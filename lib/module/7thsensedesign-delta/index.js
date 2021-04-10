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

		self.socket.on('data', function (data) {});
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
			label: 'Target Port',
			witdth: 6,
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
		'showmode': { label: 'set system in Show mode'},
		'play':    {
			label: 'Play the show (no Cueing) [Timeline]',
			options: [
				{
					type: 'textinput',
					label:'Timeline number',
					id:   'tl',
					regex: self.REGEX_NUMBER
				}
			]
		},
		'cue':     {
			label: 'Cue the show & wait for the play command [Timeline]',
			options: [
				{
					type: 'textinput',
					label:'Timeline number',
					id:   'tl',
					regex: self.REGEX_NUMBER
				}
			]
		},
		'stop':    {
			label: 'Stop the show [Timeline]',
			options: [
				{
					type: 'textinput',
					label:'Timeline number',
					id:   'tl',
					regex: self.REGEX_NUMBER
				}
			]
		},
		'rewind':  {
			label: 'Rewind the show to frame 0 [Timeline]',
			options: [
				{
					type: 'textinput',
					label:'Timeline number',
					id:   'tl',
					regex: self.REGEX_NUMBER
				}
			]
		},
		'record':  { label: 'Start recording. Details configured in GUI'},
		'advance': {
			label: 'Step forward n frames (defaults to 1)',
			options: [
				 {
					 type: 'textinput',
						label: 'Number of frames',
					 id: 'frames',
					 default: '1'
				 },
				{
					type: 'textinput',
					label:'Time Line number',
					id:   'tl',
					regex: self.REGEX_NUMBER
				}
			 ]
		},
		'stepback': {
			label: 'Step back n frames (defaults to 1)',
			options: [
				 {
					 type: 'textinput',
					 label: 'Number of frames',
					 id: 'frames',
					 default: '1'
				 },
				{
					type: 'textinput',
					label:'Time Line number',
					id:   'tl',
					regex: self.REGEX_NUMBER
				}
			 ]
		},
		'gotomarker': {
			label: 'Move to a named marker on timeline (optionally play)',
			options: [
				 {
					 type: 'textinput',
					 label: 'Marker name',
					 id: 'marker',
					 default: ''
				 },
				{
					type: 'dropdown',
					label: 'Goto and play',
					id: 'play',
					choices: [ { id: '', label: 'No Play' }, { id: 'play', label: 'Play' } ]
				},
				{
					type: 'textinput',
					label:'Time Line number',
					id:   'tl',
					regex: self.REGEX_NUMBER
				}
			 ]
		},
		'gotoframe': {
			label: 'Move to the framenumber specified (optionally play)',
			options: [
				 {
					 type: 'textinput',
					 label: 'Frame Number',
					 id: 'frame',
					 default: ''
				 },
				{
					type: 'dropdown',
					label: 'Goto and play',
					id: 'play',
					choices: [ { id: '', label: 'No Play' }, { id: 'play', label: 'Play' } ]
				},
				{
					type: 'textinput',
					label:'Time Line number',
					id:   'tl',
					regex: self.REGEX_NUMBER
				}
			 ]
		},
		'sequence': {
			label: 'Start the named sequence',
			options: [
				 {
					 type: 'textinput',
					 label: 'Sequence name',
					 id: 'seq',
					 default: ''
				 }
			 ]
		},
		'sequenceAll': {
			label: 'Start the named sequence on all servers in the group.',
			options: [
				 {
					 type: 'textinput',
					 label: 'Sequence name',
					 id: 'seq',
					 default: ''
				 }
			 ]
		},
		'smpte': {
			label: 'Enable or disable tracking an external SMPTE timecode',
			options: [
				 {
					 type: 'dropdown',
					 label: 'SMPTE On/OFF',
					 id: 'smpteId',
					 choices: [ { id: 'off', label: 'Off' }, { id: 'on', label: 'On' } ]
				 }
			 ]
		},
		'rate': {
			label: 'Set the framerate to n frames per second',
			options: [
				 {
					 type: 'textinput',
					 label: 'frames pr second',
					 id: 'fps',
					 default: ''
				 }
			 ]
		},
		'load': {
			label: 'Load a different show file',
			options: [
				 {
					 type: 'textinput',
					 label: 'Filename',
					 id: 'loadFile',
					 default: ''
				 }
			 ]
		},
		'loadAll': {
			label: 'Load a different show file on all servers in a group',
			options: [
				 {
					 type: 'textinput',
					 label: 'Filename',
					 id: 'loadFile',
					 default: ''
				 }
			 ]
		},
		'save': {
			label: 'Save a different show file',
			options: [
				 {
					 type: 'textinput',
					 label: 'Filename',
					 id: 'saveFile',
					 default: ''
				 }
			 ]
		},
		'saveAll': {
			label: 'Save a different show file on all servers in a group',
			options: [
				 {
					 type: 'textinput',
					 label: 'Filename',
					 id: 'saveFile',
					 default: ''
				 }
			 ]
		},
		'graph': {
			label: 'Enable/disable diagnostic graphs',
			options: [
				 {
					 type: 'dropdown',
					 label: 'Graph On/OFF',
					 id: 'alt',
					 choices: [ { id: 'off', label: 'Off' }, { id: 'on', label: 'On' } ]
				 }
			 ]
		},
		'stats': {
			label: 'enable/disable diagnostic stats',
			options: [
				 {
					 type: 'dropdown',
					 label: 'Stats On/OFF',
					 id: 'alt',
					 choices: [ { id: 'off', label: 'Off' }, { id: 'on', label: 'On' } ]
				 }
			 ]
		},
		'audioVu': {
			label: 'enable/disable Audio VU',
			options: [
				 {
					 type: 'dropdown',
					 label: 'Audio VU On/OFF',
					 id: 'alt',
					 choices: [ { id: 'off', label: 'Off' }, { id: 'on', label: 'On' } ]
				 }
			 ]
		},
		'channelid': {
			label: 'enable/disable channel ID',
			options: [
				 {
					 type: 'dropdown',
					 label: 'channel ID On/OFF',
					 id: 'alt',
					 choices: [ { id: 'off', label: 'Off' }, { id: 'on', label: 'On' } ]
				 }
			 ]
		},
	});
};

