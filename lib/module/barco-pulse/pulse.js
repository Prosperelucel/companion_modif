var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	this.firmwareVersion = "0";

	// super-constructor
	instance_skel.apply(this, arguments);
	self.counter = 0;
	self.actions(); // export actions

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;
	self.state = 0;
	self.config = config;
	self.init_tcp();
};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
//	debug = console.log;
	log = self.log;

	self.init_tcp();
	self.initPresets();
};

instance.prototype.init_tcp = function() {
	var self = this;
	var receivebuffer = '';
	self.state = 0;
	self.requests = {};
	self.info = {};

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
			self.log('error',"Network error: " + err.message);

			if (self.infointerval !== undefined) {
				clearInterval(self.infointerval);
			}

		});

		self.socket.on('connect', function () {
			debug("Connected");


			self.infointerval = setInterval(function() {
/*
				self.request('environment.getcontrolblocks', { "type": "Sensor", "valuetype": "Speed" }, function(err, res) {
					debug('speed controlblocks:', err, "res", res);
				});

				self.request('environment.getcontrolblocks', { "type": "Sensor", "valuetype": "Temperature" }, function(err, res) {
					debug('temperature controlblocks:', err, "res", res);
				});

				self.request('environment.getcontrolblocks', { "type": "Sensor", "valuetype": "Humidity" }, function(err, res) {
					debug('humidity controlblocks:', err, "res", res);
				});

				self.request('environment.getcontrolblocks', { "type": "Sensor", "valuetype": "Pressure" }, function(err, res) {
					debug('pressure controlblocks:', err, "res", res);
				});

				self.request('environment.getcontrolblocks', { "type": "Sensor", "valuetype": "Power" }, function(err, res) {
					debug('power controlblocks:', err, "res", res);
				});

				self.request('environment.getcontrolblocks', { "type": "Sensor", "valuetype": "Altitude" }, function(err, res) {
					debug('altitude controlblocks:', err, "res", res);
				});

				self.request('environment.getcontrolblocks', { "type": "Sensor", "valuetype": "Waveform" }, function(err, res) {
					debug('waveform controlblocks:', err, "res", res);
				});

				self.request('environment.getcontrolblocks', { "type": "Sensor", "valuetype": "Current" }, function(err, res) {
					debug('current controlblocks:', err, "res", res);
				});

				self.request('environment.getcontrolblocks', { "type": "Sensor", "valuetype": "Voltage" }, function(err, res) {
					debug('voltage controlblocks:', err, "res", res);
				});
*/
			}, 3000);


			self.request('system.getidentifications', {}, function(err, res) {
				self.info['identification'] = res;
				self.log('info',"Connected to " + res.IdentificationFamily + " (" + res.Identification + "): sn " + res.SerialNumber + " fw " + res.version);
			});


			self.request('notification.list', {}, function(err, res) {
				console.log("notification.list():",err,"RES",res);
			});

		/*	self.request("introspect",  { "object": "environment", "recursive": true }, function(err, res) {
				console.log(JSON.stringify(res, null, 4));
			});*/
/*
			self.request("signal.subscribe", { "signal": "modelupdated" }, function() {} );
			var props = {
				"property": [
					"system.state",
					"image.brightness",
					"image.connector.l1sdia.detectedsignal",
					"image.processing.warp.file.enable",
					"network.hostname",
					"notification.count",
					"optics.lenspresent",
					"statistics.laserstrikes.value",
					"statistics.projectorruntime.value",
					"statistics.laserruntime.value",
					"screen.luminance",
					"statistics.systemtime.value",
					"statistics.uptime.value",
					"system.initialstate",
					"system.ready.timeout.duration",
					"system.ready.timeout.enable",
					"environment.alarmstate"
				]
			};

			self.request("property.set", { "property": "system.ready.timeout.enable", "value": false });

			self.request("property.get", props, function(err, res) {
					console.log("property.get(): ERR",err, "RES", res)
			});

			self.request('property.get', { "property": "environment.aggregated_diagnosisstatus.observableoutput"}, function(err, res) {
				console.log('getallcontrolblocks()', JSON.stringify(res, null, 4));
			})
			self.request("property.subscribe", props, function() {} );

			self.request("system.gotoready",  { }, function(err, res) {
				console.log("system.gotoready():",err,"RES",res);
			});

			self.request("image.source.list", { }, function(err, res) {
				console.log("image.source.list:",err,"RES",res);
			});
*/
			self.request("property.get", { "property": "illumination.state" }, function(err, res) {
				console.log("property.get():",err,"RES",res);
			});


		});

		// separate buffered stream into lines with responses
		self.socket.on('data', function (chunk) {

			var i = 0, line = '', offset = 0;

			receivebuffer += chunk.toString();

			var braces = 0;
			var cmd_buffer = '';
			var startoffset = 0;
			var in_string = false;
			var next_doesnt_count = false;

			for (var i = 0; i < receivebuffer.length; i++) {

				if (receivebuffer[i] == '{' && !in_string) {
					braces++;
					cmd_buffer += '{';
					startoffset = i;
				}

				else if (receivebuffer[i] == '}' && !in_string) {
					braces--;
					cmd_buffer += '}';

					if (braces === 0) {
						receivebuffer = receivebuffer.slice(i+1);
						startoffset = 0;
						braces = 0;
						i=-1;
						var ret = "" + cmd_buffer;
						cmd_buffer = '';
						self.socket.emit('receiveline', ret);
					}

				}

				else if (braces > 0) {

					if (!in_string && receivebuffer[i] == '"') {
						in_string = true;
					}

					else if (in_string && receivebuffer[i] == '\\' && receivebuffer[i+1] == '"') {
						cmd_buffer += receivebuffer[i];
						i++;
					}

					else if (in_string && receivebuffer[i] == '"') {
						in_string = false;
					}

					cmd_buffer += receivebuffer[i];

				}

				else {
					console.log('ex: i='+i+', chr='+receivebuffer[i]+' in_string='+in_string+', startoffset='+startoffset+', cmd_buffer="'+cmd_buffer+'" "'+receivebuffer+'"');
				}

			}

			receivebuffer = receivebuffer.substr(offset);

		});

		self.socket.on('receiveline', function (line) {
			var obj = {};

			try {
				obj = JSON.parse(line);
				if (self.requests['req' + obj.id] !== undefined) {
					self.requests['req' + obj.id].callback(obj.error || null, obj.result || null);
					delete self.requests['req' + obj.id];
				}
				else {
					// notification
					console.log("NOTIFICATION:", line);

				}
			} catch(e) {
				debug('ERROR PARSING JSON DATA', e);
				console.log("RAW:", line);
			}
		});

	}
	self.initPresets();
};

