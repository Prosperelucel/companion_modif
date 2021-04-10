var TelnetSocket = require('../../telnet');
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
	self.config = config;
	self.init_tcp();
};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.init_tcp();
};



// Taken from MA2 module
instance.prototype.init_tcp = function() {
	var self = this;
	var receivebuffer = '';

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
		self.login = false;
	}

	if (self.config.host) {
		self.socket = new TelnetSocket(self.config.host, 8998);

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
	{ label: '8', id: '8' }
];

instance.prototype.HOSTLIST = [
	// 1080p
	{ label: '1080p@60',    id: '32' },
	{ label: '1080p@59.94', id: '33' },
	{ label: '1080p@50',    id: '34' },
	{ label: '1080p@50',    id: '35' },
	{ label: '1080p@30',    id: '36' },
	{ label: '1080p@29',    id: '37' },
	{ label: '1080p@25',    id: '38' },
	{ label: '1080p@24',    id: '39' },
	{ label: '1080p@23',    id: '40' },
	// 1080i
	{ label: '1080i@60',    id: '41' },
	{ label: '1080i@59.94', id: '42' },
	{ label: '1080i@50',    id: '43' },
	{ label: '1080i@30',    id: '44' },
	{ label: '1080i@29',    id: '45' },
	{ label: '1080i@25',    id: '46' },
	{ label: '1080i@25',    id: '47' },
	{ label: '1080i@25',    id: '48' },
	{ label: '1080i@24',    id: '49' },
	{ label: '1080i@23',    id: '50' },
	//720p
	{ label: '720p@60', id: '54' },
	{ label: '720p@59', id: '55' },
	{ label: '720p@50', id: '56' },
	// #Why not
	{ label: '800x600@60',           id: '21' },
	{ label: '1024x768@60',          id: '16' },
	{ label: '1280x1024@60',         id: '5' },
	{ label: '1280x960@60',          id: '9' },
	{ label: '1600x1200@60',         id: '1' },
	{ label: '1920x1200@60 Reduced', id: '60' },
	{ label: '1920x1200@60',         id: '62' },
	{ label: '2048x1080@60',         id: '195' }
];

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;

	return [{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'This will establish a telnet connection to the matrix'
		}, {
			type: 'textinput',
			id: 'host',
			label: 'Phantom 800 IP address',
			width: 12,
			default: '192.168.1.10',
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

	debug("destroy", self.id);
};

// Functions
instance.prototype.actions = function(system) {
	var self = this;
	var actions = {
		// SW
		'switch': {
			label: 'Switch Input',
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
		// OWS
		'ows': {
			label: 'Output Window Size',
			options: [{
				type: 'dropdown',
				label: 'output',
				id: 'output',
				default: '1',
				choices: self.CHOICES_INOUT
			}, {
				type: 'dropdown',
				label: 'positioning',
				id: 'ows',
				default: 'CENTER',
				choices: [
					{ id: 'FIT', label: 'Fit'},
					{ id: 'FILL',  label: 'Fill' },
					{ id: 'CENTER',   label: 'Center'},
					{ id: 'STRETCH',  label: 'Stretch' },
				]
			}]
		},
		// OWS 2
		'ows2': {
			label: 'Output Window Size (px)',
			options: [{
				type: 'dropdown',
				label: 'output',
				id: 'output',
				default: '1',
				choices: self.CHOICES_INOUT
			}, {
				type: 'textinput',
				label: 'Hsize',
				id: 'hsize',
				default: '1920',
				regex: self.REGEX_NUMBER
			},  {
				type: 'textinput',
				label: 'Vsize',
				id: 'vsize',
				default: '1080',
				regex: self.REGEX_NUMBER
			}]
		},
		// SETOT
		'setot': {
			label: 'Set Output Timing',
			options: [{
				type: 'dropdown',
				label: 'output',
				id: 'output',
				default: '1',
				choices: self.CHOICES_INOUT
			}, {
				type: 'dropdown',
				label: 'Format',
				id: 'hlist',
				default: '32',
				choices: self.HOSTLIST
			}]
		},
		//FZ
		'fz': {
			label: 'FREEZE',
			options: [{
				type: 'dropdown',
				label: 'output',
				id: 'output',
				default: '1',
				choices: self.CHOICES_INOUT
			}, {
				type: 'dropdown',
				label: 'ON/OFF',
				id: 'onoff',
				default: 'OFF',
			choices:
			[{ label: 'ON', id: 'ON' },
			{ label: 'OFF', id: 'OFF' }]
			}]
		},
		//FG
		'fg': {
			label: 'Frame Grab',
			options: [{
				type: 'dropdown',
				label: 'output',
				id: 'output',
				default: '1',
				choices: self.CHOICES_INOUT
			}]
		},
		//FGPC
		'fgpc': {
			label: 'Frame Grab Preview Clear',
			options: [{
				type: 'dropdown',
				label: 'output',
				id: 'output',
				default: '1',
				choices: self.CHOICES_INOUT
			}]
		},
		//FGP
		'fgp': {
			label: 'Frame Grab Preview',
			options: [{
				type: 'dropdown',
				label: 'output',
				id: 'output',
				default: '1',
				choices: self.CHOICES_INOUT
			}]
		},
		//BO / UBO
		'bo': {
			label: 'Blank Output',
			options: [{
				type: 'dropdown',
				label: 'output',
				id: 'output',
				default: '1',
				choices: self.CHOICES_INOUT
			}, {
				type: 'dropdown',
				label: 'On/Off',
				id: 'boubo',
				default: 'UBO ',
				choices: [
					{ label: 'ON', id: 'BO '},
					{ label: 'OFF', id: 'UBO '}
				]
			}]
		},
		//Custom Command
		'cust': {
			label: 'Custom Command',
			options: [{
				type: 'textinput',
				label: 'Custom Command',
				id: 'cust',
				default: ' ',
			}]
		},


	};

	self.setActions(actions);
}
// The Sendy Bits
instance.prototype.action = function(action) {

	var self = this;
	var id = action.action;
	var opt = action.options;
	var cmd;

	switch (id) {
		case '':
			cmd = ` ` + opt.output +' '+ opt.output;
			break;

		case 'switch':
			cmd = 'SW '+ opt.input +' '+ opt.output;
			break;

		case 'ows':
			cmd = 'OWS ' + opt.output +' '+ opt.ows;
			break;
		case 'ows2':
			cmd = 'OWS ' + opt.output +' '+ opt.hsize +' '+ opt.vsize;
			break;
		case 'setot':
			cmd = `SETOT ` + opt.output +' '+ opt.hlist;
			break;
		case 'fz':
			cmd = `FZ ` + opt.output +' '+ opt.onoff;
			break;
		case 'fg':
			cmd = `FG ` + opt.output;
			break;
		case 'fgpc':
			cmd = `FGPC ` + opt.output;
			break;
		case 'fgp':
			cmd = `FGP ` + opt.output;
			break;
		case 'bo':
			cmd = opt.boubo + opt.output;
			break;
		case 'cust':
			cmd = opt.cust;
			break;
	}

	if (cmd !== undefined) {
		if (self.socket !== undefined && self.socket.connected) {
			self.socket.write(cmd+"\r\n");
		} else {
			debug('Socket not connected :(');
		}
	}
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
