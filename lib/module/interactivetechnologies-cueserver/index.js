// Interactive Technologies CueServer
var udp           = require('../../udp');
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

	if (self.udp !== undefined) {
		self.udp.destroy();
		delete self.udp;
	}

	self.config = config;

	if (self.config.protocol == 'http') {
		self.init_http();
	}

	if (self.config.protocol == 'udp') {
		self.init_udp();
	}
};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;
	self.init_presets();

	if (self.config.protocol == 'http') {
		self.init_http();
	}

	if (self.config.protocol == 'udp') {
		self.init_udp();
	}
}

instance.prototype.init_http = function() {
	var self = this;

	self.status(self.STATE_OK);

	debug = self.debug;
	log = self.log;
};

instance.prototype.init_udp = function() {
	var self = this;

	if (self.udp !== undefined) {
		self.udp.destroy();
		delete self.udp;
	}

	self.status(self.STATE_WARNING, 'Connecting');

	if (self.config.host !== undefined) {
		self.udp = new udp(self.config.host, 52737);

		self.udp.on('error', function (err) {
			debug("Network error", err);
			self.status(self.STATE_ERROR, err);
			self.log('error',"Network error: " + err.message);
		});

		// If we get data, the connection is probably fine
		self.udp.on('data', function () {
			self.status(self.STATE_OK);
		});

		self.udp.on('status_change', function (status, message) {
			self.status(status, message);
		});
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
			width: 6,
			regex: self.REGEX_IP
		},
		{
			type: 'dropdown',
			id: 'protocol',
			label: 'Protocol',
			default: 'http',
			choices:  [
				{ id: 'http', label: 'HTTP (Port 80)' },
				{ id: 'udp', label: 'UDP (Port 52737)' }
			]
		}
	]
}

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.udp !== undefined) {
		self.udp.destroy();
	}

	debug("destroy", self.id);
}

instance.prototype.init_presets = function () {
	var self = this;
	var presets = [];

	self.setPresetDefinitions(presets);
}

instance.prototype.actions = function(system) {
	var self = this;

	self.setActions({
		'cuescript': {
			label: 'CueScript',
			options: [{
				type: 'textinput',
				label: 'Custom Cue Script',
				id: 'script',
				default: '',
				tooltip: 'You can enter a custom CueScript here.'
			}]
		},
		'audio': {
			label: 'Audio',
			options: [{
				type: 'textinput',
				label: 'Audio File to Play',
				id: 'audiofile',
				default: '',
				tooltip: 'Type in a audio file name for the CueServer to play out.'
			}]
		},
		'audiostop': {
			label: 'Audio Stop'
		},
		'cue': {
			label: 'Cue',
			options: [{
				type:   'textinput',
				label:  'Cue Number',
				id:     'cuenumber',
				default: '1',
				regex: '/^[0-999]$/'
			}]
		},
		'macro': {
			label: 'Macro',
			options: [{
				type: 'textinput',
				label: 'Macro Number',
				id: 'macronumber',
				default: '1',
				regex: '/^[0-999]$/'
			}]
		},
		'playback': {
			label: 'Playback',
			options: [{
				type: 'textinput',
				label: 'Playback Number',
				id: 'playbacknumber',
				default: '1',
				regex: '/^[0-999]$/'
			}]
		},
		'reboot': {
			label: 'Reboot'
		}
	});
}

instance.prototype.action = function(action) {
	var self = this;
	var cmd;
	var opt = action.options;

	switch(action.action) {
		case 'cuescript':
			cmd = opt.script;
			break;
		case 'audio':
			cmd = 'Audio ' + opt.audiofile;
			break;
		case 'audiostop':
			cmd = 'Audio Stop';
			break;
		case 'cue':
			cmd = 'Cue ' + opt.cuenumber;
			break;
		case 'macro':
			cmd = 'Macro ' + opt.macronumber;
			break;
		case 'playback':
			cmd = 'Playback ' + opt.playbacknumber;
			break;
		case 'reboot':
			cmd = 'Reboot';
			break;
	}

	if (self.config.protocol == 'http') {
		if (cmd !== undefined) {
			var url = 'http://' + self.config.host + ':80/exe.cgi?cmd=' + cmd;

			self.system.emit('rest_get', url, function (err, result) {
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

	if (self.config.protocol == 'udp') {
		if (cmd !== undefined ) {
			if (self.udp !== undefined ) {
				debug('sending',cmd,"to",self.config.host);
				self.udp.send(cmd);
			}
		}
	}
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;