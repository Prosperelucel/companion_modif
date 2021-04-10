var artnet = require('artnet-node');
var artnetClient = artnet.Client;
var instance_skel = require('../../instance_skel');
var log;

var discoveries = {};

function discovery(err, data) {
	if (!err && data) {

		if (data.length > 0) {
			for (var i = 0; i < data.length; ++i) {

				if (discoveries[data[i].address] === undefined) {
					data[i].ts = Date.now();
					discoveries[data[i].address] = data[i];
				} else {
					discoveries[data[i].address].ts = Date.now();
				}

			}
		}
	}
}

// Check every 5 seconds for artnet hosts
setInterval(function () {
	var discovery10 = artnet.Server.discover(discovery, 5000, "10.255.255.255");
	var discovery2 = artnet.Server.discover(discovery, 5000, "2.255.255.255");

	for (var key in discoveries) {
		if (Date.now() > discoveries[key].ts + 10000) {
			delete discoveries[key];
		}
	}
}, 5000);

function instance(system, id, config) {
	var self = this;

	self.data = [];
	for (var i = 0; i < 511; ++i) {
		self.data[i] = 0;
	}

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;

	self.init_artnet();
};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.status(self.STATE_UNKNOWN);

	self.init_artnet();

	self.timer = setInterval(function () {
		if (self.client !== undefined) {
			self.client.send(self.data);
		}
	}, 1000);
};

instance.prototype.init_artnet= function() {
	var self = this;

	self.status(self.STATE_UNKNOWN);
	if (self.client !== undefined) {
		self.client.close();
		delete self.client;
	}

	if (self.config.host_dd || self.config.host) {

		self.client = new artnetClient(self.config.host_dd || self.config.host, 6454, self.config.universe || 0);

		self.status(self.STATE_OK);
	}
};

// Return config fields for web config
instance.prototype.config_fields = function () {

	var self = this;
	var fields = [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'This module will transmit ArtNet packets to the ip and universe you specify below. If you need more universes, add multiple artnet instances.'
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Receiver IP',
			width: 6,
			regex: self.REGEX_IP
		}
	];

	if (Object.keys(discoveries).length > 0 || self.config.host_dd) {
		var choices = [ { id: '', label: 'Custom ip' } ];

		if (self.config.host_dd && discoveries[self.config.host_dd] === undefined) {
			choices.push({ id: self.config.host_dd, label: self.config.host_dd + ' (not seen for a while)' });
		}

		for (var key in discoveries) {
			choices.push({ id: key, label: discoveries[key].name + ' (' + key + ')' });
		}

		fields.push({
			type: 'dropdown',
			id: 'host_dd',
			label: 'Or choose from discovered receivers:',
			width: 6,
			default: '',
			choices: choices
		});
	}

	fields.push({
		type: 'textinput',
		id: 'universe',
		label: 'Universe number (0-63)',
		width: 6,
		default: 0,
		regex: '/^0*([0-9]|[1-5][0-9]|6[0-3])$/'
	});

	return fields;
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.client !== undefined) {
		self.client.close();
		delete self.client;
	}

	if (self.timer) {
		clearInterval(self.timer);
		self.timer = undefined;
	}

	if (self.client !== undefined) {
		self.client.close();
	}

};


instance.prototype.actions = function(system) {
	var self = this;
	self.system.emit('instance_actions', self.id, {

		'set': {
			label:'Set value',
			options: [
				{
					 type: 'textinput',
					 label: 'Channel (Range 1-512)',
					 id: 'channel',
					 default: '1',
					 regex: '/^0*([1-9]|[1-8][0-9]|9[0-9]|[1-4][0-9]{2}|50[0-9]|51[012])$/' // 1-512
				},
				{
					 type: 'textinput',
					 label: 'Value (Range 0-255)',
					 id: 'value',
					 default: '0',
					 regex: '/^0*([0-9]|[1-8][0-9]|9[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/' // 0-255
				}
			]
		}

	});
}

instance.prototype.action = function(action) {
	var self = this;
	var id = action.action;

	var cmd;

	switch (action.action) {

		case 'set':
			if (self.client !== undefined) {
				self.data[action.options.channel-1] = action.options.value;
				self.client.send(self.data);
			}
			break;

	}

};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
