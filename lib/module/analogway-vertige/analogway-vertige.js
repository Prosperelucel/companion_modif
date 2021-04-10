/*
Vertige Module Notes:
-- you must first enable the TPP server on the console:
-- press the gear icon at top right, select TPP server, choose LAN adapter, default port is 10600

*/
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
		self.socket = new tcp(self.config.host, self.config.port);

		self.socket.on('status_change', function (status, message) {
			self.status(status, message);
		});

		self.socket.on('error', function (err) {
			debug("Network error", err);
			self.log('error',"Network error: " + err.message);
		});

		self.socket.on('connect', function () {
			debug("Connected");
			self.sendcmd("?");
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
			debug("Received line from Vertige:", line);

		//	if (line.match(/TPcon\d,\d+/)) {
	// process incoming network data / feedback here

		//	}
			if (line.match(/DEV\d+/)) {
				this.model = parseInt(line.match(/DEV(\d+)/)[1]);
				switch (this.model) {
					case 513: this.modelname = 'Vertige VRC300'; break;
					case 514: this.modelname = 'Rackmount Control Unit'; break;
					default: this.modelname = 'unknown'; break;
				}
				self.log('info', self.config.label +" Type is "+ this.modelname);
				self.sendcmd("VEcmd");
			}

			if (line.match(/VEcmd\d+/)) {
				var commandSetVersion = parseInt(line.match(/VEcmd\d+,(\d+)/)[1]);
				self.log('info', "Command set version of " + self.config.label +" is " + commandSetVersion);
				// TODO: Should check the machine state now, will be implemented after feedback system is done
			}

			if (line.match(/SYdie0/)) {
				//There is no parameter readback runnning, it can be started now
			}


			if (line.match(/E\d{2}/)) {
				switch (parseInt(line.match(/E(\d{2})/)[1])) {
					case 10: self.log('error',"Received command name error from "+ self.config.label +": "+ line); break;
					case 11: self.log('error',"Received index value out of range error from "+ self.config.label +": "+ line); break;
					case 12: self.log('error',"Received index count (too few or too much) error from "+ self.config.label +": "+ line); break;
					case 13: self.log('error',"Received value out of range error from "+ self.config.label +": "+ line); break;
					default: self.log('error',"Received unspecified error from Livecore "+ self.config.label +": "+ line);
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
			label: 'IP-Adress of Vertige Controller',
			width: 6,
			default: '192.168.2.140',
			regex: self.REGEX_IP,
			tooltip: 'Enter the IP-adress of the Livecore unit you want to control. The IP of the unit can be found on the frontpanel LCD.\nIf you want to control stacked configurations, please enter the IP of the master unit.'
		},{
			type: 'dropdown',
			label: 'Port number',
			id: 'port',
			default: '10600',
			choices: [
				{ id: '10600', label: '10600 (default)' },
				{ id: '10500', label: '10500' }
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

	debug("destroy", self.id);
};

instance.prototype.actions = function(system) {
	var self = this;
	self.system.emit('instance_actions', self.id, {
				/*
					 Note: For self generating commands use option ids 0,1,...,5 and 'value'.
					The command will be of the form [valueof0],[valueof1],...[valueof5],[valueofvalue][CommandID]
					for set-commands you need a value, for get-commands you mustn't have a value
					for simple commands the value can be hardcoded in the CommandID, like "1SPtsl".
				*/
		'loadpreset': {
			label: 'load preset',
			options: [{
				type: 'number',
				label: 'preset number',
				id: 'ld_pst_pst_number',
				default: 1,
				min: 0,
				max: 200,
			},{
				type: 'dropdown',
				label: 'destination',
				id: 'ld_pst_dest',
				default: '1',
				choices: [
					{id: '0', label: 'Program' },
					{id: '1', label: 'Preview' }
				]
			}]
		},
		'take': {
			label: 'take preview to program',
		},
		'loadtemplate': {
			label:'Load preset template (with no source data)',
			options: [{
				type: 'number',
				label: 'preset number',
				id: 'ld_pst_template_no',
				default: 1,
				min: 1,
				max: 200,
			},
			{
				type: 'dropdown',
				label: 'destination',
				id: 'ld_tmp_dest',
				default: '1',
				choices: [
					{id: '0', label: 'Program' },
					{id: '1', label: 'Preview' }
				]
			}]
		},
		'loadsource': { //load source into specific layer todo: confirm that layer x exists
			label: 'load source to layer',
			options: [{
				type: 'number',
				label: 'Screen',
				id: 'ld_source_scrn', //range = 0 - 23
				default: 1,
				min: 1,
				max: 24,
			},
			{
				type: 'number',
				label: 'Layer',
				id: 'ld_source_layer', //range = 0-71
				default: 1,
				min: 1,
				max: 72,
			},
			{
				type: 'number',
				label: 'Source',
				id: 'ld_source_source', //range = 0 - 240 -- 0 == no source
				default: 1,
				min: 0,
				max: 240,
			},
			{
				type: 'dropdown',
				label: 'destination',
				id: 'ld_source_dest',
				default: '1',
				choices: [
					{id: '0', label: 'Program' },
					{id: '1', label: 'Preview' }
				]
			}]

		}

	})
}


instance.prototype.action = function(action) {
	var self = this;
	var cmd = '';

	switch(action.action) {

	case 'loadpreset': // <destination>,<pset_number>, 1PRloa
		cmd = '' + action.options.ld_pst_dest + ',' + (parseInt(action.options.ld_pst_pst_number) -1 ) + ',1PRloa';
		//console.log ('loading preset -- command = ' + cmd );
		break;

	case 'take': //1TRtke
		cmd = '1TRtke';
		//console.log ('GO!!!');
		break;

	case 'loadtemplate': //<destination>,<pset_numner>, 1PRlot -- loads preset layout without source information
		cmd = '' + action.options.ld_tmp_dest + "," + (parseInt(action.options.ld_pst_template_no) -1 ) + ',1PRlot';
		//console.log ('loading template -- command = ' + cmd );
		break;

	case 'loadsource': // <destination>,<screen/scene>,<layer>,<source>PRlfs
		cmd = '' + action.options.ld_source_dest + "," + (parseInt(action.options.ld_source_scrn) -1 ) + "," + (parseInt(action.options.ld_source_layer) -1 ) + "," + action.options.ld_source_source + "PRlfs";
		//console.log ('loading source -- command = ' + cmd );
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
