var udp           = require('../../udp');
var instance_skel = require('../../instance_skel');
var debug;
var log;


function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;

	if (self.udp !== undefined) {
		self.udp.destroy();
		delete self.udp;
	}

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	self.config = config;

	self.init_udp();
};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.init_udp();
};

instance.prototype.init_udp = function() {
	var self = this;

	if (self.udp !== undefined) {
		self.udp.destroy();
		delete self.udp;
	}

	self.status(self.STATE_WARNING, 'Connecting');

	if (self.config.host !== undefined) {
		self.udp = new udp(self.config.host, 3000);

		self.udp.on('error', function (err) {
			debug("Network error", err);
			self.status(self.STATE_ERROR, err);
			self.log('error',"Network error: " + err.message);
		});

		// If we get data, thing should be good
		self.udp.on('data', function (data) {
			self.status(self.STATE_OK);
			console.log("data: "+ data);
		});

		self.udp.on('status_change', function (status, message) {
			self.status(status, message);
		});
	}
};

instance.prototype.CHOICES_INOUT = [
	{ label: '1', id: '1' },
	{ label: '2', id: '2' },
	{ label: '3', id: '3' },
	{ label: '4', id: '4' },
	{ label: '5', id: '5' },
	{ label: '6', id: '6' },
	{ label: '7', id: '7' },
	{ label: '8', id: '8' },
	{ label: '9', id: '9' },
	{ label: '10', id: '10' },
	{ label: '11', id: '11' },
	{ label: '12', id: '12' },
	{ label: '13', id: '13' },
	{ label: '14', id: '14' },
	{ label: '15', id: '15' },
	{ label: '16', id: '16' }
];

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;

	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'This will establish a telnet connection to the matrix'
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'MatrixPro-II IP address',
			width: 12,
			default: '192.168.0.246',
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
	if (self.udp !== undefined) {
		self.udp.destroy();
	}

	debug("destroy", self.id);;
};

instance.prototype.actions = function(system) {
	var self = this;
	var actions = {
		'route': {
			label: 'Route input to output',
			options: [{
					type: 'dropdown',
					label: 'input',
					id: 'input',
					default: '1',
					choices: self.CHOICES_INOUT
			}, {
				type: 'dropdown',
				label: 'output',
				id: 'output',
				default: '1',
				choices: self.CHOICES_INOUT
			}]
		},
		'inputToAll': {
			label: 'Route input to all outputs',
			options: [{
					type: 'dropdown',
					label: 'input',
					id: 'input',
					default: '1',
					choices: self.CHOICES_INOUT
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
		case 'route':
			cmd = `LINK=${opt.input}^${opt.output}!`;
			break;

		case 'inputToAll':
			cmd = `LINK=${opt.input}!`;
			break;

	}

	if (cmd !== undefined) {
			if (self.udp !== undefined) {
					debug('sending ', cmd, "to", self.config.host);
					self.udp.send(cmd);
			}
	}
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
