var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');
var debug;
var log;

// https://lightware.com/pub/media/lightware/filedownloader/file/Lightware_s_Open_API_Environment_v1.pdf
// http://fioerx.com/FILE/LIGHTWARE/MX32x32DVI-Pro_UserManual.pdf

function instance(system, id, config) {
	var self = this;

	self.CHOICES_INPUTS = [];
	self.CHOICES_OUTPUTS = [];
	self.CHOICES_PRESETS = [];

	self.presets = {};

	// super-constructor
	instance_skel.apply(this, arguments);

	self.init_actions(); // export actions

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

	self.numPresets = 0;
	self.xpt = {};

	self.status(self.STATE_UNKNOWN);

	self.init_tcp();
	self.init_feedbacks();
};

instance.prototype.init_tcp = function() {
	var self = this;
	var receivebuffer = '';
	self.responseHandlers = {};

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	if (self.config.host) {
		self.socket = new tcp(self.config.host, 10001);

		self.socket.on('status_change', function (status, message) {
			self.status(status, message);
		});

		self.socket.on('connect', function () {
			self.socket.send("{i}\r\n{VC}\r\n");

			self.checkNumpresets();
		});

		self.socket.on('error', function (err) {
			debug("Network error", err);
			self.log('error',"Network error: " + err.message);
		});

		self.socket.on('data', function (chunk) {
			var i = 0, line = '', offset = 0;
			receivebuffer += chunk;

			while ( (i = receivebuffer.indexOf('\r\n', offset)) !== -1) {
				line = receivebuffer.substr(offset, i - offset);
				offset = i + 2;
				self.socket.emit('receiveline', line.toString());
			}
			receivebuffer = receivebuffer.substr(offset);
		});

		self.socket.on('receiveline', function (line) {
			var match;

			if (match = line.match(/\(ALL\s+(.+)\s?\)\s*$/)) {
				self.CHOICES_INPUTS.length = 0;
				self.CHOICES_OUTPUTS.length = 0;

				var outputs = match[1].split(/\s+/);
				if (outputs[outputs.length-1] == '') {
					outputs.length = outputs.length - 1;
				}

				// Assume equal number of inputs
				for (var i = 0; i < outputs.length; ++i) {
					self.CHOICES_INPUTS.push({ label: 'Input ' + (i + 1), id: i+1 });
					self.CHOICES_OUTPUTS.push({ label: 'Output ' + (i + 1), id: i+1 });

					self.setVariable('input_' + (i+1), 'Input '+(i+1));
					self.setVariable('output_' + (i+1), 'Output '+(i+1));

					self.xpt[i+1] = parseInt(outputs[i]);
				}

				// Update inputs/outputs
				self.init_actions();
				self.getIO();
				self.init_feedbacks()
				self.checkFeedbacks('xpt_color');
				self.init_presets();
			}
			else if (match = line.match(/(ERR04)/i)) {
				if (self.checkPresets !== undefined) {
					self.checkNumpresets();
				}
			}
			else if (match = line.match(/\(INAME#(\d+)=([^)]+)\)$/i)) {
				var id = parseInt(match[1]);
				var name = match[2];

				self.setVariable('input_' + id, name);
				self.CHOICES_INPUTS[id - 1] = { label: name, id: id };

				// This is (regrettably) needed to update the dropdown boxes of inputs/outputs
				self.init_actions();
				self.init_presets();
				self.init_feedbacks()
			}
			else if (match = line.match(/\(ONAME#(\d+)=([^)]+)\)$/i)) {
				var id = parseInt(match[1]);
				var name = match[2];

				self.setVariable('output_' + id, name);
				self.CHOICES_OUTPUTS[id - 1] = { label: name, id: id };

				// This is (regrettably) needed to update the dropdown boxes of inputs/outputs
				self.init_actions();
				self.init_presets();
				self.init_feedbacks()
			}
			else if (match = line.match(/\(PNAME#(\d+)=([^)]+)\)$/i)) {
				var id = parseInt(match[1]);
				var name = match[2];

				if (self.checkPresets !== undefined) {
					debug('Detected ' + id + ' presets on LW2 device');
					self.numPresets = id;
					self.checkPresets = undefined;
					self.getPresets();
					self.init_variables();
					self.init_presets();
				} else {
					self.presets[id] = name;
					self.setVariable('preset_' + id, self.presets[id]);
					self.CHOICES_PRESETS[id - 1] = { label: 'Preset ' + id + ': ' + name, id: id };
					self.init_actions();
				}
			}
			else if (match = line.match(/\(O(\d+) I(\d+)\)/i)) {
				self.xpt[parseInt(match[1])] = parseInt(match[2]);
				self.checkFeedbacks('xpt_color');
			}
			else if (match = line.match(/\(i:\s*(.+)\)$/i)) {
				log('info', 'Connected to ' + match[1]);
			}
		});
	}
};

instance.prototype.getIO = function() {
	var self = this;

	for (var i = 0; i < self.CHOICES_INPUTS.length; ++i) {
		self.socket.send("{iname#" + (i+1) + "=?}");
		self.socket.send("{oname#" + (i+1) + "=?}");
	}
};

instance.prototype.getPresets = function() {
	var self = this;

	for (var i = 0; i < self.numPresets; ++i) {
		self.socket.send("{pname#" + (i+1) + "=?}\r\n");
	}
};

instance.prototype.checkNumpresets = function() {
	var self = this;

	if (self.checkPresets === undefined) {
		self.CHOICES_PRESETS.length = 0;
		self.checkPresets = 64;
		self.socket.send("{pname#64=?}\r\n");
	} else if (self.checkPresets == 64) {
		self.checkPresets = 32;
		self.socket.send("{pname#32=?}\r\n");
	} else if (self.checkPresets == 32) {
		self.checkPresets = 16;
		self.socket.send("{pname#16=?}\r\n");
	} else if (self.checkPresets == 16) {
		self.checkPresets = 8;
		self.socket.send("{pname#8=?}\r\n");
	} else {
		debug('Found no presets on device');
		self.checkPresets = undefined;
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
			value: 'This module is for controlling Lightware equipment that supports legacy LW2 protocol.'
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Device IP',
			width: 12,
			regex: self.REGEX_IP
		}
	]
};

instance.prototype.init_variables = function() {
	var self = this;
	var variables = [];

	for (var i = 0; i < self.numPresets; ++i) {
		variables.push({ label: 'Label of preset ' + (i+1), name: 'preset_' + (i+1) });
	}

	self.setVariableDefinitions(variables);
};

instance.prototype.init_feedbacks = function() {
	var self = this;

	self.setFeedbackDefinitions({
		xpt_color: {
			label: 'Change background color',
			description: 'If the input specified is in use by the output specified, change colors of the bank',
			options: [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: self.rgb(255,255,255)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: self.rgb(255,0,0)
				},
				{
					type: 'dropdown',
					label: 'Input',
					id: 'input',
					default: '1',
					choices: self.CHOICES_INPUTS
				},
				{
					type: 'dropdown',
					label: 'Output',
					id: 'output',
					default: '1',
					choices: self.CHOICES_OUTPUTS
				}
			]
		}
	});
};

instance.prototype.init_presets = function () {
	var self = this;
	var presets = [];

	for (var o = 0; o < self.CHOICES_OUTPUTS.length; ++o) {
		for (var i = 0; i < self.CHOICES_INPUTS.length; ++i) {
			presets.push({
				category: 'Output ' + (o + 1),
				label: 'Feedback button for input ' + (i + 1) + ' on output ' + (o + 1),
				bank: {
					style: 'text',
					text: '$(instance:input_' + (i+1) + ')\\n$(instance:output_' + (o+1) + ')',
					size: 'auto',
					color: '16777215',
					bgcolor: 0
				},
				feedbacks: [
					{
						type: 'xpt_color',
						options: {
							bg: self.rgb(255, 0, 0),
							fg: self.rgb(255, 255, 255),
							input: (i+1),
							output: (o+1)
						}
					}
				],
				actions: [
					{
						action: 'xpt',
						options: {
							input: (i+1),
							output: (o+1)
						}
					}
				]
			});
		}
	}

	if (self.numPresets) {
		for (var i = 0; i < self.numPresets; ++i) {
			presets.push({
				category: 'Load presets',
				label: 'Load button for preset ' + (i+1),
				bank: {
					style: 'text',
					text: '$(instance:preset_' + (i+1) + ')',
					size: 'auto',
					color: '16777215',
					bgcolor: 0
				},
				actions: [
					{
						action: 'preset',
						options: {
							preset: (i+1)
						}
					}
				]
			});
			presets.push({
				category: 'Save presets',
				label: 'Save button for preset ' + (i+1),
				bank: {
					style: 'text',
					text: '$(instance:preset_' + (i+1) + ')',
					size: 'auto',
					color: '16777215',
					bgcolor: 0
				},
				actions: [
					{
						action: 'savepreset',
						options: {
							preset: (i+1)
						}
					}
				]
			});
		}
	}

	self.setPresetDefinitions(presets);
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
	}

	debug("destroy", self.id);
};


instance.prototype.init_actions = function(system) {
	var self = this;

	var actions = {
		'xpt': {
			label: 'Switch one input to one output',
			options: [
				{
					label: 'Input',
					type: 'dropdown',
					id: 'input',
					choices: self.CHOICES_INPUTS,
					default: 1
				},
				{
					label: 'Output',
					type: 'dropdown',
					id: 'output',
					choices: self.CHOICES_OUTPUTS,
					default: 1
				}
			]
		}
	};

	if (self.numPresets > 0) {
		actions['preset'] = {
			label: 'Load preset',
			options: [
				{
					label: 'Preset',
					type: 'dropdown',
					id: 'preset',
					choices: self.CHOICES_PRESETS,
					default: 1
				}
			]
		};
		actions['savepreset'] = {
			label: 'Save preset',
			options: [
				{
					label: 'Preset',
					type: 'dropdown',
					id: 'preset',
					choices: self.CHOICES_PRESETS,
					default: 1
				}
			]
		};
	}

	self.system.emit('instance_actions', self.id, actions);
}

instance.prototype.action = function(action) {
	var self = this;
	var cmd;
	var opt = action.options;

	switch (action.action) {

		case 'xpt':
			cmd = '{' + opt.input + '@' + opt.output + '}';
			break;

		case 'preset':
			cmd = '{%' + opt.preset + '}';
			break;

		case 'savepreset':
			cmd = '{$' + opt.preset + '}';
			break;

	}

	debug('action():', action);

	if (cmd !== undefined) {
		if (self.socket !== undefined) {
			debug('sending ', cmd, "to", self.socket.host);
			self.socket.send(cmd + "\r\n");
		}
	}
};

instance.prototype.feedback = function(feedback, bank) {
	var self = this;

	if (feedback.type = 'xpt_color') {
		var bg = feedback.options.bg;

		if (self.xpt[parseInt(feedback.options.output)] == parseInt(feedback.options.input)) {
			return {
				color: feedback.options.fg,
				bgcolor: feedback.options.bg
			};
		}
	}
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
