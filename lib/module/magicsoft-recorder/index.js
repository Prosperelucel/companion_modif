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

	self.config = config;

	self.actions();
	self.init_presets();

}

instance.prototype.init = function() {
	var self = this;

	self.status(self.STATE_OK);
	self.init_presets();

	debug = self.debug;
	log = self.log;
}

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP/Host',
			width: 6,
			regex: self.REGEX_IP
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'Target Port (Default: 8045)',
			width: 3,
			default: 8045,
			regex: self.REGEX_PORT
		},
	]
}

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;
	debug("destroy");
}

instance.prototype.CHOICES_CHANNELS = [
	{ id: '0', label: 'CH 1' },
	{ id: '1', label: 'CH 2' },
	{ id: '2', label: 'CH 3' },
	{ id: '3', label: 'CH 4' },
	{ id: '4', label: 'CH 5' },
	{ id: '5', label: 'CH 6' },
	{ id: '6', label: 'CH 7' },
	{ id: '7', label: 'CH 8' },
];

instance.prototype.CHOICES_ENCODER = [
	{ id: '0', label: 'Encoder 1' },
	{ id: '1', label: 'Encoder 2' },
];

instance.prototype.CHOICES_VIDEO_MODE = [
	{ id: '-1', label: 'Unknown' },
	{ id: '0', 	label: 'PAL' },
	{ id: '1', 	label: 'NTSC' },
	{ id: '2', 	label: 'HD 720p 50' },
	{ id: '3', 	label: 'HD 720p 59.94' },
	{ id: '4', 	label: 'HD 1080i 50' },
	{ id: '5', 	label: 'HD 1080i 59.94' },
	{ id: '6', 	label: 'HD 1080p 23.98' },
	{ id: '7', 	label: 'HD 1080p 24' },
	{ id: '8', 	label: 'HD 1080p 25' },
	{ id: '9', 	label: 'HD 1080p 50' },
	{ id: '10', label: 'HD 1080p 29.97' },
	{ id: '11', label: 'HD 1080p 59.94' },
	{ id: '12', label: 'HD 1080p 30' },
	{ id: '13', label: 'HD 1080p 60' },
	{ id: '14', label: 'UHD 4K 2160p 23.98' },
	{ id: '15', label: 'UHD 4K 2160p 24' },
	{ id: '16', label: 'UHD 4K 2160p 25' },
	{ id: '17', label: 'UHD 4K 2160p 50' },
	{ id: '18', label: 'UHD 4K 2160p 29.97' },
	{ id: '19', label: 'UHD 4K 2160p 59.94' },
	{ id: '20', label: 'UHD 4K 2160p 30' },
	{ id: '21', label: 'UHD 4K 2160p 60' },
];

instance.prototype.CHOICES_REC_TIME = [
	{ id: '1', label: '1 Sec' },
	{ id: '5', label: '5 Sec' },
	{ id: '10', label: '10 Sec' },
	{ id: '15', label: '15 Sec' },
	{ id: '30', label: '30 Sec' },
];

instance.prototype.init_presets = function () {
	var self = this;
	var presets = [];
	var pstSize = '14';

	for (var input in self.CHOICES_CHANNELS) {

		presets.push({
			category: 'Recording Start',
			label: 'Rec Start ' + self.CHOICES_CHANNELS[input].label,
			bank: {
				style: 'text',
				text: 'Rec Start ' + self.CHOICES_CHANNELS[input].label,
				size: pstSize,
				color: '16777215',
				bgcolor: self.rgb(0,0,0)
			},
			actions: [{	
				action: 'rec_start', 
				options: {
					ch: self.CHOICES_CHANNELS[input].id,
					recname: self.CHOICES_CHANNELS[input].label
				}
			}]
		});

		presets.push({
			category: 'Recording Stop',
			label: 'Rec Stop ' + self.CHOICES_CHANNELS[input].label,
			bank: {
				style: 'text',
				text: 'Rec Stop ' + self.CHOICES_CHANNELS[input].label,
				size: pstSize,
				color: '16777215',
				bgcolor: self.rgb(0,0,0)
			},
			actions: [{	
				action: 'rec_stop', 
				options: {
					ch: self.CHOICES_CHANNELS[input].id,
				}
			}]
		});

		presets.push({
			category: 'Recording Split',
			label: 'Rec Split ' + self.CHOICES_CHANNELS[input].label,
			bank: {
				style: 'text',
				text: 'Rec Split ' + self.CHOICES_CHANNELS[input].label,
				size: pstSize,
				color: '16777215',
				bgcolor: self.rgb(0,0,0)
			},
			actions: [{	
				action: 'rec_split', 
				options: {
					ch: self.CHOICES_CHANNELS[input].id,
				}
			}]
		});

		presets.push({
			category: 'Recording Mark',
			label: 'Rec Mark ' + self.CHOICES_CHANNELS[input].label,
			bank: {
				style: 'text',
				text: 'Rec Mark ' + self.CHOICES_CHANNELS[input].label,
				size: pstSize,
				color: '16777215',
				bgcolor: self.rgb(0,0,0)
			},
			actions: [{	
				action: 'rec_mark', 
				options: {
					ch: self.CHOICES_CHANNELS[input].id,
				}
			}]
		});

	}

	for (var input1 in self.CHOICES_CHANNELS) {
		for (var input2 in self.CHOICES_VIDEO_MODE) {
			presets.push({
				category: 'Recording Preset',
				label: 'Preset ' + self.CHOICES_CHANNELS[input1].label + ' ' + self.CHOICES_VIDEO_MODE[input2].label,
				bank: {
					style: 'text',
					text: self.CHOICES_CHANNELS[input1].label + ' ' + self.CHOICES_VIDEO_MODE[input2].label,
					size: pstSize,
					color: '16777215',
					bgcolor: self.rgb(0,0,0)
				},
				actions: [{	
					action: 'rec_preset', 
					options: {
						ch: self.CHOICES_CHANNELS[input1].id,
						encoder: '0',
						video_mode: self.CHOICES_VIDEO_MODE[input2].label,
						preset: '0',
					}
				}]
			});
		}
	}

	for (var input1 in self.CHOICES_CHANNELS) {
		for (var input2 in self.CHOICES_REC_TIME) {
			presets.push({
				category: 'Recording Time Add',
				label: 'Rec ' + self.CHOICES_CHANNELS[input1].label + ' Add ' + self.CHOICES_REC_TIME[input2].label,
				bank: {
					style: 'text',
					text: 'Rec ' + self.CHOICES_CHANNELS[input1].label + ' Add ' + self.CHOICES_REC_TIME[input2].label,
					size: pstSize,
					color: '16777215',
					bgcolor: self.rgb(0,0,0)
				},
				actions: [{	
					action: 'rec_time', 
					options: {
						ch: self.CHOICES_CHANNELS[input1].id,
						time: self.CHOICES_REC_TIME[input2].id,
					}
				}]
			});
		}
	}

	self.setPresetDefinitions(presets);
}

