// Analog Way Eikos 500 adapted from the Pulse 300 TCP / UDP

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

instance.prototype.init_presets = function () {
	var self = this;
	var presets = [];

	// This is the Take command

	presets.push({
		category: 'Program',
		label: 'Take',
		bank: {
			style: 'text',
			text: 'Take',
			size: '18',
			color: '16777215',
			bgcolor: self.rgb(0,255,0)
		},
		actions: [
			{
				action: 'take',
			}
		]
	});

	// These are the physical inputs as per each layer
	// BACKGROUND LIVE

	presets.push({
		category: 'Inputs',
		label: 'No Input',
		bank: {
			style: 'text',
			text: 'Black\\nLOGO',
			size: '14',
			color: '16777215',
			bgcolor: self.rgb(0,153,204)
		},
		actions: [
			{
				action: 'in',
				options: {
					input: 0
				}
			}
		]
	});

	presets.push({
		category: 'Inputs',
		label: 'Input 1',
		bank: {
			style: 'text',
			text: 'In 1',
			size: '14',
			color: '16777215',
			bgcolor: self.rgb(0,153,204)
		},
		actions: [
			{
				action: 'in',
				options: {
					input: 1
				}
			}
		]
	});

	presets.push({
		category: 'Inputs',
		label: 'Input 2',
		bank: {
			style: 'text',
			text: 'In 2',
			size: '14',
			color: '16777215',
			bgcolor: self.rgb(0,153,204)
		},
		actions: [
			{
				action: 'in',
				options: {
					input: 2
				}
			}
		]
	});

	presets.push({
		category: 'Inputs',
		label: 'Input 3',
		bank: {
			style: 'text',
			text: 'In 3',
			size: '14',
			color: '16777215',
			bgcolor: self.rgb(0,153,204)
		},
		actions: [
			{
				action: 'in',
				options: {
					input: 3
				}
			}
		]
	});

	presets.push({
		category: 'Inputs',
		label: 'Input 4',
		bank: {
			style: 'text',
			text: 'In 4',
			size: '14',
			color: '16777215',
			bgcolor: self.rgb(0,153,204)
		},
		actions: [
			{
				action: 'in',
				options: {
					input: 4
				}
			}
		]
	});

	presets.push({
		category: 'Inputs',
		label: 'Input 5',
		bank: {
			style: 'text',
			text: 'In 5',
			size: '14',
			color: '16777215',
			bgcolor: self.rgb(0,153,204)
		},
		actions: [
			{
				action: 'in',
				options: {
					input: 5
				}
			}
		]
	});

	presets.push({
		category: 'Inputs',
		label: 'Input 6',
		bank: {
			style: 'text',
			text: 'In 6',
			size: '14',
			color: '16777215',
			bgcolor: self.rgb(0,153,204)
		},
		actions: [
			{
				action: 'in',
				options: {
					input: 6
				}
			}
		]
	});

	presets.push({
		category: 'Inputs',
		label: 'DVI 1',
		bank: {
			style: 'text',
			text: 'DVI 1',
			size: '14',
			color: '16777215',
			bgcolor: self.rgb(0,153,204)
		},
		actions: [
			{
				action: 'in',
				options: {
					input: 9
				}
			}
		]
	});

	presets.push({
		category: 'Inputs',
		label: 'DVI 2',
		bank: {
			style: 'text',
			text: 'DVI 2',
			size: '14',
			color: '16777215',
			bgcolor: self.rgb(0,153,204)
		},
		actions: [
			{
				action: 'in',
				options: {
					input: 10
				}
			}
		]
	});

	presets.push({
		category: 'Inputs',
		label: 'SDI 1',
		bank: {
			style: 'text',
			text: 'SDI 1',
			size: '14',
			color: '16777215',
			bgcolor: self.rgb(0,153,204)
		},
		actions: [
			{
				action: 'in',
				options: {
					input: 11
				}
			}
		]
	});

	presets.push({
		category: 'Inputs',
		label: 'SDI 2',
		bank: {
			style: 'text',
			text: 'SDI 2',
			size: '14',
			color: '16777215',
			bgcolor: self.rgb(0,153,204)
		},
		actions: [
			{
				action: 'in',
				options: {
					input: 12
				}
			}
		]
	});

	presets.push({
		category: 'Inputs',
		label: 'SDI 3',
		bank: {
			style: 'text',
			text: 'SDI 3',
			size: '14',
			color: '16777215',
			bgcolor: self.rgb(0,153,204)
		},
		actions: [
			{
				action: 'in',
				options: {
					input: 13
				}
			}
		]
	});

	presets.push({
		category: 'Inputs',
		label: 'SDI 4',
		bank: {
			style: 'text',
			text: 'SDI 4',
			size: '14',
			color: '16777215',
			bgcolor: self.rgb(0,153,204)
		},
		actions: [
			{
				action: 'in',
				options: {
					input: 14
				}
			}
		]
	});
	// These are the frame stores
	presets.push({
		category: 'Frames',
		label: 'No Frame',
		bank: {
			style: 'text',
			text: 'No\\nFrame',
			size: '14',
			color: '16777215',
			bgcolor: self.rgb(88,88,58)
		},
		actions: [
			{
				action: 'fr',
				options: {
					frame: 0
				}
			}
		]
	});

	presets.push({
		category: 'Frames',
		label: 'Frame 1',
		bank: {
			style: 'text',
			text: 'Fr 1',
			size: '14',
			color: '16777215',
			bgcolor: self.rgb(88,88,58)
		},
		actions: [
			{
				action: 'fr',
				options: {
					frame: 1
				}
			}
		]
	});

	presets.push({
		category: 'Frames',
		label: 'Frame 2',
		bank: {
			style: 'text',
			text: 'Fr 2',
			size: '14',
			color: '16777215',
			bgcolor: self.rgb(88,88,58)
		},
		actions: [
			{
				action: 'fr',
				options: {
					frame: 2
				}
			}
		]
	});

	presets.push({
		category: 'Frames',
		label: 'Frame 3',
		bank: {
			style: 'text',
			text: 'Fr 3',
			size: '14',
			color: '16777215',
			bgcolor: self.rgb(88,88,58)
		},
		actions: [
			{
				action: 'fr',
				options: {
					frame: 3
				}
			}
		]
	});

	presets.push({
		category: 'Frames',
		label: 'Frame 4',
		bank: {
			style: 'text',
			text: 'Fr 4',
			size: '14',
			color: '16777215',
			bgcolor: self.rgb(88,88,58)
		},
		actions: [
			{
				action: 'fr',
				options: {
					frame: 4
				}
			}
		]
	});

	presets.push({
		category: 'Frames',
		label: 'Frame 5',
		bank: {
			style: 'text',
			text: 'Fr 5',
			size: '14',
			color: '16777215',
			bgcolor: self.rgb(88,88,58)
		},
		actions: [
			{
				action: 'fr',
				options: {
					frame: 5
				}
			}
		]
	});

	presets.push({
		category: 'Frames',
		label: 'Frame 6',
		bank: {
			style: 'text',
			text: 'Fr 6',
			size: '14',
			color: '16777215',
			bgcolor: self.rgb(88,88,58)
		},
		actions: [
			{
				action: 'fr',
				options: {
					frame: 6
				}
			}
		]
	});

	presets.push({
		category: 'Frames',
		label: 'Frame 7',
		bank: {
			style: 'text',
			text: 'Fr 7',
			size: '14',
			color: '16777215',
			bgcolor: self.rgb(88,88,58)
		},
		actions: [
			{
				action: 'fr',
				options: {
					frame: 7
				}
			}
		]
	});

	presets.push({
		category: 'Frames',
		label: 'Frame 8',
		bank: {
			style: 'text',
			text: 'Fr 8',
			size: '14',
			color: '16777215',
			bgcolor: self.rgb(88,88,58)
		},
		actions: [
			{
				action: 'fr',
				options: {
					frame: 8
				}
			}
		]
	});

	// These are the presets of the Eikos

	presets.push({
		category: 'Presets',
		label: 'Preset 1',
		bank: {
			style: 'text',
			text: 'Preset\\n1',
			size: '14',
			color: '16777215',
			bgcolor: self.rgb(153,153,102)
		},
		actions: [
			{
				action: 'ps',
				options: {
					preset: 3
				}
			}
		]
	});

	presets.push({
		category: 'Presets',
		label: 'Preset 2',
		bank: {
			style: 'text',
			text: 'Preset\\n2',
			size: '14',
			color: '16777215',
			bgcolor: self.rgb(153,153,102)
		},
		actions: [
			{
				action: 'ps',
				options: {
					preset: 4
				}
			}
		]
	});

	presets.push({
		category: 'Presets',
		label: 'Preset 3',
		bank: {
			style: 'text',
			text: 'Preset\\n3',
			size: '14',
			color: '16777215',
			bgcolor: self.rgb(153,153,102)
		},
		actions: [
			{
				action: 'ps',
				options: {
					preset: 5
				}
			}
		]
	});

	presets.push({
		category: 'Presets',
		label: 'Preset 4',
		bank: {
			style: 'text',
			text: 'Preset\\n4',
			size: '14',
			color: '16777215',
			bgcolor: self.rgb(153,153,102)
		},
		actions: [
			{
				action: 'ps',
				options: {
					preset: 6
				}
			}
		]
	});

	presets.push({
		category: 'Presets',
		label: 'Preset 5',
		bank: {
			style: 'text',
			text: 'Preset\\n5',
			size: '14',
			color: '16777215',
			bgcolor: self.rgb(153,153,102)
		},
		actions: [
			{
				action: 'ps',
				options: {
					preset: 3
				}
			}
		]
	});

	presets.push({
		category: 'Presets',
		label: 'Preset 6',
		bank: {
			style: 'text',
			text: 'Preset\\n6',
			size: '14',
			color: '16777215',
			bgcolor: self.rgb(153,153,102)
		},
		actions: [
			{
				action: 'ps',
				options: {
					preset: 4
				}
			}
		]
	});

	presets.push({
		category: 'Presets',
		label: 'Preset 7',
		bank: {
			style: 'text',
			text: 'Preset\\n7',
			size: '14',
			color: '16777215',
			bgcolor: self.rgb(153,153,102)
		},
		actions: [
			{
				action: 'ps',
				options: {
					preset: 5
				}
			}
		]
	});

	presets.push({
		category: 'Presets',
		label: 'Preset 8',
		bank: {
			style: 'text',
			text: 'Preset\\n8',
			size: '14',
			color: '16777215',
			bgcolor: self.rgb(153,153,102)
		},
		actions: [
			{
				action: 'ps',
				options: {
					preset: 6
				}
			}
		]
	});
	self.setPresetDefinitions(presets);
}

