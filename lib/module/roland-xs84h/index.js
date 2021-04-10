// Roland-xs84h

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
	{ id: '0', label: 'Input 1' },
	{ id: '1', label: 'Input 2' },
	{ id: '2', label: 'Input 3' },
	{ id: '3', label: 'Input 4' },
	{ id: '4', label: 'Input 5' },
	{ id: '5', label: 'Input 6' },
	{ id: '6', label: 'Input 7' },
	{ id: '7', label: 'Input 8' }
]

instance.prototype.CHOICES_INPUT_TYPES = [
	{ id: '0', label: 'HDMI' },
	{ id: '1', label: 'RGB/Component' },
	{ id: '2', label: 'Composite' },
	{ id: '3', label: 'Y/C S-Video' },
	{ id: '4', label: 'Still 1' },
	{ id: '5', label: 'Still 2' },
	{ id: '6', label: 'Still 3' },
	{ id: '7', label: 'Still 4' },
	{ id: '8', label: 'Share' }
]

instance.prototype.CHOICES_INPUT_COLORSPACES = [
	{ id: '0', label: 'Auto' },
	{ id: '1', label: 'RGB (0-255)' },
	{ id: '2', label: 'RGB (16-235)' },
	{ id: '3', label: 'YCC (SD)' },
	{ id: '4', label: 'YCC (HD)' }
]

instance.prototype.CHOICES_INPUT_CHANNELS = [
	{ id: '0', label: 'HDMI 1' },
	{ id: '1', label: 'HDMI 2' },
	{ id: '2', label: 'HDMI 3' },
	{ id: '3', label: 'HDMI 4' },
	{ id: '4', label: 'HDMI 5' },
	{ id: '5', label: 'HDMI 6' },
	{ id: '6', label: 'HDMI 7' },
	{ id: '7', label: 'HDMI 8' },
	{ id: '8', label: 'Analog 1' },
	{ id: '9', label: 'Analog 2' },
	{ id: '10', label: 'Analog 3' },
	{ id: '11', label: 'Analog 4' },
	{ id: '12', label: 'Analog 5' },
	{ id: '13', label: 'Analog 6' },
	{ id: '14', label: 'Analog 7' },
	{ id: '15', label: 'Analog 8' },
]

instance.prototype.CHOICES_OUTPUTS = [
	{ id: '0', label: 'Output 1' },
	{ id: '1', label: 'Output 2' },
	{ id: '2', label: 'Output 3 (XS-83 and XS-84 only)' },
	{ id: '3', label: 'Output 4 (XS-84 only)' }
]

instance.prototype.CHOICES_OUTPUT_TYPES = [
	{ id: '0', label: 'DVI-D' },
	{ id: '1', label: 'HDMI' }
]

instance.prototype.CHOICES_OUTPUT_COLORSPACES = [
	{ id: '0', label: 'Auto' },
	{ id: '1', label: 'RGB (0-255)' },
	{ id: '2', label: 'RGB (16-235)' },
	{ id: '3', label: 'YCC (444)' },
	{ id: '4', label: 'YCC (422)' }
]

instance.prototype.CHOICES_OUTPUT_RESOLUTIONS  = [
	{ id: '0', label: '480i 4:3/576i 4:3'},
	{ id: '1', label: '480i 16:9/576i 16:9'},
	{ id: '2', label: '480p 4:3/576p 4:3'},
	{ id: '3', label: '480p 16:9/576p 16:9'},
	{ id: '4', label: '720/59.94P'},
	{ id: '5', label: '1080/59.94i'},
	{ id: '6', label: '1080/59.94P'},
	{ id: '7', label: '640 x 480'},
	{ id: '8', label: '800 x 600'},
	{ id: '9', label: '1024 x 768'},
	{ id: '10', label: '1280 x 768'},
	{ id: '11', label: '1280 x 800'},
	{ id: '12', label: '1366 x 768'},
	{ id: '13', label: '1280 x 1024'},
	{ id: '15', label: '1600 x 1200'},
	{ id: '16', label: '1920 x 1200'}
]

