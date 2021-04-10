// ProTally

var tcp =           require('../../tcp');
var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions
	//self.init_presets();
	//self.init_tcp();

	return self;
}

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.status(self.STATUS_UNKNOWN);

	//self.init_presets();
	self.init_tcp();
}

instance.prototype.updateConfig = function(config) {
	var self = this;
	self.config = config;

	if (self.tcp !== undefined) {
		self.tcp.destroy();
		delete self.tcp;
	}

	self.init_tcp();
}

instance.prototype.init_tcp = function() {
	var self = this;

	var host = self.config.host;
	var port = self.config.port;

	if (self.config.host !== undefined) {
		self.tcp = new tcp(host, port);

		self.tcp.on('status_change', function (status, message) {
			self.status(status, message);
		});

		self.tcp.on('error', function (err) {
			debug("Network error", err);
			self.log('error',"Network error: " + err.message);
		});

		self.tcp.on('connect', function () {
			debug("Connected");
			//self.sendcmd("");
		});
	}
}

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
			type: 'textinput',
			id: 'port',
			label: 'Target Port',
			default: '9800',
			width: 5,
			regex: self.REGEX_PORT
		}
	]
}

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.tcp !== undefined) {
		self.tcp.destroy();
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
		'tally': {
			label: 'Activate Tally',
			options: [
				{
					type: 'dropdown',
					label: 'Window Number',
					id: 'windownumber',
					default: '1',
					choices: [
						{id: '1', label: 'Window 1'},
						{id: '2', label: 'Window 2'},
						{id: '3', label: 'Window 3'},
						{id: '4', label: 'Window 4'}
					],
					tooltip: 'Tally Box Window to target.'
				},
				{
					type: 'dropdown',
					label: 'Mode',
					id: 'mode',
					default: 'Program',
					choices: [
						{id: 'Preview', label: 'Preview'},
						{id: 'Program', label: 'Program'},
						{id: 'PreviewProgram', label: 'Preview + Program'}
					],
					tooltip: 'Tally Box Mode.'
				},
				{
					type: 'textinput',
					label: 'Label Text',
					id: 'label',
					default: '',
					tooltip: 'Label Text to Display in the Tally Box.'
				},
				{
					type: 'textinput',
					label: 'Box Color',
					id: 'boxcolor',
					default: '#FF0000',
					tooltip: 'Box Color to set.',
					regex: '/^#(?:[0-9a-fA-F]{3}){1,2}$/'
				}
			]
		},
		'clear': {
			label: 'Clear Tally Window',
			options: [{
				type: 'dropdown',
				label: 'Window Number',
				id: 'windownumber',
				default: '1',
				choices: [
					{id: '1', label: 'Window 1'},
					{id: '2', label: 'Window 2'},
					{id: '3', label: 'Window 3'},
					{id: '4', label: 'Window 4'}
				],
				tooltip: 'Tally Box Window to target.'
			}]
		},
		'beacon': {
			label: 'Activate Beacon',
			options: [
				{
					type: 'dropdown',
					label: 'Window Number',
					id: 'windownumber',
					default: '1',
					choices: [
						{id: '1', label: 'Window 1'},
						{id: '2', label: 'Window 2'},
						{id: '3', label: 'Window 3'},
						{id: '4', label: 'Window 4'}
					],
					tooltip: 'Tally Box Window to target.'
				},
				{
					type: 'textinput',
					label: 'Label Text',
					id: 'label',
					default: '',
					tooltip: 'Label Text to Display in the Tally Box.'
				},
				{
					type: 'textinput',
					label: 'Box Color',
					id: 'boxcolor',
					default: '#FF0000',
					tooltip: 'Box Color to set.',
					regex: '/^#(?:[0-9a-fA-F]{3}){1,2}$/'
				},
				{
					type: 'textinput',
					label: 'Beacon Rate',
					id: 'beaconrate',
					default: '1000',
					tooltip: 'The rate the box should flash on the screen, in milliseconds.',
					regex: self.REGEX_NUMBER
				}
			]
		}
	});
}

instance.prototype.action = function(action) {
	var self = this;
	var options = action.options;

	var cmd;

	var ProTallyObj = {};

	switch(action.action) {
		case 'tally':
			ProTallyObj.windowNumber = options.windownumber;
			ProTallyObj.mode = options.mode;
			ProTallyObj.label = options.label.substring(0, 15);
			ProTallyObj.color = options.boxcolor;
			break;
		case 'clear':
			ProTallyObj.windowNumber = options.windownumber;
			ProTallyObj.mode = "Clear";
			break;
		case 'beacon':
			ProTallyObj.windowNumber = options.windownumber;
			ProTallyObj.mode = "Beacon";
			ProTallyObj.label = options.label.substring(0, 15);
			ProTallyObj.color = options.boxcolor;
			ProTallyObj.beaconrate = options.beaconrate;
			break;
	}

	//send the ProTally object
	if (ProTallyObj.mode !== undefined) {
		if (self.tcp !== undefined) {
			self.tcp.send(JSON.stringify(ProTallyObj));
		} else {
			debug('Socket not connected. ProTally may not be active at the destination host/port.');
		}
	}
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;