/*
instance.prototype.monitor_log_poll = function() {
	var self = this;
};
*/

instance.prototype.request = function(method, params, cb) {
	var self = this;
	self.counter++;
	self.requests['req' + self.counter] = {
		method: method,
		params: params,
		callback: cb
	};
	var line = '{"method":"'+method+'","id":"'+self.counter+'","params":'+JSON.stringify(params)+',"jsonrpc":"2.0"}';
	self.socket.write(line);
	console.log('SEND Request: %s', line);
	debug('SNED['+self.counter+']:', line);
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;

	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Projector IP',
			width: 6,
			default: '192.168.1.100',
			regex: self.REGEX_IP
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'Target Port (9090)',
			default: '9090',
			width: 5,
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

	self.requests = {};
};

instance.prototype.LIST_OnOff = [
	{id: 'true',	label: 'On'},
	{id: 'false',	label: 'Off'}
];

instance.prototype.LIST_power = [
	{ id: 'system.poweron',		label: 'Projektor ON' },
	{ id: 'system.poweroff',	label: 'Projektor OFF' },
];

instance.prototype.LIST_illumination = [
	{ id: 'illumination.extinguish',	label: 'Extinguish' },
	{ id: 'illumination.ignite',			label: 'Illuminate' },
];

instance.prototype.LIST_input = [
	{ id: 'L1 HDMI',				label: 'HDMI' },
	{ id: 'L1 Displayport',	label: 'Displayport' },
];

