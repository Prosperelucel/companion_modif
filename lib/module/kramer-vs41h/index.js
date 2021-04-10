var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	let self = this;

	// Decimal codes for the instructions supported by Kramer Switcher (Protocol 2000).
	// See https://kramerav.com/support/download.asp?f=35567
	// See https://kramerav.com/downloads/protocols/protocol_2000_rev0_51.pdf
	self.SWITCH_VIDEO = 1;
	self.FRONT_PANEL  = 30;

	// The most significant bit for bytes 2-4 must be 1. Adding 128 to each of those
	//  bytes accomplishes this.
	self.MSB = 128;

	// A promise that's resolved when the socket connects to the switcher.
	self.PromiseConnected = null;

	// super-constructor
	instance_skel.apply(this, arguments);
	
	self.actions();

	return self;

}


/**
 * The user updated the config.
 * 
 * @param config         The new config object
 */
instance.prototype.updateConfig = function(config) {
	let self = this;

	// Reconnect to the switcher if the IP changed
	if (self.config.host !== config.host || self.isConnected() === false) {
		// Have to set the new host IP before making the connection.
		self.config.host = config.host;
		self.init_tcp();
	}

	// Update the rest of the config
	self.config = config;

}


/**
 * Initializes the module and try to detect capabilities.
 */
instance.prototype.init = function() {
	let self = this;
	
	debug = self.debug;
	log   = self.log;

	self.init_tcp();

}


/**
 * Connect to the switcher over TCP port 5000.
 */
instance.prototype.init_tcp = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	if (!self.config.host) {
		return;
	}

	self.status(self.STATUS_WARNING, 'Connecting');

	self.PromiseConnected = new Promise((resolve, reject) => {

		self.socket = new tcp(self.config.host, 5000, { reconnect_interval:5000 });
		self.socket.on('error', (err) => {

			if (self.currentStatus !== self.STATUS_ERROR) {
				// Only log the error if the module isn't already in this state.
				// This is to prevent spamming the log during reconnect failures.
				debug('Network error', err);
				self.status(self.STATUS_ERROR, err);
				self.log('error', `Network error: ${err.message}`);
			}

			reject(err);

		});

		self.socket.on('connect', () => {
			self.status(self.STATUS_OK);
			debug('Connected');
			resolve();
		});

	}).catch((err) => {
		// The error is already logged, but Node requires all rejected promises to be caught.
	});

	self.socket.on('status_change', (status, message) => {
		self.status(status, message);
	});

}


/**
 * Sends the command to the Kramer switcher.
 * 
 * @param cmd      The command to send (ArrayBuffer)
 * @returns        Success state of writing to the socket
 */
instance.prototype.send = function(cmd) {
	let self = this;

	if (self.isConnected()) {
		debug('sending', cmd, 'to', self.config.host);
		return self.socket.send(cmd);
	} else {
		debug('Socket not connected');
	}

	return false;

}


/**
 * Returns if the socket is connected.
 * 
 * @returns      If the socket is connected
 */
instance.prototype.isConnected = function() {
	let self = this;
	return self.socket !== undefined && self.socket.connected;
}


/**
 * Return config fields for web config.
 * 
 * @returns      The config fields for the module
 */
instance.prototype.config_fields = function() {
	let self = this;
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 6,
			regex: self.REGEX_IP
		}
	]
}


/**
 * Cleanup when the module gets deleted.
 */
instance.prototype.destroy = function() {
	let self = this;
	debug('destroy', self.id);

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

}


/**
 * Creates the actions for this module.
 */
instance.prototype.actions = function(system) {
	let self = this;

	self.setActions({
		'switch_video': {
			label: 'Switch Video',
			options: [
				{
					type: 'dropdown',
					label: 'Input #',
					id: 'input',
					default: '0',
					choices: [
						{ id: '0', label: 'Mute (Off)' },
						{ id: '1', label: 'Input 1' },
						{ id: '2', label: 'Input 2' },
						{ id: '3', label: 'Input 3' },
						{ id: '4', label: 'Input 4' }
					]
				}
			]
		},
		'front_panel': {
			label: 'Front Panel',
			options: [
				{
					type: 'dropdown',
					label: 'Status',
					id: 'status',
					default: '0',
					choices: [
						{ id: '0', label: 'Panel Unlocked' },
						{ id: '1', label: 'Panel Locked' }
					]
				}
			]
		}
	});

}


/**
 * Executes the action and sends the TCP packet to the Kramer switcher.
 * 
 * @param action      The action to perform
 */
instance.prototype.action = function(action) {
	let self = this;
	let opt = action.options;
	let cmd = undefined;

	switch (action.action) {

		case 'switch_video':
			cmd = self.makeCommand(self.SWITCH_VIDEO, opt.input);
			break;

		case 'front_panel':
			cmd = self.makeCommand(self.FRONT_PANEL, opt.status);
			break;

	}

	if (cmd !== undefined) {
		self.send(cmd);
	}

}


/**
 * Formats the command as per the Kramer 2000 protocol.
 * 
 * @param instruction    String or base 10 instruction code for the command
 * @param paramA         String or base 10 parameter A for the instruction
 * @returns              The built command to send
 */
instance.prototype.makeCommand = function(instruction, paramA) {
	let self = this;

	return Buffer.from([
		parseInt(instruction, 10),
		self.MSB + parseInt(paramA || 0, 10),
		self.MSB + 0,	// Unused for switchers
		self.MSB + 1,	// Unused for switchers
		0x0a  // End with a \r to separate multiple commands
	]);

}


instance_skel.extendedBy(instance);
exports = module.exports = instance;
