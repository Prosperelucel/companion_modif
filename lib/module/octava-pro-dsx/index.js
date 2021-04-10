var instance_skel = require('../../instance_skel');
var debug;
var log;

function pad(num) {
	var s = "000" + num;
	return s.substr(s.length-3);
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
	self.init_presets();

	self.config = config;

	self.actions();
}

instance.prototype.init = function() {
	var self = this;

	self.init_presets();
	self.status(self.STATE_OK);

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
			label: 'Target IP',
			width: 12,
			regex: self.REGEX_IP
		}
		]
}

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;
	debug("destroy");
}

instance.prototype.CHOICES_SCALE = [
	{ id: 'scale_rx:passthru', 	label: 'Pass Thru' },
	{ id: 'scale_rx:720@60',	 	label: '720P@60Hz' },
	{ id: 'scale_rx:1080@25', 	label: '1080P@25Hz' },
	{ id: 'scale_rx:1080@30', 	label: '1080P@30Hz' },
	{ id: 'scale_rx:1080@50', 	label: '1080P@50Hz' },
	{ id: 'scale_rx:1080@60', 	label: '1080P@60Hz' },
	{ id: 'scale_rx:3840@25',		label: '3840x2160@25Hz' },
	{ id: 'scale_rx:3840@30', 	label: '3840x2160@30Hz' },
];

instance.prototype.CHOICES_ROTATE = [
	{ id: 'rotate:0', 	label: 'Rotate 0 Degrees' },
	{ id: 'rotate:90', 	label: 'Rotate 90 Degrees' },
	{ id: 'rotate:180',	label: 'Rotate 180 Degrees' },
	{ id: 'rotate:270',	label: 'Rotate 270 Degrees' },
];

instance.prototype.CHOICES_COMMANDS_1 = [
	{ id: 'video_on', 	label: 'Video ON' },
	{ id: 'video_off',	label: 'Video OFF' },
	{ id: 'reboot',			label: 'Reboot' },
	{ id: 'reset', 			label: 'Factory Reset' },
];

instance.prototype.init_presets = function () {
	var self = this;
	var presets = [];
	var pstSize = '18';
	
	for (var i = 0; i < 199; i++) {
		presets.push({
			category: 'TX Channel Select',
			label: 'CH ' + (i+1),
			bank: {
				style: 'text',
				text: 'CH ' + (i+1),
				size: pstSize,
				color: '16777215',
				bgcolor: 0
			},
			actions: [{
				action: 'rx_switch',
				options: {
					action: (i+1),
				}
			}]
		});
	}

	for (var input in self.CHOICES_SCALE) {
		presets.push({
			category: 'Video Scale',
			label: self.CHOICES_SCALE[input].label,
			bank: {
				style: 'text',
				text: self.CHOICES_SCALE[input].label,
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [{
				action: 'scale',
				options: {
					action: self.CHOICES_SCALE[input].id,
				}
			}]
		});
	}	

	for (var input in self.CHOICES_ROTATE) {
		presets.push({
			category: 'Video Rotate',
			label: self.CHOICES_ROTATE[input].label,
			bank: {
				style: 'text',
				text: self.CHOICES_ROTATE[input].label,
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [{
				action: 'rotate',
				options: {
					action: self.CHOICES_ROTATE[input].id,
				}
			}]
		});
	}		

	for (var input in self.CHOICES_COMMANDS_1) {
		presets.push({
			category: 'Commands',
			label: self.CHOICES_COMMANDS_1[input].label,
			bank: {
				style: 'text',
				text: self.CHOICES_COMMANDS_1[input].label,
				size: pstSize,
				color: '16777215',
				bgcolor: 0
			},
			actions: [{
				action: self.CHOICES_COMMANDS_1[input].id,
			}]
		});
	}

	self.setPresetDefinitions(presets);
}

instance.prototype.actions = function(system) {
	var self = this;

	self.system.emit('instance_actions', self.id, {

		'rx_switch': {
			label: 'Connect to TX CH: (1-199)',
			options: [
				{
					type: 'number',
					id: 'action',
					label: 'Channel number (1-199)',
					min: 1,
					max: 199,
					default: 1,
					required: true,
					range: false,
					regex: self.REGEX_NUMBER
				}
			]
		},
		'scale': {
			label: 'Scale RX Video Output',
			options: [
				{
					type: 'dropdown',
					id: 'action',
					label: 'Resolution:',
					default: 'scale_rx:1080@60',
					choices: self.CHOICES_SCALE
				},
			]
		},
		'rotate': {
			label: 'Rotate RX Video Output',
			options: [
				{
					type: 'dropdown',
					id: 'action',
					label: 'Rotate:',
					default: 'rotate:0',
					choices: self.CHOICES_ROTATE
				},
			]
		},

		'video_on': 	{ label: 'Video ON' },
		'video_off':	{ label: 'Video OFF' },
		'reboot':			{ label: 'Reboot Device' },
		'reset': 			{ label: 'Reset Default' },
				
	});
}

instance.prototype.action = function(action) {
	var self = this;
	var cmd;

	switch(action.action) {
		case 'rx_switch':	cmd = 'rxswitch:' + pad(action.options.action);	break;
		case 'scale':			cmd = action.options.action;	break;
		case 'rotate':		cmd = action.options.action;	break;
		case 'video_on':	cmd = 'video:on';				break;
		case 'video_off':	cmd = 'video:off';			break;
		case 'reboot':		cmd = 'reboot';					break;
		case 'reset':			cmd = 'reset:default';	break;
	}
	
	if (cmd !== undefined) {
		
		var message = 'http://' + self.config.host + '/cgi-bin/query.cgi?cmd=' + cmd;

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