instance.prototype.LIST_shutter = [
	{id: 'Open', 		label: 'Shutter open'},
	{id: 'Closed',	label: 'Shutter close'}
];

instance.prototype.LIST_lens_zoom = [
	{id: 'optics.zoom.stepforward', 	label: 'Forward'},
	{id: 'optics.zoom.stepreverse', 	label: 'Back'},
];

instance.prototype.LIST_lens_focus = [
	{id: 'optics.focus.stepforward',	label: 'Forward'},
	{id: 'optics.focus.stepreverse',	label: 'Back'},
];

instance.prototype.LIST_lens_shift = [
	{id: 'optics.lensshift.vertical.stepforward', 	label: 'Up'},
	{id: 'optics.lensshift.vertical.stepreverse', 	label: 'Down'},
	{id: 'optics.lensshift.horizontal.stepforward',	label: 'Left'},
	{id: 'optics.lensshift.horizontal.stepreverse',	label: 'Right'},
];

instance.prototype.LIST_lens_calibrate = [
	{id: 'optics.zoom.calibrate', 									label: 'Calibrate Zoom'},
	{id: 'optics.focus.calibrate', 									label: 'Calibrate Focus'},
	{id: 'optics.lensshift.vertical.calibrate',			label: 'Calibrate Vertical'},
	{id: 'optics.lensshift.horizontal.calibrate',		label: 'Calibrate Horizontal'},
	{id: 'optics.shifttocenter',										label: 'Go To Center'},
];

instance.prototype.LIST_rc_shift = [
	{id: 'RC_SHIFT_UP',			label: 'up'},
	{id: 'RC_SHIFT_DOWN',		label: 'down'},
	{id: 'RC_SHIFT_LEFT',		label: 'left'},
	{id: 'RC_SHIFT_RIGHT',	label: 'right'}
];

instance.prototype.LIST_release = [
	{id: 'keydispatcher.sendpressevent',		label: 'Press'},
	{id: 'keydispatcher.sendreleaseevent',	label: 'Release'}
];

instance.prototype.LIST_rc_key = [
	{id: 'RC_SHUTTER_OPEN',		label: 'Shutter Open'},
	{id: 'RC_SHUTTER_CLOSE',	label: 'Shutter Close'},
	{id: 'RC_POWER_ON',				label: 'Power ON'},
	{id: 'RC_POWER_OFF',			label: 'Power OFF'},
	{id: 'RC_OSD',						label: 'OSD'},
	{id: 'RC_LCD',						label: 'LCD'},
	{id: 'RC_PATTERN',				label: 'Pattern'},
	{id: 'RC_RGB',						label: 'RGB'},
	{id: 'RC_ZOOM_PLUS',			label: 'Zoom +'},
	{id: 'RC_ZOOM_MINUS',			label: 'Zoom -'},
	{id: 'RC_SHIFT_UP',				label: 'Lens Up'},
	{id: 'RC_SHIFT_DOWN',			label: 'Lens Down'},
	{id: 'RC_SHIFT_LEFT',			label: 'Lens Left'},
	{id: 'RC_SHIFT_RIGHT',		label: 'Lens Right'},
	{id: 'RC_FOCUS_PLUS',			label: 'Focus +'},
	{id: 'RC_FOCUS_MINUS',		label: 'Focus -'},
	{id: 'RC_MENU',						label: 'Menu'},
	{id: 'RC_DEFAULT',				label: 'Default'},
	{id: 'RC_BACK',						label: 'Back'},
	{id: 'RC_UP',							label: 'Up'},
	{id: 'RC_LEFT',						label: 'Left'},
	{id: 'RC_OK',							label: 'Ok'},
	{id: 'RC_RIGHT',					label: 'Right'},
	{id: 'RC_DOWN',						label: 'Down'},
	{id: 'RC_ADDRESS',				label: 'Address'},
	{id: 'RC_INPUT',					label: 'Input'},
	{id: 'RC_MACRO',					label: 'Macro'},
	{id: 'RC_1',							label: '1'},
	{id: 'RC_2',							label: '2'},
	{id: 'RC_3',							label: '3'},
	{id: 'RC_4',							label: '4'},
	{id: 'RC_5',							label: '5'},
	{id: 'RC_6',							label: '6'},
	{id: 'RC_7',							label: '7'},
	{id: 'RC_8',							label: '8'},
	{id: 'RC_9',							label: '9'},
	{id: 'RC_0',							label: '0'},
	{id: 'RC_ASTERISK',				label: 'Asterisk'},
	{id: 'RC_NUMBER',					label: 'Number'},
	{id: 'KP_LEFT',						label: 'KP Left'},
	{id: 'KP_UP',							label: 'KP Up'},
	{id: 'KP_OK',							label: 'KP Ok'},
	{id: 'KP_RIGHT',					label: 'KP Right'},
	{id: 'KP_DOWN',						label: 'KP Down'},
	{id: 'KP_MENU',						label: 'KP Menu'},
	{id: 'KP_POWER',					label: 'KP Power'},
	{id: 'KP_BACK',						label: 'KP Back'},
	{id: 'KP_OSD',						label: 'KP OSD'},
	{id: 'KP_LENS',						label: 'KP Lens'},
	{id: 'KP_PATTERN',				label: 'KP Pattern'},
	{id: 'KP_SHUTTER',				label: 'KP Shutter'},
	{id: 'KP_INPUT',					label: 'KP Input'},
	{id: 'KP_STANDBY',				label: 'KP Standby'},
];

