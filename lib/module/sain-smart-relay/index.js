var instance_skel = require('../../instance_skel');
var debug;
var log;
var relay_max = '8';


function pad(num) {
	var s = "00" + num;
	return s.substr(s.length-2);
}

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions
	self.init_presets();	// init presets

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;

	relay_max = self.config.relay_nr;
	self.init_presets();
	self.actions();
}

instance.prototype.init = function() {
	var self = this;

	self.init_presets();
	self.status(self.STATE_OK);

	debug = self.debug;
	log = self.log;
}

instance.prototype.CHOICES_RELAY_CH = [
	{ id: '4',	label: '4 CH'},
	{ id: '8',	label: '8 CH'},
	{ id: '16',	label: '16 CH'},
];

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 5,
			regex: self.REGEX_IP
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'HTTP Port (Default: 30000)',
			width: 4,
			default: 30000,
			regex: self.REGEX_PORT
		},
		{
			type: 'dropdown',
			id: 'relay_nr',
			label: 'Relay Channels',
			width: 3,
			default: '8',
			choices: self.CHOICES_RELAY_CH
		}
	]
}

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;
	debug("destroy");
}

instance.prototype.CHOICES_RELAY_4_ON = [
	{ id: '1',	label: 'Relay 1 ON'},
	{ id: '3',	label: 'Relay 2 ON'},
	{ id: '5',	label: 'Relay 3 ON'},
	{ id: '7',	label: 'Relay 4 ON'},
];

instance.prototype.CHOICES_RELAY_4_OFF = [
	{ id: '0',	label: 'Relay 1 OFF'},
	{ id: '2',	label: 'Relay 2 OFF'},
	{ id: '4',	label: 'Relay 3 OFF'},
	{ id: '6',	label: 'Relay 4 OFF'},
];

instance.prototype.CHOICES_RELAY_8_ON = [
	{ id: '1',	label: 'Relay 1 ON'},
	{ id: '3',	label: 'Relay 2 ON'},
	{ id: '5',	label: 'Relay 3 ON'},
	{ id: '7',	label: 'Relay 4 ON'},
	{ id: '9',	label: 'Relay 5 ON'},
	{ id: '11',	label: 'Relay 6 ON'},
	{ id: '13',	label: 'Relay 7 ON'},
	{ id: '15',	label: 'Relay 8 ON'},
];

instance.prototype.CHOICES_RELAY_8_OFF = [
	{ id: '0',	label: 'Relay 1 OFF'},
	{ id: '2',	label: 'Relay 2 OFF'},
	{ id: '4',	label: 'Relay 3 OFF'},
	{ id: '6',	label: 'Relay 4 OFF'},
	{ id: '8',	label: 'Relay 5 OFF'},
	{ id: '10',	label: 'Relay 6 OFF'},
	{ id: '12',	label: 'Relay 7 OFF'},
	{ id: '14',	label: 'Relay 8 OFF'},
];

instance.prototype.CHOICES_RELAY_16_ON = [
	{ id: '1',	label: 'Relay 1 ON'},
	{ id: '3',	label: 'Relay 2 ON'},
	{ id: '5',	label: 'Relay 3 ON'},
	{ id: '7',	label: 'Relay 4 ON'},
	{ id: '9',	label: 'Relay 5 ON'},
	{ id: '11',	label: 'Relay 6 ON'},
	{ id: '13',	label: 'Relay 7 ON'},
	{ id: '15',	label: 'Relay 8 ON'},
	{ id: '17',	label: 'Relay 9 ON'},
	{ id: '19',	label: 'Relay 10 ON'},
	{ id: '21',	label: 'Relay 11 ON'},
	{ id: '23',	label: 'Relay 12 ON'},
	{ id: '25',	label: 'Relay 13 ON'},
	{ id: '27',	label: 'Relay 14 ON'},
	{ id: '29',	label: 'Relay 15 ON'},
	{ id: '31',	label: 'Relay 16 ON'},
];

instance.prototype.CHOICES_RELAY_16_OFF = [
	{ id: '0',	label: 'Relay 1 OFF'},
	{ id: '2',	label: 'Relay 2 OFF'},
	{ id: '4',	label: 'Relay 3 OFF'},
	{ id: '6',	label: 'Relay 4 OFF'},
	{ id: '8',	label: 'Relay 5 OFF'},
	{ id: '10',	label: 'Relay 6 OFF'},
	{ id: '12',	label: 'Relay 7 OFF'},
	{ id: '14',	label: 'Relay 8 OFF'},
	{ id: '16',	label: 'Relay 9 OFF'},
	{ id: '18',	label: 'Relay 10 OFF'},
	{ id: '20',	label: 'Relay 11 OFF'},
	{ id: '22',	label: 'Relay 12 OFF'},
	{ id: '24',	label: 'Relay 13 OFF'},
	{ id: '26',	label: 'Relay 14 OFF'},
	{ id: '28',	label: 'Relay 15 OFF'},
	{ id: '30',	label: 'Relay 16 OFF'},
];

