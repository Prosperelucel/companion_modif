var instance_skel = require('../../instance_skel');
var udp           = require('../../udp');
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
	self.init_udp();
};

instance.prototype.init_udp = function() {
	var self = this;

	if (self.config.host !== undefined) {
		self.udp = new udp(self.config.host, 11116);

		self.udp.on('status_change', function (status, message) {
			self.status(status, message);
		});
	}
};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.status(self.STATUS_UNKNOWN);

	self.init_udp();
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
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.udp !== undefined) {
		self.udp.destroy();
	}
	debug("destroy", self.id);
};

instance.prototype.actions = function(system) {
	var self = this;

	self.system.emit('instance_actions', self.id, {
		'asc': {
			label: 'Take (Advance Script Cue)',
			options: [
				{
					type: 'dropdown',
					label: 'Cues to advance / step Back',
					id: 'cueNum',
					default: '0',
					choices: [
						{ id: '-10', label: 'Step back 10 Cues'},
						{ id: '-1',  label: 'Step back 1 Cue' },
						{ id: '0',   label: 'None / Take'},
						{ id: '+1',  label: 'Advance 1 Cue' },
						{ id: '+10', label: 'Advance 10 Cues' }
					]
				}
			]
		},

		'bpr': {
			label: 'Basic Preset Recall (Index Nr)',
			options: [
				{
					 type: 'textinput',
					 label: 'Preset Index',
					 id: 'idx',
					 default: 1,
					 regex: self.REGEX_NUMBER
				},
				{
					type: 'textinput',
					label: 'Duration (Optional)',
					id: 'dur',
					default: 1,
					regex: self.REGEX_NUMBER
				}

			]
		},

		'rsc': {
			label: 'Recall Script Cue (Script, Cue)',
			options: [
				{
					 type: 'textinput',
					 label: 'Script ID/Register ID',
					 id: 'sidx',
					 default: 1,
					 regex: self.REGEX_NUMBER
				},
				{
					type: 'textinput',
					label: 'Script Cue',
					id: 'cidx',
					default: 1,
					regex: self.REGEX_NUMBER
				},
				{
					type: 'dropdown',
					label: 'ID Type being recalled',
					id: 'type',
					default: 'S',
					choices: [ { id: 'S', label: 'ScriptID (default)' }, { id: 'R', label: 'RegisterID' } ]
				},
			]
		},

		'trn': {
			label: 'Transition layer(s)',
			options: [
				{
					type: 'dropdown',
					 label: 'Transition Mix on/off',
					id: 'mix',
					default: '1',
					choices: [ { id: 1, label: 'Mix On' }, { id: 0, label: 'Mix Off' } ]
				},
				{
					type: 'textinput',
					label: 'duration',
					id: 'dur',
					default: 60,
					regex: self.REGEX_NUMBER
				},
				{
					type: 'textinput',
					label: 'Layer(s) input multiple layers space delimited',
					id: 'lay',
					default: ''
				}
			]
		},

		'frz':	{
			label: 'Freeze Layer(s)',
			options:[
				{
					type: 'dropdown',
					 label: 'Freeze Layer on/off',
					id: 'frzonoff',
					default: '1',
					choices: [ { id: 1, label: 'Freeze On' }, { id: 0, label: 'Freeze Off' } ]
				},
				{
					type: 'textinput',
					label: 'Layer(s) input multiple layers space delimited',
					id: 'lay',
					default: 1
				}
			]
		},

		'btr':	{
			label: 'Background Transition',
			 options:[
				{
					type: 'textinput',
					label: 'duration',
					id: 'dur',
					default: 60,
					regex: self.REGEX_NUMBER
				}
			]
		},

		'fkr':	{
			label: 'Function Key Recall',
			options:[
				{
					type: 'textinput',
					label: 'Funktion key ID',
					id: 'fkrid',
					default: 1,
					regex: self.REGEX_NUMBER
				},
				{
					type: 'textinput',
					label: 'Layer(s) input multiple layers space delimited',
					id: 'lay',
					default: 1
				}
			]
		},

		'ofz':	{
			label: 'Output Freeze',
			options:[
				{
					type: 'dropdown',
					 label: 'Freeze Output on/off',
					id: 'frzonoff',
					default: '1',
					choices: [ { id: 1, label: 'Freeze On' }, { id: 0, label: 'Freeze Off' } ]
				},
				{
					type: 'textinput',
					label: 'Output(s)input multiple outputs space delimited',
					id: 'output',
					default: 1
				}
			]
		 },

		'dmt':	{
			 label: 'Device Mixer Transition',
			 options:[
				 {
					type: 'textinput',
					 label: 'duration',
					 id: 'dur',
					 default: 60,
					 regex: self.REGEX_NUMBER
				 },
				 {
					type: 'textinput',
					 label: 'Device(s)',
					 id: 'dev',
					 default: 1
				 }
			 ]
			},

	});
}


instance.prototype.action = function(action) {
	var self = this;
	var id = action.action;
	var cmd;
	var opt = action.options;
	// spyder port 11116

	switch (action.action) {

		case 'asc':
			if (opt.cueNum == 0) {
				cmd = 'ASC';
				break;
			}
			if (opt.cueNum != 0) {
				cmd = 'ASC ' + opt.cueNum;
			}
			break;

		case 'bpr':
			cmd = 'BPR' +' '+ opt.idx +' '+  opt.dur;
			break;

		case 'rsc':
			cmd = 'RSC' +' '+ opt.sidx +' '+ opt.cidx + ' ' + opt.type;
			break;

		case 'trn':
			cmd = 'TRN' +' '+ opt.mix +' '+ opt.dur +' '+ opt.lay;
			break;

		case 'frz':
			cmd = 'FRZ' +' '+ opt.frzonoff +' '+ opt.lay;
			break;

		case 'btr':
			cmd = 'BTR' +' '+ opt.dur;
			break;

		case 'fkr':
			cmd = 'FKR' +' '+ opt.fkrid +' '+ opt.lay;
			break;

		case 'ofz':
			cmd = 'OFZ' +' '+ opt.frzonoff +' '+ opt.output;
			break;

		case 'dmt':
			cmd = 'DMT' +' '+ opt.dur +' '+ opt.dev;
			break

	}

	if (cmd !== undefined) {
		debug("Sending ", cmd, "to", self.config.host);

		if (self.udp !== undefined) {
			self.udp.send('spyder\x00\x00\x00\x00' + cmd);
		}
	}

	debug('action():', action);

};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
