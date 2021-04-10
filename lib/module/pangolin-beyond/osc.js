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

	self.config = config;
	self.init_presets();
};
instance.prototype.init = function() {
	var self = this;

	self.status(self.STATE_OK);

	debug = self.debug;
	log = self.log;
	self.init_presets();
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 8,
			regex: self.REGEX_IP
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'Target Port',
			width: 4,
			regex: self.REGEX_PORT
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;
	debug("destroy");
};

instance.prototype.actions = function(system) {
	var self = this;
	self.system.emit('instance_actions', self.id, {
		'Brightness': {
			label: 'Brightness',
			options: [
				{
					type: 'textinput',
					label: 'Brightness',
					id: 'brightness_value',
					default: 100,
					/*min: 0,
					max: 100,*/
					regex: self.REGEX_SIGNED_NUMBER
				}
			]
		},
		'selectclip': {
			label: 'Select clip',
			options: [
				{
					type: 'textinput',
					label: 'Page',
					id: 'page_value',
					default: 1,
					/*min: -1,
					max: 100,*/
					regex: self.REGEX_SIGNED_NUMBER
				},
				{
					type: 'textinput',
					label: 'Cell',
					id: 'cell_value',
					default: 1,
					/*min: -1,
					max: 100,*/
					regex: self.REGEX_SIGNED_NUMBER
				}
			]
		},
		'startclip': {
			label: 'Start clip'
		},
		'bpm': {
			label: 'BPM',
			options: [
				{
					type: 'textinput',
					label: 'BPM',
					id: 'bpm_value',
					default: 60,
					/*min: 0,
					max: 400,*/
					regex: self.REGEX_SIGNED_NUMBER
				}
			]
		},
		'bpmtap': {
			label: 'BPM Tap',
		},
		'laserenable': {
			label: 'Enable Output'
		},
		'laserdisable': {
			label: 'Disable Output'
		},
		'Blackout': {
			label: 'Blackout'
		},
		'onecue': {
			label: 'One cue'
		},
		'multicue': {
			label: 'Multi cue'
		},
		'select': {
			label: 'Click select'
		},
		'toggle': {
			label: 'Toggle'
		},
		'restart': {
			label: 'Restart'
		},
		'flash': {
			label: 'Flash'
		},
		'soloflash': {
			label: 'Solo flash'
		},
	});
}
instance.prototype.init_presets = function () {
	var self = this;
	var presets = [];
	/*
	presets.push({
		category: 'Layer 4',
		label: 'play_preset',
		bank: {
			style: 'text',
			text: 'Pause',
			size: '18',
			color: self.rgb(0,0,0),
			bgcolor: self.rgb(255,0,0)
		},
		actions: [{
			action: 'Pause',
			options: {
				layers_play: '4'
			}
		}]
	});
	*/
	self.setPresetDefinitions(presets);
}
instance.prototype.action = function(action) {
	var self = this;
	debug('action: ', action);

	if (action.action == 'Brightness') {
		self.system.emit('osc_send', self.config.host, self.config.port, "/beyond/master/brightness", quickint(action.options.brightness_value));
	}
	else if (action.action == 'laserenable') {
		self.system.emit('osc_send', self.config.host, self.config.port, "/beyond/general/enablelaseroutput", quickint(1));
	}
	else if (action.action == 'laserdisable') {
		self.system.emit('osc_send', self.config.host, self.config.port, "/beyond/general/disablelaseroutput", quickint(1));
	}
	else if (action.action == 'onecue') {
		self.system.emit('osc_send', self.config.host, self.config.port, "/beyond/general/onecue", quickint(1));
	}
	else if (action.action == 'multicue') {
		self.system.emit('osc_send', self.config.host, self.config.port, "/beyond/general/multicue", quickint(1));
	}
	else if (action.action == 'select') {
		self.system.emit('osc_send', self.config.host, self.config.port, "/beyond/general/clickselect", quickint(1));
	}
	else if (action.action == 'toggle') {
		self.system.emit('osc_send', self.config.host, self.config.port, "/beyond/general/clicktoggle", quickint(1));
	}
	else if (action.action == 'restart') {
		self.system.emit('osc_send', self.config.host, self.config.port, "/beyond/general/clickrestart", quickint(1));
	}
	else if (action.action == 'flash') {
		self.system.emit('osc_send', self.config.host, self.config.port, "/beyond/general/clickflash", quickint(1));
	}
	else if (action.action == 'soloflash') {
		self.system.emit('osc_send', self.config.host, self.config.port, "/beyond/general/clicksoloflash", quickint(1));
	}
	else if (action.action == 'Blackout') {
		self.system.emit('osc_send', self.config.host, self.config.port, "/beyond/general/blackout", quickint(1));
	}
	else if (action.action == 'startclip') {
		self.system.emit('osc_send', self.config.host, self.config.port, "/beyond/general/StartCell", quickint(1));
	}
	else if (action.action == 'bpmtap') {
		self.system.emit('osc_send', self.config.host, self.config.port, "/beyond/general/BeatTap", quickint(1));
	}
	else if (action.action == 'bpm') {
		self.system.emit('osc_send', self.config.host, self.config.port, "/b/master/bpm", quickint(action.options.bpm_value));
	}
	else if (action.action == 'selectclip') {
		self.system.emit('osc_send', self.config.host, self.config.port, "/b/Grid/PageIndex", quickint(action.options.page_value));
		self.system.emit('osc_send', self.config.host, self.config.port, "/b/Grid/CellIndex", quickint(action.options.cell_value));
	}
};

function quickint(integer)
{
	var bol = {
			type: "i",
			value: parseInt(integer)
		};
	return bol;
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;
