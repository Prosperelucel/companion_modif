// PlayBackPro Plus TCP / UDP

var tcp           = require('../../tcp');
var udp           = require('../../udp');
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

	if (self.udp !== undefined) {
		self.udp.destroy();
		delete self.udp;
	}

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	self.config = config;
	if (self.config.prot == 'tcp') {
		self.init_tcp();
	};
	if (self.config.prot == 'udp') {
		self.init_udp();
	};
};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;
	self.init_presets();

	if (self.config.prot == 'tcp') {
		self.init_tcp();
	};

	if (self.config.prot == 'udp') {
		self.init_udp();
	};
};

instance.prototype.init_udp = function() {
	var self = this;

	if (self.udp !== undefined) {
		self.udp.destroy();
		delete self.udp;
	}

	self.status(self.STATE_WARNING, 'Connecting');

	if (self.config.host !== undefined) {
		self.udp = new udp(self.config.host, 7000);

		self.udp.on('error', function (err) {
			debug("Network error", err);
			self.status(self.STATE_ERROR, err);
			self.log('error',"Network error: " + err.message);
		});

		// If we get data, thing should be good
		self.udp.on('data', function () {
			self.status(self.STATE_OK);
		});

		self.udp.on('status_change', function (status, message) {
			self.status(status, message);
		});
	}
};

instance.prototype.init_tcp = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	self.status(self.STATE_WARNING, 'Connecting');

	if (self.config.host) {
		self.socket = new tcp(self.config.host, 4647);

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
			type: 'dropdown',
			id: 'prot',
			label: 'Connect with TCP / UDP',
			default: 'tcp',
			choices:  [
				{ id: 'udp', label: 'UDP' },
				{ id: 'tcp', label: 'TCP' }
			]
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
	}
	if (self.udp !== undefined) {
		self.udp.destroy();
	}

	debug("destroy", self.id);;
};

instance.prototype.init_presets = function () {
	var self = this;
	var presets = [
		{
			category: 'Program',
			label: 'Take',
			bank: {
				style: 'png',
				text: '',
				png64: self.ICON_PLAY_INACTIVE,
				pngalignment: 'center:center',
				size: '18',
				color: '16777215',
				bgcolor: self.rgb(0,0,0),
			},
			actions: [
				{
					action: 'take',
				}
			]
		},
		{
			category: 'Program',
			label: 'Kill',
			bank: {
				style: 'png',
				text: '',
				png64: self.ICON_STOP_INACTIVE,
				pngalignment: 'center:center',
				size: '18',
				color: '16777215',
				bgcolor: self.rgb(0,0,0),
			},
			actions: [
				{
					action: 'kill',
				}
			]
		},
		{
			category: 'Program',
			label: 'Pause',
			bank: {
				style: 'png',
				text: '',
				png64: self.ICON_PAUSE_INACTIVE,
				pngalignment: 'center:center',
				size: '18',
				color: '16777215',
				bgcolor: self.rgb(0,0,0),
			},
			actions: [
				{
					action: 'pause',
				}
			]
		},
		{
			category: 'Program',
			label: 'Freeze',
			bank: {
				style: 'text',
				text: 'Freeze',
				size: '18',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'freeze',
				}
			]
		},
		{
			category: 'Program',
			label: 'Loop',
			bank: {
				style: 'text',
				text: 'Loop',
				size: '18',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'loop',
				}
			]
		},
		{
			category: 'Program',
			label: 'Link',
			bank: {
				style: 'text',
				text: 'Link',
				size: '18',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'link',
				}
			]
		},
		{
			category: 'Program',
			label: 'Previous',
			bank: {
				style: 'png',
				text: '',
				png64: self.ICON_REW_INACTIVE,
				pngalignment: 'center:center',
				size: '18',
				color: '16777215',
				bgcolor: self.rgb(0,0,0),
			},
			actions: [
				{
					action: 'previous',
				}
			]
		},
		{
			category: 'Program',
			label: 'Next',
			bank: {
				style: 'png',
				text: '',
				png64: self.ICON_FWD_INACTIVE,
				pngalignment: 'center:center',
				size: '18',
				color: '16777215',
				bgcolor: self.rgb(0,0,0),
			},
			actions: [
				{
					action: 'next',
				}
			]
		},
		{
			category: 'Program',
			label: 'Goto 10',
			bank: {
				style: 'text',
				text: 'Goto\\n10 Sec',
				size: '18',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: '10',
				}
			]
		},
		{
			category: 'Program',
			label: 'Goto 20',
			bank: {
				style: 'text',
				text: 'Goto\\n20 Sec',
				size: '18',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: '20',
				}
			]
		},
		{
			category: 'Program',
			label: 'Goto 30',
			bank: {
				style: 'text',
				text: 'Goto\\n30 Sec',
				size: '18',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: '30',
				}
			]
		},
		{
			category: 'Program',
			label: 'Fast Forward',
			bank: {
				style: 'text',
				text: 'FF\\nPGM',
				size: '18',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'ff',
				}
			]
		},
		{
			category: 'Program',
			label: 'Rewind',
			bank: {
				style: 'text',
				text: 'Rew\\nPGM',
				size: '18',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'fr',
				}
			]
		},
		{
			category: 'Program',
			label: 'Goto IN',
			bank: {
				style: 'text',
				text: 'Goto\\nIN\\nPGM',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'oi',
				}
			]
		},
		{
			category: 'Program',
			label: 'Goto Out',
			bank: {
				style: 'text',
				text: 'Goto\\nOut\\nPGM',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'oo',
				}
			]
		},
		{
			category: 'Preview',
			label: 'Mark In',
			bank: {
				style: 'text',
				text: 'Mark\\nIn\\nPRW',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'es',
				}
			]
		},
		{
			category: 'Preview',
			label: 'Mark Out',
			bank: {
				style: 'text',
				text: 'Mark\\nOut\\nPRW',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'ee',
				}
			]
		},
		{
			category: 'Preview',
			label: 'Play/Pause',
			bank: {
				style: 'text',
				text: 'Play\\nPause\\nPRW',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'ep',
				}
			]
		},
		{
			category: 'Preview',
			label: 'Fast Forward',
			bank: {
				style: 'text',
				text: 'FF\\nPRW',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'ef',
				}
			]
		},
		{
			category: 'Preview',
			label: 'Rewind',
			bank: {
				style: 'text',
				text: 'Rev\\nPRW',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'er',
				}
			]
		},
		{
			category: 'Preview',
			label: 'Step Back PRW',
			bank: {
				style: 'text',
				text: 'Step\\nBack\\nPRW',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'e-',
				}
			]
		},
		{
			category: 'Preview',
			label: 'Step FWD PRW',
			bank: {
				style: 'text',
				text: 'Step\\nFWD\\nPRW',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'e+',
				}
			]
		}
	];
	self.setPresetDefinitions(presets);
}

