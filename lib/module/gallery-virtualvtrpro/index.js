// Virtual VTR

var tcp           = require('../../tcp');
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

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	self.config = config;
	self.init_tcp();
};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;
	self.init_presets();
	self.init_tcp();
};


instance.prototype.init_tcp = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	self.status(self.STATE_WARNING, 'Connecting');

	if (self.config.host) {
		self.socket = new tcp(self.config.host, self.config.port);

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

		self.socket.on('data', function (data) {
			var rx = data.toString();
			var i = rx.indexOf(";"); //find first postion of ;
				if (i<0) {
					debug("Reply: "+data)
				} else {
				var o = rx.indexOf(";",i+1); //find second position of ;
			
				var replyType = rx.substring(i+1,o); //what is reply?
					if (replyType=="TIMECODE") {
						currentTimecode = rx.substring(o+1);
						debug("Current Timecode: "+currentTimecode)
						}
					}
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
			type: 'textinput',
			id: 'port',
			label: 'TCP Port',
			default: '12345',
			
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
			category: 'Transport',
			label: 'Play',
			bank: {
				style: 'text',
				text: 'Play',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'play',
				}
			]
		});

		presets.push({
			category: 'Transport',
			label: 'Stop',
			bank: {
				style: 'text',
				text: 'Stop',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'stop',
				}
			]
		});

		presets.push({
			category: 'Transport',
			label: 'Rewind',
			bank: {
				style: 'text',
				text: 'Rewind',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'rewind',
				}
			]
		});

		presets.push({
			category: 'Transport',
			label: 'Fast Forward',
			bank: {
				style: 'text',
				text: 'Fast Forward',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'ffw',
				}
			]
		});
		
		presets.push({
			category: 'Transport',
			label: 'Eject',
			bank: {
				style: 'text',
				text: 'Eject',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'eject',
				}
			]
		});

		presets.push({
			category: 'Transport',
			label: 'Go To Start',
			bank: {
				style: 'text',
				text: 'Go To Start',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'beginning',
				}
			]
		});

		

		presets.push({
			category: 'Transport',
			label: 'Goto Timecode',
			bank: {
				style: 'text',
				text: 'Goto\\nTimecode',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'goto_TC',
				}
			]
		});
		
		presets.push({
			category: 'Transport',
			label: 'Load Clip',
			bank: {
				style: 'text',
				text: 'Load\\nClip',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'load_Clip',
				}
			]
		});

		self.setPresetDefinitions(presets);
}

instance.prototype.actions = function(system) {
	var self = this;

	self.system.emit('instance_actions', self.id, {
		'stop':     { label: 'Stop' },
		'play':     { label: 'Play' },
		'rewind':    { label: 'Rewind' },
		'ffw':     { label: 'Fast Forward' },
		'record':   { label: 'Record' },
		'beginning':     { label: 'Go to Start' },
		'eject':     { label: 'Eject' },
		'load_Clip':		{
			label: 'Load clip name',
			options: [
				{
					type: 'textinput',
					label: 'Clip File Name',
					id: 'clipName',
					val: 'moviename.mov'
				}
			]
		},
		'goto_TC':	{
			label: 'Locate to timecode',
			options: [
				{
					type: 'textinput',
					label: 'Timecode HH:MM:SS:FF',
					id: 'timecode',
					val: '00:00:00:00',
					regex: self.REGEX_TIMECODE
				}
			]
		},

		'query_timecode':     { label: 'Query Timecode' }
	});
};

instance.prototype.action = function(action) {
	var self = this;
	var cmd
	var opt = action.options

	switch(action.action){

		case 'stop':
			cmd = 'COMMAND;STOP';
			break;

		case 'play':
			cmd = 'COMMAND;PLAY'
			break;

		case 'rewind':
			cmd = 'COMMAND;REWD';
			break;

		case 'ffw':
			cmd = 'COMMAND;FFWD';
			break;

		case 'record':
			cmd = 'COMMAND;RECD';
			break;

		case 'beginning':
			cmd = 'COMMAND;RETN';
			break;
			
		case 'eject':
			cmd = 'COMMAND;EJCT';
			break;
		
		case 'goto_TC':
			cmd = 'COMMAND;GOTO;'+ opt.timecode;
			break;
			
		case 'load_Clip':
			cmd = 'COMMAND;LOAD;'+ opt.clipName;
			break;	
			
		case 'query_timecode':
			cmd = 'REQUEST;STATUS;TIMECODE';
			break;	

	}
	if (self.config.host) {
		if (cmd !== undefined) {

			debug('sending ',cmd,"to",self.config.host);

			if (self.socket !== undefined && self.socket.connected) {
				self.socket.send(cmd);
			} else {
				debug('Socket not connected :(');
			}
		}
	};
};


instance.module_info = {
	label: 'Virtual VTR',
	id: 'virtualvtr',
	version: '1.0.0'
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
