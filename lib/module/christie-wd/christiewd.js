var instance_skel = require('../../instance_skel');
var udp		  = require('../../udp');
var TelnetSocket  = require('../../telnet');
var debug;
var log;


function instance(system, id, config) {
	var self = this;

	// Request id counter
	self.request_id = 0;
	// super-constructor
	instance_skel.apply(this, arguments);
	self.status(1,'Initializing');
	self.actions(); // export actions

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;
	self.config = config;

	if (self.udp !== undefined) {
		self.udp.destroy();
		delete self.udp;
	}
	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	self.config = config;
	if (self.config.prot == 'tcp') {
		self.init_tcp();
	}
	if (self.config.prot == 'udp') {
		self.init_udp();
	}

};

instance.prototype.incomingData = function(data) {
	var self = this;
	debug(data);

};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;

	if (self.config.prot == 'tcp') {
		self.init_tcp();
	}

	if (self.config.prot == 'udp') {
		self.init_udp();
	}
};

instance.prototype.init_tcp = function() {
	var self = this;
	var receivebuffer = '';

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	if (self.config.host) {
		self.socket = new TelnetSocket(self.config.host, self.config.port || 1234);

		self.socket.on('status_change', function (status, message) {
			self.status(status, message);
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

instance.prototype.init_udp = function() {
	var self = this;

	if (self.udp !== undefined) {
		self.udp.destroy();
		delete self.udp;
	}

	self.status(self.STATE_WARNING, 'Connecting');

	if (self.config.host !== undefined) {
		self.udp = new udp(self.config.host, self.config.port);

		self.udp.on('error', function (err) {
			debug("Network error", err);
			self.status(self.STATE_ERROR, err);
			self.log('error',"Network error: " + err.message);
		});

		// If we get data, thing should be good
		self.udp.on('data', function () {
			self.status(self.STATE_OK);
		});

		self.udp.on('status_change', function (status, message) {
			self.status(status, message);
		});
	}
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;

	return [
		{
			type:  'text',
			id:    'info',
			width: 12,
			label: 'Information',
			value: 'Remember to activate Remoting under Connections -> Remoting -> TCP or UDP Server. Use Multi Client if you want to be able to send Commands from multiple Devices'
		},
		{
			type:    'textinput',
			id:      'host',
			label:   'Widget Designer IP',
			width:   12,
			default: '192.168.0.1',
			regex:   self.REGEX_IP
		},
		{
			type:    'textinput',
			id:      'port',
			label:   'Port',
			width:   6,
			default: '123',
			regex:   self.REGEX_PORT
		},
		{
			type: 'dropdown',
			id: 'prot',
			label: 'Connect with TCP / UDP',
			default: 'tcp',
			choices:  [
				{ id: 'udp', label: 'UDP' },
				{ id: 'tcp', label: 'TCP' }
			]
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
	}
	if (self.udp !== undefined) {
		self.udp.destroy();
	}

	debug("destroy", self.id);
};

instance.prototype.actions = function(system) {
	var self = this;
	self.system.emit('instance_actions', self.id, {

		'command': {
			label:'WD Command',
			options: [
				{
					type:    'textinput',
					label:   'Command',
					id:      'command',
					default: '',
				}
			]
		},
		'customscriptclick': {
			label:'CustomScript Click',
			options: [
				{
					type:    'textinput',
					label:   'CustomScript ID',
					id:      'csid',
					default: '',
					regex:   self.REGEX_NUMBER
				}
			]
		},
		'fadetovalue': {
			label:'Fade to Value in Secounds',
			options: [
				{
					type:    'textinput',
					label:   'Fader ID',
					id:      'faderid',
					default: '',
					regex:   self.REGEX_NUMBER
				},
				{
					type:    'textinput',
					label:   'Time (sec)',
					id:      'fadetime',
					default: '2.0',
				},
				{
					type:    'textinput',
					label:   'Value',
					id:      'value',
					default: '1.0',
				}
			]
		}

	});
}

instance.prototype.action = function(action) {
	var self = this;
	var cmd;
	var opt = action.options

		switch (action.action) {

			case 'command':
				cmd = opt.command;
				break;

			case 'customscriptclick':
				cmd = 'WDCustomScriptClick('+ opt.csid + ')';
				break;

			case 'fadetovalue':
				cmd = 'WDFadeToValue('+ opt.faderid +','+ opt.fadetime +','+ opt.value +')';
				break;
	}

	if (cmd !== undefined) {

		if (self.config.prot == 'tcp') {
			if (cmd !== undefined) {
				if (self.socket !== undefined && self.socket.connected) {
					self.socket.write('{'+cmd+'}\r\n');
				} else {
					debug('Socket not connected :(');
				}
			}
		}
		if (self.config.prot == 'udp') {
			if (cmd !== undefined ) {
				if (self.udp !== undefined ) {
					self.udp.send('{' + cmd + '}');
				}
			}
		}
	}
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