instance.prototype.actions = function(system) {
	var self = this;

	self.setActions({
		'power': {
			label: 'Power',
			options: [{
				type: 'dropdown',
				label: 'Power',
				id: 'p1',
				default: 'system.poweron',
				choices: self.LIST_power
			}]
		},
		'illumination': {
			label: 'Illumination',
			options: [{
				type: 'dropdown',
				label: 'illumination',
				id: 'p1',
				default: 'illumination.ignite',
				choices: self.LIST_illumination
			}]
		},
		'osd': {
			label: 'OSD on',
			options: [{
				type: 'dropdown',
				label: 'Show OSD?',
				id: 'p1',
				default: 'true',
				choices: self.LIST_OnOff
			}]
		},
		'input': {
			label: 'Select input',
			options: [{
				type: 'dropdown',
				label: 'input',
				id: 'p1',
				default: 'L1 HDMI',
				choices: self.LIST_input
			}]
		},
		'shutter': {
			label: 'Shutter projector',
			options: [{
				type: 'dropdown',
				label: 'shutter open/close',
				id: 'p1',
				default: 'Open',
				choices: self.LIST_shutter
			}]
		},
		'shutter_toggle': {
			label: 'Shutter projector (Toggle)',
		},
		'testpattern': {
			label: 'Testpattern on/off',
			options: [{
				type: 'dropdown',
				label: 'on/off',
				id: 'p1',
				default: 'on',
				choices: self.LIST_OnOff
			}]
		},
		'stealth': {
			label: 'Stealth mode (LEDs)',
			options: [{
				type: 'dropdown',
				label: 'Controlable leds on/off',
				id: 'p1',
				default: 'on',
				choices: self.LIST_OnOff
			}]
		},
		'stealth_toggle': {
			label: 'Stealth mode (Toggle)',
		},
		'lens_zoom': {
			label: 'Zoom lens',
			options: [{
				type: 'dropdown',
				label: 'Direction',
				id: 'p1',
				default: 'optics.zoom.stepforward',
				choices: self.LIST_lens_zoom
			},{
				type: 'number',
				id: 'p2',
				label: 'Steps (1-100)',
				min: 0,
				max: 100,
				default: 1,
				required: true,
				range: false,
				regex: self.REGEX_NUMBER
			}]
		},
		'lens_focus': {
			label: 'Focus lens',
			options: [{
				type: 'dropdown',
				label: 'Direction',
				id: 'p1',
				default: 'optics.focus.stepforward',
				choices: self.LIST_lens_focus
			},{
				type: 'number',
				id: 'p2',
				label: 'Steps (1-100)',
				min: 0,
				max: 100,
				default: 1,
				required: true,
				range: false,
				regex: self.REGEX_NUMBER
			}]
		},
		'lens_shift': {
			label: 'Shift lens',
			options: [{
				type: 'dropdown',
				label: 'Direction',
				id: 'p1',
				default: 'optics.lensshift.vertical.stepforward',
				choices: self.LIST_lens_shift
			},{
				type: 'number',
				id: 'p2',
				label: 'Steps (1-100)',
				min: 0,
				max: 100,
				default: 1,
				required: true,
				range: false,
				regex: self.REGEX_NUMBER
			}]
		},
		'lens_calibrate': {
			label: 'Calibrate lens',
			options: [{
				type: 'dropdown',
				label: 'Type',
				id: 'p1',
				default: 'optics.zoom.calibrate',
				choices: self.LIST_lens_calibrate
			}]
		},
		'rc_shift': {
			label: 'Remote Shift lens',
			options: [{
				type: 'dropdown',
				label: 'Direction',
				id: 'p1',
				default: 'RC_SHIFT_UP',
				choices: self.LIST_rc_shift
			},{
				type: 'dropdown',
				label: 'press/release',
				id: 'p2',
				choices: self.LIST_release
			}]
		},
		'remoteKey': {
			label: 'Send remote button',
			options: [{
				type: 'p1',
				label: 'Button from remote controller',
				id: 'key',
				choices: self.LIST_rc_key
			}]
		},
		'factory': {
			label: 'Reset to factory defaults',
		}
	});
}