instance.prototype.actions = function(system) {
	var self = this;

	self.system.emit('instance_actions', self.id, {
		'take':     { label: 'Take' },
		'play':     { label: 'Play from current location' },
		'pause':    { label: 'Pause Resume' },
		'kill':     { label: 'Kill' },
		'freeze':   { label: 'Freeze temp' },
		'loop':     { label: 'Loop temp' },
		'link':     { label: 'Link temp' },
		'previous': { label: 'Previous Clip' },
		'next':     { label: 'Next Clip' },
		'10':       { label: 'Goto 10' },
		'20':       { label: 'Goto 20' },
		'30':       { label: 'Goto 30' },
		'ff':       { label: 'Fast Forward Program'},
		'fr':       { label: 'Fast Rewind Program'},
		'oi':       { label: 'Goto In Program'},
		'oo':       { label: 'Goto Out Program'},
		'es':       { label: 'Mark In PRW'},
		'ee':       { label: 'Mark Out PRW'},
		'ep':       { label: 'Play/Pause PRW'},
		'ef':       { label: 'Fast Forward PRW'},
		'er':       { label: 'Fast Rewind PRW'},
		'e+':       { label: 'Step Forward PRW'},
		'e-':       { label: 'Step Backward PRW'},


		'goxxx':		{
			label: 'Load clip (id) into Preview',
			options: [
				{
					type: 'textinput',
					label: 'clip ID',
					id: 'clip',
					regex: self.REGEX_NUMBER
				}
			]
		},
		'gtxxx':	{
			label: 'Load clip (id) and Take',
			options: [
				{
					type: 'textinput',
					label: 'Clip ID',
					id: 'clip',
					regex: self.REGEX_NUMBER
				}
			]
		}
	});
};

instance.prototype.action = function(action) {
	var self = this;
	var cmd
	var opt = action.options

	switch(action.action){

		case 'take':
			cmd = 'TA';
			break;

		case 'play':
			cmd = 'PL'
			break;

		case 'pause':
			cmd = 'OP';
			break;

		case 'kill':
			cmd = 'KL';
			break;

		case 'freeze':
			cmd = 'FT';
			break;

		case 'loop':
			cmd = 'LT';
			break;

		case 'link':
			cmd = 'IT';
			break;

		case 'previous':
			cmd = 'PR';
			break;

		case 'next':
			cmd = 'NX';
			break;

		case '10':
			cmd = '10';
			break;

		case '20':
			cmd = '20';
			break;

		case '30':
			cmd = '30';
			break;

		case 'goxxx':
		/*
			clipId = parseInt(opt.clip, 10);
			if (clipId < 10) {
				clipId = '00'+clipId;
			}
			else if (clipId < 100) {
				clipId = '0'+clipId;
			}*/
			cmd = 'GO'+ parseInt(opt.clip, 10);
			break;

		case 'gtxxx':
		/*
			clipId = parseInt(opt.clip, 10);
			if (clipId < 10) {
				clipId = '00'+clipId;
			}
			else if (clipId < 100) {
				clipId = '0'+clipId;
			}*/
			cmd = 'GT'+ parseInt(opt.clip, 10);
			break;

		case 'ff':
			cmd = 'OF';
			break;

		case 'fr':
			cmd = 'OR';
			break;

		case 'es':
			cmd = 'ES';
			break;

		case 'ee':
			cmd = 'EE';
			break;

		case 'ep':
			cmd = 'EP';
			break;

		case 'ef':
			cmd = 'EF';
			break;

		case 'er':
			cmd = 'ER';
			break;

		case 'e+':
			cmd = 'E+';
			break;

		case 'e-':
			cmd = 'E-';
			break;

		case 'oi':
			cmd = 'OI';
			break;

		case 'oo':
			cmd = 'OO';
			break;


	}
	if (self.config.prot == 'tcp') {
		if (cmd !== undefined) {

			debug('sending ',cmd,"to",self.config.host);

			if (self.socket !== undefined && self.socket.connected) {
				self.socket.send(cmd);
			} else {
				debug('Socket not connected :(');
			}
		}
	};
	if (self.config.prot == 'udp') {

		if (cmd !== undefined ) {

			if (self.udp !== undefined ) {
				debug('sending',cmd,"to",self.config.host);

				self.udp.send(cmd);
			}
		}
	};

};



instance.module_info = {
	label: 'PlayBackPro Plus',
	id: 'playbackproplus',
	version: '1.2.0'
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
