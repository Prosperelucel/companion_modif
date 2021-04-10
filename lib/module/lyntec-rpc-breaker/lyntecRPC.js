var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	self.init_presets();

	return self;
}

instance.prototype.updateConfig = function (config) {
	var self = this;

	self.config = config;
	self.init_presets();

	self.initVariables();

	self.init_feedbacks();

	self.init_tcp();
};

instance.prototype.init = function () {
	var self = this;

	self.commands = [];
	self.transmitOK = false;
	self.connected = false;
	self.transmitTimer;
	self.zoneCheckTimer;
	self.zoneCheckLastTimeout = 0

	self.initVariables();

	self.init_feedbacks();

	self.status(self.STATE_UNKNOWN);

	self.init_tcp();
};

instance.prototype.init_tcp = function () {
	var self = this;

	// var connected = false;

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	if (self.config.host) {
		self.commands = [];

		if (self.config.port === undefined) {
			self.config.port = 23;
		}
		self.socket = new tcp(self.config.host, self.config.port);

		self.socket.on('status_change', function (status, message) {
			self.status(status, message);
		});

		self.socket.on('error', function (err) {
			self.log('debug', "Network error", err);
			self.status(self.STATE_ERROR, err);
			self.log('error', "Network error: " + err.message);
		});

		self.socket.on('connect', function () {
			self.status(self.STATE_OK);
			self.log('debug', "Connected");
		});

		self.socket.on('data', function (data) {
			let dataString = data.toString();
			let loginFound = dataString.search("Login:");
			let passFound = dataString.search("Password:");
			let commandPrompt = dataString.search(":>")

			var bytes = []

			if(loginFound >= 0){
				if (self.socket !== undefined && self.socket.connected) {
					self.socket.send(self.config.user+"\r\n");
					self.log('debug', "Sent Username");
				}
				else {
					self.log('debug', 'Socket not connected :(');
				}
				bytes = []
				self.stopZoneCheckTimer();
				self.stopTransmitTimer();
			}
			else if(passFound >= 0){
				if (self.socket !== undefined && self.socket.connected) {
					self.socket.send(self.config.pass+"\r\n");
					self.log('debug', "Sent password");
					self.connected = false;
				}
				else {
					self.log('debug', 'Socket not connected :(');
				}
				bytes = [];
				self.stopZoneCheckTimer();
			}
			else if(commandPrompt >= 0){
				if(!self.connected){
					if (self.socket !== undefined && self.socket.connected) {
						self.log('debug', 'Login Success')
						self.connected = true;

						self.requestZones();
						self.requestBreakers();
						self.startTransmitTimer(10);
						self.startZoneCheckTimer(30000);
					}
					else {
						self.log('debug', 'Socket not connected :(');
					}
				}
				self.transmitOK = true;
			}

			var cleanedString = dataString.replace(/\r|\n|\:\>/g, '');
			var array = Buffer.from(cleanedString, "hex");


			var dataStringStart = false
			for (let i =0; i < array.length; i++){
				if(array[i] == 0xB0){
					dataStringStart = true
					bytes = []
				}
				else if(array[i] == 0xF0){
					if(dataStringStart & (array.length >= 2)){
						self.processBytes(bytes)
					}
					bytes = []
					dataStringStart = false
				}
				else if(dataStringStart){
					bytes.push(array[i])
				}
			}
		});
	}
};

