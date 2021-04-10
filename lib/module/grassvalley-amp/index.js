var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');
var debug;
var log;

// http://www.gvgdevelopers.com/concrete/apis/amp_protocol/
// http://www.gvgdevelopers.com/Protocols/AMP_SDK/Docs/AMP%20at%20a%20glance.pdf
// http://www.gvgdevelopers.com/concrete/index.php/download_file/-/view/11/ (K2_Protocol_Developers_Guide.pdf)
// http://www.gvgdevelopers.com/concrete/index.php/download_file/-/view/10 (AMP Specification)

function zpad(data, length) {
	return ('0'.repeat(length) + data).substr(0-length);
};

function str2hex(str) {
	var result = '';

	for (var i = 0; i < str.length; ++i) {
		result += zpad(str.charCodeAt(i).toString(16), 2);
	}

	return result;
}

function instance(system, id, config) {
	var self = this;

	self.awaiting_reply = false;
	self.command_queue = [];
	self.files = [];

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;
	self.init_tcp();
};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.status(self.STATE_UNKNOWN);

	self.init_tcp();
};

instance.prototype.init_tcp = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	if (self.config.host) {
		self.socket = new tcp(self.config.host, 3811);

		self.socket.on('status_change', function (status, message) {
			self.status(status, message);
		});

		self.socket.on('connect', function () {
			self.initAMPSocket();
		});

		self.socket.on('error', function (err) {
			debug("Network error", err);
			self.log('error',"Network error: " + err.message);
		});

		self.socket.on('data', function (chunk) {
			self.buffer = Buffer.concat([self.buffer, chunk]);

			console.log("AMP Buffer: ", self.buffer, self.buffer.toString());

			if (self.waiting_for_crat && self.buffer.length >= 4) {
				var result = self.buffer.slice(0, 4).toString();
				self.buffer = self.buffer.slice(4);

				self.waiting_for_crat = false;
				/*setInterval(function () {
					self.sendCommand('61200F');
				}, 100);*/

				if (result.match(/1111/)) {
					self.log('error', 'Error opening AMP socket, server said NAK');
				}
				else if (result.match(/1001/)) {
					// ACKed, ok

					// Request file list
					self.files.length = 0;
					self.sendCommand('a2140000');
					self.sendCommand('a115ff');

				} else {
					self.log('error', 'Unkown data received while connecting to device');
					debug('Did not expect: ' + result);
				}
			} else if (self.awaiting_reply) {

				if (self.buffer.length >= 4) {
					var str = self.buffer.toString();
					var cmd1 = parseInt(str[0], 16);
					var count = parseInt(str[1], 16);
					var cmd2 = parseInt(str[2] + str[3], 16);

//					console.log("cmd: " + cmd1 + " count " + count + " cmd2 " + cmd2, str.substr(0,4));

					switch (cmd1) {
						case 8:
							if (cmd2 == 0x14) {
								self.handleListFirstID();
							} else
							if (cmd2 == 0x8A) {
								self.handleListNextID();
							}
							break;
						case 1:
							if (count == 0 && cmd2 == 1) { // ack
								self.buffer = self.buffer.slice(4);
							} else
							if (count == 1 && cmd2 == 0x12) {
								self.buffer = self.buffer.slice(6);
								self.log('error', 'Error received on last command');
								// Todo parse NAK bits
							}
							break;
						case 7:
							if (cmd2 == 0x20 && self.buffer.length >= 6 + (count * 2)) {
								// Status info
								var status = self.buffer.slice(4, 4 + (count * 2)).toString();
								self.handleStatusInfo(status);
								self.buffer = self.buffer.slice(6 + (count * 2));
							}
					}

					// Todo: fiks
					self.awaiting_reply = false;

					if (self.command_queue.length > 0) {
						self._sendCommand(self.command_queue.shift());
					}
				}
			}
		});
	}
};

