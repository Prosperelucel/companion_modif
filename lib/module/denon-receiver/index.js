var instance_skel = require('../../instance_skel');
var tcp = require('../../tcp');
var debug;
var log;

function instance(system, id, config) {
		var self = this;

		// super-constructor
		instance_skel.apply(this, arguments);
		self.actions(); // export actions
		return self;
}

instance.prototype.init = function () {
		var self = this;

		debug = self.debug;
		log = self.log;

		self.status(self.STATUS_UNKNOWN);

		if (self.config.host !== undefined) {
			self.tcp = new tcp(self.config.host, 23);

			self.tcp.on('status_change', function (status, message) {
				self.status(status, message);
			});

			self.tcp.on('error', function () {
				// Ignore
			});
		}
};

instance.prototype.updateConfig = function (config) {
		var self = this;
		self.config = config;

		if (self.tcp !== undefined) {
			self.tcp.destroy();
			delete self.tcp;
		}

		if (self.config.host !== undefined) {
			self.tcp = new tcp(self.config.host, 23);

			self.tcp.on('status_change', function (status, message) {
				self.status(status, message);
			});

			self.tcp.on('error', function (message) {
				// ignore for now
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
				value: 'This module is for Denon AV Receivers'
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 6,
				default: '192.168.0.100',
				regex: self.REGEX_IP
			}
		]
};

// When module gets deleted
instance.prototype.destroy = function () {
	var self = this;

		if (self.tcp !== undefined) {
			self.tcp.destroy();
		}
		debug("destroy", self.id);
};

instance.prototype.CHOICES_SOURCES = [
	{ label: 'PHONO', id: 'SIPHONO' },
	{ label: 'CD', id: 'SICD' },
	{ label: 'TUNER', id: 'SITUNER' },
	{ label: 'DVD', id: 'SIDVD' },
	{ label: 'HDP', id: 'SIHDP' },
	{ label: 'TV/CBL', id: 'SITV/CBL' },
	{ label: 'SAT', id: 'SISAT' },
	{ label: 'VCR', id: 'SIVCR' },
	{ label: 'DVR', id: 'SIDVR' },
	{ label: 'V.AUX', id: 'SIV.AUX' },
	{ label: 'NET/USB', id: 'SINET/USB' },
	{ label: 'XM', id: 'SIXM' },
	{ label: 'IPOD', id: 'SIIPOD' }
];

instance.prototype.actions = function (system) {
	var self = this;

	var actions = {
		'power': {
			label: 'Power control',
			options: [{
				type: 'dropdown',
				label: 'on/standby',
				id: 'power',
				default: 'power_on',
				choices: [{ label: 'Power on', id: 'power_on' }, { label: 'standby', id: 'power_off' }]
			}]
		},
		'mute': {
			label: 'mute',
			options: [{
				type: 'dropdown',
				label: 'on/off',
				id: 'mute',
				default: 'mute_on',
				choices: [{ label: 'Mute on', id: 'mute_on' }, { label: 'mute off', id: 'mute_off' }]
			}]
		},
		'volume': {
			label: 'volume',
			options: [{
				type: 'dropdown',
				label: 'up/down',
				id: 'volume',
				default: 'volume_up',
				choices: [{ label: 'Volume up', id: 'volume_up' }, { label: 'Volume down', id: 'volume_down' }]
			}/*,{
				type: 'textinput',
				label: 'dB',
				id: 'dBvalue',
				default: '6',
				regex: self.REGEX_NUMBER
			}*/]
		},
		'source': {
			label: 'Source selection',
			options: [{
				type: 'dropdown',
				label: 'Switch to source',
				id: 'source',
				default: 'SIDVD',
				choices: self.CHOICES_SOURCES
			}]
		}
	};
		self.setActions(actions);
};


instance.prototype.action = function (action) {
	var self = this;
	var id = action.action;
	var opt = action.options;
	var cmd;

	switch (id) {

		case 'power':
			if (opt.power == 'power_on') {
				cmd = 'PWON\r';
			} else if (opt.power == 'power_off') {
				cmd = 'PWSTANDBY\r';
			}
			break

		case 'mute':
			if (opt.mute == 'mute_on') {
				cmd = 'MUON\r';
			} else if (opt.mute == 'mute_off') {
				cmd = 'MUOFF\r';
			}
			break

		case 'volume':
			if (opt.volume == 'volume_up') {
				cmd = 'MVUP\r';
			} else if (opt.volume == 'volume_down') {
				cmd = 'MVDOWN\r';
			}
			break

		case 'source':
			cmd = opt.source + '\r';
			break
	}

	if (cmd !== undefined) {
		if (self.tcp !== undefined) {
			debug('sending ', cmd, "to", self.tcp.host);
			self.tcp.send(cmd);
		}
	}
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