instance.prototype.processBytes = function(bytes){
	var self = this;
	var breakerRaw, stateRaw, zoneRaw, state;

	if(bytes[0] == 0xC8){ //breaker Status(DONE)
		//B0 C8 1F 02 F0
		for (let i =1; i <= bytes.length;) {
			if(bytes.length - i >=2){
				breakerRaw = bytes[i++]
				stateRaw = bytes[i++]

				switch (stateRaw) {
					case 1:
						state = "Off"
						break;
					case 2:
						state = "On"
						break;
					case 3:
						state = "Tripped"
						break;
					case 4:
						state = "Faulty"
						break;
					case 5:
						state = "Empty"
						break;
					case 6:
						state = "Manually On"
						break;
					default :
						break;
				}

				self.log('debug', 'Breaker '+breakerRaw+' is now '+state)
				self.updateVariable('breaker_'+breakerRaw, state);
			}
			else{
				i++
			}
		}
		self.checkFeedbacks('breaker_state');
	}//breaker Status

	if(bytes[0] == 0xC9){ //Zone Status(DONE)
		for (let i =1; i <= bytes.length;) {
			if(bytes.length - i >=2){
				zoneRaw = bytes[i++]
				stateRaw = bytes[i++]
				switch (stateRaw) {
					case 1:
						state = "Off"
						break;
					case 2:
						state = "On"
						break;
					case 3:
						state = "Sequencing"
						self.startZoneCheckTimer(1000);
						break;
					default :
						break;
				}

				self.log('debug', 'Zone '+zoneRaw+' is now '+state)
				self.updateVariable('zone_'+zoneRaw, state);
			}
			else{
				i++
			}
		}
		self.checkFeedbacks('zone_state');
	}//Zone Status

	if(bytes[0] == 0xB6){ //All Breaker Status (DONE)
		self.log('info', "Full Breaker Update Recieved");
		var numOfBreakers = bytes[1]
		if(self.currentState.internal.breakers != numOfBreakers){
			self.currentState.internal.breakers = numOfBreakers;
			self.initVariables();
			self.actions();
			self.init_feedbacks();
			self.requestZones();
		}
		for (let i =1; i <= numOfBreakers; i++) {
			let byteNum = i+1
			if(byteNum < bytes.length){
				value = (bytes[byteNum] & 0x0F)

				state = ""
				switch (value) {
					case 1:
						state = "Off"
						break;
					case 2:
						state = "On"
						break;
					case 3:
						state = "Tripped"
						break;
					case 4:
						state = "Faulty"
						break;
					case 5:
						state = "Empty"
						break;
					case 6:
						state = "Manually On"
						break;
					default :
						break;
				}
				self.log('debug', 'Breaker '+i+' is now '+state)
				self.updateVariable('breaker_'+i, state);
			}
		}
		self.checkFeedbacks('breaker_state');
	}//All Breaker Status

	if(bytes[0] == 0xB9){ //All Zone Status(DONE)
		self.log('info', "Full Zone Update Recieved");

		let sequencing = false;
		var numOfZones = bytes[1]
		if(self.currentState.internal.zones != numOfZones){
			self.currentState.internal.zones = numOfZones;
			self.initVariables();
			self.actions();
			self.init_feedbacks();
			self.requestBreakers();
		}
		for(let i = 1; i <= numOfZones; i++){
			let byteNum = i+1
			if(byteNum < bytes.length){
				var value = bytes[byteNum]
				state = "N/A"
				switch (value) {
					case 1:
						state = "Off"
						break;
					case 2:
						state = "On"
						break;
					case 3:
						state = "Sequencing"
						sequencing = true;
						break;
					default :
						break;
				}
				self.log('debug', 'Zone '+i+' is now '+state)
				self.updateVariable('zone_'+i, state);
			}
		}
		if(sequencing){
			self.startZoneCheckTimer(1000);
		}
		else{
			self.startZoneCheckTimer(30000);
		}
		self.checkFeedbacks('zone_state');
	}//All Zone Status
}

instance.prototype.requestZones = function() {//request zone status
	var self = this;
	self.commands.push("B0B9F0");
}

instance.prototype.requestBreakers = function() {//Request breaker status
	var self = this;
	self.commands.push("B0B6F0");
}

instance.prototype.breakerChange = function(breaker, state) {
	var self = this;
	if(state == 0){
		self.commands.push("B0B5"+self.decimalToHex(breaker,2)+"F0");
	}
	else if(state == 1){
		self.commands.push("B0B4"+self.decimalToHex(breaker,2)+"F0");
	}
}

instance.prototype.zoneChange = function(zone, state) {
	var self = this;
	if(state == 0){
		self.commands.push("B0B8"+self.decimalToHex(zone,2)+"F0");
	}
	else if(state == 1){
		self.commands.push("B0B7"+self.decimalToHex(zone,2)+"F0");
	}
}

instance.prototype.startZoneCheckTimer = function(timeout) {
	var self = this;

	if(self.zoneCheckLastTimeout != timeout){
		// Stop the timer if it was already running
		self.stopZoneCheckTimer();

		self.log('info', "Starting zoneCheckTimer");
		// Create a reconnect timer to watch the socket. If disconnected try to connect.
		self.zoneCheckTimer = setInterval(function(){
			self.requestZones();
		}, timeout);
		self.zoneCheckLastTimeout = timeout;
	}

};

instance.prototype.stopZoneCheckTimer = function() {
	var self = this;

	self.log('info', "Stopping zoneCheckTimer");
	if (self.zoneCheckTimer !== undefined) {
		clearInterval(self.zoneCheckTimer);
		delete self.zoneCheckTimer;
	}

};

instance.prototype.startTransmitTimer = function(timeout) {
	var self = this;

	// Stop the timer if it was already running
	self.stopTransmitTimer();

	self.log('info', "Starting transmitTimer");
	// Create a reconnect timer to watch the socket. If disconnected try to connect.
	self.transmitTimer = setInterval(function(){
		self.transmitCommands();
	}, timeout);
};