instance.prototype.CHOICES_OUTPUT_MODES = [
	{ id: '0', label: 'Matrix' },
	{ id: '1', label: 'Multi-2' },
	{ id: '2', label: 'Multi-3' },
	{ id: '3', label: 'Multi-4' },
	{ id: '4', label: 'Span-2' },
	{ id: '5', label: 'Span-3' },
	{ id: '6', label: 'Span-4' },
	{ id: '7', label: 'Rotation-L1' },
	{ id: '8', label: 'Rotation-L2' },
	{ id: '9', label: 'Rotation-L3' },
	{ id: '10', label: 'Rotation-L4' },
	{ id: '11', label: 'Rotation-R1' },
	{ id: '12', label: 'Rotation-R2' },
	{ id: '13', label: 'Rotation-R3' },
	{ id: '14', label: 'Rotation-R4' },
	{ id: '15', label: '4K-1' },
	{ id: '16', label: '4K-2' },
	{ id: '17', label: 'Dissolve-1' },
	{ id: '18', label: 'PGM-PST' },
	{ id: '19', label: '2 x PGM-PST' },
	{ id: '20', label: '3 x PGM-PST' },
	{ id: '21', label: 'Dual Dissolve' },
	{ id: '22', label: 'Dual PGM-PST' }	
]

instance.prototype.CHOICES_PRESETS = [
	{ id: '0', label: 'Preset 1' },
	{ id: '1', label: 'Preset 2' },
	{ id: '2', label: 'Preset 3' },
	{ id: '3', label: 'Preset 4' },
	{ id: '4', label: 'Preset 5' },
	{ id: '5', label: 'Preset 6' },
	{ id: '6', label: 'Preset 7' },
	{ id: '7', label: 'Preset 8' },
	{ id: '8', label: 'Preset 9' },
	{ id: '9', label: 'Preset 10' },
	{ id: '10', label: 'Preset 11' },
	{ id: '11', label: 'Preset 12' },
	{ id: '12', label: 'Preset 13' },
	{ id: '13', label: 'Preset 14' },
	{ id: '14', label: 'Preset 15' },
	{ id: '15', label: 'Preset 16' },
	{ id: '16', label: 'Preset 17' },
	{ id: '17', label: 'Preset 18' },
	{ id: '18', label: 'Preset 19' },
	{ id: '19', label: 'Preset 20' },
	{ id: '20', label: 'Preset 21' },
	{ id: '21', label: 'Preset 22' },
	{ id: '22', label: 'Preset 23' },
	{ id: '23', label: 'Preset 24' },
	{ id: '24', label: 'Preset 25' },
	{ id: '25', label: 'Preset 26' },
	{ id: '26', label: 'Preset 27' },
	{ id: '27', label: 'Preset 28' },
	{ id: '28', label: 'Preset 29' },
	{ id: '29', label: 'Preset 30' },
	{ id: '30', label: 'Preset 31' },
	{ id: '31', label: 'Preset 32' }	
]

instance.prototype.CHOICES_EDID_RGB = [	
	{ id: '0', label: 'Internal' },
	{ id: '1', label: '640 x 480' },
	{ id: '2', label: '800 x 600' },
	{ id: '3', label: '1024 x 768' },
	{ id: '4', label: '1280 x 720' },
	{ id: '5', label: '1280 x 800' },
	{ id: '6', label: '1366 x 768' },
	{ id: '7', label: '1280 x 1024' },
	{ id: '8', label: '1400 x 1050' },
	{ id: '9', label: '1600 x 1200' },
	{ id: '10', label: '1920 x 1200' }
]

instance.prototype.CHOICES_EDID_HDMI = [
	{ id: '0', label: 'Internal' },
	{ id: '1', label: '640 x 480' },
	{ id: '2', label: '800 x 600' },
	{ id: '3', label: '1024 x 768' },
	{ id: '4', label: '1280 x 720' },
	{ id: '5', label: '1280 x 800' },
	{ id: '6', label: '1366 x 768' },
	{ id: '7', label: '1280 x 1024' },
	{ id: '8', label: '1400 x 1050' },
	{ id: '9', label: '1600 x 1200' },
	{ id: '10', label: '1920 x 1200' },
	{ id: '11', label: 'DATA1' },
	{ id: '12', label: 'DATA2' },
	{ id: '13', label: 'DATA3' },
	{ id: '14', label: 'DATA4' },
	{ id: '15', label: 'DATA5' },
	{ id: '16', label: 'DATA6' },
	{ id: '17', label: 'DATA7' },
	{ id: '18', label: 'DATA8' },
	{ id: '19', label: '480i 4:3/576i 4:3' },
	{ id: '20', label: '480i 16:9/576i 16:9' },
	{ id: '21', label: '480p 4:3/576p 4:3' },
	{ id: '22', label: '480p 16: 9/576p 16: 9' },
	{ id: '23', label: '720p' },
	{ id: '24', label: '1080i' },
	{ id: '25', label: '1080p' }
]

