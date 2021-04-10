// Roland-V600UHD

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
	{ id: '0', label: 'HDMI / RGB IN 1'},
	{ id: '1', label: 'HDMI IN 2'},
	{ id: '2', label: 'HDMI IN 3'},
	{ id: '3', label: 'HDMI IN 4'},
	{ id: '4', label: 'SDI IN 5'},
	{ id: '5', label: 'SDI IN 6'},
	{ id: '6', label: 'Still 1'},
	{ id: '7', label: 'Still 2 / Pattern Generator'}
]

instance.prototype.CHOICES_AUDIOINPUTS = [
	{ id: '0', label: 'Channel 1'},
	{ id: '1', label: 'Channel 2'},
	{ id: '2', label: 'Channel 3'},
	{ id: '3', label: 'Channel 4'},
	{ id: '4', label: 'Channel 5'},
	{ id: '5', label: 'Channel 6'},
	{ id: '6', label: 'Channel 7'},
	{ id: '7', label: 'Test Tone'}
]

instance.prototype.CHOICES_TRANSITION_PATTERNS = [
	{ id: '0', label: 'Wipe 1'},
	{ id: '1', label: 'Wipe 2'},
	{ id: '2', label: 'Wipe 3'},
	{ id: '3', label: 'Mix'}
]

instance.prototype.CHOICES_COMPOSITION_TYPES = [
	{ id: '0', label: 'None'},
	{ id: '1', label: 'PinP 1-1'},
	{ id: '2', label: 'PinP 1-2'},
	{ id: '3', label: 'Key 1'},
	{ id: '4', label: 'PinP 1-1 + Key 1'},
	{ id: '5', label: 'PinP 1-2 + Key 1'}
]

instance.prototype.CHOICES_DSK_TYPES = [
	{ id: '0', label: 'None'},
	{ id: '1', label: 'PinP 2-1'},
	{ id: '2', label: 'PinP 2-2'},
	{ id: '3', label: 'Key 2'},
	{ id: '4', label: 'PinP 2-1 + Key 2'},
	{ id: '5', label: 'PinP 2-2 + Key 2'}
]