// below is the table of definitions for the actual lables in the drop downs to the final command issues

instance.prototype.actions = function(system) {
	var self = this;

	self.system.emit('instance_actions', self.id, {
		'take': {
			label: 'Take'
		 },

		'Background LIVE': {
			label: 'Background LIVE',
			options: [{
				type:   'dropdown',
				label:  'Input',
				id:     'input',
				default: '0',
				choices: [
					{ id: '0', label: 'No Input' },
					{ id: '1', label: 'Input 1' },
					{ id: '2', label: 'Input 2' },
					{ id: '3', label: 'Input 3' },
					{ id: '4', label: 'Input 4' },
					{ id: '5', label: 'Input 5' },
					{ id: '6', label: 'Input 6' },
					{ id: '9', label: 'DVI 1' },
					{ id: '10', label: 'DVI 2' },
					{ id: '11', label: 'SDI 1' },
					{ id: '12', label: 'SDI 2' },
					{ id: '13', label: 'SDI 3' },
					{ id: '14', label: 'SDI 4' }
				]
			}]
		},

		'PIP 2': {
			label: 'PIP 2',
			options: [{
				type:   'dropdown',
				label:  'Input',
				id:     'input',
				default: '0',
				choices: [
					{ id: '0', label: 'No Input' },
					{ id: '1', label: 'Input 1' },
					{ id: '2', label: 'Input 2' },
					{ id: '3', label: 'Input 3' },
					{ id: '4', label: 'Input 4' },
					{ id: '5', label: 'Input 5' },
					{ id: '6', label: 'Input 6' },
					{ id: '9', label: 'DVI 1' },
					{ id: '10', label: 'DVI 2' },
					{ id: '11', label: 'SDI 1' },
					{ id: '12', label: 'SDI 2' },
					{ id: '13', label: 'SDI 3' },
					{ id: '14', label: 'SDI 4' }
				]
			}]
		},

		'PIP 3': {
			label: 'PIP 3',
			options: [{
				type:   'dropdown',
				label:  'Input',
				id:     'input',
				default: '0',
				choices: [
					{ id: '0', label: 'No Input' },
					{ id: '1', label: 'Input 1' },
					{ id: '2', label: 'Input 2' },
					{ id: '3', label: 'Input 3' },
					{ id: '4', label: 'Input 4' },
					{ id: '5', label: 'Input 5' },
					{ id: '6', label: 'Input 6' },
					{ id: '9', label: 'DVI 1' },
					{ id: '10', label: 'DVI 2' },
					{ id: '11', label: 'SDI 1' },
					{ id: '12', label: 'SDI 2' },
					{ id: '13', label: 'SDI 3' },
					{ id: '14', label: 'SDI 4' }
				]
			}]
		},

		'Background Frame': {
			label: 'Background Frame',
			options: [{
				type:   'dropdown',
				label:  'Frame',
				id:     'frame',
				default: '0',
				choices: [
					{ id: '0', label: 'No Frame' },
					{ id: '1', label: 'Frame 1' },
					{ id: '2', label: 'Frame 2' },
					{ id: '3', label: 'Frame 3' },
					{ id: '4', label: 'Frame 4' },
					{ id: '5', label: 'Frame 5' },
					{ id: '6', label: 'Frame 6' },
					{ id: '7', label: 'Frame 7' },
					{ id: '8', label: 'Frame 8' }
				]
			}]
		},

		'LOGO 1': {
			label: 'LOGO 1',
			options: [{
				type:   'dropdown',
				label:  'Logo',
				id:     'frame',
				default: '0',
				choices: [
					{ id: '0', label: 'No Logo' },
					{ id: '1', label: 'Logo 1' },
					{ id: '2', label: 'Logo 2' },
					{ id: '3', label: 'Logo 3' },
					{ id: '4', label: 'Logo 4' },
					{ id: '5', label: 'Logo 5' },
					{ id: '6', label: 'Logo 6' },
					{ id: '7', label: 'Logo 7' },
					{ id: '8', label: 'Logo 8' }
				]
			}]
		},

		'LOGO 2': {
			label: 'LOGO 2',
			options: [{
				type:   'dropdown',
				label:  'Logo',
				id:     'frame',
				default: '0',
				choices: [
					{ id: '0', label: 'No Logo' },
					{ id: '1', label: 'Logo 1' },
					{ id: '2', label: 'Logo 2' },
					{ id: '3', label: 'Logo 3' },
					{ id: '4', label: 'Logo 4' },
					{ id: '5', label: 'Logo 5' },
					{ id: '6', label: 'Logo 6' },
					{ id: '7', label: 'Logo 7' },
					{ id: '8', label: 'Logo 8' }
				]
			}]
		},


		'ps': {
			label: 'User Preset',
			options: [{
				type:   'dropdown',
				label:  'Preset',
				id:     'preset',
				default: '3',
				choices: [
					{ id: '3', label: 'Preset 1' },
					{ id: '4', label: 'Preset 2' },
					{ id: '5', label: 'Preset 3' },
					{ id: '6', label: 'Preset 4' },
					{ id: '7', label: 'Preset 5' },
					{ id: '8', label: 'Preset 6' },
					{ id: '9', label: 'Preset 7' },
					{ id: '10', label: 'Preset 8' }
				]
			}]
		}
	});
};

