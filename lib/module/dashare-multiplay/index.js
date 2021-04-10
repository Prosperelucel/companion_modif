var instance_skel = require('../../instance_skel');
var TelnetSocket = require('../../telnet');
var actions = require('./actions');
var presets = require('./presets');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

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
	self.initPresets();
};

instance.prototype.incomingData = function(data) {
	var self = this;
	debug(data);

	self.status(self.STATUS_OK);

};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.init_tcp();
	self.initPresets();
};

instance.prototype.init_tcp = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
		self.login = false;
	}

	if (self.config.host) {
		self.socket = new TelnetSocket(self.config.host, self.config.port);

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
				self.socket.write(new Buffer([ 255, 252, info ]));
			}

			// tell the remote DONT do whatever they WILL offer
			if (type == 'WILL') {
				self.socket.write(new Buffer([ 255, 254, info ]));
			}
		});
	}
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;

	return [
		{
			type:    'text',
			id:      'info',
			width:   12,
			label:   'Information',
			value:   'This will establish a telnet connection to Multiplay'
		},{
			type:    'textinput',
			id:      'host',
			label:   'IP address of the player',
			width:   12,
			default: '127.0.0.1',
			regex:   self.REGEX_IP
		},{
			type:    'textinput',
			id:      'port',
			label:   'Port number',
			width:   6,
			default: '2000',
			regex:   self.REGEX_PORT
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
	}

	debug("destroy", self.id);
};

instance.prototype.actions = function(system) {
	var self = this;
	self.setActions(actions.getActions());
};

instance.prototype.initPresets = function (updates) {
	var self = this;
	self.setPresetDefinitions(presets.getPresets(self));
};

instance.prototype.action = function(action) {

	var self = this;
	var id = action.action;
	var cmd;

	switch (id) {
		case 'go':
			cmd = 'go';
			break;

		case 'stop_all':
			cmd = 'stop all';
			break;

		case 'fade_all':
			cmd = 'fade all';
			break;

		case 'pause_all':
			cmd = 'pause all';
			break;

		case 'resume_all':
			cmd = 'resume all';
			break;

		case 'stopwatch_stop':
			cmd = 'stopwatch stop';
			break;

		case 'stopwatch_start':
			cmd = 'stopwatch start';
			break;

		case 'stopwatch_reset':
			cmd = 'stopwatch reset';
			break;

		case 'advance':
			cmd = 'advance';
			break;

		case 'pause':
			cmd = 'pause';
			break;

		case 'resume':
			cmd = 'resume';
			break;

		case 'stop':
			cmd = 'stop';
			break;

		case 'jump':
			cmd = 'jump';
			break;

		case 'next_track':
			cmd = 'next track';
			break;

		case 'previous_track':
			cmd = 'previous track';
			break;

		case 'clear':
			cmd = 'clear';
			break;

		case 'version':
			cmd = 'version';
			break;

		case 'quit':
			cmd = 'quit';
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