instance.prototype.CHOICES_KEYLOCKMODES = [
	{ id: '0', label: 'Crosspoint' },
	{ id: '1', label: 'Switching Mode' },
	{ id: '2', label: 'Menu + Exit' },
	{ id: '3', label: 'Cursor + Value' },
	{ id: '4', label: 'Cross - No Input' },
	{ id: '5', label: 'Cross - Off' },
	{ id: '6', label: 'Cross - Output 1' },
	{ id: '7', label: 'Cross - Output 2' },
	{ id: '8', label: 'Cross - Output 3' },
	{ id: '9', label: 'Cross - Output 4' }
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
		
		'inputchannel_video_type': {
			label: 'Set video input channel signal type',
			options:
			[
				{
					type: 'dropdown',
					label: 'Input Channel',
					id: 'input',
					default: '0',
					choices: self.CHOICES_INPUTS
				},
				{
					type: 'dropdown',
					label: 'Type',
					id: 'type',
					default: '0',
					choices: self.CHOICES_INPUT_TYPES
				}
			]
		},
		'inputchannel_video_colorspace': {
			label: 'Set video input channel color space',
			options:
			[
				{
					type: 'dropdown',
					label: 'Input Channel',
					id: 'input',
					default: '0',
					choices: self.CHOICES_INPUTS
				},
				{
					type: 'dropdown',
					label: 'Color Space',
					id: 'colorspace',
					default: '0',
					choices: self.CHOICES_INPUT_COLORSPACES
				}
			]
		},
		'inputchannel_video_hdcp': {
			label: 'Enable/Disable Input Channel HDCP',
			options:
			[
				{
					type: 'dropdown',
					label: 'Input Channel',
					id: 'input',
					default: '0',
					choices: self.CHOICES_INPUTS
				},
				{
					type: 'dropdown',
					label: 'HDCP Enable/Disable',
					id: 'hdcp',
					default: '0',
					choices:
					[
						{ id: '0', label: 'Disable'},
						{ id: '1', label: 'Enable'}
					]
				}
			]
		},
		'inputchannel_video_aspectratio': {
			label: 'Set video input channel aspect ratio',
			options:
			[
				{
					type: 'dropdown',
					label: 'Input Channel',
					id: 'input',
					default: '0',
					choices: self.CHOICES_INPUTS
				},
				{
					type: 'dropdown',
					label: 'Aspect Ratio',
					id: 'aspectratio',
					default: '0',
					choices:
					[
						{ id: '0', label: 'Full'},
						{ id: '1', label: 'Letterbox'},
						{ id: '2', label: 'Crop'},
						{ id: '3', label: 'Dot by Dot'},
						{ id: '4', label: 'Manual'}
					]
				}
			]
		},
		'outputchannel_outputselect': {
			label: 'Set output select for a video output channel',
			options:
			[
				{
					type: 'dropdown',
					label: 'Output Channel',
					id: 'output',
					default: '0',
					choices: self.CHOICES_OUTPUTS
				},
				{
					type: 'dropdown',
					label: 'Output Select',
					id: 'outputselect',
					default: '0',
					choices:
					[
						{ id: '0', label: 'Auto'},
						{ id: '1', label: 'HDMI'},
						{ id: '2', label: 'HDBaseT'}
					]
				}
			]
		},
		'outputchannel_resolution': {
			label: 'Set output resolution for a video output channel',
			options:
			[
				{
					type: 'dropdown',
					label: 'Output Channel',
					id: 'output',
					default: '0',
					choices: self.CHOICES_OUTPUTS
				},
				{
					type: 'dropdown',
					label: 'Output Resolution',
					id: 'resolution',
					default: '0',
					choices: self.CHOICES_OUTPUT_RESOLUTIONS
				}
			]
		},
		'outputchannel_video_hdcp': {
			label: 'Enable/Disable Output Channel HDCP',
			options:
			[
				{
					type: 'dropdown',
					label: 'Output Channel',
					id: 'output',
					default: '0',
					choices: self.CHOICES_OUTPUTS
				},
				{
					type: 'dropdown',
					label: 'HDCP Enable/Disable',
					id: 'hdcp',
					default: '0',
					choices:
					[
						{ id: '0', label: 'Disable'},
						{ id: '1', label: 'Enable'}
					]
				}
			]
		},
		'outputchannel_video_colorspace': {
			label: 'Set video output channel color space',
			options:
			[
				{
					type: 'dropdown',
					label: 'Output Channel',
					id: 'output',
					default: '0',
					choices: self.CHOICES_OUTPUTS
				},
				{
					type: 'dropdown',
					label: 'Color Space',
					id: 'colorspace',
					default: '0',
					choices: self.CHOICES_OUTPUT_COLORSPACES
				}
			]
		},
		'outputchannel_video_signaltype': {
			label: 'Set video output channel signal type',
			options:
			[
				{
					type: 'dropdown',
					label: 'Output Channel',
					id: 'output',
					default: '0',
					choices: self.CHOICES_OUTPUTS
				},
				{
					type: 'dropdown',
					label: 'Type',
					id: 'type',
					default: '0',
					choices: self.CHOICES_OUTPUT_TYPES
				}
			]
		},
		'outputchannel_inputchannel_audioandvideo': {
			label: 'Select input channel audio and video for an output',
			options:
			[
				{
					type: 'dropdown',
					label: 'Output Channel',
					id: 'output',
					default: '0',
					choices: self.CHOICES_OUTPUTS
				},
				{
					type: 'dropdown',
					label: 'Input Channel (Audio and Video)',
					id: 'input',
					default: '0',
					choices: self.CHOICES_INPUTS
				}
			]
		},
		'outputchannel_inputchannel_video': {
			label: 'Select input channel video for an output',
			options:
			[
				{
					type: 'dropdown',
					label: 'Output Channel',
					id: 'output',
					default: '0',
					choices: self.CHOICES_OUTPUTS
				},
				{
					type: 'dropdown',
					label: 'Input Channel (Video Only)',
					id: 'input',
					default: '0',
					choices: self.CHOICES_INPUTS
				}
			]
		},
		'outputchannel_inputchannel_audio': {
			label: 'Select input channel audio for an output',
			options:
			[
				{
					type: 'dropdown',
					label: 'Output Channel',
					id: 'output',
					default: '0',
					choices: self.CHOICES_OUTPUTS
				},
				{
					type: 'dropdown',
					label: 'Input Channel (Audio Only)',
					id: 'input',
					default: '0',
					choices: self.CHOICES_INPUTS
				}
			]
		},
		'outputchannel_onoff': {
			label: 'Turn an output on or off',
			options:
			[
				{
					type: 'dropdown',
					label: 'Output Channel',
					id: 'output',
					default: '0',
					choices: self.CHOICES_OUTPUTS
				},
				{
					type: 'dropdown',
					label: 'On or Off',
					id: 'value',
					default: '0',
					choices: [
						{ id: '0', label: 'On'},
						{ id: '1', label: 'Off'}
					]
				}
			]
		},
		'audiolevel_hdmiinput': {
			label: 'Set the audio input level of an HDMI input',
			options:
			[
				{
					type: 'dropdown',
					label: 'Input Channel',
					id: 'input',
					default: '0',
					choices: self.CHOICES_INPUTS
				},
				{
					type: 'textinput',
					label: 'Level (0 - 127)',
					id: 'value',
					default: '0'
				}
			]
		},
		'audiolevel_audioinput': {
			label: 'Set the audio input level of an Audio input',
			options:
			[
				{
					type: 'dropdown',
					label: 'Input Channel',
					id: 'input',
					default: '0',
					choices: self.CHOICES_INPUTS
				},
				{
					type: 'textinput',
					label: 'Level (0 - 127)',
					id: 'value',
					default: '0'
				}
			]
		},
		'audiolevel_output': {
			label: 'Set the audio level of an output',
			options:
			[
				{
					type: 'dropdown',
					label: 'Output Channel',
					id: 'output',
					default: '0',
					choices: self.CHOICES_OUTPUTS
				},
				{
					type: 'textinput',
					label: 'Level (0 - 127)',
					id: 'value',
					default: '0'
				}
			]
		},
		'mute_hdmi_onoff': {
			label: 'Set mute on/off for an HDMI input',
			options:
			[
				{
					type: 'dropdown',
					label: 'Input Channel',
					id: 'input',
					default: '0',
					choices: self.CHOICES_INPUTS
				},
				{
					type: 'dropdown',
					label: 'On or off',
					id: 'value',
					default: '0',
					choices: [
						{ id: '0', label: 'Off'},
						{ id: '1', label: 'On'}
					]
				}
			]
		},
		'mute_audio_onoff': {
			label: 'Set mute on/off for an Audio input',
			options:
			[
				{
					type: 'dropdown',
					label: 'Input Channel',
					id: 'input',
					default: '0',
					choices: self.CHOICES_INPUTS
				},
				{
					type: 'dropdown',
					label: 'On or off',
					id: 'value',
					default: '0',
					choices: [
						{ id: '0', label: 'Off'},
						{ id: '1', label: 'On'}
					]
				}
			]
		},
		'mute_output_onoff': {
			label: 'Set mute on/off for an output',
			options:
			[
				{
					type: 'dropdown',
					label: 'Output Channel',
					id: 'input',
					default: '0',
					choices: self.CHOICES_OUTPUTS
				},
				{
					type: 'dropdown',
					label: 'On or off',
					id: 'value',
					default: '0',
					choices: [
						{ id: '0', label: 'Off'},
						{ id: '1', label: 'On'}
					]
				}
			]
		},
		'audio_output_delay': {
			label: 'Set audio output delay time',
			options:
			[
				{
					type: 'dropdown',
					label: 'Output Channel',
					id: 'output',
					default: '0',
					choices: self.CHOICES_OUTPUTS
				},
				{
					type: 'textinput',
					label: 'Level (0 - 170) in milliseconds',
					id: 'value',
					default: '0'
				}
			]
		},
		'video_outputmode': {
			label: 'Set video output mode',
			options:
			[
				{
					type: 'dropdown',
					label: 'Output Mode',
					id: 'mode',
					default: '0',
					choices: self.CHOICES_OUTPUT_MODES
				}
			]
		},
		'recall_preset': {
			label: 'Recall Preset',
			options:
			[
				{
					type: 'dropdown',
					label: 'Recall Preset',
					id: 'preset',
					default: '0',
					choices: self.CHOICES_PRESETS
				}
			]
		},
		
		//implement auto command here later
		
		'audio_sendlevel': {
			label: 'Set the send level for audio sent to an output',
			options:
			[
				{
					type: 'dropdown',
					label: 'Output',
					id: 'output',
					default: '0',
					choices: self.CHOICES_OUTPUTS
				},
				{
					type: 'dropdown',
					label: 'Input',
					id: 'input',
					default: '0',
					choices: self.CHOICES_INPUT_CHANNELS
				},
				{
					type: 'textinput',
					label: 'Send Rate (0 - 100)',
					id: 'value',
					default: '0'
				}
			]
		},
		'edid_rgb': {
			label: 'Set the EDID for an RGB Input',
			options:
			[
				{
					type: 'dropdown',
					label: 'Input',
					id: 'input',
					default: '0',
					choices: self.CHOICES_INPUTS
				},
				{
					type: 'dropdown',
					label: 'EDID',
					id: 'edid',
					default: '0',
					choices: self.CHOICES_EDID_RGB
				}
			]
		},
		'edid_hdmi': {
			label: 'Set the EDID for an HDMI Input',
			options:
			[
				{
					type: 'dropdown',
					label: 'Input',
					id: 'input',
					default: '0',
					choices: self.CHOICES_INPUTS
				},
				{
					type: 'dropdown',
					label: 'EDID',
					id: 'edid',
					default: '0',
					choices: self.CHOICES_EDID_HDMI
				}
			]
		},
		'panel_lock': {
			label: 'Set panel lock',
			options:
			[
				{
					type: 'dropdown',
					label: 'On or Off',
					id: 'value',
					default: '0',
					choices: [
						{ id: '0', label: 'Off'},
						{ id: '1', label: 'On'}
					]
				}
			]
		},
		'key_lock_mode': {
			label: 'Set Key Lock Mode',
			options:
			[
				{
					type: 'dropdown',
					label: 'Key Lock Mode',
					id: 'mode',
					default: '0',
					choices: self.CHOICES_KEYLOCKMODES
				},
				{
					type: 'dropdown',
					label: 'On or Off',
					id: 'value',
					default: '0',
					choices: [
						{ id: '0', label: 'Off'},
						{ id: '1', label: 'On'}
					]
				}
			]
		}
		
	});
}

