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
};

instance.prototype.init = function() {
	var self = this;
	self.status(self.STATE_OK); // status ok!
	debug = self.debug;
	log = self.log;
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			tooltip: 'The IP of the computer running Horae',
			width: 6,
			regex: self.REGEX_IP
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'Target port',
			tooltip: 'The horae port number',
			width: 6,
			default: "7770",
			regex: self.REGEX_PORT
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;
	debug("destory", self.id);;
};

instance.prototype.actions = function(system) {
	var self = this;
	self.system.emit('instance_actions', self.id, {
		'play': { label: 'Start' },
		'stop': { label: 'Stop' },
		'arm':  { label: 'Arm' },
	});
}

instance.prototype.action = function(action) {
	var self = this;
	var id = action.action;

	var osc = {
		'play': '/horae/transport/play',
		'stop': '/horae/transport/stop',
		'arm':  '/horae/arm',
	};

	if (osc[id] !== undefined) {
		debug('sending', osc[id], "to", self.config.host);
		self.system.emit('osc_send', self.config.host, self.config.port, osc[id], [{
			type: "f",
			value: 1
		}])
	}


};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
