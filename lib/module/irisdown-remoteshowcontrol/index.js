var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');
var ping = require('ping');
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

	self.lastState = self.STATE_UNKNOWN;

	self.config = config;
};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.status(self.STATE_UNKNOWN, 'Checking ping response');

	self.timer = setInterval(function () {
		ping.sys.probe(self.config.host, function(isAlive) {
			if (isAlive) {
				if (self.lastState !== self.STATE_OK && self.lastState !== self.STATE_ERROR) {
					self.status(self.STATE_OK);
					self.lastState = self.STATE_OK;
				}
			} else {
				if (self.lastState != self.STATE_WARNING) {
					self.status(self.STATE_WARNING, 'No ping response');
					self.lastState = self.STATE_WARNING;
				}
			}
		}, { timeout: 2 });
	}, 5000);
};

instance.prototype.init_tcp = function(cb) {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	if (self.config.host) {
		self.socket = new tcp(self.config.host, 61001, { reconnect: false });

		self.socket.on('error', function (err) {
			debug("Network error", err);
			self.status(self.STATE_ERROR, err.message);
			self.log('error',"Network error: " + err.message);
		});

		self.socket.on('connect', function () {
			if (self.lastState != self.STATE_OK) {
				self.status(self.STATE_OK);
				self.lastState = self.STATE_OK;
			}
			debug("Connected");
			if (typeof cb == 'function') {
				cb();
			}
		})

		self.socket.on('data', function (data) {});

		self.socket.on('end', function () {
			debug('Disconnected, ok');
			self.socket.destroy();
			delete self.socket;
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
			value: 'This module controls Remote Show Control by <a href="http://irisdown.co.uk" target="_new">Irisdown</a>. Go over to their website to download the plugin.'
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 6,
			regex: self.REGEX_IP
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.timer) {
		clearInterval(self.timer);
		delete self.timer;
	}

	if (self.socket !== undefined) {
		self.socket.destroy();
	}

	debug("destroy", self.id);;
};


instance.prototype.actions = function(system) {
	var self = this;

	self.system.emit('instance_actions', self.id, {
		'open': {
			label: 'Open file',
			options: [
				{
					type: 'textinput',
					label: 'filename',
					id: 'file',
					default: ''
				}
			]
		},
		'close':{
			label: 'Close file',
			options: [
				 {
					type: 'textinput',
					label: 'filename',
					id: 'file',
					default: ''
				 }
			 ]
		 },
		'run':  {
			label: 'Run (file)',
			options: [
				{
					type: 'textinput',
					label: 'filename (optional)',
					id: 'file',
					default: ''
				}
		 ]
		},
		'runCurrent': { label: 'Run at selected slide' },
		'stop':  {
			label: 'Stop (file)',
			options: [
				{
					type: 'textinput',
					label: 'filename (optional)',
					id: 'file',
					default: ''
				}
		 ]
		},
		'next': { label: 'Next slide' },
		'prev': { label: 'Previous slide' },
		'go':   {
			label: 'Goto Slide',
			options: [
				{
					type: 'textinput',
					label: 'slide nr',
					id: 'slide',
					default: ''
				}
			]
		},
		'goSection':   {
			label: 'Goto Section',
			options: [
				{
					type: 'textinput',
					label: 'section name',
					id: 'section',
					default: ''
				}
			]
		},
		'setbg':{ label: 'Set background' },

	});
};

instance.prototype.action = function(action) {
	var self = this;
	var id = action.action;
	var cmd

	switch (action.action){

		case 'open':
			cmd = 'OPEN ' + '"' + action.options.file + '"';
			break;

		case 'close':
			cmd = 'CLOSE ' + '"' + action.options.file + '"' ;
			break;

		case 'run':
			cmd = 'RUN ' + '"' + action.options.file + '"';
			break;

		case 'stop':
			cmd = 'STOP ' + '"' + action.options.file + '"';
			break;

		case 'runCurrent':
			cmd = 'RUNCURRENT';
			break;

		case 'next':
			cmd = 'NEXT';
			break;

		case 'prev':
			cmd = 'PREV';
			break;

		case 'go':
			cmd = 'GO '+ action.options.slide;
			break;

		case 'goSection':
			cmd = 'GO '+ action.options.section;
			break;

		case 'setbg':
			cmd = 'SETBG';
			break;

	};




	if (cmd !== undefined) {

		debug('sending ',cmd,"to",self.config.host);

		self.init_tcp(function () {
			self.socket.send(cmd + "\r");
		});

	}

};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
