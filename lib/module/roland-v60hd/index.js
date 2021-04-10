// Roland-V60HD

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
	{ label: 'SDI IN 1', id: '0' },
	{ label: 'SDI IN 2', id: '1' },
	{ label: 'SDI IN 3', id: '2' },
	{ label: 'SDI IN 4', id: '3' },
	{ label: 'HDMI IN 5', id: '4' },
	{ label: 'HDMI/RGB IN 6', id: '5' },
	{ label: 'STILL/BKG IN 7', id: '6' },
	{ label: 'STILL/BKG IN 8', id: '7' }
]

instance.prototype.CHOICES_BUSES = [
	{ id: "0", label: "Program"},
	{ id: "1", label: "Preset/Preview"},
	{ id: "2", label: "Aux"}
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
			debug("Network error", err);
			self.log('error',"Network error: " + err.message);
		});

		self.socket.on('connect', function () {
			debug("Connected");
		});

		// if we get any data, display it to stdout
		self.socket.on("data", function(buffer) {
			var indata = buffer.toString("utf8");
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
			value: 'This module will connect to a Roland Pro AV V-60HD Video Switcher.'
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

	debug("destroy", self.id);
}

instance.prototype.actions = function() {
	var self = this;

	self.system.emit('instance_actions', self.id, {

		'select_pgm': {
			label: 'Select channel for final video output (PGM)',
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
		'select_pvw': {
			label: 'Select channel for preset video (PST/PVW)',
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
		'select_transition_effect': {
			label: 'Select transition effect',
			options: [
				{
					type: 'dropdown',
					label: 'Transition Effect',
					id: 'transitioneffect',
					default: '0',
					choices: [
						{ id: "0", label: "Mix"},
						{ id: "1", label: "Wipe 1"},
						{ id: "2", label: "Wipe 2"},
					]
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
		'cut': {
			label: 'Press the [CUT] button'
		},
		'auto': {
			label: 'Press the [AUTO] button'
		},
		'pinp1': {
			label: 'Press the [PinP 1] button'
		},
		'pinp2': {
			label: 'Press the [PinP 2] button'
		},
		'split': {
			label: 'Press the [Split] button'
		},
		'dsk': {
			label: 'Press the [DSK] button'
		},
		'dsk_pvw': {
			label: 'Press the DSK [PVW] button'
		},
		'dsk_automixing': {
			label: 'Press the DSK [AUTO MIXING] button'
		},
		'dsk_outputfade': {
			label: 'Press the DSK [OUTPUT FADE] button'
		},
		'pinp1_position': {
			label: 'Adjust display position of inset screen assigned to the [PinP 1] button',
			options: [
				{
					type: 'textinput',
					label: 'Horizontal Position (-450 to 450)',
					id: 'horizontal',
					default: '0'
				},
				{
					type: 'textinput',
					label: 'Vertical Position (-400 to 400)',
					id: 'vertical',
					default: '0'
				}
			]
		},
		'pinp2_position': {
			label: 'Adjust display position of inset screen assigned to the [PinP 2] button',
			options: [
				{
					type: 'textinput',
					label: 'Horizontal Position (-450 to 450)',
					id: 'horizontal',
					default: '0'
				},
				{
					type: 'textinput',
					label: 'Vertical Position (-400 to 400)',
					id: 'vertical',
					default: '0'
				}
			]
		},
		'split_position': {
			label: 'During split composition, adjust the display position of the video',
			options: [
				{
					type: 'textinput',
					label: 'Position 1 (-250 to 250)',
					id: 'value1',
					default: '0'
				},
				{
					type: 'textinput',
					label: 'Position 2 (-250 to 250)',
					id: 'value2',
					default: '0'
				}
			]
		},
		'dsk_selectsource': {
			label: 'During DSK composition, set the channel of the overlaid logo or image',
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
		'dsk_keylevel': {
			label: 'Adjust the key level (amount of extraction) for DSK composition',
			options: [
				{
					type: 'textinput',
					label: '0 - 255',
					id: 'level',
					default: '255'
				}
			]
		},
		'dsk_keygain': {
			label: 'Adjust the key gain (semi-transmissive region) for DSK composition',
			options: [
				{
					type: 'textinput',
					label: '0 - 255',
					id: 'level',
					default: '255'
				}
			]
		},
		'select_channel6input': {
			label: 'Select input connector for Channel 6',
			options: [
				{
					type: 'dropdown',
					label: 'Input Connector',
					id: 'inputconnector',
					default: '0',
					choices: [
						{ id: "0", label: "HDMI"},
						{ id: "1", label: "RGB/Component"}
					]
				}
			]
		},
		'select_outputbus_sdi1': {
			label: 'Select output bus for SDI 1',
			options: [
				{
					type: 'dropdown',
					label: 'Bus',
					id: 'bus',
					default: '0',
					choices: self.CHOICES_BUSES
				}
			]
		},
		'select_outputbus_sdi2': {
			label: 'Select output bus for SDI 2',
			options: [
				{
					type: 'dropdown',
					label: 'Bus',
					id: 'bus',
					default: '0',
					choices: self.CHOICES_BUSES
				}
			]
		},
		'select_outputbus_hdmi1': {
			label: 'Select output bus for HDMI 1',
			options: [
				{
					type: 'dropdown',
					label: 'Bus',
					id: 'bus',
					default: '0',
					choices: self.CHOICES_BUSES
				}
			]
		},
		'select_outputbus_hdmi2': {
			label: 'Select output bus for HDMI 2',
			options: [
				{
					type: 'dropdown',
					label: 'Bus',
					id: 'bus',
					default: '0',
					choices: self.CHOICES_BUSES
				}
			]
		},
		'hdcp': {
			label: 'Set HDCP On/Off',
			options: [
				{
					type: 'dropdown',
					label: 'HDCP Setting',
					id: 'hdcpsetting',
					default: '0',
					choices: [
						{ id: "0", label: "Off"},
						{ id: "1", label: "On"}
					]
				}
			]
		},
		'preset': {
			label: 'Call up Preset Memory',
			options: [
				{
					type: 'dropdown',
					label: 'Preset',
					id: 'preset',
					default: '0',
					choices: [
						{ id: "0", label: "Preset 1"},
						{ id: "1", label: "Preset 2"},
						{ id: "2", label: "Preset 3"},
						{ id: "3", label: "Preset 4"},
						{ id: "4", label: "Preset 5"},
						{ id: "5", label: "Preset 6"},
						{ id: "6", label: "Preset 7"},
						{ id: "7", label: "Preset 8"}
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
		case "select_pgm":
			cmd = "\u0002PGM:" + options.source + ";";
			break;
		case "select_pvw":
			cmd = "\u0002PST:" + options.source + ";";
			break;
		case "select_aux":
			cmd = "\u0002AUX:" + options.source + ";";
			break;
		case "select_transition_effect":
			cmd = "\u0002TRS:" + options.transitioneffect + ";";
			break;
		case "set_transition_time":
			cmd = "\u0002TIM:" + options.transitiontime + ";";
			break;
		case "cut":
			cmd = "\u0002CUT;";
			break;
		case "auto":
			cmd = "\u0002ATO;";
			break;
		case "pinp1":
			cmd = "\u0002P1S;";
			break;
		case "pinp2":
			cmd = "\u0002P2S;";
			break;
		case "split":
			cmd = "\u0002SPT;";
			break;
		case "dsk":
			cmd = "\u0002DSK;";
			break;
		case "dsk_pvw":
			cmd = "\u0002DVW;";
			break;
		case "dsk_automixing":
			cmd = "\u0002ATM;";
			break;
		case "dsk_outputfade":
			cmd = "\u0002FDE;";
			break;
		case "pinp1_position":
			cmd = "\u0002PP1:" + options.horizontal + "," + options.vertical + ";";
			break;
		case "pinp2_position":
			cmd = "\u0002PP2:" + options.horizontal + "," + options.vertical + ";";
			break;
		case "split_position":
			cmd = "\u0002SPT:" + options.value1 + "," + options.value2 + ";";
			break;
		case "dsk_selectsource":
			cmd = "\u0002DSS:" + options.source + ";";
			break;
		case "dsk_keylevel":
			cmd = "\u0002KYL:" + options.level + ";";
			break;
		case "dsk_keygain":
			cmd = "\u0002KYG:" + options.level + ";";
			break;
		case "select_channel6input":
			cmd = "\u0002IPS:" + options.inputconnector + ";";
			break;
		case "select_outputbus_sdi1":
			cmd = "\u0002OS1:" + options.bus + ";";
			break;
		case "select_outputbus_sdi2":
			cmd = "\u0002OS2:" + options.bus + ";";
			break;
		case "select_outputbus_hdmi1":
			cmd = "\u0002OH1:" + options.bus + ";";
			break;
		case "select_outputbus_hdmi2":
			cmd = "\u0002OH2:" + options.bus + ";";
			break;
		case "hdcp":
			cmd = "\u0002HCP:" + options.hdcpsetting + ";";
			break;
		case "preset":
			cmd = "\u0002MEM:" + options.preset + ";";
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
