var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;
	self.init_tcp();
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
		self.socket = new tcp(self.config.host, 23);

		self.socket.on('status_change', function (status, message) {
			self.status(status, message);
		});

		self.socket.on('connect', function () {
			self.socket.send("\r\n" + self.config.password + "\r\n");
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
			type: 'textinput',
			id: 'host',
			label: 'Device IP',
			width: 12,
			regex: self.REGEX_IP
		},
		{
			type: 'textinput',
			id: 'password',
			label: 'Password',
			width: 6,
			default: 'SS-CDR250N'
		},
		{
			type: 'text',
			id: 'info',
			width: 6,
			label: 'Information',
			value: 'You only need to change the password here if you have changed it from the default password of the device. If you are using an SS-R250N, the default password is SS-R250N.'
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
			category: 'Transport Control',
			label: 'Play',
			bank: {
				style: 'text',
				text: 'PLAY',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'play'
				}
			]
		});

		presets.push({
			category: 'Transport Control',
			label: 'Record Ready',
			bank: {
				style: 'text',
				text: 'RECORD READY',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'recordready'
				}
			]
		});

		presets.push({
			category: 'Transport Control',
			label: 'Record',
			bank: {
				style: 'text',
				text: 'RECORD',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'record'
				}
			]
		});

		presets.push({
			category: 'Transport Control',
			label: 'Mark Track',
			bank: {
				style: 'text',
				text: 'MARK\\nTRACK',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'mark'
				}
			]
		});

		presets.push({
			category: 'Transport Control',
			label: 'Stop',
			bank: {
				style: 'text',
				text: 'STOP',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'stop'
				}
			]
		});

		presets.push({
			category: 'Transport Control',
			label: 'Pause',
			bank: {
				style: 'text',
				text: 'PAUSE',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'pause'
				}
			]
		});

		presets.push({
			category: 'Transport Control',
			label: 'Previous Track',
			bank: {
				style: 'text',
				text: 'PREV\\nTRACK',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'prev'
				}
			]
		});

		presets.push({
			category: 'Transport Control',
			label: 'Next Track',
			bank: {
				style: 'text',
				text: 'NEXT\\nTRACK',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'next'
				}
			]
		});

		presets.push({
			category: 'Transport Control',
			label: 'Jump to track',
			bank: {
				style: 'text',
				text: 'JUMP\\nTO\\nTRACK',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'jump',
					options: {
						track: '1'
					}
				}
			]
		});

		presets.push({
			category: 'Power Control',
			label: 'Power On',
			bank: {
				style: 'text',
				text: 'POWER\\nON',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'powerOn'
				}
			]
		});

		presets.push({
			category: 'Power Control',
			label: 'Power Off',
			bank: {
				style: 'text',
				text: 'POWER\\nOFF',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'powerOff'
				}
			]
		});

	self.setPresetDefinitions(presets);
}

instance.prototype.actions = function(system) {
	var self = this;
	self.system.emit('instance_actions', self.id, {
		'play':        { label: 'Play' },
		'recordready': { label: 'Record ready' },
		'record':      { label: 'Record' },
		'mark':        { label: 'Mark track (while recording)' },
		'stop':        { label: 'Stop' },
		'pause':       { label: 'Pause' },
		'prev':        { label: 'Previous track' },
		'next':        { label: 'Next track' },
		'jump': {
			label: 'Jump to track',
			options: [
				{
					label: 'Track number',
					id: 'track',
					type: 'textinput',
					regex: self.REGEX_NUMBER,
					default: 1
				}
			]
		},
		'powerOn':     { label: 'Power on' },
		'powerOff':    { label: 'Power off' }
	});
}

instance.prototype.action = function(action) {
	var self = this;
	var cmd = '0';
	var opt = action.options;

	switch (action.action) {

		case 'play':
			cmd += '12';
			break;

		case 'recordready':
			cmd += '1301';
			break;

		case 'record':
			cmd += '1300';
			break;

		case 'mark':
			cmd += '1302';
			break;

		case 'stop':
			cmd += '10';
			break;

		case 'pause':
			cmd += '1401';
			break;

		case 'prev':
			cmd += '1A01';
			break;

		case 'next':
			cmd += '1A00';
			break;

		case 'jump':
			cmd += '23';

			var track = ('0000' + opt.track).substr(-4);
			cmd += track.substr(2);
			cmd += track.substr(0, 2);
			break;

		case 'powerOn':
			cmd += '7500';
			break;

		case 'powerOff':
			cmd += '7511';
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
