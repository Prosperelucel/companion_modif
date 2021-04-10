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

		self.socket.on('data', function (data) {});
	}
};


// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;

	return [
		{
			type: 'text',
			id: 'info',
			label: 'Information',
			width: 12,
			value: 'To enable remote control in Playdeck, go to: Settings -> All Settings -> Remote Connection. And enable "Remote control via TCP"'
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 4,
			regex: self.REGEX_IP
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'TCP Port (Default: 11375)',
			width: 4,
			default: 11375,
			regex: self.REGEX_PORT
		},
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
	}

	debug("destroy", self.id);
};

instance.prototype.CHOICES_COMMANDS_1 = [
	{ id: 'play',							label: 'Play'},
	{ id: 'pause', 						label: 'Pause'},
	{ id: 'stop', 						label: 'Stop'},
	{ id: 'nextclip', 				label: 'Next Clip'},
	{ id: 'previousclip', 		label: 'Previous Clip'},
	{ id: 'restartclip', 			label: 'Restart Clip'},
	{ id: 'jump',							label: 'Jump'},
	{ id: 'fadein',						label: 'Fade In'},
	{ id: 'fadeout',					label: 'Fade Out'},
	{ id: 'muteaudio',				label: 'Mute Audio'},
	{ id: 'unmuteaudio',			label: 'Unmute Audio'},
	{ id: 'activateall',			label: 'Activate All'},
	{ id: 'stopalloverlays',	label: 'Stop All Overlays'},
];

instance.prototype.CHOICES_COMMANDS_2 = [
	{ id: 'playoverlay',			label: 'Play Overlay'},
	{ id: 'stopoverlay',			label: 'Stop Overlay'},
	{ id: 'playaction',				label: 'Play Action'},
];

instance.prototype.CHOICES_COMMANDS_3 = [
	{ id: 'selectblock', 			label: 'Select Block'},
	{ id: 'activateblock', 		label: 'Activate Block'},
	{ id: 'deactivateblock',	label: 'Deactivate Block'},
];

instance.prototype.CHOICES_COMMANDS_4 = [
	{ id: 'selectclip',				label: 'Select Clip'},
	{ id: 'activateclip',			label: 'Activate Clip'},
	{ id: 'deactivateclip',		label: 'Deactivate Clip'},
	{ id: 'cue', 							label: 'Cue'},
	{ id: 'cueandplay', 			label: 'Cue And Play'},
];

instance.prototype.CHOICES_COMMANDS_5 = [
	{ id: 'startrec', label: 'Start Recording' },
	{ id: 'stoprec', 	label: 'Stop Recording' },
];

instance.prototype.CHOICES_PLAYLIST = [
	{ id: '1', label: 'Left Playlist' },
	{ id: '2', 	label: 'Right Playlist' },
];

instance.prototype.init_presets = function () {
	var self = this;
	var presets = [];
	var pstSize = '14';

	for (var i = 0; i < 2; i++) {
		for (var input in self.CHOICES_COMMANDS_1) {
			presets.push({
				category: 'Playlist ' + (i+1),
				label: self.CHOICES_COMMANDS_1[input].label,
				bank: {
					style: 'text',
					text: self.CHOICES_COMMANDS_1[input].label + ' P' + (i+1),
					size: pstSize,
					color: '16777215',
					bgcolor: self.rgb(0,0,0)
				},
				actions: [{	
					action: self.CHOICES_COMMANDS_1[input].id, 
					options: {
						playlist: (i+1)
					}
				}]
			});
		}

		for (var input in self.CHOICES_COMMANDS_2) {
			for (var x = 0; x < 30; x++){
				presets.push({
					category: 'Playlist ' + (i+1),
					label: self.CHOICES_COMMANDS_2[input].label,
					bank: {
						style: 'text',
						text: self.CHOICES_COMMANDS_2[input].label + ' ' + (x+1) + ' P' + (i+1),
						size: pstSize,
						color: '16777215',
						bgcolor: self.rgb(0,0,0)
					},
					actions: [{
						action: self.CHOICES_COMMANDS_2[input].id, 
						options: {
							playlist: (i+1),
							id: (x+1)
						}
					}]
				});
			}
		}

		for (var input in self.CHOICES_COMMANDS_3) {
			presets.push({
				category: 'Playlist ' + (i+1),
				label: self.CHOICES_COMMANDS_3[input].label,
				bank: {
					style: 'text',
					text: self.CHOICES_COMMANDS_3[input].label + ' P' + (i+1),
					size: pstSize,
					color: '16777215',
					bgcolor: self.rgb(0,0,0)
				},
				actions: [{	
					action: self.CHOICES_COMMANDS_3[input].id, 
					options: {
						playlist: (i+1)
					}
				}]
			});
		}

		for (var input in self.CHOICES_COMMANDS_4) {
			presets.push({
				category: 'Playlist ' + (i+1),
				label: self.CHOICES_COMMANDS_4[input].label,
				bank: {
					style: 'text',
					text: self.CHOICES_COMMANDS_4[input].label + ' P' + (i+1),
					size: pstSize,
					color: '16777215',
					bgcolor: self.rgb(0,0,0)
				},
				actions: [{	
					action: self.CHOICES_COMMANDS_4[input].id, 
					options: {
						playlist: (i+1)
					}
				}]
			});
		}
	}

	for (var input in self.CHOICES_COMMANDS_5) {
		presets.push({
			category: 'Recording',
			label: self.CHOICES_COMMANDS_5[input].label,
			bank: {
				style: 'text',
				text: self.CHOICES_COMMANDS_5[input].label,
				size: pstSize,
				color: '16777215',
				bgcolor: self.rgb(0,0,0)
			},
			actions: [{	
				action: self.CHOICES_COMMANDS_5[input].id, 
			}]
		});
	}

	self.setPresetDefinitions(presets);
}

