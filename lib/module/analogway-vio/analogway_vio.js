var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	this.firmwareVersion = "0";
	this.numOutputs = 0;
	this.numInputs = 0;
	this.modelnum;
	this.modelname = '';

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}


instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.init_tcp();
};

instance.prototype.init_tcp = function() {
	var self = this;
	var receivebuffer = '';

	if (self.socket !== undefined) {
		self.socket.destroy();
	}

	if (self.config.host) {
		self.socket = new tcp(self.config.host, 10600);

		self.socket.on('status_change', function (status, message) {
			self.status(status, message);
		});

		self.socket.on('error', function (err) {
			debug("Network error", err);
			self.log('error',"Network error: " + err.message);
		});

		self.socket.on('connect', function () {
			debug("Connected");
			self.sendcmd("");
		});

		// separate buffered stream into lines with responses
		self.socket.on('data', function (chunk) {
			var i = 0, line = '', offset = 0;
			receivebuffer += chunk;
			while ( (i = receivebuffer.indexOf('\r\n', offset)) !== -1) {
				line = receivebuffer.substr(offset, i - offset);
				offset = i + 1;
				self.socket.emit('receiveline', line.toString());
			}
			receivebuffer = receivebuffer.substr(offset);
		});

		self.socket.on('receiveline', function (line) {
			debug("Received line from Livecore:", line);

			if (line.match(/TPcon\d/)) {
					var connectedDevices = parseInt(line.match(/TPcon(\d)/)[1]);
					if (connectedDevices < 4) {
						self.log('info',self.config.label +" has " + (connectedDevices-1) + " other connected controller(s).");
						self.sendcmd("?");
					}	else if (connectedDevices == 4) {
						self.log(warn,self.config.label +" has 4 other connected controllers. Maximum reached.");
						self.sendcmd("?");
					} else {
						self.log('error',self.config.label +" connections limit has been reached! Max 5 controllers possible, but it is " + connectedDevices + "! Closing connection now.");
						self.socket.destroy(); // TODO: there should be a possibility for the user to reconnect
					}

			}
			if (line.match(/DEV\d+/)) {
				this.model = parseInt(line.match(/DEV(\d+)/)[1]);
				if (this.model == 1024) {
					self.sendcmd("0,TPver");
				} else {
					switch (this.model) {
						case 97: 		this.modelname = 'NeXtage 16'; break;
						case 98: 		this.modelname = 'SmartMatriX Ultra'; break;
						case 99: 		this.modelname = 'Ascender 32'; break;
						case 100:		this.modelname = 'Ascender 48'; break;
						case 102:		this.modelname = 'Output Expander 16'; break;
						case 103:		this.modelname = 'Output Expander 32'; break;
						case 104:		this.modelname = 'Output Expander 48'; break;
						case 105:		this.modelname = 'NeXtage 16 - 4K'; break;
						case 106:		this.modelname = 'SmartMatriX Ultra - 4K'; break;
						case 107:		this.modelname = 'Ascender 32 - 4K'; break;
						case 108:		this.modelname = 'Ascender 48 - 4K'; break;
						case 112:		this.modelname = 'Ascender 16'; break;
						case 113:		this.modelname = 'Ascender 16 - 4K'; break;
						case 114:		this.modelname = 'Ascender 48 - 4K - PL'; break;
						case 115:		this.modelname = 'Output Expander 48 - 4K  - PL'; break;
						case 116:		this.modelname = 'NeXtage 08'; break;
						case 117:		this.modelname = 'NeXtage 08 - 4K'; break;
						case 118:		this.modelname = 'Ascender 32 - 4K -PL'; break;
						case 119:		this.modelname = 'Output Expander 32 - 4K - PL'; break;
						case 1024:	this.modelname = 'VIO 4K'; break;
						default:		this.modelname = 'unknown'; break;
					}
					self.log('error', self.config.label +" Instance is not connected to a VIO, it is connected to "+ this.modelname+ ". Closing connection now.");
					self.socket.destroy();
				}
			}

			if (line.match(/TPver\d+/)) {
				var commandSetVersion = parseInt(line.match(/TPver\d+,(\d+)/)[1]);
				self.log('info', "Command set version of " + self.config.label +" is " + commandSetVersion);
				// TODO: Should check the machine state now, will be implemented after feedback system is done
			}

			if (line.match(/TPdie0/)) {
				//There is no parameter readback runnning, it can be started now
			}


			if (line.match(/E\d{2}/)) {
				switch (parseInt(line.match(/E(\d{2})/)[1])) {
					case 10: self.log('error',"Received command name error from "+ self.config.label +": "+ line); break;
					case 11: self.log('error',"Received index value out of range error from "+ self.config.label +": "+ line); break;
					case 12: self.log('error',"Received index count (too few or too much) error from "+ self.config.label +": "+ line); break;
					case 13: self.log('error',"Received value out of range error from "+ self.config.label +": "+ line); break;
					default: self.log('error',"Received unspecified error from VIO "+ self.config.label +": "+ line);
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
			label: 'IP-Adress of VIO 4K',
			width: 6,
			default: '192.168.2.140',
			regex: self.REGEX_IP,
			tooltip: 'Enter the IP-adress of the VIO you want to control. The IP of the unit can be found on the frontpanel LCD.'
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
		/*
			 Note: For self generating commands use option ids 0,1,...,5 and 'value'.
			The command will be of the form [valueof0],[valueof1],...[valueof5],[valueofvalue][CommandID]
			for set-commands you need a value, for get-commands you mustn't have a value
			for simple commands the value can be hardcoded in the CommandID, like "1PCrpr".
		*/
		'1PCrpr': {
			label: 'Take'
		},
		'PCpum': {
			label: 'Use Autotake',
			options: [
				{
					type: 'dropdown',
					label: 'Autotake',
					id: 'value',
					default: '1',
					choices: [{id: '0', label: 'Off'},{id: '1', label: 'On'}]
				}
			]
		},
		'recallpreset': {
			label: 'Recall Preset',
			options: [{
				type: 'textinput',
				label: 'Preset to load',
				id: 'preset',
				default: '1',
				tooltip: 'Enter the number of the memory you want to load from 1 to 16',
				regex: '/^0*([1-9]|1[0-6])$/'
			}]
		},
		'PFfal': {
			label: 'Freeze',
			options: [{
					type: 'dropdown',
					label: 'Freeze',
					id: 'value',
					default: '0',
					choices: [{id: '0', label: 'Off'},{id: '1', label: 'On'}]
			}]
		},
		'recallview': {
			label: 'Recall View',
			options: [{
				type: 'textinput',
				label: 'View to load',
				id: 'view',
				default: '1',
				tooltip: 'Enter the number of the memory you want to load from 1 to 64',
				regex: '/^0*([1-9]|[1-5][0-9]|[6][0-4])$/'
			}]
		},
		'recallviewandinput': {
			label: 'Recall View and Input',
			options: [
				{
					type: 'textinput',
					label: 'View to load',
					id: 'preset',
					default: '1',
					tooltip: 'Enter the number of the memory you want to load from 1 to 64',
					regex: '/^0*([1-9]|[1-5][0-9]|[6][0-4])$/'
				},{
					type: 'dropdown',
					label: 'Input',
					id: 'input',
					choices: [
						{id: '0', label: 'DisplayPort'},
						{id: '1', label: 'HDMI Backpanel'},
						{id: '2', label: 'HD15-Analog'},
						{id: '3', label: 'Optical'},
						{id: '4', label: 'SDI'},
						{id: '5', label: 'DVI-D'},
						{id: '6', label: 'HDMI Frontpanel'},
						{id: '7', label: 'Option Card 1'},
						{id: '8', label: 'Option Card 2'}
					]
				}
			]
		},
		'PRinp': {
			label: 'Select Input',
			options: [{
				type: 'dropdown',
				label: 'Input',
				id: 'value',
				choices: [
					{id: '0', label: 'None'},
					{id: '1', label: 'DisplayPort'},
					{id: '2', label: 'HDMI Backpanel'},
					{id: '3', label: 'HD15-Analog'},
					{id: '4', label: 'Optical'},
					{id: '5', label: 'SDI'},
					{id: '6', label: 'DVI-D'},
					{id: '7', label: 'HDMI Frontpanel'},
					{id: '8', label: 'Option Card 1'},
					{id: '9', label: 'Option Card 2'}
				]
			}]
		},
		'QFfor': {
			label: 'Display Quick Frame',
			options: [{
					type: 'dropdown',
					label: 'Display Quick Frame',
					id: 'value',
					default: '0',
					choices: [{id: '0', label: 'Hide'},{id: '1', label: 'Show'}]
			}]
		},
		'QFsel': {
			label: 'Select Quick Frame Slot',
			options: [{
				type: 'textinput',
				label: 'Slot',
				id: 'value',
				default: '1',
				tooltip: 'Enter the number of the slot you want to be used for Quick Frame from 1 to 50',
				regex: '/^0*([1-9]|[1-4][0-9]|50)$/'
			}]
		},
		'OUpat': {
			label: 'Switch Testpattern',
			options: [
				{
					type: 'dropdown',
					label: 'Output',
					id: '0',
					choices: [
						{id: '0', label: 'Main output of master device'},
						{id: '1', label: 'Option 1 output of master device'},
						{id: '2', label: 'Option 2 output of master device'},
						{id: '3', label: 'Main output of slave device'},
						{id: '4', label: 'Option 1 output of slave device'},
						{id: '5', label: 'Option 2 output of slave device'}
					]
				},{
					type: 'dropdown',
					label: 'Testpattern',
					id: 'value',
					choices: [
						{id: '0',		label: 'No Pattern'},
						{id: '1',		label: 'Color Pattern'},
						{id: '2',		label: 'Vertical Grey Scale'},
						{id: '3',		label: 'Horizontal Grey Scale'},
						{id: '4',		label: 'Vertical Color Bar'},
						{id: '5',		label: 'Horizontal Color Bar'},
						{id: '6',		label: 'Grid 16x16'},
						{id: '7',		label: 'Grid 32x32'},
						{id: '8',		label: 'Grid custom size'},
						{id: '9',		label: 'SMPTE'},
						{id: '10',	label: 'Horizontal Burst'},
						{id: '11',	label: 'Vertical Burst'},
						{id: '12',	label: 'Vertical Gradient'},
						{id: '13',	label: 'Horizontal Gradient'},
						{id: '14',	label: 'Crosshatch'},
						{id: '15',	label: 'Checkerboard'}
					]
				}
			]
		}
	});
}

instance.prototype.action = function(action) {
	var self = this;
	var cmd = '';

	switch(action.action) {

	case 'recallpreset':
		// set preset to load
		cmd = '' + (parseInt(action.options.preset)-1) + ',1PKrcr';
		break;

	case 'recallview':
		// screen is hardcoded to 0
		cmd = '' + (parseInt(action.options.view)-1) + ',0,1PBirr';
		break;

	case 'recallviewandinput':
		// screen is hardcoded to 0
		cmd = '' + (parseInt(action.options.view)-1) + ',0' + parseInt(action.options.input) + ',1PBrcr';
		break;

	default:
		cmd = '';
		if (action.options) {
			for (var i = 0; i<= 5; i++) {
				if (action.options.hasOwnProperty(i) && action.options[i] != '') {
					cmd += action.options[i] + ',';
				}
			}
			if (action.options.hasOwnProperty('value') && action.options['value'] != '') {
				cmd += action.options['value'];
			}
		}
		cmd += action.action;
		break;
	}
	self.sendcmd(cmd);
};


instance.prototype.sendcmd = function(cmd) {
	var self = this;
	cmd +="\n";

	if (cmd !== undefined) {

		if (self.socket === undefined) {
			self.init_tcp();
		}

		// TODO: remove this when issue #71 is fixed
		if (self.socket !== undefined && self.socket.host != self.config.host) {
			self.init_tcp();
		}

		debug('sending tcp',cmd,"to",self.config.host);

		if (self.socket !== undefined && self.socket.connected) {
			self.socket.send(cmd);
		} else {
			debug('Socket not connected :(');
		}

	}
};


instance_skel.extendedBy(instance);
exports = module.exports = instance;
