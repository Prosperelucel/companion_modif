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
			self.tcp = new tcp(self.config.host, 5000);

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
			self.tcp = new tcp(self.config.host, 5000);

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
				value: 'This module is for Tesla Smart KVM Switch 8>1'
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 6,
				default: '192.168.1.10',
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
	{ label: 'Source 1', id: '1' },
	{ label: 'Source 2', id: '2' },
	{ label: 'Source 3', id: '3' },
	{ label: 'Source 4', id: '4' },
	{ label: 'Source 5', id: '5' },
	{ label: 'Source 6', id: '6' },
	{ label: 'Source 7', id: '7' },
	{ label: 'Source 8', id: '8' }
];

instance.prototype.actions = function (system) {
	var self = this;

	var actions = {
		'switch': {
			label: 'Switch to source',
			options: [{
				type: 'dropdown',
				label: 'source',
				id: 'source',
				default: '1',
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

		case 'switch':
			if (opt.source == '1') {
				cmd = new Buffer([0xAA,0xBB,0x03,0x01,0x01,0xEE]);
			} else if (opt.source == '2') {
				cmd = new Buffer([0xAA,0xBB,0x03,0x01,0x02,0xEE]);
			} else if (opt.source == '3') {
				cmd = new Buffer([0xAA,0xBB,0x03,0x01,0x03,0xEE]);
			} else if (opt.source == '4') {
				cmd = new Buffer([0xAA,0xBB,0x03,0x01,0x04,0xEE]);
			} else if (opt.source == '5') {
				cmd = new Buffer([0xAA,0xBB,0x03,0x01,0x05,0xEE]);
			} else if (opt.source == '6') {
				cmd = new Buffer([0xAA,0xBB,0x03,0x01,0x06,0xEE]);
			} else if (opt.source == '7') {
				cmd = new Buffer([0xAA,0xBB,0x03,0x01,0x07,0xEE]);
			} else if (opt.source == '8') {
				cmd = new Buffer([0xAA,0xBB,0x03,0x01,0x08,0xEE]);
			}
			break;

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