instance.prototype.handleListFirstID = function() {
	var self = this;
	var buffer = self.buffer.toString();

	debug('handleListFirstID: ', self.buffer[1], ' == a');
	if (buffer[1] == '0' && self.buffer.length >= 6) {
		debug('no clips');
		self.buffer = self.buffer.slice(6);
	} else if (buffer[1] == '8' && self.buffer.length >= 22) {
		debug('Clip 8 byte mode ' + Buffer.from(self.buffer.slice(4, 4 + 16).toString(), 'hex').toString());

		self.files.push(Buffer.from(self.buffer.slice(4, 4 + 16).toString(), 'hex').toString());
		self.buffer = self.buffer.slice(4 + 16 + 2);
	} else if (buffer[1] == 'A' || buffer[1] == 'a' && self.buffer.length >= 12) {
		var len = parseInt(buffer.substr(4,4), 16);
		debug("Going to try to read " + len + " bytes of clips");
		var i = 0;

		if (buffer.length < len*2) { return; }

		while (len > 0 && 8+4+i < buffer.length) {
			var len2 = parseInt(buffer.substr(8 + i, 4), 16);
			var name = buffer.substr(8+i+4, len2 * 2);
			debug("Clip: " + Buffer.from(name, 'hex').toString());
			self.files.push(Buffer.from(name, 'hex').toString());
			i += 4 + (len2 * 2);
		}

		self.buffer = self.buffer.slice(8 + (len * 2) + 2);
		//console.log("File list: ", self.files);
		self.actions();
	}
};

instance.prototype.handleNextID = function() {
	var self = this;
	var buffer = self.buffer.toString();

	//console.log("NEXTID_ EXTENDED: ", buffer, Buffer.from(buffer).toString());
};

instance.prototype.handleStatusInfo = function(status) {
	var self = this;
	var buf = Buffer.from(status, 'hex');

	if (buf[1] & (1<<0)) {
		debug('Status: PLAYING');
	}
	if (buf[1] & (1<<5)) {
		debug('Status: STOP')
	}
	if (buf[1] & (1<<7)) {
		debug('Status: STANDBY ON')
	}
};

instance.prototype.initAMPSocket = function() {
	var self = this;
	var channel = self.config.channel;

	self.buffer = new Buffer('');

	if (channel !== undefined) {
		self.waiting_for_crat = true;
		self.socket.send('CRAT' + zpad(channel.length + 3, 4) + '2' + zpad(channel.length, 2) + channel + "\n");
	}
};

instance.prototype.sendCommand = function(command) {
	var self = this;

	if (!self.awaiting_reply) {
		self._sendCommand(command);
	} else {
		debug('queueing command ' + command);
		self.command_queue.push(command);
	}
};

instance.prototype._sendCommand = function(command) {
	var self = this;

	if (command.length > 9999) {
		self.log('error', 'Internal error, command too long');
		return;
	}

	if (self.socket !== undefined && self.socket.connected) {
		self.awaiting_reply = true;
		self.socket.send('CMDS' + zpad(command.length, 4) + command + "\n");
	} else {
		debug('Socket not connected :(');
	}
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;
	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: "This module connects to VTR's that support the AMP protocol"
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Device IP',
			width: 6,
			regex: self.REGEX_IP
		},
		{
			type: 'textinput',
			id: 'channel',
			label: 'AMP Channel',
			width: 6,
			default: 'Vtr1'
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.send('STOP0000\n');
		self.socket.destroy();
	}

	debug("destroy", self.id);
};


instance.prototype.actions = function(system) {
	var self = this;

	self.system.emit('instance_actions', self.id, {
		'play': { label: 'Play' },
		'stop': { label: 'Stop' },
		'eject': { label: 'Eject' },
		'record': { label: 'Record' },
		'loadclip': {
			label: 'Load clip',
			options: [
				{
					label: 'Clip name',
					id: 'clip',
					type: 'textinput',
					regex: '/^\\S.*$/'
				},
				{
					label: 'Clip name',
					id: 'clipdd',
					type: 'dropdown',
					choices: [].concat(
						[ {id: '', label: ' - None - '} ],
						self.files.map(function (el) { return { id: el, label: el }; })
					)
				}
			]
		}
	});
};

instance.prototype.action = function(action) {
	var self = this;
	var cmd;
	var opt = action.options;

	switch (action.action) {

		case 'play':
			self.sendCommand('2001');
			break;

		case 'stop':
			self.sendCommand('2000');
			break;

		case 'eject':
			self.sendCommand('200f');
			break;

		case 'record':
			self.sendCommand('2002');
			break;

		case 'loadclip':
			var clip = opt.clipdd || opt.clip;
			self.sendCommand('4a14' + zpad(clip.length + 2, 4) + zpad(clip.length, 4) + str2hex(clip));
	}

	debug('action():', action.action);
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
