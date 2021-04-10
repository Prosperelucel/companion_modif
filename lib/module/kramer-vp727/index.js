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
};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.status(1,'Connecting'); // status ok!

	self.init_tcp();
};

instance.prototype.init_tcp = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	if (self.config.host) {
		self.socket = new tcp(self.config.host, 5000);

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
		'freeze':     {
			label: 'Freeze Output',
			options: [
				{
					type: 'dropdown',
					label: 'Freeze on/off',
					id: 'frzId',
					choices: [
						{ id: '0', label: 'Off' },
						{ id: '1', label: 'On' },
					]
				},
				{
					type: 'dropdown',
					label: 'Program / Preview',
					id: 'outId',
					choices: [
						{ id: '195',  label: 'Preview' },
						{ id: '197',  label: 'Program' }
					]
				}

			]
		},
		'blank':     {
			label: 'Blank Output',
			options: [
				{
					type: 'dropdown',
					label: 'Blank on/off',
					id: 'blankId',
					choices: [
						{ id: '0', label: 'Off' },
						{ id: '1', label: 'On' },
					]
				},
				{
					type: 'dropdown',
					label: 'Program / Preview',
					id: 'outId',
					choices: [
						{ id: '196',  label: 'Preview' },
						{ id: '198',  label: 'Program' }
					]
				}
			]
		},
		'pattern':     {
			label: 'Test Pattern',
			options: [
				{
					type: 'dropdown',
					label: 'Select Pattern',
					id: 'pat',
					choices: [
						{ id: '0', label: 'Off' },
						{ id: '1', label: '32 Grey Ramp' },
						{ id: '2', label: 'Red'},
						{ id: '3', label: 'Green'},
						{ id: '4', label: 'Blue'},
						{ id: '5', label: 'White'},
						{ id: '6', label: 'Black'},
						{ id: '7', label: 'Checkerboard'},
						{ id: '8', label: 'Color Bar'},
						{ id: '9', label: 'Aspect Ratio'},
						{ id: '10', label: 'RGB Steps'},
						{ id: '11', label: 'Gamma Check'}
					]
				},
				{
					type: 'dropdown',
					label: 'Program / Preview',
					id: 'outId',
					choices: [
						{ id: '80',  label: 'Preview' },
						{ id: '132', label: 'Program' }
					]
				}

			]
		},
		'pgmSel':   {
			label: 'Program Select',
			options: [
				{
					type: 'dropdown',
						 label: 'Input',
						 id: 'pgmId',
						 choices: [
							 { id: '0', label: '1'},
							 { id: '1', label: '2'},
							 { id: '2', label: '3'},
							 { id: '3', label: '4'},
							 { id: '4', label: '5'},
							 { id: '5', label: '6'},
							 { id: '6', label: '7'},
							 { id: '7', label: '8'}
						 ]
				}
			]
		},
		'prwSel':   {
			label: 'Preview Select',
			options: [
				{
					type: 'dropdown',
						 label: 'Input',
						 id: 'prwId',
						 choices: [
							 { id: '0', label: '1'},
							 { id: '1', label: '2'},
							 { id: '2', label: '3'},
							 { id: '3', label: '4'},
							 { id: '4', label: '5'},
							 { id: '5', label: '6'},
							 { id: '6', label: '7'},
							 { id: '7', label: '8'}
						 ]
				}
			]
		},
		/*
		'command':   {
			label: 'Command',
			options: [
				{
					type: 'textinput',
						 label: 'command',
						 id: 'comId'

				}
			]
		},
		*/
		'take':   { label:  'Take'},
		'transition':   {
			label: 'Transition Select',
			options: [
				{
					type: 'dropdown',
						 label: 'Input',
						 id: 'transId',
						 choices: [
							 { id: '0', label: 'Cut'},
							 { id: '1', label: 'Fade'},
							 { id: '2', label: 'Diagonal'},
							 { id: '3', label: 'Wipe'},
							 { id: '4', label: 'Circle'},
							 { id: '5', label: 'Square'},
							 { id: '6', label: 'Corner'},
							 { id: '7', label: 'Checkerboard'}
						 ]
				}
			]
		},

	});
};




	instance.prototype.action = function(action) {
		var self = this;
		var opt = action.options

		switch (action.action) {

			case 'pgmSel':
				cmd = 'Y 0 94 '+ opt.pgmId;
				break;

			case 'prwSel':
				cmd = 'Y 0 42 '+ opt.prwId;
				break;

			case 'pattern':
				cmd = 'Y 0 '+ opt.outId +' '+ opt.pat;
				break;

			case 'freeze':
				cmd = 'Y 0 '+ opt.outId + ' ' + opt.frzId;
				break;

			case 'blank':
				cmd = 'Y 0 '+ opt.outId + ' ' + opt.blankId;
				break;

			case 'take':
				cmd = 'Y 0 2';
				break;

			case 'transition':
				cmd = 'Y 0 146 '+ opt.transId;
				break;

			case 'command':
				cmd = opt.comId;
				break;

	};





	if (cmd !== undefined) {

		debug('sending ',cmd,"to",self.config.host);

		if (self.socket !== undefined && self.socket.connected) {
			self.socket.send(cmd + '\n');
		} else {
			debug('Socket not connected :(');
		}

	}

};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