instance.prototype.actions = function(system) {
	var self = this;

	self.setActions({

		'rec_start': {
			label: 'Recording Start',
			options: [
				{
					type: 'dropdown',
					id: 'ch',
					label: 'Channel:',
					default: '0',
					choices: self.CHOICES_CHANNELS
				},
				{
					type: 'textinput',
					id: 'recname',
					label: 'Rec Name:',
					default: ''
				}
			]
		},
		'rec_stop': {
			label: 'Recording Stop',
			options: [
				{
					type: 'dropdown',
					id: 'ch',
					label: 'Channel:',
					default: '0',
					choices: self.CHOICES_CHANNELS
				}
			]
		},
		'rec_split': {
			label: 'Recording Split',
			options: [
				{
					type: 'dropdown',
					id: 'ch',
					label: 'Channel:',
					default: '0',
					choices: self.CHOICES_CHANNELS
				}
			]
		},
		'rec_mark': {
			label: 'Recording Mark',
			options: [
				{
					type: 'dropdown',
					id: 'ch',
					label: 'Channel:',
					default: '0',
					choices: self.CHOICES_CHANNELS
				}
			]
		},
		'rec_preset': {
			label: 'Recording Preset',
			options: [
				{
					type: 'dropdown',
					id: 'ch',
					label: 'Channel:',
					default: '0',
					choices: self.CHOICES_CHANNELS
				},
				{
					type: 'dropdown',
					id: 'encoder',
					label: 'Encoder:',
					default: '0',
					choices: self.CHOICES_ENCODER
				},
				{
					type: 'dropdown',
					id: 'video_mode',
					label: 'Video Mode:',
					default: '-1',
					choices: self.CHOICES_VIDEO_MODE
				},
				{
					type: 'number',
					id: 'preset',
					label: 'Preset ID:',
					min: 0,
					max: 100,
					default: 0,
					required: true,
					range: false,
					regex: self.REGEX_NUMBER
				},
			]
		},
		'rec_time': {
			label: 'Recording Add Time',
			options: [
				{
					type: 'dropdown',
					id: 'ch',
					label: 'Channel:',
					default: '0',
					choices: self.CHOICES_CHANNELS
				},
				{
					type: 'number',
					id: 'time',
					label: 'Time In Seconds:',
					min: 0,
					default: 10,
					required: true,
					range: false,
					regex: self.REGEX_NUMBER
				}
			]
		},

	});
}

instance.prototype.action = function(action) {
	var self = this;
	var c = self.config;
	var o = action.options;
	var pack_cmd;
	var pack_body;
	var pack_type;
	var pack_url;

	switch(action.action) {

		case 'rec_start':
			pack_type = 'post';
			pack_cmd = '/recording/rec?channel=' + o.ch + '&recname=' + o.recname;
			break;

		case 'rec_stop':
			pack_type = 'post';
			pack_cmd = '/recording/stop?channel=' + o.ch;
			break;

		case 'rec_split':
			pack_type = 'post';
			pack_cmd = '/recording/split?channel=' + o.ch;
			break;

		case 'rec_mark':
			pack_type = 'post';
			pack_cmd = '/recording/mark?channel=' + o.ch;
			break;
			
		case 'rec_preset':
			pack_type = 'post';
			pack_cmd = '/recording/preset?channel=' + o.ch + '&encoder=' + o.encoder + '&videomode=' + o.video_mode + '&preset=' + o.preset;
			break;

		case 'rec_time':
			pack_type = 'post';
			pack_cmd = '/recording/time/add?channel=' + o.ch + '&time=' + o.time;
			break;
	
	}

	pack_url = 'http://' + c.host +  ':' + c.port + pack_cmd;

	if (pack_type == 'post') {
		self.system.emit('rest', pack_url, '',function (err, result) {
			if (err !== null) {
				self.log('error', 'HTTP POST Request failed (' + result.error.code + ')');
				self.status(self.STATUS_ERROR, result.error.code);
			}
			else {
				self.status(self.STATUS_OK);
			}
		});
	}
	else if (pack_type == 'get') {

		self.system.emit('rest_get', pack_url, function (err, result) {
			if (err !== null) {
				self.log('error', 'HTTP GET Request failed (' + result.error.code + ')');
				self.status(self.STATUS_ERROR, result.error.code);
			}
			else {
				self.status(self.STATUS_OK);
			}
		});
	}

}

instance_skel.extendedBy(instance);
exports = module.exports = instance;


