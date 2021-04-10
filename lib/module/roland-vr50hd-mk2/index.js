// Roland-VR-50HD MK II

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

instance.prototype.CHOICES_INPUTS = [
	{ id: '0', label: 'Input 1'},
	{ id: '1', label: 'Input 2'},
	{ id: '2', label: 'Input 3'},
	{ id: '3', label: 'Input 4'},
	{ id: '4', label: 'Still'}
]

instance.prototype.CHOICES_INPUTSOURCES = [
	{ id: '0', label: 'Input 1'},
	{ id: '1', label: 'Input 2'},
	{ id: '2', label: 'Input 3'},
	{ id: '3', label: 'Input 4'}
]

instance.prototype.CHOICES_INPUT_TYPES = [
	{ id: '0', label: 'SDI'},
	{ id: '1', label: 'HDMI'},
	{ id: '2', label: 'Composite'},
	{ id: '3', label: 'RGB/Component'}
]

instance.prototype.CHOICES_AUXINPUTS = [
	{ id: '0', label: 'Input 1'},
	{ id: '1', label: 'Input 2'},
	{ id: '2', label: 'Input 3'},
	{ id: '3', label: 'Input 4'},
	{ id: '4', label: 'PinP'},
	{ id: '5', label: 'PinP/Key'},
	{ id: '6', label: 'PGM'}
]

instance.prototype.CHOICES_STILLS = [
	{ id: '0', label: 'Still 1'},
	{ id: '1', label: 'Still 2'},
	{ id: '2', label: 'Still 3'},
	{ id: '3', label: 'Still 4'}
]

instance.prototype.CHOICES_SOURCES = [
	{ id: '0', label: 'SDI 1'},
	{ id: '1', label: 'SDI 2'},
	{ id: '2', label: 'SDI 3'},
	{ id: '3', label: 'SDI 4'},
	{ id: '4', label: 'HDMI 1'},
	{ id: '5', label: 'HDMI 2'},
	{ id: '6', label: 'HDMI 3'},
	{ id: '7', label: 'HDMI 4'},
	{ id: '8', label: 'Composite 1'},
	{ id: '9', label: 'Composite 2'},
	{ id: '10', label: 'RGB/Component 1'},
	{ id: '11', label: 'RGB/Component 2'}
]

instance.prototype.CHOICES_AUDIOINPUTS = [
	{ id: '0', label: 'Channel 1'},
	{ id: '1', label: 'Channel 2'},
	{ id: '2', label: 'Channel 3'},
	{ id: '3', label: 'Channel 4'},
	{ id: '4', label: 'Channels 5/6'},
	{ id: '5', label: 'Channels 7/8'},
	{ id: '6', label: 'Channels 9/10'},
	{ id: '7', label: 'Channels 11/12'}
]

instance.prototype.CHOICES_TRANSITION_EFFECTS = [
	{ id: '0', label: 'Cut'},
	{ id: '1', label: 'Mix'},
	{ id: '2', label: 'Wipe'}
]

instance.prototype.CHOICES_MEMORIES = [
	{ id: '0', label: 'Memory 1'},
	{ id: '1', label: 'Memory 2'},
	{ id: '2', label: 'Memory 3'},
	{ id: '3', label: 'Memory 4'},
	{ id: '4', label: 'Memory 5'},
	{ id: '5', label: 'Memory 6'},
	{ id: '6', label: 'Memory 7'},
	{ id: '7', label: 'Memory 8'}
]