instance.prototype.actions = function(system) {
	var self = this;

	self.system.emit('instance_actions', self.id, {
		
		'play': {
			label: 'Play',
			options: [
				{
					type: 'dropdown',
					id: 'playlist',
					label: 'Playlist',
					default: '1',
					choices: self.CHOICES_PLAYLIST
				}
			]
		},
		'pause': {
			label: 'Pause',
			options: [
				{
					type: 'dropdown',
					id: 'playlist',
					label: 'Playlist',
					default: '1',
					choices: self.CHOICES_PLAYLIST
				}
			]
		},
		'stop': {
			label: 'Stop',
			options: [
				{
					type: 'dropdown',
					id: 'playlist',
					label: 'Playlist',
					default: '1',
					choices: self.CHOICES_PLAYLIST
				}
			]
		},
		'nextclip': {
			label: 'Next Clip',
			options: [
				{
					type: 'dropdown',
					id: 'playlist',
					label: 'Playlist',
					default: '1',
					choices: self.CHOICES_PLAYLIST
				}
			]
		},
		'previousclip': {
			label: 'Previous Clip',
			options: [
				{
					type: 'dropdown',
					id: 'playlist',
					label: 'Playlist',
					default: '1',
					choices: self.CHOICES_PLAYLIST
				}
			]
		},
		'restartclip': {
			label: 'Restart Clip',
			options: [
				{
					type: 'dropdown',
					id: 'playlist',
					label: 'Playlist',
					default: '1',
					choices: self.CHOICES_PLAYLIST
				}
			]
		},
		'jump': {
			label: 'Jump',
			options: [
				{
					type: 'dropdown',
					id: 'playlist',
					label: 'Playlist',
					default: '1',
					choices: self.CHOICES_PLAYLIST
				}
			]
		},
		'fadein': {
			label: 'Fade In',
			options: [
				{
					type: 'dropdown',
					id: 'playlist',
					label: 'Playlist',
					default: '1',
					choices: self.CHOICES_PLAYLIST
				}
			]
		},
		'fadeout': {
			label: 'Fade Out',
			options: [
				{
					type: 'dropdown',
					id: 'playlist',
					label: 'Playlist',
					default: '1',
					choices: self.CHOICES_PLAYLIST
				}
			]
		},
		'muteaudio': {
			label: 'Mute Audio',
			options: [
				{
					type: 'dropdown',
					id: 'playlist',
					label: 'Playlist',
					default: '1',
					choices: self.CHOICES_PLAYLIST
				}
			]
		},
		'unmuteaudio': {
			label: 'Unmute Audio',
			options: [
				{
					type: 'dropdown',
					id: 'playlist',
					label: 'Playlist',
					default: '1',
					choices: self.CHOICES_PLAYLIST
				}
			]
		},
		'activateall': {
			label: 'Activate All',
			options: [
				{
					type: 'dropdown',
					id: 'playlist',
					label: 'Playlist',
					default: '1',
					choices: self.CHOICES_PLAYLIST
				}
			]
		},
		'stopalloverlays': {
			label: 'Stop All Overlays',
			options: [
				{
					type: 'dropdown',
					id: 'playlist',
					label: 'Playlist',
					default: '1',
					choices: self.CHOICES_PLAYLIST
				}
			]
		},
		'playoverlay': {
			label: 'Play Overlay',
			options: [
				{
					type: 'dropdown',
					id: 'playlist',
					label: 'Playlist',
					default: '1',
					choices: self.CHOICES_PLAYLIST
				},
				{
					type: 'number',
					id: 'id',
					label: 'Overlay ID:',
					min: 1,
					max: 30,
					default: 1,
					required: true,
					range: false,
					regex: self.REGEX_NUMBER
				}
			]
		},
		'stopoverlay': {
			label: 'Stop Overlay',
			options: [
				{
					type: 'dropdown',
					id: 'playlist',
					label: 'Playlist',
					default: '1',
					choices: self.CHOICES_PLAYLIST
				},
				{
					type: 'number',
					id: 'id',
					label: 'Overlay ID:',
					min: 1,
					max: 30,
					default: 1,
					required: true,
					range: false,
					regex: self.REGEX_NUMBER
				}
			]
		},
		'playaction': {
			label: 'Play Action',
			options: [
				{
					type: 'dropdown',
					id: 'playlist',
					label: 'Playlist',
					default: '1',
					choices: self.CHOICES_PLAYLIST
				},
				{
					type: 'number',
					id: 'id',
					label: 'Action ID:',
					min: 1,
					max: 30,
					default: 1,
					required: true,
					range: false,
					regex: self.REGEX_NUMBER
				}
			]
		},
		'selectblock': {
			label: 'Select Block',
			options: [
				{
					type: 'dropdown',
					id: 'playlist',
					label: 'Playlist',
					default: '1',
					choices: self.CHOICES_PLAYLIST
				},
				{
					type: 'number',
					id: 'id',
					label: 'Block ID:',
					min: 1,
					max: 256,
					default: 1,
					required: true,
					range: false,
					regex: self.REGEX_NUMBER
				}
			]
		},
		'activateblock': {
			label: 'Activate Block',
			options: [
				{
					type: 'dropdown',
					id: 'playlist',
					label: 'Playlist',
					default: '1',
					choices: self.CHOICES_PLAYLIST
				},
				{
					type: 'number',
					id: 'id',
					label: 'Block ID:',
					min: 1,
					max: 256,
					default: 1,
					required: true,
					range: false,
					regex: self.REGEX_NUMBER
				}
			]
		},
		'deactivateblock': {
			label: 'Deactivate Block',
			options: [
				{
					type: 'dropdown',
					id: 'playlist',
					label: 'Playlist',
					default: '1',
					choices: self.CHOICES_PLAYLIST
				},
				{
					type: 'number',
					id: 'id',
					label: 'Block ID:',
					min: 1,
					max: 256,
					default: 1,
					required: true,
					range: false,
					regex: self.REGEX_NUMBER
				}
			]
		},
		'selectclip': {
			label: 'Select Clip',
			options: [
				{
					type: 'dropdown',
					id: 'playlist',
					label: 'Playlist',
					default: '1',
					choices: self.CHOICES_PLAYLIST
				},
				{
					type: 'number',
					id: 'id',
					label: 'Block ID:',
					min: 1,
					max: 256,
					default: 1,
					required: true,
					range: false,
					regex: self.REGEX_NUMBER
				},
				{
					type: 'number',
					id: 'clip_id',
					label: 'Clip ID:',
					min: 1,
					max: 256,
					default: 1,
					required: true,
					range: false,
					regex: self.REGEX_NUMBER
				}
			]
		},
		'activateclip': {
			label: 'Activate Clip',
			options: [
				{
					type: 'dropdown',
					id: 'playlist',
					label: 'Playlist',
					default: '1',
					choices: self.CHOICES_PLAYLIST
				},
				{
					type: 'number',
					id: 'id',
					label: 'Block ID:',
					min: 1,
					max: 256,
					default: 1,
					required: true,
					range: false,
					regex: self.REGEX_NUMBER
				},
				{
					type: 'number',
					id: 'clip_id',
					label: 'Clip ID:',
					min: 1,
					max: 256,
					default: 1,
					required: true,
					range: false,
					regex: self.REGEX_NUMBER
				}
			]
		},
		'deactivateclip': {
			label: 'Deactivate Clip',
			options: [
				{
					type: 'dropdown',
					id: 'playlist',
					label: 'Playlist',
					default: '1',
					choices: self.CHOICES_PLAYLIST
				},
				{
					type: 'number',
					id: 'id',
					label: 'Block ID:',
					min: 1,
					max: 256,
					default: 1,
					required: true,
					range: false,
					regex: self.REGEX_NUMBER
				},
				{
					type: 'number',
					id: 'clip_id',
					label: 'Clip ID:',
					min: 1,
					max: 256,
					default: 1,
					required: true,
					range: false,
					regex: self.REGEX_NUMBER
				}
			]
		},
		'cue': {
			label: 'Cue',
			options: [
				{
					type: 'dropdown',
					id: 'playlist',
					label: 'Playlist',
					default: '1',
					choices: self.CHOICES_PLAYLIST
				},
				{
					type: 'number',
					id: 'id',
					label: 'Block ID:',
					min: 1,
					max: 256,
					default: 1,
					required: true,
					range: false,
					regex: self.REGEX_NUMBER
				},
				{
					type: 'number',
					id: 'clip_id',
					label: 'Clip ID:',
					min: 1,
					max: 256,
					default: 1,
					required: true,
					range: false,
					regex: self.REGEX_NUMBER
				}
			]
		},
		'cueandplay': {
			label: 'Cue And Play',
			options: [
				{
					type: 'dropdown',
					id: 'playlist',
					label: 'Playlist',
					default: '1',
					choices: self.CHOICES_PLAYLIST
				},
				{
					type: 'number',
					id: 'id',
					label: 'Block ID:',
					min: 1,
					max: 256,
					default: 1,
					required: true,
					range: false,
					regex: self.REGEX_NUMBER
				},
				{
					type: 'number',
					id: 'clip_id',
					label: 'Clip ID:',
					min: 1,
					max: 256,
					default: 1,
					required: true,
					range: false,
					regex: self.REGEX_NUMBER
				}
			]
		},
		'startrec': {
			label: 'Start Recording',
		},
		'stoprec': {
			label: 'Stop Recording',
		}
	});
}


