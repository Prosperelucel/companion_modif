// Analog Way Pulse 300 TCP / UDP

var tcp           = require('../../tcp');
var udp           = require('../../udp');
var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions
	self.init_presets();

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;
	self.init_presets();

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
	};

	if (self.config.prot == 'udp') {
		self.init_udp();
	};
};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;
	self.init_presets();

	if (self.config.prot == 'tcp') {
		self.init_tcp();
	};

	if (self.config.prot == 'udp') {
		self.init_udp();
	};
};

instance.prototype.init_udp = function() {
	var self = this;

	if (self.udp !== undefined) {
		self.udp.destroy();
		delete self.udp;
	}

	self.status(self.STATE_WARNING, 'Connecting');

	if (self.config.host !== undefined) {
		self.udp = new udp(self.config.host, 10500);

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

instance.prototype.init_tcp = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	self.status(self.STATE_WARNING, 'Connecting');

	if (self.config.host) {
		self.socket = new tcp(self.config.host, 10500);

		self.socket.on('status_change', function (status, message) {
			self.status(status, message);
		});

		self.socket.on('error', function (err) {
			debug("Network error", err);
			self.status(self.STATE_ERROR, err);
			self.log('error',"Network error: " + err.message);
		});

		self.socket.on('connect', function () {
			self.status(self.STATE_OK);
			debug("Connected");
		})

		self.socket.on('data', function (data) {});
	}
};


// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;

	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 6,
			regex: self.REGEX_IP
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

	debug("destroy", self.id);;
};

instance.prototype.CHOICES_INPUTS = [
	{ id: '0',  label: 'No Input', text: 'Black\\nLOGO' },
	{ id: '1',  label: 'Input 1',  text: 'In 1' },
	{ id: '2',  label: 'Input 2',  text: 'In 2' },
	{ id: '3',  label: 'Input 3',  text: 'In 3' },
	{ id: '4',  label: 'Input 4',  text: 'In 4' },
	{ id: '5',  label: 'Input 5',  text: 'In 5' },
	{ id: '6',  label: 'Input 6',  text: 'In 6' },
	{ id: '9',  label: 'DVI 1',    text: 'DVI 1' },
	{ id: '10', label: 'DVI 2',    text: 'DVI 2' },
	{ id: '11', label: 'SDI 1',    text: 'SDI 1' },
	{ id: '12', label: 'SDI 2',    text: 'SDI 2' }
];

instance.prototype.CHOICES_FRAMES = [
	{ id: '0', label: 'No Frame', text: 'No\\nFrame' },
	{ id: '1', label: 'Frame 1',  text: 'Fr 1' },
	{ id: '2', label: 'Frame 2',  text: 'Fr 2' },
	{ id: '3', label: 'Frame 3',  text: 'Fr 3' },
	{ id: '4', label: 'Frame 4',  text: 'Fr 4' },
	{ id: '5', label: 'Frame 5',  text: 'Fr 5' },
	{ id: '6', label: 'Frame 6',  text: 'Fr 6' }
];

instance.prototype.CHOICES_PRESETS = [
	{ id: '3', label: 'Preset 1', text: 'Preset\\n1' },
	{ id: '4', label: 'Preset 2', text: 'Preset\\n2' },
	{ id: '5', label: 'Preset 3', text: 'Preset\\n3' },
	{ id: '6', label: 'Preset 4', text: 'Preset\\n4' }
];

instance.prototype.init_presets = function () {
	var self = this;
	var presets = [];

	presets.push({
		category: 'Program',
		label: 'Take',
		bank: {
			style: 'text',
			text: 'Take',
			size: '18',
			color: '16777215',
			bgcolor: self.rgb(0,204,0)
		},
		actions: [
			{
				action: 'take',
			}
		]
	});

	for (var input in self.CHOICES_INPUTS) {
		presets.push({
			category: 'Inputs',
			label: self.CHOICES_INPUTS[input].label,
			bank: {
				style: 'text',
				text: self.CHOICES_INPUTS[input].text,
				size: '14',
				color: '16777215',
				bgcolor: self.rgb(0,0,0)
			},
			actions: [
				{
					action: 'in',
					options: {
						input: self.CHOICES_INPUTS[input].id
					}
				}
			]
		});
	}

	for (var frame in self.CHOICES_FRAMES) {
		presets.push({
			category: 'Frames',
			label: self.CHOICES_FRAMES[frame].label,
			bank: {
				style: 'text',
				text: self.CHOICES_FRAMES[frame].text,
				size: '14',
				color: '16777215',
				bgcolor: self.rgb(0,0,0)
			},
			actions: [
				{
					action: 'fr',
					options: {
						frame: self.CHOICES_FRAMES[frame].id
					}
				}
			]
		});
	}

	for (var preset in self.CHOICES_PRESETS) {
		presets.push({
			category: 'Presets',
			label: self.CHOICES_PRESETS[preset].label,
			bank: {
				style: 'text',
				text: self.CHOICES_PRESETS[preset].text,
				size: '14',
				color: '16777215',
				bgcolor: self.rgb(0,0,0)
			},
			actions: [
				{
					action: 'ps',
					options: {
						preset: self.CHOICES_PRESETS[preset].id
					}
				}
			]
		});
	}

	self.setPresetDefinitions(presets);
}

instance.prototype.actions = function(system) {
	var self = this;

	self.system.emit('instance_actions', self.id, {
		'take': {
			label: 'Take'
		 },

		'in': {
			label: 'Input',
			options: [{
				type:   'dropdown',
				label:  'Input',
				id:     'input',
				default: '0',
				choices: self.CHOICES_INPUTS
			}]
		},

		'fr':      {
			label: 'Background Frame',
			options: [{
				type:   'dropdown',
				label:  'Frame',
				id:     'frame',
				default: '0',
				choices: self.CHOICES_FRAMES
			}]
		},
		'ps':      {
			label: 'User Preset',
			options: [{
				type:   'dropdown',
				label:  'Preset',
				id:     'preset',
				default: '3',
				choices: self.CHOICES_PRESETS
			}]
		}
	});
}

instance.prototype.action = function(action) {
	var self = this;
	var cmd
	var opt = action.options

	switch(action.action) {

		case 'take':
			cmd = '1TK \r\n 1TK';
			break;

		case 'in':
			cmd = '1,2,' + opt.input + 'IN' + '\r\n' + '1,2,' + opt.input + 'IN' ;
			break;

		case 'fr':
			cmd = '1,0,' + opt.frame + 'IN' + '\r\n' + '1,0,' + opt.frame + 'IN';
			break;

		case 'ps':
			cmd = '' + opt.preset + 'Nf \r\n 1Nt1Nc' + '\r\n' + '' + opt.preset + 'Nf \r\n 1Nt1Nc';
			break;
	}

	if (self.config.prot == 'tcp') {

		if (cmd !== undefined) {

			debug('sending ',cmd,"to",self.config.host);

			if (self.socket !== undefined && self.socket.connected) {
				self.socket.send(cmd);
			}
			else {
				debug('Socket not connected :(');
			}
		}
	}

	if (self.config.prot == 'udp') {

		if (cmd !== undefined ) {

			if (self.udp !== undefined ) {
				debug('sending',cmd,"to",self.config.host);

				self.udp.send(cmd);
			}
		}
	}
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;
