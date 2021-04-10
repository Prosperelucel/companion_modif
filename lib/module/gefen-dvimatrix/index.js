// Gefen DVI Matrix

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
}

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.init_tcp();
}

instance.prototype.init_tcp = function() {
	var self = this;
	var receivebuffer = '';

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	if (self.config.port === undefined) {
		self.config.port = 23;
	}

	if (self.config.host) {
		self.socket = new tcp(self.config.host, self.config.port);

		self.socket.on('status_change', function (status, message) {
			self.status(status, message);
		});

		self.socket.on('error', function (err) {
			debug('Network error', err);
			self.log('error','Network error: ' + err.message);
		});

		self.socket.on('connect', function () {
			debug('Connected');
			self.socket.send('\r\n');
		});

		// if we get any data, display it to stdout
		self.socket.on('data', function(buffer) {
			var indata = buffer.toString('utf8');
			//future feedback can be added here
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
			value: 'This module will connect to a Gefen DVI Matrix.'
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'IP Address',
			width: 6,
			default: '192.168.0.1',
			regex: self.REGEX_IP
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'Port',
			width: 6,
			default: '23',
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

	debug('destroy', self.id);
}

instance.prototype.actions = function() {
	var self = this;

	self.system.emit('instance_actions', self.id, {

		'route': {
			label: 'Route input to output',
			options: [
				{
					type: 'dropdown',
					label: 'Input',
					id: 'input',
					default: '1',
					choices: [
						{ id: '1', label: 'Input 1'},
						{ id: '2', label: 'Input 2'},
						{ id: '3', label: 'Input 3'},
						{ id: '4', label: 'Input 4'},
						{ id: '5', label: 'Input 5'},
						{ id: '6', label: 'Input 6'},
						{ id: '7', label: 'Input 7'},
						{ id: '8', label: 'Input 8'},
						{ id: '9', label: 'Input 9'},
						{ id: '10', label: 'Input 10'},
						{ id: '11', label: 'Input 11'},
						{ id: '12', label: 'Input 12'},
						{ id: '13', label: 'Input 13'},
						{ id: '14', label: 'Input 14'},
						{ id: '15', label: 'Input 15'},
						{ id: '16', label: 'Input 16'}
					]
				},
				{
					type: 'dropdown',
					label: 'Output',
					id: 'output',
					default: '1',
					choices: [
						{ id: '1', label: 'Output 1'},
						{ id: '2', label: 'Output 2'},
						{ id: '3', label: 'Output 3'},
						{ id: '4', label: 'Output 4'},
						{ id: '5', label: 'Output 5'},
						{ id: '6', label: 'Output 6'},
						{ id: '7', label: 'Output 7'},
						{ id: '8', label: 'Output 8'},
						{ id: '9', label: 'Output 9'},
						{ id: '10', label: 'Output 10'},
						{ id: '11', label: 'Output 11'},
						{ id: '12', label: 'Output 12'},
						{ id: '13', label: 'Output 13'},
						{ id: '14', label: 'Output 14'},
						{ id: '15', label: 'Output 15'},
						{ id: '16', label: 'Output 16'}
					]
				}
			]
		},
		'route_all': {
			label: 'Route input to all outputs',
			options: [
				{
					type: 'dropdown',
					label: 'Input',
					id: 'input',
					default: '1',
					choices: [
						{ id: '1', label: 'Input 1'},
						{ id: '2', label: 'Input 2'},
						{ id: '3', label: 'Input 3'},
						{ id: '4', label: 'Input 4'},
						{ id: '5', label: 'Input 5'},
						{ id: '6', label: 'Input 6'},
						{ id: '7', label: 'Input 7'},
						{ id: '8', label: 'Input 8'},
						{ id: '9', label: 'Input 9'},
						{ id: '10', label: 'Input 10'},
						{ id: '11', label: 'Input 11'},
						{ id: '12', label: 'Input 12'},
						{ id: '13', label: 'Input 13'},
						{ id: '14', label: 'Input 14'},
						{ id: '15', label: 'Input 15'},
						{ id: '16', label: 'Input 16'}
					]
				}
			]
		},
		'set_input_name': {
			label: 'Set Input Name',
			options: [
				{
					type: 'dropdown',
					label: 'Input',
					id: 'input',
					default: '1',
					choices: [
						{ id: '1', label: 'Input 1'},
						{ id: '2', label: 'Input 2'},
						{ id: '3', label: 'Input 3'},
						{ id: '4', label: 'Input 4'},
						{ id: '5', label: 'Input 5'},
						{ id: '6', label: 'Input 6'},
						{ id: '7', label: 'Input 7'},
						{ id: '8', label: 'Input 8'},
						{ id: '9', label: 'Input 9'},
						{ id: '10', label: 'Input 10'},
						{ id: '11', label: 'Input 11'},
						{ id: '12', label: 'Input 12'},
						{ id: '13', label: 'Input 13'},
						{ id: '14', label: 'Input 14'},
						{ id: '15', label: 'Input 15'},
						{ id: '16', label: 'Input 16'}
					]
				},
				{
					type: 'textinput',
					label: 'Name',
					id: 'name',
					default: ''
				}
			]
		},
		'set_output_name': {
			label: 'Set Output Name',
			options: [
				{
					type: 'dropdown',
					label: 'Output',
					id: 'output',
					default: '1',
					choices: [
						{ id: '1', label: 'Output 1'},
						{ id: '2', label: 'Output 2'},
						{ id: '3', label: 'Output 3'},
						{ id: '4', label: 'Output 4'},
						{ id: '5', label: 'Output 5'},
						{ id: '6', label: 'Output 6'},
						{ id: '7', label: 'Output 7'},
						{ id: '8', label: 'Output 8'},
						{ id: '9', label: 'Output 9'},
						{ id: '10', label: 'Output 10'},
						{ id: '11', label: 'Output 11'},
						{ id: '12', label: 'Output 12'},
						{ id: '13', label: 'Output 13'},
						{ id: '14', label: 'Output 14'},
						{ id: '15', label: 'Output 15'},
						{ id: '16', label: 'Output 16'}
					]
				},
				{
					type: 'textinput',
					label: 'Name',
					id: 'name',
					default: ''
				}
			]
		}
		
	});
}

instance.prototype.action = function(action) {

	var self = this;
	var cmd;
	var options = action.options;
	
	switch(action.action) {
		case 'route':
			cmd = 'r ' + options.input + ' ' + options.output;
			break;
		case 'route_all':
			cmd = 's ' + options.input;
			break;
		case 'set_input_name':
			cmd = '#set_input_name ' + options.input + ' ' + options.name;
			break;
		case 'set_output_name':
			cmd = '#set_output_name ' + options.output + ' ' + options.name;
			break;
	}

	if (cmd !== undefined) {
		if (self.socket !== undefined && self.socket.connected) {
			self.socket.send(cmd + '\r\n');
		} else {
			debug('Socket not connected :(');
		}

	}
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