instance.prototype.action = function(action) {
	var self = this;
	var id = action.action;
	var opt = action.options;

	var pj_command;
	var pj_args = {};

	switch(id) {

		case 'power':
			pj_command = opt.p1;
			break;

		case 'illumination':
			pj_command = opt.p1;
			break;

		case 'osd':
			pj_command = 'property.set';
			pj_args = { "property": "ui.osd", "value": opt.p1};
			break;

		case 'input':
			pj_command = 'property.set';
			pj_args = { "property": "image.window.main.source", "value": opt.p1 };
			break;
	
		case 'shutter':
			pj_command = 'property.set';
			pj_args = { "property": "optics.shutter.target", "value": opt.p1 };
			break;

		case 'shutter_toggle':
			pj_command = 'optics.shutter.toggle';
			break;
	
		case 'testpattern':
			pj_command = 'property.set';
			pj_args = { "property": "image.testpattern.show", "value": opt.p1 };
			break;

		case 'stealth':
			pj_command = 'property.set';
			pj_args = { "property": "ui.stealthmode", "value": opt.p1 };
			break;

		case 'stealth_toggle':
			pj_command = 'ui.togglestealthmode';
			break;

		case 'lens_zoom':
			pj_command = opt.p1;
			pj_args = { "steps": opt.p2 };
			break;

		case 'lens_focus':
			pj_command = opt.p1;
			pj_args = { "steps": opt.p2 };
			break;

		case 'lens_shift':
			pj_command = opt.p1;
			pj_args = { "steps": opt.p2 };
			break;

		case 'lens_calibrate':
			pj_command = opt.p1;
			break;

		case 'rc_shift':
			pj_command = opt.p2;
			pj_args = { "key": opt.p1 };
			break;
	
		case 'remoteKey':
				pj_command = 'keydispatcher.sendclickevent';
				pj_args = { "key": opt.p1 };
			break;

		case 'factory':
			pj_command = 'system.resetall';
			break;
	}
	if (pj_command !== undefined) {
		self.request(pj_command, pj_args, function() {});
	}

};