instance.prototype.action = function(action) {
	var self = this;
	var cmd
	var opt = action.options

	switch (action.action){

		case 'play':
			cmd = 'play tl='+ opt.tl;
			break;

		case 'cue':
			cmd = 'cue tl='+ opt.tl;
			break;

		case 'stop':
			cmd = 'stop tl='+ opt.tl;
			break;

		case 'rewind':
			cmd = 'rewind tl='+ opt.tl;
			break;

		case 'record':
			cmd = 'record tl='+ opt.tl;
			break;

		case 'advance':
			cmd = 'advance '+ opt.frames + ' tl='+ opt.tl;
			break;

		case 'stepback':
			cmd = 'stepback '+ opt.frames + ' tl='+ opt.tl;
			break;

		case 'gotomarker':
			cmd = 'gotomarker '+ opt.marker + ' tl=' + opt.tl + ' ' + opt.play;
			break;

		case 'gotoframe':
			cmd = 'gotoframe '+ opt.frame + ' tl=' + opt.tl + ' ' + opt.play;
			break;

		case 'sequence':
			cmd = 'sequence '+ opt.seq;
			break;

		case 'sequenceAll':
			cmd = 'sequenceall '+ opt.seq;
			break;

		case 'smpte':
			cmd = 'smpte '+ opt.smpteId;
			break;

		case 'rate':
			cmd = 'rate '+ opt.fps;
			break;

		case 'load':
			cmd = 'load '+ opt.loadFile;
			break;

		case 'loadAll':
			cmd = 'loadAll '+ opt.loadFile;
			break;

		case 'save':
			cmd = 'save '+ opt.saveFile;
			break;

		case 'saveAll':
			cmd = 'saveAll '+ opt.saveFile;
			break;

		case 'graph':
			cmd = 'graph '+ opt.alt;
			break;

		case 'stats':
			cmd = 'stats '+ opt.alt;
			break;

		case 'audioVu':
			cmd = 'audiovu '+ opt.alt;
			break;

		case 'channelid':
			cmd = 'channelid '+ opt.alt;
			break;

		case 'showmode':
			cmd = 'applyshowmode';
			break;



	};




	if (cmd !== undefined) {

		debug('sending ',cmd,"to",self.config.host);

		if (self.socket !== undefined && self.socket.connected) {
			self.socket.send(cmd + "\r");
		} else {
			debug('Socket not connected :(');
		}

	}

	// debug('action():', action);

};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