instance.prototype.CHOICES_CAMERAS = [
	{ id: '0', label: 'Camera 1'},
	{ id: '1', label: 'Camera 2'},
	{ id: '2', label: 'Camera 3'},
	{ id: '3', label: 'Camera 4'},
	{ id: '4', label: 'Camera 5'},
	{ id: '5', label: 'Camera 6'}
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
			value: 'This module will connect to a Roland Pro AV VR-50HD MK II Video Switcher.'
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

		'select_pgm': {
			label: 'Select video input',
			options: [
				{
					type: 'dropdown',
					label: 'Source',
					id: 'source',
					default: '0',
					choices: self.CHOICES_INPUTS
				}
			]
		},
		'select_transition_effect': {
			label: 'Select transition effect',
			options: [
				{
					type: 'dropdown',
					label: 'Transition Effect',
					id: 'transitioneffect',
					default: '0',
					choices: self.CHOICES_TRANSITION_EFFECTS
				}
			]
		},
		'set_transition_time': {
			label: 'Set Video Transition Time',
			options: [
				{
					type: 'textinput',
					label: 'Time between 0 (0.0 sec) and 40 (4.0 sec)',
					id: 'transitiontime',
					default: '1'
				}
			]
		},
		'set_pinp_onoff': {
			label: 'Set the [PinP] Button On/Off',
			options: [
				{
					type: 'dropdown',
					label: 'Setting',
					id: 'setting',
					default: '0',
					choices: [
						{ id: '0', label: 'Off'},
						{ id: '1', label: 'On'}
					]
				}
			]
		},
		'set_pinpkey_onoff': {
			label: 'Set the [PinP/Key] Button On/Off',
			options: [
				{
					type: 'dropdown',
					label: 'Setting',
					id: 'setting',
					default: '0',
					choices: [
						{ id: '0', label: 'Off'},
						{ id: '1', label: 'On'}
					]
				}
			]
		},
		'set_still_onoff': {
			label: 'Set the [Still Key] Button On/Off',
			options: [
				{
					type: 'dropdown',
					label: 'Setting',
					id: 'setting',
					default: '0',
					choices: [
						{ id: '0', label: 'Off'},
						{ id: '1', label: 'On'}
					]
				}
			]
		},
		'set_outputfade_onoff': {
			label: 'Set the [Output Fade] Button On/Off',
			options: [
				{
					type: 'dropdown',
					label: 'Setting',
					id: 'setting',
					default: '0',
					choices: [
						{ id: '0', label: 'Off'},
						{ id: '1', label: 'On'}
					]
				}
			]
		},
		'set_freeze_onoff': {
			label: 'Set the [Freeze/User Logo] Button On/Off',
			options: [
				{
					type: 'dropdown',
					label: 'Setting',
					id: 'setting',
					default: '0',
					choices: [
						{ id: '0', label: 'Off'},
						{ id: '1', label: 'On'}
					]
				}
			]
		},
		'audio_input_level': {
			label: 'Adjust Volume Level of Input Audio',
			options: [
				{
					type: 'dropdown',
					label: 'Audio Channel',
					id: 'audiochannel',
					default: '0',
					choices: self.CHOICES_AUDIOINPUTS
				},
				{
					type: 'textinput',
					label: '0 (-INF dB) to 127 (10.0 dB)',
					id: 'level',
					default: '0'
				}
			]
		},
		'audio_master_level': {
			label: 'Adjust Volume Level for Master Out',
			options: [
				{
					type: 'textinput',
					label: '0 (-INF dB) to 127 (10.0 dB)',
					id: 'level',
					default: '0'
				}
			]
		},
		'memory': {
			label: 'Recall Memory',
			options: [
				{
					type: 'dropdown',
					label: 'Memory',
					id: 'memory',
					default: '0',
					choices: self.CHOICES_MEMORIES
				}
			]
		},
		'select_aux': {
			label: 'Select video for AUX bus',
			options: [
				{
					type: 'dropdown',
					label: 'Source',
					id: 'source',
					default: '0',
					choices: self.CHOICES_AUXINPUTS
				}
			]
		},
		'select_video_input_source': {
			label: 'Select source video for video input',
			options: [
				{
					type: 'dropdown',
					label: 'Input Number',
					id: 'inputnumber',
					default: '0',
					choices: self.CHOICES_INPUTSOURCES
				},
				{
					type: 'dropdown',
					label: 'For Inputs 3 & 4, you can only select either SDI or HDMI.',
					id: 'inputtype',
					default: '0',
					choices: self.CHOICES_INPUT_TYPES
				}
			]
		},
		'select_still_source': {
			label: 'Select still image of the [STILL] button',
			options: [
				{
					type: 'dropdown',
					label: 'Still Source',
					id: 'stillsource',
					default: '0',
					choices: self.CHOICES_STILLS
				}
			]
		},
		'select_stillkey_source': {
			label: 'Select source image for the Still Key',
			options: [
				{
					type: 'dropdown',
					label: 'Still Source',
					id: 'stillsource',
					default: '0',
					choices: self.CHOICES_STILLS
				}
			]
		},
		'select_pinp_source': {
			label: 'Select source video for PinP',
			options: [
				{
					type: 'dropdown',
					label: 'Source',
					id: 'source',
					default: '0',
					choices: self.CHOICES_SOURCES
				}
			]
		},
		'select_pinpkey_source': {
			label: 'Select source video for PinP/Key',
			options: [
				{
					type: 'dropdown',
					label: 'Source',
					id: 'source',
					default: '0',
					choices: self.CHOICES_SOURCES
				}
			]
		},
		'camera': {
			label: 'Recall Preset Memory on Remote Camera',
			options: [
				{
					type: 'dropdown',
					label: 'Camera',
					id: 'camera',
					default: '0',
					choices: self.CHOICES_CAMERAS
				},
				{
					type: 'dropdown',
					label: 'Memory',
					id: 'memory',
					default: '0',
					choices: self.CHOICES_MEMORIES
				}
			]
		},
		'resetusb': {
			label: 'Reset USB Connection'
		}		
	});
}