instance.prototype.CHOICES_MEMORIES = [
	{ id: '0', label: '1-1'},
	{ id: '1', label: '1-2'},
	{ id: '2', label: '1-3'},
	{ id: '3', label: '1-4'},
	{ id: '4', label: '1-5'},
	{ id: '5', label: '1-6'},
	{ id: '6', label: '1-7'},
	{ id: '7', label: '1-8'},
	{ id: '8', label: '2-1'},
	{ id: '9', label: '2-2'},
	{ id: '10', label: '2-3'},
	{ id: '11', label: '2-4'},
	{ id: '12', label: '2-5'},
	{ id: '13', label: '2-6'},
	{ id: '14', label: '2-7'},
	{ id: '15', label: '2-8'},
	{ id: '16', label: '3-1'},
	{ id: '17', label: '3-2'},
	{ id: '18', label: '3-3'},
	{ id: '19', label: '3-4'},
	{ id: '20', label: '3-5'},
	{ id: '21', label: '3-6'},
	{ id: '22', label: '3-7'},
	{ id: '23', label: '3-8'},
	{ id: '24', label: '4-1'},
	{ id: '25', label: '4-2'},
	{ id: '26', label: '4-3'},
	{ id: '27', label: '4-4'},
	{ id: '28', label: '4-5'},
	{ id: '29', label: '4-6'},
	{ id: '30', label: '4-7'},
	{ id: '31', label: '4-8'},
	{ id: '32', label: '5-1'},
	{ id: '33', label: '5-2'},
	{ id: '34', label: '5-3'},
	{ id: '35', label: '5-4'},
	{ id: '36', label: '5-5'},
	{ id: '37', label: '5-6'},
	{ id: '38', label: '5-7'},
	{ id: '39', label: '5-8'},
	{ id: '40', label: '6-1'},
	{ id: '41', label: '6-2'},
	{ id: '42', label: '6-3'},
	{ id: '43', label: '6-4'},
	{ id: '44', label: '6-5'},
	{ id: '45', label: '6-6'},
	{ id: '46', label: '6-7'},
	{ id: '47', label: '6-8'},
	{ id: '48', label: '7-1'},
	{ id: '49', label: '7-2'},
	{ id: '50', label: '7-3'},
	{ id: '51', label: '7-4'},
	{ id: '52', label: '7-5'},
	{ id: '53', label: '7-6'},
	{ id: '54', label: '7-7'},
	{ id: '55', label: '7-8'},
	{ id: '56', label: '8-1'},
	{ id: '57', label: '8-2'},
	{ id: '58', label: '8-3'},
	{ id: '59', label: '8-4'},
	{ id: '60', label: '8-5'},
	{ id: '61', label: '8-6'},
	{ id: '62', label: '8-7'},
	{ id: '63', label: '8-8'}
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
			value: 'This module will connect to a Roland Pro AV V-600UHD Video Switcher.'
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
			label: 'Select PGM Channel',
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
		'select_pst': {
			label: 'Select PST Channel',
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
		'select_aux': {
			label: 'Select channel to send to AUX bus',
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
		'select_transition_pattern': {
			label: 'Select transition pattern',
			options: [
				{
					type: 'dropdown',
					label: 'Transition Pattern',
					id: 'transitionpattern',
					default: '0',
					choices: self.CHOICES_TRANSITION_PATTERNS
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
		'auto': {
			label: 'Press the [AUTO] button'
		},
		'cut': {
			label: 'Press the [CUT] button'
		},
		'select_composition_type': {
			label: 'Select Composition Type',
			options: [
				{
					type: 'dropdown',
					label: 'Composition Type',
					id: 'compositiontype',
					default: '0',
					choices: self.CHOICES_COMPOSITION_TYPES
				}
			]
		},
		'select_dsk_type': {
			label: 'Select DSK Type',
			options: [
				{
					type: 'dropdown',
					label: 'DSK Type',
					id: 'dsktype',
					default: '0',
					choices: self.CHOICES_DSK_TYPES
				}
			]
		},
		'composition': {
			label: 'Press the [COMPOSITION] button'
		},
		'dsk': {
			label: 'Press the [DSK] button'
		},
		'set_outputfade_onoff': {
			label: 'Set Output Fade On/Off',
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
		'set_outputfade_time': {
			label: 'Set Output Fade Time',
			options: [
				{
					type: 'textinput',
					label: 'Time between 0 (0.0 sec) and 100 (10.0 sec)',
					id: 'transitiontime',
					default: '1'
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
					label: '-801 (-INF dB), -800 (-80.0 dB) – 0 (0.0 dB) –100 (10.0 dB)',
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
					label: '-801 (-INF dB), -800 (-80.0 dB) – 0 (0.0 dB) –100 (10.0 dB)',
					id: 'level',
					default: '0'
				}
			]
		},
		'audio_aux_level': {
			label: 'Adjust Volume Level for Aux Bus',
			options: [
				{
					type: 'textinput',
					label: '-801 (-INF dB), -800 (-80.0 dB) – 0 (0.0 dB) –100 (10.0 dB)',
					id: 'level',
					default: '0'
				}
			]
		},
		'memory': {
			label: 'Call Up Memory',
			options: [
				{
					type: 'dropdown',
					label: 'Memory',
					id: 'memory',
					default: '0',
					choices: self.CHOICES_MEMORIES
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
		case 'select_pgm':
			cmd = '\u0002PGM:' + options.source + ';';
			break;
		case 'select_pvw':
			cmd = '\u0002PST:' + options.source + ';';
			break;
		case 'select_aux':
			cmd = '\u0002AUX:' + options.source + ';';
			break;
		case 'select_transition_pattern':
			cmd = '\u0002TRS:' + options.transitionpattern + ';';
			break;
		case 'set_transition_time':
			cmd = '\u0002TIM:' + options.transitiontime + ';';
			break;
		case 'auto':
			cmd = '\u0002ATO;';
			break;
		case 'cut':
			cmd = '\u0002CUT;';
			break;
		case 'select_composition_type':
			cmd = '\u0002CTY:' + options.compositiontype + ';';
			break;
		case 'select_dsk_type':
			cmd = '\u0002DTY:' + options.dsktype + ';';
			break;
		case 'composition':
			cmd = '\u0002CMP;';
			break;
		case 'dsk':
			cmd = '\u0002DSK;';
			break;
		case 'set_outputfade_onoff':
			cmd = '\u0002FDE:' + options.setting + ';';
			break;
		case 'set_outputfade_time':
			cmd = '\u0002FDT:' + options.transitiontime + ';';
			break;
		case 'audio_input_level':
			cmd = '\u0002IAL:' + options.audiochannel + ',' + options.level + ';';
			break;
		case 'audio_master_level':
			cmd = '\u0002OAL:' + options.level + ';';
			break;
		case 'audio_aux_level':
			cmd = '\u0002OAX:' + options.level + ';';
			break;
		case 'memory':
			cmd = '\u0002MEM:' + options.memory + ';';
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
