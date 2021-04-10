var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	// Example: When this script was committed, a fix needed to be made
	// this will only be run if you had an instance of an older "version" before.
	// "version" is calculated out from how many upgradescripts your intance config has run.
	// So just add a addUpgradeScript when you commit a breaking change to the config, that fixes
	// the config.

	self.addUpgradeScript(function () {
		// just an example
		if (self.config.host !== undefined) {
			self.config.old_host = self.config.host;
		}
	});

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;
	self.init_presets();

	self.config = config;
};
instance.prototype.init = function() {
	var self = this;
	self.init_presets();
	self.status(self.STATE_OK);

	debug = self.debug;
	log = self.log;
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
			value: 'This module will control Wyrestorm SW-0402-MV Multiviewer '
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 8,
			regex: self.REGEX_IP
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;
	debug("destroy");
};

instance.prototype.init_presets = function () {
	var self = this;
	var presets = [

		{
			category: 'Multiviewer',
			label: '1@1',
			bank: {
				style: 'text',
				text: '1@1',
				size: '18',
				color: self.rgb(255,255,255),
				bgcolor: self.rgb(0,0,0),

			},
			actions: [
				{
					action: 'route',
					options: {
						out: '1',
						inp: '1'
					}
				}
			]
		},
		{
			category: 'Multiviewer',
			label: '2@1',
			bank: {
				style: 'text',
				text: '2@1',
				size: '18',
				color: self.rgb(255,255,255),
				bgcolor: self.rgb(0,0,0),

			},
			actions: [
				{
					action: 'route',
					options: {
						out: '1',
						inp: '2'
					}
				}
			]
		},
		{
			category: 'Multiviewer',
			label: '3@1',
			bank: {
				style: 'text',
				text: '3@1',
				size: '18',
				color: self.rgb(255,255,255),
				bgcolor: self.rgb(0,0,0),

			},
			actions: [
				{
					action: 'route',
					options: {
						out: '1',
						inp: '3'
					}
				}
			]
		},
		{
			category: 'Multiviewer',
			label: '4@1',
			bank: {
				style: 'text',
				text: '4@1',
				size: '18',
				color: self.rgb(255,255,255),
				bgcolor: self.rgb(0,0,0),

			},
			actions: [
				{
					action: 'route',
					options: {
						out: '1',
						inp: '4'
					}
				}
			]
		},
		{
			category: 'Multiviewer',
			label: '1@2',
			bank: {
				style: 'text',
				text: '1@2',
				size: '18',
				color: self.rgb(255,255,255),
				bgcolor: self.rgb(0,0,0),

			},
			actions: [
				{
					action: 'route',
					options: {
						out: '2',
						inp: '1'
					}
				}
			]
		},
		{
			category: 'Multiviewer',
			label: '2@2',
			bank: {
				style: 'text',
				text: '2@2',
				size: '18',
				color: self.rgb(255,255,255),
				bgcolor: self.rgb(0,0,0),

			},
			actions: [
				{
					action: 'route',
					options: {
						out: '2',
						inp: '2'
					}
				}
			]
		},
		{
			category: 'Multiviewer',
			label: '3@2',
			bank: {
				style: 'text',
				text: '3@2',
				size: '18',
				color: self.rgb(255,255,255),
				bgcolor: self.rgb(0,0,0),

			},
			actions: [
				{
					action: 'route',
					options: {
						out: '2',
						inp: '3'
					}
				}
			]
		},
		{
			category: 'Multiviewer',
			label: '4@2',
			bank: {
				style: 'text',
				text: '4@2',
				size: '18',
				color: self.rgb(255,255,255),
				bgcolor: self.rgb(0,0,0),

			},
			actions: [
				{
					action: 'route',
					options: {
						out: '2',
						inp: '4'
					}
				}
			]
		},
		{
			category: 'Multiviewer',
			label: '4KQV @1',
			bank: {
				style: 'text',
				text: '4KQV @1',
				size: '18',
				color: self.rgb(255,255,255),
				bgcolor: self.rgb(0,0,0),

			},
			actions: [
				{
					action: 'route',
					options: {
						out: '1',
						inp: '5'
					}
				}
			]
		},
		{
			category: 'Multiviewer',
			label: '2KQV @1',
			bank: {
				style: 'text',
				text: '2KQV @1',
				size: '18',
				color: self.rgb(255,255,255),
				bgcolor: self.rgb(0,0,0),

			},
			actions: [
				{
					action: 'route',
					options: {
						out: '1',
						inp: '6'
					}
				}
			]
		},
		{
			category: 'Multiviewer',
			label: '4KQV @2',
			bank: {
				style: 'text',
				text: '4KQV @2',
				size: '18',
				color: self.rgb(255,255,255),
				bgcolor: self.rgb(0,0,0),

			},
			actions: [
				{
					action: 'route',
					options: {
						out: '2',
						inp: '5'
					}
				}
			]
		},
		{
			category: 'Multiviewer',
			label: '2KQV @2',
			bank: {
				style: 'text',
				text: '2KQV @2',
				size: '18',
				color: self.rgb(255,255,255),
				bgcolor: self.rgb(0,0,0),

			},
			actions: [
				{
					action: 'route',
					options: {
						out: '2',
						inp: '6'
					}
				}
			]
		},
		{
			category: 'Multiviewer',
			label: 'MV L',
			bank: {
				style: 'text',
				text: 'MV L',
				size: '18',
				color: self.rgb(255,255,255),
				bgcolor: self.rgb(0,0,0),

			},
			actions: [
				{
					action: 'mode',
					options: {
						mode: '5',
					}
				}
			]
		},
		{
			category: 'Multiviewer',
			label: 'MV R',
			bank: {
				style: 'text',
				text: 'MV R',
				size: '18',
				color: self.rgb(255,255,255),
				bgcolor: self.rgb(0,0,0),

			},
			actions: [
				{
					action: 'mode',
					options: {
						mode: '4',
					}
				}
			]
		},
		{
			category: 'Multiviewer',
			label: 'MV T',
			bank: {
				style: 'text',
				text: 'MV T',
				size: '18',
				color: self.rgb(255,255,255),
				bgcolor: self.rgb(0,0,0),

			},
			actions: [
				{
					action: 'mode',
					options: {
						mode: '3',
					}
				}
			]
		},
		{
			category: 'Multiviewer',
			label: 'MV B',
			bank: {
				style: 'text',
				text: 'MV B',
				size: '18',
				color: self.rgb(255,255,255),
				bgcolor: self.rgb(0,0,0),

			},
			actions: [
				{
					action: 'mode',
					options: {
						mode: '2',
					}
				}
			]
		},
		{
			category: 'Multiviewer',
			label: 'Refresh',
			bank: {
				style: 'text',
				text: 'Refresh',
				size: '18',
				color: self.rgb(255,255,255),
				bgcolor: self.rgb(0,0,0),

			},
			actions: [
				{
					action: 'refresh',

				}
			]
		}

	];
self.setPresetDefinitions(presets);
}

