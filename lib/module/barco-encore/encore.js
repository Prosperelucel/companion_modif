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

	self.status(1,'Connecting'); // status ok!

	self.init_tcp();
};

instance.prototype.init_tcp = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	if (self.config.host) {
		self.socket = new tcp(self.config.host, self.config.port !== undefined ? self.config.port : 3000 );

		self.socket.on('status_change', function (status, message) {
			self.status(status, message);
		});

		self.socket.on('error', function (err) {
			debug("Network error", err);
			self.status(self.STATE_ERROR, err);
			self.log('error',"Network error: " + err.message);
		});

		self.socket.on('connect', function () {
			self.status(self.STATE_OK);
			debug("Connected");
		})

		self.socket.on('data', function (data) {});
	}
};


// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;
	return [
/*		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'Warning bla bla bla.'
		}, */
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
			width: 6,
			default:3000,
			regex: self.REGEX_PORT
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


instance.prototype.actions = function(system) {
	var self = this;
	self.system.emit('instance_actions', self.id, {

		'atrn':	{
			label: 'Auto Transition',
			options: [
				{
					type: 'textinput',
					label: 'Transition Frames',
					id: 'frames',
					default: "30",
					regex: self.REGEX_NUMBER
				}
			]
		},

		'preset_recall':	{
			label: 'Recall Preset',
			options: [
				{
					type: 'textinput',
					label: 'Preset Number',
					id: 'preset',
					default: "",
					regex: self.REGEX_NUMBER
				}
			]
		}

	});
};


instance.prototype.action = function(action) {
	var self = this;
	var opt = action.options

	switch (action.action) {

		case 'atrn':
			cmd = 'ATRN ' + parseInt(opt.frames);
			break;

		case 'preset_recall':
			cmd = 'PRESET R ' + parseInt(opt.preset);
			break;

	};

	if (cmd !== undefined) {

		debug('sending ',cmd,"to",self.config.host);

		if (self.socket !== undefined && self.socket.connected) {
			self.socket.send(cmd + "\n");
		}
		else {
			debug('Socket not connected :(');
		}

	}

};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