instance.prototype.action = function(action) {
	var self = this;
	var cmd;
	
	switch(action.action) {

		case 'play':
			cmd = '<play|' + action.options.playlist + '>';
			break;

		case 'pause':
			cmd = '<pause|' + action.options.playlist + '>';
			break;

		case 'stop':
			cmd = '<stop|' + action.options.playlist + '>';
			break;
			
		case 'nextclip':
			cmd = '<nextclip|' + action.options.playlist + '>';
			break;

		case 'previousclip':
			cmd = '<previousclip|' + action.options.playlist + '>';
			break;

		case 'restartclip':
			cmd = '<restartclip|' + action.options.playlist + '>';
			break;
			
		case 'jump':
			cmd = '<jump|' + action.options.playlist + '>';
			break;
			
		case 'fadein':
			cmd = '<fadein|' + action.options.playlist + '>';
			break;

		case 'fadeout':
			cmd = '<fadeout|' + action.options.playlist + '>';
			break;
			
		case 'muteaudio':
			cmd = '<muteaudio|' + action.options.playlist + '>';
			break;
			
		case 'unmuteaudio':
			cmd = '<unmuteaudio|' + action.options.playlist + '>';
			break;
			
		case 'activateall':
			cmd = '<activateall|' + action.options.playlist + '>';
			break;
			
		case 'stopalloverlays':
			cmd = '<stopalloverlays|' + action.options.playlist + '>';
			break;

		case 'playoverlay':
			cmd = '<playoverlay|' + action.options.playlist + '|' + action.options.id + '>';
			break;

		case 'stopoverlay':
			cmd = '<stopoverlay|' + action.options.playlist + '|' + action.options.id + '>';
			break;
			
		case 'playaction':
			cmd = '<playaction|' + action.options.playlist + '|' + action.options.id + '>';
			break;
			
		case 'selectblock':
			cmd = '<selectblock|' + action.options.playlist + '|' + action.options.id + '>';
			break;
			
		case 'activateblock':
			cmd = '<activateblock|' + action.options.playlist + '|' + action.options.id + '>';
			break;

		case 'deactivateblock':
			cmd = '<deactivateblock|' + action.options.playlist + '|' + action.options.id + '>';
			break;
	
		case 'selectclip':
			cmd = '<selectclip|' + action.options.playlist + '|' + action.options.id + '|' + action.options.clip_id + '>';
			break;
					
		case 'activateclip':
			cmd = '<activateclip|' + action.options.playlist + '|' + action.options.id + '|' + action.options.clip_id + '>';
			break;
					
		case 'deactivateclip':
			cmd = '<deactivateclip|' + action.options.playlist + '|' + action.options.id + '|' + action.options.clip_id + '>';
			break;
					
		case 'cue':
			cmd = '<cue|' + action.options.playlist + '|' + action.options.id + '|' + action.options.clip_id + '>';
			break;
					
		case 'cueandplay':
			cmd = '<cueandplay|' + action.options.playlist + '|' + action.options.id + '|' + action.options.clip_id + '>';
			break;

		case 'startrec':
			cmd = '<startrec>';
			break;

		case 'stoprec':
			cmd = '<stoprec>';
			break;
		}

	if (cmd !== undefined) {

			debug('sending ',cmd,"to",self.config.host);

			if (self.socket !== undefined && self.socket.connected) {
					self.socket.send(cmd);
			}
			else {
					debug('Socket not connected :(');
			}
	}
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;