instance.prototype.action = function(action) {

	var self = this;
	var cmd;
	var options = action.options;
	
	switch(action.action) {
		case 'inputchannel_video_type':
			cmd = 'VIS:' + options.input + ',' + options.type + ';';
			break;
		case 'inputchannel_video_colorspace':
			cmd = 'VIC:' + options.input + ',' + options.colorspace + ';';
			break;
		case 'inputchannel_video_hdcp':
			cmd = 'VIH:' + options.input + ',' + options.hdcp + ';';
			break;
		case 'inputchannel_video_aspectratio':
			cmd = 'VIA:' + options.input + ',' + options.aspectratio + ';';
			break;
		case 'outputchannel_outputselect':
			cmd = 'VOS:' + options.output + ',' + options.outputselect + ';';
			break;
		case 'outputchannel_resolution':
			cmd = 'VOR:' + options.output + ',' + options.resolution + ';';
			break;
		case 'outputchannel_video_hdcp':
			cmd = 'VOH:' + options.output + ',' + options.hdcp + ';';
			break;
		case 'outputchannel_video_colorspace':
			cmd = 'VOC:' + options.output + ',' + options.colorspace + ';';
			break;
		case 'outputchannel_video_signaltype':
			cmd = 'VOD:' + options.output + ',' + options.type + ';';
			break;
		case 'outputchannel_inputchannel_audioandvideo':
			cmd = 'OAV:' + options.output + ',' + options.input + ';';
			break;
		case 'outputchannel_inputchannel_video':
			cmd = 'OVS:' + options.output + ',' + options.input + ';';
			break;
		case 'outputchannel_inputchannel_audio':
			cmd = 'OAS:' + options.output + ',' + options.input + ';';
			break;
		case 'outputchannel_onoff':
			cmd = 'OFS:' + options.output + ',' + options.value + ';';
			break;
		case 'audiolevel_hdmiinput':
			cmd = 'IDL:' + options.input + ',' + options.value + ';';
			break;
		case 'audiolevel_audioinput':
			cmd = 'IAL:' + options.input + ',' + options.value + ';';
			break;
		case 'audiolevel_output':
			cmd = 'OAL:' + options.output + ',' + options.value + ';';
			break;
		case 'mute_hdmi_onoff':
			cmd = 'IDM:' + options.input + ',' + options.value + ';';
			break;
		case 'mute_audio_onoff':
			cmd = 'IAM:' + options.input + ',' + options.value + ';';
			break;
		case 'mute_output_onoff':
			cmd = 'OAM:' + options.output + ',' + options.value + ';';
			break;
		case 'audio_output_delay':
			cmd = 'ADT:' + options.output + ',' + options.value + ';';
			break;
		case 'video_outputmode':
			cmd = 'MOD:' + options.mode + ';';
			break;
		case 'recall_preset':
			cmd = 'PSE:' + options.preset + ';';
			break;
		case 'audio_sendlevel':
			switch(options.output) {
				case '0':
					cmd = 'ASA:';
					break;
				case '1':
					cmd = 'ASB:';
					break;
				case '2':
					cmd = 'ASC:';
					break;
				case '3':
					cmd = 'ASD:';
					break;
			}
			cmd += options.input + ',' + options.value + ';';
			break;
		case 'edid_rgb':
			cmd = 'AED:' + options.input + ',' + options.edid + ';';
			break;
		case 'edid_hdmi':
			cmd = 'DED:' + options.input + ',' + options.edid + ';';
			break;
		case 'panel_lock':
			cmd = 'PLS:' + options.value + ';';
			break;
		case 'key_lock_mode':
			cmd = 'KLM:' + options.mode + ',' + options.edid + ';';
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