instance.prototype.action = function(action) {
	var self = this;
	var cmd
	var opt = action.options

	switch(action.action) {

		case 'take':
			cmd = '1TK \r\n 1TK';
			break;

		case 'Background LIVE':
			cmd = '1,2,' + opt.input + 'IN' + '\r\n' + '1,2,' + opt.input + 'IN' ;
			break;

		case 'PIP 2':
			cmd = '1,3,' + opt.input + 'IN' + '\r\n' + '1,3,' + opt.input + 'IN' ;
			break;

		case 'PIP 3':
			cmd = '1,4,' + opt.input + 'IN' + '\r\n' + '1,4,' + opt.input + 'IN' ;
			break;

		case 'Background Frame':
			cmd = '1,0,' + opt.frame + 'IN' + '\r\n' + '1,0,' + opt.frame + 'IN';
			break;

		case 'LOGO 1':
			cmd = '1,6,' + opt.frame + 'IN' + '\r\n' + '1,6,' + opt.frame + 'IN';
			break;

		case 'LOGO 2':
			cmd = '1,7,' + opt.frame + 'IN' + '\r\n' + '1,7,' + opt.frame + 'IN';
			break;

		case 'ps':
			cmd = '' + opt.preset + 'Nf \r\n 1Nt1Nc' + '\r\n' + '' + opt.preset + 'Nf \r\n 1Nt1Nc';
			break;

	}

	if (self.config.prot == 'tcp') {
		if (cmd !== undefined) {
			if (self.socket !== undefined && self.socket.connected) {
				self.socket.send(cmd);
			} else {
				debug('Socket not connected :(');
			}
		}
	}

	if (self.config.prot == 'udp') {
		if (cmd !== undefined ) {
			if (self.udp !== undefined ) {
				self.udp.send(cmd);
			}
		}
	};

};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