instance.prototype.stopTransmitTimer = function() {
	var self = this;

	self.log('info', "Stopping transmitTimer");
	if (self.transmitTimer !== undefined) {
		clearInterval(self.transmitTimer);
		delete self.transmitTimer;
	}

};

instance.prototype.transmitCommands = function(){
	var self = this;

	if(self.transmitOK){
		if(self.commands.length){
			var command = self.commands.shift()
			if (self.socket !== undefined && self.socket.connected) {
				self.socket.send(command+"\r\n");
				self.log('debug', "Sent Username");
			}
			else {
				self.log('debug', 'Socket not connected :(');
			}
			self.transmitOK = false;
		}
	}
}

/**
 * The current state of the LynTec panel.
 * Initially populated by emptyCurrentState().
 *
 * .internal contains the internal state of the module
 * .dynamicVariable contains the values of the dynamic variables
 */
instance.prototype.currentState = {
	internal : {},
	dynamicVariables : {},
};

/**
 * Initialize an empty current state.
 */
instance.prototype.emptyCurrentState = function() {
	var self = this;

	var internal = {}
	if(self.currentState.internal != undefined){
		internal = self.currentState.internal
	}
	// Reinitialize the currentState variable, otherwise this variable (and the module's
	//	state) will be shared between multiple instances of this module.
	self.currentState = {};

	// The internal state of the connection to ProPresenter
	self.currentState.internal = internal

	// The dynamic variable exposed to Companion
	self.currentState.dynamicVariables = {'breaker_1':'Empty'}

	for (let i =2; i <= self.currentState.internal.breakers; i++) {
		self.currentState.dynamicVariables['breaker_'+i] = 'Empty'
		self.setVariable('breaker_'+i, 'Empty');
	}

	for (let i =1; i <= self.currentState.internal.zones; i++) {
		self.currentState.dynamicVariables['zone_'+i] = 'Off'
		self.setVariable('zone_'+i, 'Off');
	}

	// Update Companion with the default state if each dynamic variable.
//	Object.keys(self.currentState.dynamicVariables).forEach(function(key) {
//		self.updateVariable(key, self.currentState.dynamicVariables[key]);
//	});

};

/**
 * Initialize the available variables. (These are listed in the module config UI)
 */
instance.prototype.initVariables = function() {
	var self = this;

	// Initialize the current state and update Companion with the variables.
	self.emptyCurrentState();

	var variables = [];
	var element = {}

	for (let i =1; i <= self.currentState.internal.breakers; i++) {
		element = {
			label: 'Breaker #'+i+' State',
			name:  'breaker_'+i
		}
		variables.push(element)
	}

	for (let i =1; i <= self.currentState.internal.zones; i++) {
		element = {
			label: 'Zone #'+i+' State',
			name:  'zone_'+i
		}
		variables.push(element)
	}

	self.setVariableDefinitions(variables);

	self.init_presets();
};

/**
 * Updates the dynamic variable and records the internal state of that variable.
 *
 * Will log a warning if the variable doesn't exist.
 */
instance.prototype.updateVariable = function(name, value) {
	var self = this;

	if (self.currentState.dynamicVariables[name] === undefined) {
		self.log('warn', "Variable " + name + " does not exist");
		return;
	}

	self.currentState.dynamicVariables[name] = value;
	self.setVariable(name, value);
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
			value: 'This module allows control of LynTec RPC panels running version 1.01 of the LynTec Telnet Server'
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'IP of LynTec RPC Panel',
			width: 12,
			regex: self.REGEX_IP
		},
		{
			type: 'textinput',
			id: 'user',
			label: 'Username of LynTec RPC Panel',
			width: 12
		},
		{
			type: 'textinput',
			id: 'pass',
			label: 'Password of LynTec RPC Panel',
			width: 12
		}
	];
};

// When module gets deleted
instance.prototype.destroy = function () {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.send("q\r\n");
		self.socket.destroy();
	}

	self.stopZoneCheckTimer()
	self.stopTransmitTimer()

	self.log('debug', "destroy", self.id);
};

