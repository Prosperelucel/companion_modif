var tcp           = require('../../tcp');
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

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	self.config = config;
	self.init_tcp();

};

instance.prototype.init = function() {
	var self = this;

		debug = self.debug;
		log = self.log;

	self.init_presets();
	self.init_tcp();
};

instance.prototype.init_tcp = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	self.status(self.STATE_WARNING, 'Connecting');

	if (self.config.host) {
		self.socket = new tcp(self.config.host, self.config.port);

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
			width: 4,
			regex: self.REGEX_IP
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'TCP/Telnet Port (Default: 23)',
			width: 4,
			default: 23,
			regex: self.REGEX_PORT
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

instance.prototype.CHOICES_INPUTS = [
	{ id: '1',	label: 'Input 1' },
	{ id: '2',	label: 'Input 2' },
	{ id: '3',	label: 'Input 3' },
	{ id: '4',	label: 'Input 4' },
	{ id: '5',	label: 'Input 5' },
	{ id: '6',	label: 'Input 6' },
	{ id: '7',	label: 'Input 7' },
	{ id: '8',	label: 'Input 8' },
	{ id: '9',	label: 'Input 9' },
	{ id: '10',	label: 'Input 10' },
	{ id: '11',	label: 'Input 11' },
	{ id: '12',	label: 'Input 12' },
	{ id: '13',	label: 'Input 13' },
	{ id: '14',	label: 'Input 14' },
	{ id: '15',	label: 'Input 15' },
	{ id: '16',	label: 'Input 16' },
];

instance.prototype.CHOICES_OUTPUTS = [
	{ id: '0',	label: 'All Outputs' },
	{ id: '1',	label: 'Output 1' },
	{ id: '2',	label: 'Output 2' },
	{ id: '3',	label: 'Output 3' },
	{ id: '4',	label: 'Output 4' },
	{ id: '5',	label: 'Output 5' },
	{ id: '6',	label: 'Output 6' },
	{ id: '7',	label: 'Output 7' },
	{ id: '8',	label: 'Output 8' },
	{ id: '9',	label: 'Output 9' },
	{ id: '10',	label: 'Output 10' },
	{ id: '11',	label: 'Output 11' },
	{ id: '12',	label: 'Output 12' },
	{ id: '13',	label: 'Output 13' },
	{ id: '14',	label: 'Output 14' },
	{ id: '15',	label: 'Output 15' },
	{ id: '16',	label: 'Output 16' },
];

instance.prototype.CHOICES_AUDIO_MODE = [
	{ id: '0',	label: 'Bind To Output' },
	{ id: '1', 	label: 'Bind To Input' },
	{ id: '2', 	label: 'Matrix' },
];

instance.prototype.CHOICES_LCD = [
	{ id: '0',	label: 'Always ON' },
	{ id: '1', 	label: '15 sec' },
	{ id: '2', 	label: '30 sec' },
	{ id: '3', 	label: '60 sec' },
];

instance.prototype.CHOICES_RESOLUTIONS = [
	{ id: '0',	label: '1080P_2CH' },
	{ id: '1',	label: '1080P_6CH' },
	{ id: '2',	label: '1080P_8CH' },
	{ id: '3',	label: '1080P_3D_2CH' },
	{ id: '4',	label: '1080P_3D_6CH' },
	{ id: '5',	label: '1080P_3D_8CH' },
	{ id: '6',	label: '4K30HZ_3D_2CH' },
	{ id: '7',	label: '4K30HZ_3D_6CH' },
	{ id: '8',	label: '4K30HZ_3D_8CH' },
	{ id: '9',	label: '4K60HzY420_3D_2CH' },
	{ id: '10',	label: '4K60HzY420_3D_6CH' },
	{ id: '11',	label: '4K60HzY420_3D_8CH' },
	{ id: '12',	label: '4K60HZ_3D_2CH' },
	{ id: '13',	label: '4K60HZ_3D_6CH' },
	{ id: '14',	label: '4K60HZ_3D_8CH' },
	{ id: '15',	label: '1080P_2CH_HDR' },
	{ id: '16',	label: '1080P_6CH_HDR' },
	{ id: '17',	label: '1080P_8CH_HDR' },
	{ id: '18',	label: '1080P_3D_2CH_HDR' },
	{ id: '19',	label: '1080P_3D_6CH_HDR' },
	{ id: '20',	label: '1080P_3D_8CH_HDR' },
	{ id: '21',	label: '4K30HZ_3D_2CH_HDR' },
	{ id: '22',	label: '4K30HZ_3D_6CH_HDR' },
	{ id: '23',	label: '4K30HZ_3D_8CH_HDR' },
	{ id: '24',	label: '4K60HzY420_3D_2CH_HDR' },
	{ id: '25',	label: '4K60HzY420_3D_6CH_HDR' },
	{ id: '26',	label: '4K60HzY420_3D_8CH_HDR' },
	{ id: '27',	label: '4K60HZ_3D_2CH_HDR' },
	{ id: '28',	label: '4K60HZ_3D_6CH_HDR' },
	{ id: '29',	label: '4K60HZ_3D_8CH_HDR' },
	{ id: '30',	label: 'USER1_EDID' },
	{ id: '31',	label: 'USER2_EDID' },
	{ id: '32',	label: 'USER3_EDID' },
];

instance.prototype.CHOICES_COMMANDS_AUDIO_CH = [
	{ id: 'audio_enable',	label: 'All Ch',	action: '0'},
	{ id: 'audio_enable',	label: 'Ch 1',		action: '1'},
	{ id: 'audio_enable',	label: 'Ch 2',		action: '2'},
	{ id: 'audio_enable',	label: 'Ch 3',		action: '3'},
	{ id: 'audio_enable',	label: 'Ch 4',		action: '4'},
	{ id: 'audio_enable',	label: 'Ch 5',		action: '5'},
	{ id: 'audio_enable',	label: 'Ch 6',		action: '6'},
	{ id: 'audio_enable',	label: 'Ch 7',		action: '7'},
	{ id: 'audio_enable',	label: 'Ch 8',		action: '8'},
	{ id: 'audio_enable',	label: 'Ch 9',		action: '9'},
	{ id: 'audio_enable',	label: 'Ch 10',		action: '10'},
	{ id: 'audio_enable',	label: 'Ch 11', 	action: '11'},
	{ id: 'audio_enable',	label: 'Ch 12', 	action: '12'},
	{ id: 'audio_enable',	label: 'Ch 13', 	action: '13'},
	{ id: 'audio_enable',	label: 'Ch 14', 	action: '14'},
	{ id: 'audio_enable',	label: 'Ch 15', 	action: '15'},
	{ id: 'audio_enable',	label: 'Ch 16', 	action: '16'},
];

instance.prototype.CHOICES_COMMANDS_SYSTEM = [
	{ id: 'audio_matrix_mode', 	label: 'Audio Mode: Bind Output',	action: '0'},
	{ id: 'audio_matrix_mode', 	label: 'Audio Mode: Bind Input', 	action: '1'},
	{ id: 'audio_matrix_mode', 	label: 'Audio Mode: Matrix', 		action: '2'},
	{ id: 'lcd_on_time', 	label: 'LCD Always On',			action: '0'},
	{ id: 'lcd_on_time', 	label: 'LCD Timeout 15 sec',	action: '1'},
	{ id: 'lcd_on_time', 	label: 'LCD Timeout 30 sec',	action: '2'},
	{ id: 'lcd_on_time', 	label: 'LCD Timeout 60 sec',	action: '3'},
	{ id: 'key_lock', 			label: 'Key Lock On',		action: 'ON'},
	{ id: 'key_lock', 			label: 'Key Lock Off',		action: 'OFF'},
	{ id: 'factory_reset',	label: 'Factory Reset'},
];

instance.prototype.CHOICES_COMMANDS_ENABLE_DISABLE = [
	{ id: 'EN',		label: 'EN'},
	{ id: 'DIS',	label: 'DIS'},
];

instance.prototype.init_presets = function () {
	var self = this;
	var presets = [];
	var pstSize_small= '14';
	var pstSize_medium = '18';
	var pstSize_big = '24';

	for (var x = 0; x < 16; x++) {
		for (var y = 0; y < 16; y++) {
			presets.push({
				category: 'Video Route Out ' + (x+1),
				label: 'In ' + (y+1) + ' Out' + (x+1),
				bank: {
					style: 'text',
					text: 'In ' + (y+1) + ' Out' + (x+1),
					size: pstSize_big,
					color: '16777215',
					bgcolor: self.rgb(0,0,0)
				},
				actions: [{	
					action: 'video_route',
					options: {
						input: (y+1),
						output: (x+1)
					}
				}],
			});
		}
	}

	for (var x = 0; x < 16; x++) {
		for (var y = 0; y < 16; y++) {
			presets.push({
				category: 'Audio Route Out ' + (x+1),
				label: 'In ' + (y+1) + ' Out' + (x+1),
				bank: {
					style: 'text',
					text: 'In ' + (y+1) + ' Out' + (x+1),
					size: pstSize_big,
					color: '16777215',
					bgcolor: self.rgb(0,0,0)
				},
				actions: [{	
					action: 'audio_route',
					options: {
						input: (y+1),
						output: (x+1)
					}
				}],
			});
		}
	}

	for (var x = 0; x < 2; x++) {
		presets.push({
			category: 'En/Dis Video Out',
			label: 'Out All ' + self.CHOICES_COMMANDS_ENABLE_DISABLE[x].label,
			bank: {
				style: 'text',
				text: 'Out All ' + self.CHOICES_COMMANDS_ENABLE_DISABLE[x].label,
				size: pstSize_medium,
				color: '16777215',
				bgcolor: self.rgb(0,0,0)
			},
			actions: [{	
				action: 'video_enable',
				options: {
					output: '0',
					set: self.CHOICES_COMMANDS_ENABLE_DISABLE[x].id
				}
			}],
		});

		for (var y = 1; y < 16; y++) {
			presets.push({
				category: 'En/Dis Video Out',
				label: 'Out ' + (y+1) + ' ' + self.CHOICES_COMMANDS_ENABLE_DISABLE[x].label,
				bank: {
					style: 'text',
					text: 'Out ' + (y+1) + ' ' + self.CHOICES_COMMANDS_ENABLE_DISABLE[x].label,
					size: pstSize_big,
					color: '16777215',
					bgcolor: self.rgb(0,0,0)
				},
				actions: [{	
					action: 'video_enable', 
					options: {
						options: (y+1),
						set: self.CHOICES_COMMANDS_ENABLE_DISABLE[x].id
					}
				}],
			});
		}
	}

	for (var x = 0; x < 2; x++) {
		presets.push({
			category: 'En/Dis Audio Out',
			label: 'Ch All ' + self.CHOICES_COMMANDS_ENABLE_DISABLE[x].label,
			bank: {
				style: 'text',
				text: 'Ch All ' + self.CHOICES_COMMANDS_ENABLE_DISABLE[x].label,
				size: pstSize_big,
				color: '16777215',
				bgcolor: self.rgb(0,0,0)
			},
			actions: [{	
				action: 'audio_enable',
				options: {
					output: '0',
					set: self.CHOICES_COMMANDS_ENABLE_DISABLE[x].id
				}
			}],
		});

		for (var y = 1; y < 16; y++) {
			presets.push({
				category: 'En/Dis Audio Out',
				label: 'Ch ' + (y+1) + ' ' + self.CHOICES_COMMANDS_ENABLE_DISABLE[x].label,
				bank: {
					style: 'text',
					text: 'Ch ' + (y+1) + ' ' + self.CHOICES_COMMANDS_ENABLE_DISABLE[x].label,
					size: pstSize_big,
					color: '16777215',
					bgcolor: self.rgb(0,0,0)
				},
				actions: [{	
					action: 'audio_enable', 
					options: {
						options: (y+1),
						set: self.CHOICES_COMMANDS_ENABLE_DISABLE[x].id
					}
				}],
			});
		}
	}

	for (var input in self.CHOICES_COMMANDS_SYSTEM) {
		presets.push({
			category: 'System Commands',
			label: self.CHOICES_COMMANDS_SYSTEM[input].label,
			bank: {
				style: 'text',
				text: self.CHOICES_COMMANDS_SYSTEM[input].label,
				size: pstSize_small,
				color: '16777215',
				bgcolor: self.rgb(0,0,0)
			},
			actions: [{	
				action: self.CHOICES_COMMANDS_SYSTEM[input].id, 
				options: {
					set: self.CHOICES_COMMANDS_SYSTEM[input].action
				}
			}],
		});
	}

	self.setPresetDefinitions(presets);
}


instance.prototype.actions = function(system) {
	var self = this;

	self.system.emit('instance_actions', self.id, {
		'video_route': {
			label: 'Video Route',
			options: [
				{
					type: 'dropdown',
					id: 'input',
					label: 'Input',
					default: '1',
					choices: self.CHOICES_INPUTS
				},
				{
					type: 'dropdown',
					id: 'output',
					label: 'To Output',
					default: '0',
					choices: self.CHOICES_OUTPUTS
				}
			]
		},
		'audio_route': {
			label: 'Audio Route',
			options: [
				{
					type: 'dropdown',
					id: 'input',
					label: 'Input',
					default: '1',
					choices: self.CHOICES_INPUTS
				},
				{
					type: 'dropdown',
					id: 'output',
					label: 'To Output',
					default: '0',
					choices: self.CHOICES_OUTPUTS
				}
			]
		},
		'video_enable': {
			label: 'Enable/Disable Video',
			options: [
				{
					type: 'dropdown',
					id: 'output',
					label: 'output',
					default: '0',
					choices: self.CHOICES_AUDIO_OUTPUTS
				},
				{
				type: 'dropdown',
				id: 'set',
				label: 'Set',
				default: 'EN',
				choices: [
					{ id: 'EN',		label: 'Enable Video Output' },
					{ id: 'DIS',	label: 'Disable Video Output' }
				]
			}
			]
		},
		'audio_enable': {
			label: 'Enable/Disable Audio',
			options: [
				{
					type: 'dropdown',
					id: 'output',
					label: 'Output',
					default: '0',
					choices: self.CHOICES_OUTPUTS
				},
				{
				type: 'dropdown',
				id: 'set',
				label: 'Set',
				default: 'EN',
				choices: [
					{ id: 'EN',		label: 'Enable Audio Output' },
					{ id: 'DIS',	label: 'Disable Audio Output' }
				]
			}
			]
		},
		'video_resolution': {
			label: 'Video Input Resolution',
			options: [
				{
					type: 'dropdown',
					id: 'input',
					label: 'Input',
					default: '1',
					choices: self.CHOICES_INPUTS
				},
				{
					type: 'dropdown',
					id: 'set',
					label: 'Resolution',
					default: '0',
					choices: self.CHOICES_RESOLUTIONS
				}
			]
		},
		'audio_matrix_mode': {
			label: 'Audio Matrix Mode',
			options: [
				{
					type: 'dropdown',
					id: 'set',
					label: 'Mode',
					default: '0',
					choices: self.CHOICES_AUDIO_MODE
				}
			]
		},
		'lcd_on_time': {
			label: 'LCD On Time',
			options: [
				{
					type: 'dropdown',
					id: 'set',
					label: 'Select',
					default: '0',
					choices: self.CHOICES_LCD
				}
			]
		},
		'key_lock': {
			label: 'Key Lock',
			options: [
				{
					type: 'dropdown',
					id: 'set',
					label: 'Set',
					default: 'OFF',
					choices: [
						{ id: 'OFF',	label: 'OFF' },
						{ id: 'ON',		label: 'ON' }
					]
				}
			]
		},
		'factory_reset': {
			label: 'Factory Reset Device'
		}
	});
}

instance.prototype.action = function(action) {
	var self = this;
	var cmd;
	
	switch(action.action) {

		case 'video_route':
			cmd = 'SET OUT' + action.options.output + ' VS IN' + action.options.input;
			break;

		case 'audio_route':
			cmd = 'SET OUT' + action.options.output + ' AS IN' + action.options.input;
			break;

		case 'video_enable':
			cmd = 'SET OUT' + action.options.output + ' STREAM ' + action.options.set;
			break;

		case 'audio_enable':
			cmd = 'SET OUT' + action.options.output + ' EXA ' + action.options.set;
			break;

		case 'video_resolution':
			cmd = 'SET IN' + action.options.input + ' EDID ' + action.options.set;
			break;
			
		case 'audio_matrix_mode':
			cmd = 'SET EXAMX MODE' + action.options.set;
			break;

		case 'lcd_on_time':
			cmd = 'SET LCD ON T' + action.options.set;
			break;	
	
		case 'key_lock':
			cmd = 'SET KEY LOCK ' + action.options.set;
			break;

		case 'factory_reset':
			cmd = 'SET RST';
			break;
	}

	if (cmd !== undefined) {

			debug('sending ',cmd + '\r\n',"to",self.config.host);

			if (self.socket !== undefined && self.socket.connected) {
					self.socket.send(cmd);
			}
			else {
					debug('Socket not connected :(');
			}
	}
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;
