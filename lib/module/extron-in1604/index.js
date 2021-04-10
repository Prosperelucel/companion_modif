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

	// Match part of the copyright response from unit when a connection is made.
	// Send Info request which should reply with Matrix setup, eg: "V8X4 A8X4"
	if (self.login === false && data.match(/Extron Electronics/)) {
		self.status(self.STATUS_WARNING,'Logging in');
		self.socket.write("I\n");
	}

	if (self.login === false && data.match(/Password:/)) {
		self.log('error', "expected no password");
		self.status(self.STATUS_ERROR, 'expected no password');
	}

	// Match first letter of expected response from unit.
	else if (self.login === false && data.match(/Vid/)) {
		self.login = true;
		self.status(self.STATUS_OK);
		debug("logged in");
	}
	// Heatbeat to keep connection alive
	function heartbeat() {
		self.login = false;
		self.status(self.STATUS_WARNING,'Checking Connection');
		self.socket.write("I\n"); // should reply with Scaler setup, eg: "Vid3 Aud3 Typ6 Std0 Blk0 Hrtxxx.x Vrtxxx.x"
		debug("Checking Connection");
	}

	if (self.login === true) {
		clearInterval(self.heartbeat_interval);
		var beat_period = 180; // Seconds
		self.heartbeat_interval = setInterval(heartbeat, beat_period * 1000);
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
			self.login = false;
		});

		self.socket.on('connect', function () {
			debug("Connected");
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
				self.socket.write(new Buffer([ 255, 252, info ]));
			}

			// tell the remote DONT do whatever they WILL offer
			if (type == 'WILL') {
				self.socket.write(new Buffer([ 255, 254, info ]));
			}
		});
	}
};

instance.prototype.CHOICES_INPUT = [
	{ label: 'Input 1', id: '1' },
	{ label: 'Input 2', id: '2' },
	{ label: 'Input 3', id: '3' },
	{ label: 'Input 4', id: '4' },
	{ label: 'Input 5', id: '5' },
	{ label: 'Input 6', id: '6' },
	{ label: 'Input 7', id: '7' },
	{ label: 'Input 8', id: '8' }
]

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;

	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'This will establish a telnet connection to the Extron device'
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'IP address',
			width: 12,
			default: '192.168.254.254',
			regex: self.REGEX_IP
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;
	clearInterval (self.heartbeat_interval); //Stop Heartbeat

	if (self.socket !== undefined) {
		self.socket.destroy();
	}

	debug("destroy", self.id);
};

instance.prototype.actions = function(system) {
	var self = this;
	var actions = {
		'input': {
			label: 'Switch input',
			options: [{
				type: 'dropdown',
				label: 'Select input',
				id: 'input',
				choices: self.CHOICES_INPUT,
				default: '1'
			}]
		}
	};

	self.setActions(actions);
}

instance.prototype.action = function(action) {

	var self = this;
	var id = action.action;
	var opt = action.options;
	var cmd;

	switch (id) {
		case 'input':
			cmd = opt.input +'!';
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