/**
* Define button presets
*/
instance.prototype.init_presets = function () {
	var self = this;

	var presets = []
	var element = {}

	for (let i =1; i <= self.currentState.internal.breakers; i++) {
		element = {
			category: 'Breaker Toggle',
			label: 'This button tells breaker '+i+' to toggle its state depending on the recieved state.',
			bank: {
				style: 'text',
				text: 'Breaker '+i+'\\n$(LynTec:breaker_'+i+')',
				size: '14',
				color: self.rgb(255,255,255),
				bgcolor: self.rgb(0,0,0),
				latch: false
			},
			actions: [
				{
					action: 'breakerToggle',
					options: {
						breaker: i,
					}
				}
			],
			feedbacks: [
				{
					type: 'breaker_state',
					options: {
						fg: self.rgb(0,0,0),
						bg: self.rgb(0,255,0),
						state: 2, //On State
						breaker: i
					}
				},
				{
					type: 'breaker_state',
					options: {
						fg: self.rgb(0,0,0),
						bg: self.rgb(0,204,0),
						state: 6, //Manualy On State
						breaker: i
					}
				},
				{
					type: 'breaker_state',
					options: {
						fg: self.rgb(0,0,0),
						bg: self.rgb(255,0,0),
						state: 3, //Tripped State
						breaker: i
					}
				},
				{
					type: 'breaker_state',
					options: {
						fg: self.rgb(0,0,0),
						bg: self.rgb(255,0,0),
						state: 4, //Faulty State
						breaker: i
					}
				}
			]
		}
		presets.push(element)
	}

	for (let i =1; i <= self.currentState.internal.zones; i++) {
		element = {
			category: 'Zone Toggle',
			label: 'This button tells zone '+i+' to toggle its state depending on the recieved state.',
			bank: {
				style: 'text',
				text: 'Zone '+i+'\\n$(LynTec:zone_'+i+')',
				size: '14',
				color: self.rgb(255,255,255),
				bgcolor: self.rgb(0,0,0),
				latch: false
			},
			actions: [
				{
					action: 'zoneToggle',
					options: {
						zone: i,
					}
				}
			],
			feedbacks: [
				{
					type: 'zone_state',
					options: {
						state: 2, //On
						fg: self.rgb(0,0,0),
						bg: self.rgb(0, 255, 0),
						zone: i
					}
				},
				{
					type: 'zone_state',
					options: {
						state: 3, //Sequencing
						fg: self.rgb(255,255,255),
						bg: self.rgb(102,153,255),
						zone: i
					}
				}
			]
		}
		presets.push(element)
	}

	self.setPresetDefinitions(presets);
}

instance.prototype.actions = function (system) {
	var self = this;
	var element = {}

	var zoneOptions = []
	for (let i =1; i <= self.currentState.internal.zones; i++) {
		element = { id: i, label: i.toString() };
		zoneOptions.push(element)
	}

	var breakerOptions = []
	for (let i =1; i <= self.currentState.internal.breakers; i++) {
		element = { id: i, label: i.toString() };
		breakerOptions.push(element)
	}


	self.system.emit('instance_actions', self.id, {

		'breakerOn': {
			label: 'Breaker On',
			options: [
				{
					type: 'dropdown',
					label: 'Breaker',
					id: 'breaker',
					default: 1,
					choices: breakerOptions
				}
			]
		},

		'breakerOff': {
			label: 'Breaker Off',
			options: [
				{
					type: 'dropdown',
					label: 'Breaker',
					id: 'breaker',
					default: 1,
					choices: breakerOptions
				}
			]
		},

		'breakerToggle': {
			label: 'Breaker Toggle',
			options: [
				{
					type: 'dropdown',
					label: 'Breaker',
					id: 'breaker',
					default: 1,
					choices: breakerOptions
				}
			]
		},

		'zoneOn': {
			label: 'Zone On',
			options: [
				{
					type: 'dropdown',
					label: 'Zone',
					id: 'zone',
					default: 1,
					choices: zoneOptions
				}
			]
		},

		'zoneOff': {
			label: 'Zone Off',
			options: [
				{
					type: 'dropdown',
					label: 'Zone',
					id: 'zone',
					default: 1,
					choices: zoneOptions
				}
			]
		},

		'zoneToggle': {
			label: 'Zone Toggle',
			options: [
				{
					type: 'dropdown',
					label: 'Zone',
					id: 'zone',
					default: 1,
					choices: zoneOptions
				}
			]
		},
	});
};

