// Roland-vp42h

var tcp = require('../../tcp');
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

instance.prototype.CHOICES_SCENES = [
	{ id: '0', label: 'Scene 1' },
	{ id: '1', label: 'Scene 2' },
	{ id: '2', label: 'Scene 3' },
	{ id: '3', label: 'Scene 4' },
	{ id: '4', label: 'Scene 5' },
	{ id: '5', label: 'Scene 6' },
	{ id: '6', label: 'Scene 7' },
	{ id: '7', label: 'Scene 8' },
	{ id: '8', label: 'Scene 9' },
	{ id: '9', label: 'Scene 10' }
]

instance.prototype.CHOICES_LAYERS = [
	{ id: '0', label: 'Layer 1' },
	{ id: '1', label: 'Layer 2' },
	{ id: '2', label: 'Layer 3' },
	{ id: '3', label: 'Layer 4' }
]

instance.prototype.CHOICES_INPUTS = [
	{ id: '0', label: 'Input 1' },
	{ id: '1', label: 'Input 2' },
	{ id: '2', label: 'Input 3' },
	{ id: '3', label: 'Input 4' }
]

instance.prototype.CHOICES_INPUTS_WITHBLACK = [
	{ id: '0', label: 'Input 1' },
	{ id: '1', label: 'Input 2' },
	{ id: '2', label: 'Input 3' },
	{ id: '3', label: 'Input 4' },
	{ id: '4', label: 'Black' }
]

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;
	self.init_tcp();
}

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.init_tcp();
}

instance.prototype.init_tcp = function() {
	var self = this;
	var receivebuffer = '';

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	if (self.config.port === undefined) {
		self.config.port = 8023;
	}

	if (self.config.host) {
		self.socket = new tcp(self.config.host, self.config.port);

		self.socket.on('status_change', function (status, message) {
			self.status(status, message);
		});

		self.socket.on('error', function (err) {
			debug('Network error', err);
			self.log('error','Network error: ' + err.message);
		});

		self.socket.on('connect', function () {
			debug('Connected');
		});

		// if we get any data, display it to stdout
		self.socket.on('data', function(buffer) {
			var indata = buffer.toString('utf8');
			//future feedback can be added here
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
			value: 'This module will connect to a Roland Pro AV VP-42H Video Processor.'
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'IP Address',
			width: 6,
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

	debug('destroy', self.id);
}

instance.prototype.actions = function() {
	var self = this;

	self.system.emit('instance_actions', self.id, {
		
		'specify_transition_time': {
			label: 'Specify the video/scene transition time',
			options: 
			[
				{
					type: 'textinput',
					label: 'Value (0 - 4000 in milliseconds)',
					id: 'value',
					default: '0'
				}
			]
		},
		'switch_scenes': {
			label: 'Switch scenes',
			options:
			[
				{
					type: 'dropdown',
					label: 'Scene',
					id: 'scene',
					default: '0',
					choices: self.CHOICES_SCENES
				}
			]
		},
		'showhide_layer': {
			label: 'Show/Hide a layer',
			options:
			[
				{
					type: 'dropdown',
					label: 'Scene',
					id: 'scene',
					default: '0',
					choices: self.CHOICES_SCENES
				},
				{
					type: 'dropdown',
					label: 'Layer',
					id: 'layer',
					default: '0',
					choices: self.CHOICES_LAYERS
				},
				{
					type: 'dropdown',
					label: 'Show/Hide',
					id: 'value',
					default: '1',
					choices:
					[
						{ id: '0', label: 'Hide (Disabled)' },
						{ id: '1', label: 'Show (Enabled)' }
					]
				}
			]
		},
		'specify_input_layer': {
			label: 'Specify the input channel assigned to a layer',
			options:
			[
				{
					type: 'dropdown',
					label: 'Scene',
					id: 'scene',
					default: '0',
					choices: self.CHOICES_SCENES
				},
				{
					type: 'dropdown',
					label: 'Layer',
					id: 'layer',
					default: '0',
					choices: self.CHOICES_LAYERS
				},
				{
					type: 'dropdown',
					label: 'Input',
					id: 'input',
					default: '0',
					choices: self.CHOICES_INPUTS_WITHBLACK
				}
			]
		},
		'adjust_inputvolume': {
			label: 'Adjust the input channel volume',
			options:
			[
				{
					type: 'dropdown',
					label: 'Scene',
					id: 'scene',
					default: '0',
					choices: self.CHOICES_SCENES
				},
				{
					type: 'dropdown',
					label: 'Input',
					id: 'input',
					default: '0',
					choices: self.CHOICES_INPUTS
				},
				{
					type: 'textinput',
					label: 'Value (0 - 127)',
					id: 'value',
					default: '0'
				}
			]
		},
		'adjust_overallvolume': {
			label: 'Adjust the overall volume',
			options:
			[
				{
					type: 'dropdown',
					label: 'Scene',
					id: 'scene',
					default: '0',
					choices: self.CHOICES_SCENES
				},
				{
					type: 'textinput',
					label: 'Value (0 - 127)',
					id: 'value',
					default: '0'
				}
			]
		}
		
	});
}

instance.prototype.action = function(action) {

	var self = this;
	var cmd;
	var options = action.options;
	
	var lf = '\u000a';
	
	switch(action.action) {
		case 'specify_transition_time':
			cmd = 'set,10,19,0,' + options.value + lf;
			break;
		case 'switch_scenes':
			cmd = 'set,11,11,0,' + options.scene + lf;
			break;
		case 'showhide_layer':
			cmd = 'set,' + options.scene + ',43,' + options.layer + ',' + options.value + lf;
			break;
		case 'specify_input_layer':
			cmd = 'set,' + options.scene + ',44,' + options.layer + ',' + options.input + lf;
			break;
		case 'adjust_inputvolume':
			cmd = 'set,' + options.scene + ',1,' + options.input + ',' + options.value + lf;
			break;
		case 'adjust_overallvolume':
			cmd = 'set,' + options.scene + ',2,0,' + options.value + lf;
			break;
	}

	if (cmd !== undefined) {
		if (self.socket !== undefined && self.socket.connected) {
			self.socket.send(cmd);
		} else {
			debug('Socket not connected :(');
		}

	}
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;