instance.prototype.actions = function(system) {
	var self = this;

	self.system.emit('instance_actions', self.id, {
		'route': {
			label: 'Route inputs',
			options: [
				{
					type: 'dropdown',
					label: 'Output',
					id: 'out',
					choices: [
						{ id: '1', label: 'Output 1' },
						{ id: '2', label: 'Output 2' }
					]
				},
				{
					type: 'dropdown',
					label: 'Input',
					id: 'inp',
					choices: [
						{ id: '1', label: 'Input 1' },
						{ id: '2', label: 'Input 2' },
						{ id: '3', label: 'Input 3' },
						{ id: '4', label: 'Input 4' },
						{ id: '5', label: '4K QV' },
						{ id: '6', label: '2K QV' }
					]
				}
			]
		},
		'mode': {
			label: 'Multiviewer mode',
			options: [
				{
					type: 'dropdown',
					label: 'Mode',
					id: 'mode',
					choices: [
						{ id: '5', label: 'MV L' },
						{ id: '4', label: 'MV R' },
						{ id: '3', label: 'MV T' },
						{ id: '2', label: 'MV B' }
					]
				},
			]
		},
		'refresh':  {label: 'Refresh'},
	});
}

instance.prototype.action = function(action) {
	var self = this;
	var cmd
	opt = action.options
	debug('action: ', action);

	switch (action.action) {

		case 'route':
			cmd = 'VB' + opt.out + opt.inp;
			break;

		case 'mode':
			cmd = 'VB3' + opt.mode;
			break;

		case 'refresh':
			cmd = 'REFRESH';
			break;

	}


	if (cmd !== undefined) {
			self.system.emit('rest_get', 'http://' + self.config.host + '/BasicVideoSendCMD.CGI?num=' + cmd,function (err, data, response) {
				if (!err) {
						self.log('Error from wyrestorm: ' + result);
						return;
						}
					//console.log("Result from REST: ", result);
					});
		}

};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