instance.prototype.init_presets = function () {
	var self = this;
	var presets = [];
	var pstSize = '18';

	relay_max = self.config.relay_nr;

	switch (relay_max) {
		case '4':		
			for (var input in self.CHOICES_RELAY_4_ON) {
				presets.push({
					category: 'Relay ON',
					label: self.CHOICES_RELAY_4_ON[input].label,
					bank: {
						style: 'text',
						text: self.CHOICES_RELAY_4_ON[input].label,
						size: pstSize,
						color: '16777215',
						bgcolor: self.rgb(0,204,0)
					},
					actions: [{	
						action: 'relay_on', 
						options: {
							action: self.CHOICES_RELAY_4_ON[input].id
						}
					}]
				});
			}		
			for (var input in self.CHOICES_RELAY_4_OFF) {
				presets.push({
					category: 'Relay OFF',
					label: self.CHOICES_RELAY_4_OFF[input].label,
					bank: {
						style: 'text',
						text: self.CHOICES_RELAY_4_OFF[input].label,
						size: pstSize,
						color: '16777215',
						bgcolor: self.rgb(255,0,0)
					},
					actions: [{	
						action: 'relay_off', 
						options: {
							action: self.CHOICES_RELAY_4_OFF[input].id
						}
					}]
				});
			}
		break;
		
		case '8':		
			for (var input in self.CHOICES_RELAY_8_ON) {
				presets.push({
					category: 'Relay ON',
					label: self.CHOICES_RELAY_8_ON[input].label,
					bank: {
						style: 'text',
						text: self.CHOICES_RELAY_8_ON[input].label,
						size: pstSize,
						color: '16777215',
						bgcolor: self.rgb(0,204,0)
					},
					actions: [{	
						action: 'relay_on', 
						options: {
							action: self.CHOICES_RELAY_8_ON[input].id
						}
					}]
				});
			}		
			for (var input in self.CHOICES_RELAY_8_OFF) {
				presets.push({
					category: 'Relay OFF',
					label: self.CHOICES_RELAY_8_OFF[input].label,
					bank: {
						style: 'text',
						text: self.CHOICES_RELAY_8_OFF[input].label,
						size: pstSize,
						color: '16777215',
						bgcolor: self.rgb(255,0,0)
					},
					actions: [{	
						action: 'relay_off', 
						options: {
							action: self.CHOICES_RELAY_8_OFF[input].id
						}
					}]
				});
			}		
		break;
		
		case '16':		
			for (var input in self.CHOICES_RELAY_16_ON) {
				presets.push({
					category: 'Relay ON',
					label: self.CHOICES_RELAY_16_ON[input].label,
					bank: {
						style: 'text',
						text: self.CHOICES_RELAY_16_ON[input].label,
						size: pstSize,
						color: '16777215',
						bgcolor: self.rgb(0,204,0)
					},
					actions: [{	
						action: 'relay_on', 
						options: {
							action: self.CHOICES_RELAY_16_ON[input].id
						}
					}]
				});
			}		
			for (var input in self.CHOICES_RELAY_16_OFF) {
				presets.push({
					category: 'Relay OFF',
					label: self.CHOICES_RELAY_16_OFF[input].label,
					bank: {
						style: 'text',
						text: self.CHOICES_RELAY_16_OFF[input].label,
						size: pstSize,
						color: '16777215',
						bgcolor: self.rgb(255,0,0)
					},
					actions: [{	
						action: 'relay_off', 
						options: {
							action: self.CHOICES_RELAY_16_OFF[input].id
						}
					}]
				});
			}	
		break;
	}

	/*	

*/
	self.setPresetDefinitions(presets);
}

instance.prototype.actions = function(system) {
	var self = this;
	var x = self.CHOICES_RELAY_8_ON;
	var y = self.CHOICES_RELAY_8_OFF;

	relay_max = self.config.relay_nr;

	switch (relay_max) {
		case '4':		
			x = self.CHOICES_RELAY_4_ON;		
			y = self.CHOICES_RELAY_4_OFF;		
			break;
		
		case '8':		
			x = self.CHOICES_RELAY_8_ON;		
			y = self.CHOICES_RELAY_8_OFF;		
			break;
		
		case '16':	
			x = self.CHOICES_RELAY_16_ON;	
			y = self.CHOICES_RELAY_16_OFF;	
			break;
	}

	self.system.emit('instance_actions', self.id, {

		'relay_on': {
			label: 'Turn Relay ON',
			options: [
				{
					type: 'dropdown',
					id: 'action',
					label: 'Relay',
					default: '1',
					choices: x
				}
			]
		},
		'relay_off': {
			label: 'Turn Relay OFF',
			options: [
				{
					type: 'dropdown',
					id: 'action',
					label: 'Relay:',
					default: '0',
					choices: y
				}
			]
		}

	});
}

instance.prototype.action = function(action) {
	var self = this;
	var cmd;

	switch(action.action) {
		case 'relay_on':	cmd = pad(action.options.action);	break;
		case 'relay_off':	cmd = pad(action.options.action);	break;
	}
	
	if (cmd !== undefined) {
		
		var message = 'http://' + self.config.host + '/' + self.config.port + '/' + cmd;

		debug('sending ',message,"to",self.config.host);
		console.log('HTTP Send: ' + message);

		self.system.emit('rest_get', message, function (err, result) {
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