var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');
var TelnetSocket = require('../../telnet');
var debug;
var log;


function instance(system, id, config) {
	var self = this;

	// Request id counter
	self.request_id = 0;
	self.login = false;
	// super-constructor
	instance_skel.apply(this, arguments);
	self.status(1,'Initializing');
	self.actions(); // export actions

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;
	self.config = config;
	self.init_tcp();
};

instance.prototype.incomingData = function(data) {
	var self = this;
	debug(data);

	if (self.login === false && data.match("DCS-200 login:")) {
		self.status(self.STATUS_WARNING,'Logging in');
		self.socket.write("user"+ "\n");
	}

	if (self.login === false && data.match("Password:")) {
		self.status(self.STATUS_WARNING,'Logging in');
		self.socket.write(""+ "\n");
	}


	else if (self.login === false && data.match("ShellApp waiting for input")) {
		self.login = true;
		self.status(self.STATUS_OK);
		debug("logged in");
	}
	else if (self.login === false && data.match('login incorrect')) {
		self.log('error', "incorrect username/password (expected to be 'user' and no password)");
		self.status(self.STATUS_ERROR, 'Incorrect user/pass');
	}
	else {
		debug("data nologin", data);
	}
};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.init_tcp();
};

instance.prototype.init_tcp = function() {
	var self = this;
	var receivebuffer = '';

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
		self.login = false;
	}

	if (self.config.host) {
		self.socket = new TelnetSocket(self.config.host, 23);

		self.socket.on('status_change', function (status, message) {
			if (status !== self.STATUS_OK) {
				self.status(status, message);
			}
		});

		self.socket.on('error', function (err) {
			debug("Network error", err);
			self.log('error',"Network error: " + err.message);
		});

		self.socket.on('connect', function () {
			debug("Connected");
			self.login = false;
		});

		self.socket.on('error', function (err) {
			debug("Network error", err);
			self.log('error',"Network error: " + err.message);
			self.login = false;
		});

		// if we get any data, display it to stdout
		self.socket.on("data", function(buffer) {
			var indata = buffer.toString("utf8");
			self.incomingData(indata);
		});

		self.socket.on("iac", function(type, info) {
			// tell remote we WONT do anything we're asked to DO
			if (type == 'DO') {
				socket.write(new Buffer([ 255, 252, info ]));
			}

			// tell the remote DONT do whatever they WILL offer
			if (type == 'WILL') {
				socket.write(new Buffer([ 255, 254, info ]));
			}
		});
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
			value: 'This will establish a telnet connection to the dcs'
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'DCS IP address',
			width: 12,
			default: '192.168.0.1',
			regex: self.REGEX_IP
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
	}

	debug("destroy", self.id);;
};

instance.prototype.actions = function(system) {
	var self = this;
	self.system.emit('instance_actions', self.id, {

		'command': {
			label:'Run Command',
			options: [
				{
					 type: 'textinput',
					 label: 'Command',
					 id: 'command',
					 default: '',
				}
			]
		},
		'take': {label: 'Take'},
		'black': {
			label:'Black',
			options: [
				{
					 type: 'dropdown',
					 label: 'On / Off',
					 id: 'blackId',
					 choices: [
						 { id: '0', label: 'Off' },
						 { id: '1', label: 'On' }
					 ]

				}
			]
		},
		'freeze': {
			label:'Freeze Program',
			options: [
				{
					 type: 'dropdown',
					 label: 'On / Off',
					 id: 'frzId',
					 choices: [
						 { id: '0', label: 'Off' },
						 { id: '1', label: 'On' }
					 ]

				}
			]
		},
		'isel': {
			label:'Input Select (n)',
			options: [
				{
					 type: 'dropdown',
					 label: 'Input',
					 id: 'inpId',
					 choices: [
						 { id: '1', label: 'Input 1 VGA' },
						 { id: '2', label: 'Input 2 VGA' },
						 { id: '3', label: 'Input 3 VGA' },
						 { id: '4', label: 'Input 4 VGA' },
						 { id: '5', label: 'Input 5 VGA' },
						 { id: '6', label: 'Input 6 VGA' },
						 { id: '7', label: 'Input 7 DVI' },
						 { id: '8', label: 'Input 8 DVI' },
						 { id: '9', label: 'Input 9 SDI' }
					 ]

				}
			]
		},
		'otpt': {
			label:'Output Testpattern',
			options: [
				{
					 type: 'dropdown',
					 label: 'Test Pattern',
					 id: 'patId',
					 choices: [
						 { id: '1', label: 'H Ramp' },
						 { id: '2', label: 'V Ramp' },
						 { id: '3', label: '100% Col Bars' },
						 { id: '4', label: '16x16 Grid' },
						 { id: '5', label: '32x32 Grid' },
						 { id: '6', label: 'Burst' },
						 { id: '7', label: '75% Col bars' },
						 { id: '8', label: '50% Gray' },
						 { id: '9', label: 'Gray Steps 1' },
						 { id: '10', label: 'Gray Steps 2' },
						 { id: '11', label: 'White' },
						 { id: '12', label: 'Black' },
						 { id: '13', label: 'Red' },
						 { id: '14', label: 'Green' },
						 { id: '15', label: 'Blue' }
					 ]

				},
				{
					type: 'dropdown',
					label: 'Output',
					id: 'otpId',
					choices: [
						{ id: '1', label: 'PGM DVI' },
						{ id: '2', label: 'PGM VGA' },
						{ id: '3', label: 'PRW DVI' },
						{ id: '4', label: 'PRW VGA' }
					]
				}
			]
		},
		'otpm': {
			label:'Output Testpattern Mode',
			options: [
				{
					 type: 'dropdown',
					 label: 'On / Off',
					 id: 'modeId',
					 choices: [
						 { id: '0', label: 'Off' },
						 { id: '1', label: 'On' },
					 ]

				},
				{
					type: 'dropdown',
					label: 'Output',
					id: 'otpId',
					choices: [
						{ id: '1', label: 'PGM DVI' },
						{ id: '2', label: 'PGM VGA' },
						{ id: '3', label: 'PRW DVI' },
						{ id: '4', label: 'PRW VGA' }
					]
				}
			]
		},

		'logosel': {
			label:'select Logo',
			options: [
				{
					 type: 'dropdown',
					 label: 'Logo',
					 id: 'logoId',
					 choices: [
						 { id: '1', label: 'Logo 1' },
						 { id: '2', label: 'Logo 2' },
						 { id: '3', label: 'Logo 3' }

					 ]

				},
			]
		},


	});
}

instance.prototype.action = function(action) {
	var self = this;
	console.log("Sending some action", action);
	var cmd;
	opt = action.options;
	switch (action.action) {

		case 'take':
			cmd = 'TAKE';
		break;

		case 'black':
			cmd = 'BLACK -m'+ opt.blackId;
		break;

		case 'freeze':
			cmd = 'FREEZE -m'+ opt.frzId;
		break;

		case 'isel':
			cmd = 'ISEL -i'+ opt.inpId;
		break;

		case 'otpt':
			cmd = 'OTPT -o'+ opt.otpId + ' -t' + opt.patId;
		break;

		case 'otpm':
			cmd = 'OTPM -o'+ opt.otpId + ' -m' + opt.modeId;
		break;

		case 'logosel':
			cmd = 'LOGOSEL -l'+ opt.logoId;
		break;

		case 'command':
			cmd = opt.command;
		break;

	}

	if (cmd !== undefined) {

		if (self.socket !== undefined && self.socket.connected) {
			self.socket.write(cmd+"\n");
		} else {
			debug('Socket not connected :(');
		}

	}
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