instance.prototype.action = function (action) {
	var self = this;
	var id = action.action;
	var opt = action.options;
	var breaker, breakerState, zone, zoneState;

	switch (id) {
		case 'breakerOn':
			breaker = parseInt(opt.breaker);
			self.breakerChange(breaker, 1);
			break;

		case 'breakerOff':
			breaker = parseInt(opt.breaker);
			self.breakerChange(breaker, 0);
			break;

		case 'breakerToggle':
			breaker = parseInt(opt.breaker);
			eval("breakerState = self.currentState.dynamicVariables.breaker_"+breaker)

			if (breakerState == "On"){
				self.breakerChange(breaker, 0);
			}
			else if (breakerState == "Off") {
				self.breakerChange(breaker, 1);
			}
			break;

		case 'zoneOn':
			zone = parseInt(opt.zone);
			self.zoneChange(zone, 1);
			break;

		case 'zoneOff':
			zone = parseInt(opt.zone);
			self.zoneChange(zone, 0);
			break;

		case 'zoneToggle':
			zone = parseInt(opt.zone);
			eval("zoneState = self.currentState.dynamicVariables.zone_"+zone)
			if (zoneState == "On"){
				self.zoneChange(zone, 0);
			}
			else if (zoneState == "Off") {
				self.zoneChange(zone, 1);
			}
			break;
	}
};

instance.prototype.decimalToHex = function (d, padding) {
		var hex = Number(d).toString(16);
		padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

		while (hex.length < padding) {
				hex = "0" + hex;
		}

		return hex;
}

instance.prototype.init_feedbacks = function() {
	var self = this;

	var zoneOptions = []
	for (let i =1; i <= self.currentState.internal.zones; i++) {
		zoneOptions.push({ id: i, label: i })
	}

	var breakerOptions = []
	for (let i =1; i <= self.currentState.internal.breakers; i++) {
		breakerOptions.push({ id: i, label: i })
	}

	var feedbacks = {};
	feedbacks['breaker_state'] = {
		label: 'Change colors based on breaker state',
		description: 'Sets the background according to the state of the selected breaker',
		options: [
			{
				type: 'dropdown',
				label: 'Breaker',
				id: 'breaker',
				default: 1,
				choices: breakerOptions
			},
			{
				type: 'dropdown',
				label: 'State',
				id: 'state',
				default: 1,
				choices: [
					{ id: 2, label: "On" },
					{ id: 1, label: "Off" },
					{ id: 3, label: "Tripped" },
					{ id: 4, label: "Faulted" },
					{ id: 5, label: "Empty" },
					{ id: 6, label: "Manualy On"}
				]
			},//State
			{
				type: 'colorpicker',
				label: 'On - Foreground color',
				id: 'fg',
				default: self.rgb(0,0,0)
			},//FG
			{
				type: 'colorpicker',
				label: 'On - Background color',
				id: 'bg',
				default: self.rgb(0,255,0)
			}//BG
		]
	};

	feedbacks['zone_state'] = {
		label: 'Change colors based on zone state',
		description: 'Sets the background according to the state of the selected zone',
		options: [
			{
				type: 'dropdown',
				label: 'Zone',
				id: 'zone',
				default: 1,
				choices: zoneOptions
			},
			{
				type: 'dropdown',
				label: 'State',
				id: 'state',
				default: 1,
				choices: [
					{ id: 2, label: "On" },
					{ id: 1, label: "Off" },
					{ id: 3, label: "Sequencing" },
				]
			},//State
			{
				type: 'colorpicker',
				label: 'On - Foreground color',
				id: 'fg',
				default: self.rgb(0,0,0)
			},//On FG
			{
				type: 'colorpicker',
				label: 'On - Background color',
				id: 'bg',
				default: self.rgb(0,255,0)
			}//On BG
		]
	};

	self.setFeedbackDefinitions(feedbacks);
}

instance.prototype.feedback = function(feedback, bank) {
	var self = this;

	if (feedback.type == 'breaker_state') {
		var breakerState = "Empty"

		eval("breakerState = self.currentState.dynamicVariables.breaker_"+feedback.options.breaker)

		let stateNum = 0;
		switch (breakerState) {
			case "Off":
				stateNum = 1
				break;
			case "On":
				stateNum = 2
				break;
			case "Tripped":
				stateNum = 3
				break;
			case "Faulty":
				stateNum = 4
				break;
			case "Empty":
				stateNum = 5
				break;
			case "Manually On":
				stateNum = 6
				break;
			default :
				break;
		}

		if (stateNum == feedback.options.state) {
			return { color: feedback.options.fg, bgcolor: feedback.options.bg};
		}
	}

	if (feedback.type == 'zone_state') {
		let zoneState = "Off"

		eval("zoneState = self.currentState.dynamicVariables.zone_"+feedback.options.zone)

		let stateNum = 0;
		switch (zoneState) {
			case "Off":
				stateNum = 1
				break;
			case "On":
				stateNum = 2
				break;
			case "Sequencing":
				stateNum = 3
				break;
			default :
				break;
		}

		if (stateNum == feedback.options.state) {
			return { color: feedback.options.fg, bgcolor: feedback.options.bg};
		}
	}
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;