instance.prototype.initPresets = function (updates) {
	var self = this;
	var presets = [];

	// Shutter Open / Close
	for (var i in self.LIST_shutter) {
		presets.push({
			category: 'Lens Control',
			label: self.LIST_shutter[i].label,
			bank: {
				style: 'text',
				text: self.LIST_shutter[i].label,
				size: '14',
				color: self.rgb(0,0,0),
				bgcolor: self.rgb(235,235,235)
			},
			actions: [
				{
					action: 'shutter',
					options: {
						p1: self.LIST_shutter[i].id
					}
				}
			]
		})
	}

	// Shutter Toggle
	presets.push({
		category: 'Lens Control',
		label: 'Shutter Toggle',
		bank: {
			style: 'text',
			text: 'Shutter Toggle',
			size: '14',
			color: self.rgb(0,0,0),
			bgcolor: self.rgb(235,235,235)
		},
		actions: [
			{
				action: 'shutter_toggle',
			}
		]
	})

	// Lens Zoom
	for (var i in self.LIST_lens_zoom) {
		presets.push({
			category: 'Lens Control',
			label: 'Lens Zoom ' + self.LIST_lens_zoom[i].label,
			bank: {
				style: 'text',
				text: 'Zoom ' + self.LIST_lens_zoom[i].label,
				size: '14',
				color: self.rgb(0,0,0),
				bgcolor: self.rgb(235,235,235)
			},
			actions: [
				{
					action: 'lens_zoom',
					options: {
						p1: self.LIST_lens_zoom[i].id,
						p2: 1
					}
				}
			]
		})
	}

	// Lens Focus
	for (var i in self.LIST_lens_focus) {
		presets.push({
			category: 'Lens Control',
			label: 'Lens Focus ' + self.LIST_lens_focus[i].label,
			bank: {
				style: 'text',
				text: 'Focus ' + self.LIST_lens_focus[i].label,
				size: '14',
				color: self.rgb(0,0,0),
				bgcolor: self.rgb(235,235,235)
			},
			actions: [
				{
					action: 'lens_focus',
					options: {
						p1: self.LIST_lens_focus[i].id,
						p2: 1
					}
				}
			]
		})
	}

	// Lens Shift
	for (var i in self.LIST_lens_shift) {
		presets.push({
			category: 'Lens Control',
			label: 'Lens Shift ' + self.LIST_lens_shift[i].label,
			bank: {
				style: 'text',
				text: 'Shift ' + self.LIST_lens_shift[i].label,
				size: '14',
				color: self.rgb(0,0,0),
				bgcolor: self.rgb(235,235,235)
			},
			actions: [
				{
					action: 'lens_shift',
					options: {
						p1: self.LIST_lens_shift[i].id,
						p2: 1
					}
				}
			]
		})
	}

	// Lens Calibrate
	for (var i in self.LIST_lens_calibrate) {
		presets.push({
			category: 'Lens Control',
			label: self.LIST_lens_calibrate[i].label,
			bank: {
				style: 'text',
				text: self.LIST_lens_calibrate[i].label,
				size: '14',
				color: self.rgb(0,0,0),
				bgcolor: self.rgb(235,235,235)
			},
			actions: [
				{
					action: 'lens_calibrate',
					options: {
						p1: self.LIST_lens_calibrate[i].id,
					}
				}
			]
		})
	}

	// Remote Lens Shift
	for (var i in self.LIST_rc_shift) {
		presets.push({
			category: 'Remote Lens',
			label: 'Remote Lense Shift ' + self.LIST_rc_shift[i].label,
			bank: {
				style: 'text',
				text: 'Remote Shift ' + self.LIST_rc_shift[i].label,
				size: '14',
				color: self.rgb(0,0,0),
				bgcolor: self.rgb(235,235,235)
			},
			actions: [
				{
					action: 'rc_shift',
					options: {
						p1: self.LIST_rc_shift[i].id,
						p2: 'Press'
					}
				}
			],
			release_actions: [
				{
					action: 'rc_shift',
					options: {
						p1: self.LIST_rc_shift[i].id,
						p2: 'Release'
					}
				}
			]
		})
	}

	// Remote Key Press
	for (var i in self.LIST_rc_key) {
		presets.push({
			category: 'Remote',
			label: 'Remote ' + self.LIST_rc_key[i].label,
			bank: {
				style: 'text',
				text: 'Remote ' + self.LIST_rc_key[i].label,
				size: '14',
				color: self.rgb(0,0,0),
				bgcolor: self.rgb(235,235,235)
			},
			actions: [
				{
					action: 'remoteKey',
					options: {
						p1: self.LIST_rc_key[i].id
					}
				}
			]
		})
	}

	// Power ON / OFF
	for (var i in self.LIST_power) {
		presets.push({
			category: 'System',
			label: self.LIST_power[i].label,
			bank: {
				style: 'text',
				text: self.LIST_power[i].label,
				size: '14',
				color: self.rgb(0,0,0),
				bgcolor: self.rgb(235,235,235)
			},
			actions: [
				{
					action: 'power',
					options: {
						p1: self.LIST_power[i].id
					}
				}
			]
		})
	}

	// Shutter Open / Close
	for (var i in self.LIST_shutter) {
		presets.push({
			category: 'System',
			label: self.LIST_shutter[i].label,
			bank: {
				style: 'text',
				text: self.LIST_shutter[i].label,
				size: '14',
				color: self.rgb(0,0,0),
				bgcolor: self.rgb(235,235,235)
			},
			actions: [
				{
					action: 'shutter',
					options: {
						p1: self.LIST_shutter[i].id
					}
				}
			]
		})
	}

	// Shutter Toggle
	presets.push({
		category: 'System',
		label: 'Shutter Toggle',
		bank: {
			style: 'text',
			text: 'Shutter Toggle',
			size: '14',
			color: self.rgb(0,0,0),
			bgcolor: self.rgb(235,235,235)
		},
		actions: [
			{
				action: 'shutter_toggle',
			}
		]
	})

	// Illumination
	for (var i in self.LIST_illumination) {
		presets.push({
			category: 'System',
			label: self.LIST_illumination[i].label,
			bank: {
				style: 'text',
				text: self.LIST_illumination[i].label,
				size: '14',
				color: self.rgb(0,0,0),
				bgcolor: self.rgb(235,235,235)
			},
			actions: [
				{
					action: 'illumination',
					options: {
						p1: self.LIST_illumination[i].id
					}
				}
			]
		})
	}

	// OSD ON / OFF
	for (var i in self.LIST_OnOff) {
		presets.push({
			category: 'System',
			label: 'OSD ' + self.LIST_OnOff[i].label,
			bank: {
				style: 'text',
				text: 'OSD ' + self.LIST_OnOff[i].label,
				size: '14',
				color: self.rgb(0,0,0),
				bgcolor: self.rgb(235,235,235)
			},
			actions: [
				{
					action: 'osd',
					options: {
						p1: self.LIST_OnOff[i].id
					}
				}
			]
		})
	}

	// Testpattern ON / OFF
	for (var i in self.LIST_OnOff) {
		presets.push({
			category: 'System',
			label: 'Testpattern ' + self.LIST_OnOff[i].label,
			bank: {
				style: 'text',
				text: 'TP ' + self.LIST_OnOff[i].label,
				size: '14',
				color: self.rgb(0,0,0),
				bgcolor: self.rgb(235,235,235)
			},
			actions: [
				{
					action: 'testpattern',
					options: {
						p1: self.LIST_OnOff[i].id
					}
				}
			]
		})
	}

	// Stealth Mode ON / OFF
	for (var i in self.LIST_OnOff) {
		presets.push({
			category: 'System',
			label: 'Stealth ' + self.LIST_OnOff[i].label,
			bank: {
				style: 'text',
				text: 'Stealth ' + self.LIST_OnOff[i].label,
				size: '14',
				color: self.rgb(0,0,0),
				bgcolor: self.rgb(235,235,235)
			},
			actions: [
				{
					action: 'stealth',
					options: {
						p1: self.LIST_OnOff[i].id
					}
				}
			]
		})
	}

	// Stealth Toggle
	presets.push({
		category: 'System',
		label: 'Stealth Mode Toggle',
		bank: {
			style: 'text',
			text: 'Stealth Toggle',
			size: '14',
			color: self.rgb(0,0,0),
			bgcolor: self.rgb(235,235,235)
		},
		actions: [
			{
				action: 'Stealth_toggle',
			}
		]
	})
	
	// Factory Reset
	presets.push({
		category: 'System',
		label: 'Factory Reset',
		bank: {
			style: 'text',
			text: 'Factory Reset',
			size: '14',
			color: self.rgb(0,0,0),
			bgcolor: self.rgb(235,235,235)
		},
		actions: [
			{
				action: 'factory',
			}
		]
	})
				
	self.setPresetDefinitions(presets);
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
