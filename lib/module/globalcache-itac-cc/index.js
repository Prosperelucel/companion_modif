var tcp = require('../../tcp');
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

	self.config = config;
	self.init_tcp();
	self.init_presets();
};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.status(self.STATE_UNKNOWN);
	self.init_presets();
	self.init_tcp();
};

instance.prototype.init_tcp = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	if (self.config.host) {
		self.socket = new tcp(self.config.host, 4998);

		self.socket.on('status_change', function (status, message) {
			self.status(status, message);
		});

		self.socket.on('error', function (err) {
			debug("Network error", err);
			self.log('error',"Network error: " + err.message);
		});
	}
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;
	return [
		{
			type:  'textinput',
			id:    'host',
			label: 'Device IP',
			width: 12,
			regex: self.REGEX_IP
		},
		{
			type:  'text',
			id:    'info',
			width: 12,
			label: 'Information',
			value: 'This module controls an itac IP2CC device by <a href="https://www.globalcache.com/products/itach/ip2ccspecs/" target="_new">Global Cache</a>.'
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
	}

	debug("destroy", self.id);;
};

instance.prototype.init_presets = function () {
	var self = this;
	var presets = [];

		presets.push({
			category: 'Port 1',
			label: 'Close',
			bank: {
				style: 'text',
				text: 'PORT 1\\nCLOSE',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'portSet',
					options: {
						portNum: '1,',
						setPort: '1'
					}
				}
			]
		});

		presets.push({
			category: 'Port 1',
			label: 'Open',
			bank: {
				style: 'text',
				text: 'PORT 1\\nOPEN',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'portSet',
					options: {
						portNum: '1,',
						setPort: '0'
					}
				}
			]
		});

		presets.push({
			category: 'Port 2',
			label: 'Close',
			bank: {
				style: 'text',
				text: 'PORT 2\\nCLOSE',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'portSet',
					options: {
						portNum: '2,',
						setPort: '1'
					}
				}
			]
		});

		presets.push({
			category: 'Port 2',
			label: 'Open',
			bank: {
				style: 'text',
				text: 'PORT 2\\nOPEN',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'portSet',
					options: {
						portNum: '2,',
						setPort: '0'
					}
				}
			]
		});

		presets.push({
			category: 'Port 3',
			label: 'Close',
			bank: {
				style: 'text',
				text: 'PORT 3\\nCLOSE',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'portSet',
					options: {
						portNum: '3,',
						setPort: '1'
					}
				}
			]
		});

		presets.push({
			category: 'Port 3',
			label: 'Open',
			bank: {
				style: 'text',
				text: 'PORT 3\\nOPEN',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'portSet',
					options: {
						portNum: '3,',
						setPort: '0'
					}
				}
			]
		});

	self.setPresetDefinitions(presets);
}

instance.prototype.actions = function(system) {
	var self = this;
	self.system.emit('instance_actions', self.id, {
		'portSet':    {
			label: 'Choose port and state',
			options: [
					{
						type:    'dropdown',
						label:   'Choose Port',
						id:      'portNum',
						width:   12,
						default: '1,',
						choices:	[
							{ id: '1,',		label: 'Port 1' },
							{ id: '2,',		label: 'Port 2' },
							{ id: '3,',		label: 'Port 3' }
						]
					},
					{
						type:    'dropdown',
						label:   'Set On or Off',
						id:      'setPort',
						width:   12,
						default: '1',
						choices:	[
							{ id: '1',		label: 'Turn On (Close)' },
							{ id: '0',		label: 'Turn Off (Open)' }
						]
					},
			]
		}
	});
};

instance.prototype.action = function(action) {
	var self = this;
	var cmd  = 'setstate,1:';
	var opt  = action.options;

	switch (action.action) {

		case 'portSet':
			cmd += opt.portNum + opt.setPort;
			break;

	}

	if (cmd !== undefined) {

		debug('sending tcp', cmd, "to", self.config.host);

		if (self.socket !== undefined && self.socket.connected) {
			self.socket.send(cmd + "\r\n");

		} else {
			debug('Socket not connected :(');
		}

	}

	debug('action():', action);

};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