instance.prototype.action = function(action) {

	var self = this;
	var cmd;
	var options = action.options;
	
	switch(action.action) {
		case 'select_pgm':
			cmd = '\u0002PGM:' + options.source + ';';
			break;
		case 'select_transition_effect':
			cmd = '\u0002TRS:' + options.transitioneffect + ';';
			break;
		case 'set_transition_time':
			cmd = '\u0002TIM:' + options.transitiontime + ';';
			break;	
		case 'set_pinp_onoff':
			cmd = '\u0002PIP:' + options.setting + ';';
			break;
		case 'set_pinpkey_onoff':
			cmd = '\u0002PKY:' + options.setting + ';';
			break;
		case 'set_still_onoff':
			cmd = '\u0002SKY:' + options.setting + ';';
			break;
		case 'set_outputfade_onoff':
			cmd = '\u0002FDE:' + options.setting + ';';
			break;
		case 'set_freeze_onoff':
			cmd = '\u0002ULF:' + options.setting + ';';
			break;
		case 'audio_input_level':
			cmd = '\u0002';
			switch(options.audiochannel) {
				case '0':
					cmd += 'LM1:';
					break;
				case '1':
					cmd += 'LM2:';
					break;
				case '2':
					cmd += 'LM3:';
					break;
				case '3':
					cmd += 'LM4:';
					break;
				case '4':
					cmd += 'LS1:';
					break;
				case '5':
					cmd += 'LS2:';
					break;
				case '6':
					cmd += 'LS3:';
					break;
				case '7':
					cmd += 'LS4:';
					break;
				default:
					cmd += 'LM1:';
					break;
			}	
			cmd += options.level + ';';
			break;
		case 'audio_master_level':
			cmd = '\u0002LMN:' + options.level + ';';
			break;
		case 'memory':
			cmd = '\u0002MEM:' + options.memory + ';';
			break;
		case 'select_aux':
			cmd = '\u0002AUX:' + options.source + ';';
			break;			
		case 'select_video_input_source':
			cmd = '\u0002VIS:' + options.inputnumber + ',' + options.inputtype + ';';
			break;
		case 'select_still_source':
			cmd = '\u0002STS:' + options.stillsource + ';';
			break;
		case 'select_stillkey_source':
			cmd = '\u0002SKS:' + options.stillsource + ';';
			break;
		case 'select_pinp_source':
			cmd = '\u0002PIS:' + options.source + ';';
			break;
		case 'select_pinpkey_source':
			cmd = '\u0002PKS:' + options.source + ';';
			break;
		case 'camera':
			cmd = '\u0002CML:' + options.camera + ',' + options.memory + ';';
			break;
		case 'resetusb':
			cmd = '\u0002UVR;';
			break;
		default:
			cmd = null;
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
