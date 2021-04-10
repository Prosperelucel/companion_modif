var artnet = require('artnet-node');
var artnetClient = artnet.Client;
var instance_skel = require('../../instance_skel');
var log;

var discoveries = {};

function discovery(err, data) {
	if (!err && data) {

		if (data.length > 0) {
			for (var i = 0; i < data.length; ++i) {

				if (discoveries[data[i].address] === undefined) {
					data[i].ts = Date.now();
					discoveries[data[i].address] = data[i];
				} else {
					discoveries[data[i].address].ts = Date.now();
				}

			}
		}
	}
}

// Check every 5 seconds for artnet hosts
setInterval(function () {
	var discovery10 = artnet.Server.discover(discovery, 5000, "10.255.255.255");
	var discovery2 = artnet.Server.discover(discovery, 5000, "2.255.255.255");

	for (var key in discoveries) {
		if (Date.now() > discoveries[key].ts + 10000) {
			delete discoveries[key];
		}
	}
}, 5000);

function instance(system, id, config) {
	var self = this;

	self.data = [];
	for (var i = 0; i < 511; ++i) {
		self.data[i] = 0;
	}

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;

	self.init_artnet();
	self.init_presets();
};
instance.prototype.CHOICES_PLAYMODE = [
	{ label: 'Play once', id: '0' },
	{ label: 'Loop', id: '1' },
	{ label: 'Bounce', id: '2' }
];
instance.prototype.CHOICES_LAYER = [
	{ label: 'Layer 1', id: '1' },
	{ label: 'Layer 2', id: '2' },
	{ label: 'Layer 3', id: '3' },
	{ label: 'Layer 4', id: '4' }
];
instance.prototype.CHOICES_CHOKE = [
	{ label: 'Keep active', id: '0' },
	{ label: 'All to 0', id: '1' }
];
instance.prototype.init = function() {
	var self = this;

	log = self.log;

	self.status(self.STATE_UNKNOWN);

	self.init_artnet();

	self.timer = setInterval(function () {
		if (self.client !== undefined) {
			self.client.send(self.data);
		}
	}, 1000);
	self.init_presets();
};

instance.prototype.init_artnet= function() {
	var self = this;

	self.status(self.STATE_UNKNOWN);
	if (self.client !== undefined) {
		self.client.close();
		delete self.client;
	}

	if (self.config.host_dd || self.config.host) {

		self.client = new artnetClient(self.config.host_dd || self.config.host, 6454, self.config.universe || 0);

		self.status(self.STATE_OK);
	}
	self.data[4] = 255;
	self.data[5] = 255;
	self.data[7] = 128;
	self.data[8] = 128;
	self.data[10] = 128;
	self.data[12] = 128;
	self.data[14] = 128;
	self.data[16] = 128;
	self.data[18] = 128;
	self.data[22] = 255;
	self.data[23] = 255;
	self.data[24] = 255;
	self.data[25] = 255;
	self.data[81] = 127;
	self.data[82] = 127;
	self.data[104] = 255;
	self.data[105] = 255;
	self.data[107] = 128;
	self.data[108] = 128;
	self.data[110] = 128;
	self.data[112] = 128;
	self.data[114] = 128;
	self.data[116] = 128;
	self.data[118] = 128;
	self.data[122] = 255;
	self.data[123] = 255;
	self.data[124] = 255;
	self.data[125] = 255;
	self.data[181] = 127;
	self.data[182] = 127;
	self.data[204] = 255;
	self.data[205] = 255;
	self.data[207] = 128;
	self.data[208] = 128;
	self.data[210] = 128;
	self.data[212] = 128;
	self.data[214] = 128;
	self.data[216] = 128;
	self.data[218] = 128;
	self.data[222] = 255;
	self.data[223] = 255;
	self.data[224] = 255;
	self.data[225] = 255;
	self.data[281] = 127;
	self.data[282] = 127;
	self.data[304] = 255;
	self.data[305] = 255;
	self.data[307] = 128;
	self.data[308] = 128;
	self.data[310] = 128;
	self.data[312] = 128;
	self.data[314] = 128;
	self.data[316] = 128;
	self.data[318] = 128;
	self.data[322] = 255;
	self.data[323] = 255;
	self.data[324] = 255;
	self.data[325] = 255;
	self.data[381] = 127;
	self.data[382] = 127;
};

// Return config fields for web config
instance.prototype.config_fields = function () {

	var self = this;
	var fields = [
		{
			type:  'text',
			id:    'info',
			width:  12,
			label: 'Information',
			value: 'This module controls the avolites AI server thru artnet'
		},
		{
			type:  'textinput',
			id:    'host',
			label: 'AI server IP adress',
			width:  6,
			regex:  self.REGEX_IP
		}
	];

	if (Object.keys(discoveries).length > 0 || self.config.host_dd) {
		var choices = [ { id: '', label: 'Custom ip' } ];

		if (self.config.host_dd && discoveries[self.config.host_dd] === undefined) {
			choices.push({ id: self.config.host_dd, label: self.config.host_dd + ' (not seen for a while)' });
		}

		for (var key in discoveries) {
			choices.push({ id: key, label: discoveries[key].name + ' (' + key + ')' });
		}

		fields.push({
			type: 'dropdown',
			id: 'host_dd',
			label: 'Or choose from discovered Devices:',
			width: 6,
			default: '',
			choices: choices
		});
	}

	fields.push({
		type: 'textinput',
		id: 'universe',
		label: 'Universe number (0-63)',
		width: 6,
		default: 0,
		regex: '/^0*([0-9]|[1-5][0-9]|6[0-3])$/'
	});

	return fields;
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.client !== undefined) {
		self.client.close();
		delete self.client;
	}

	if (self.timer) {
		clearInterval(self.timer);
		self.timer = undefined;
	}

	if (self.client !== undefined) {
		self.client.close();
	}

};


instance.prototype.actions = function(system) {
	var self = this;
	self.system.emit('instance_actions', self.id, {
		'File': {
			label:'File',
			options: [
				{
					type: 'number',
					label: 'Directory (0 -> 255)',
					id: 'Directoryid',
					min: 0,
					max: 255,
					default: 0,
					required: true
				},
				{
					type: 'number',
					label: 'File (0 -> 255)',
					id: 'Fileid',
					min: 0,
					max: 255,
					default: 1,
					required: true
				},
				{
					type: 'dropdown',
					label: 'Layer: ',
					id: 'layers_file',
					default: '1',
					choices: self.CHOICES_LAYER
				}
			]
		},
		'Play': {
			label:'Play',
			options: [
				{
					type: 'dropdown',
					label: 'Playmode: ',
					id: 'playmodes',
					default: '0',
					choices: self.CHOICES_PLAYMODE
				},
				{
					type: 'dropdown',
					label: 'Layer: ',
					id: 'layers_play',
					default: '1',
					choices: self.CHOICES_LAYER
				}
			]
		},
		'Stop': {
			label:'Stop',
			options: [
				{
					type: 'dropdown',
					label: 'Layer: ',
					id: 'layers_stop',
					default: '1',
					choices: self.CHOICES_LAYER
				}
			]
		},
		'Pause': {
			label:'Pause',
			options: [
				{
					type: 'dropdown',
					label: 'Layer: ',
					id: 'layers_pause',
					default: '1',
					choices: self.CHOICES_LAYER
				}
			]
		},
		'Intensity': {
			label:'Intensity',
			options: [
				{
						type: 'number',
						label: 'Intensity (0 -> 100)',
						id: 'Intensityid',
						min: 0,
						max: 100,
						default: 100,
						required: true
				},
				{
					type: 'dropdown',
					label: 'Layer: ',
					id: 'layers_int',
					default: '1',
					choices: self.CHOICES_LAYER
				},
				{
					type: 'dropdown',
					label: 'Other layers: ',
					id: 'choke',
					default: '0',
					choices: self.CHOICES_CHOKE
				}
			]
		},
		'Speed': {
			label:'Speed',
			options: [
				{
						type: 'number',
						label: 'Speed (1 -> 100)',
						id: 'Speedid',
						min: 1,
						max: 100,
						default: 100,
						required: true
				},
				{
					type: 'dropdown',
					label: 'Layer: ',
					id: 'layers_spd',
					default: '1',
					choices: self.CHOICES_LAYER
				}
			]
		},
		'Strobe': {
			label:'Strobe',
			options: [
				{
						type: 'number',
						label: 'Strobe (0 -> 100)',
						id: 'Strobeid',
						min: 0,
						max: 100,
						default: 100,
						required: true
				},
				{
					type: 'dropdown',
					label: 'Layer: ',
					id: 'layers_str',
					default: '1',
					choices: self.CHOICES_LAYER
				}
			]
		},
		'Volume': {
			label:'Volume',
			options: [
				{
						type: 'number',
						label: 'Volume (0 -> 100)',
						id: 'Volumeid',
						min: 0,
						max: 100,
						default: 100,
						required: true
				},
				{
					type: 'dropdown',
					label: 'Layer: ',
					id: 'layers_vol',
					default: '1',
					choices: self.CHOICES_LAYER
				}
			]
		},
		'Color': {
			label:'Color',
			options: [
				{
					type: 'colorpicker',
					label: 'Color: ',
					id: 'colorid',
					default: this.rgb(255, 255, 255)
				},
				{
					type: 'dropdown',
					label: 'Layer: ',
					id: 'layers_col',
					default: '1',
					choices: self.CHOICES_LAYER
				}
			]
		}
	});
}
instance.prototype.init_presets = function () {
	var self = this;
	var presets = [];
	presets.push({
		category: 'Layer 1',
		label: 'play_preset',
		bank: {
			style: 'text',
			text: 'Play',
			size: '18',
			color: self.rgb(0,0,0),
			bgcolor: self.rgb(255,255,0)
		},
		actions: [{
			action: 'Play',
			options: {
				playmodes: '0',
				layers_play: '1'
			}
		}]
	});
	presets.push({
		category: 'Layer 1',
		label: 'play_preset',
		bank: {
			style: 'text',
			text: 'Loop',
			size: '18',
			color: self.rgb(0,0,0),
			bgcolor: self.rgb(255,255,0)
		},
		actions: [{
			action: 'Play',
			options: {
				playmodes: '1',
				layers_play: '1'
			}
		}]
	});
	presets.push({
		category: 'Layer 1',
		label: 'play_preset',
		bank: {
			style: 'text',
			text: 'Bounce',
			size: '18',
			color: self.rgb(0,0,0),
			bgcolor: self.rgb(255,255,0)
		},
		actions: [{
			action: 'Play',
			options: {
				playmodes: '2',
				layers_play: '1'
			}
		}]
	});
	presets.push({
		category: 'Layer 1',
		label: 'stop_preset',
		bank: {
			style: 'text',
			text: 'Stop',
			size: '18',
			color: self.rgb(0,0,0),
			bgcolor: self.rgb(255,0,0)
		},
		actions: [{
			action: 'Stop',
			options: {
				layers_play: '1'
			}
		}]
	});
	presets.push({
		category: 'Layer 1',
		label: 'play_preset',
		bank: {
			style: 'text',
			text: 'Pause',
			size: '18',
			color: self.rgb(0,0,0),
			bgcolor: self.rgb(255,0,0)
		},
		actions: [{
			action: 'Pause',
			options: {
				layers_play: '1'
			}
		}]
	});
	presets.push({
	category: 'Layer 2',
	label: 'play_preset',
	bank: {
		style: 'text',
		text: 'Play',
		size: '18',
		color: self.rgb(0,0,0),
		bgcolor: self.rgb(255,255,0)
	},
	actions: [{
		action: 'Play',
		options: {
			playmodes: '0',
			layers_play: '2'
		}
	}]
	});
	presets.push({
		category: 'Layer 2',
		label: 'play_preset',
		bank: {
			style: 'text',
			text: 'Loop',
			size: '18',
			color: self.rgb(0,0,0),
			bgcolor: self.rgb(255,255,0)
		},
		actions: [{
			action: 'Play',
			options: {
				playmodes: '1',
				layers_play: '2'
			}
		}]
	});
	presets.push({
		category: 'Layer 2',
		label: 'play_preset',
		bank: {
			style: 'text',
			text: 'Bounce',
			size: '18',
			color: self.rgb(0,0,0),
			bgcolor: self.rgb(255,255,0)
		},
		actions: [{
			action: 'Play',
			options: {
				playmodes: '2',
				layers_play: '2'
			}
		}]
	});
	presets.push({
		category: 'Layer 2',
		label: 'stop_preset',
		bank: {
			style: 'text',
			text: 'Stop',
			size: '18',
			color: self.rgb(0,0,0),
			bgcolor: self.rgb(255,0,0)
		},
		actions: [{
			action: 'Stop',
			options: {
				layers_play: '2'
			}
		}]
	});
	presets.push({
		category: 'Layer 2',
		label: 'play_preset',
		bank: {
			style: 'text',
			text: 'Pause',
			size: '18',
			color: self.rgb(0,0,0),
			bgcolor: self.rgb(255,0,0)
		},
		actions: [{
			action: 'Pause',
			options: {
				layers_play: '2'
			}
		}]
	});
		presets.push({
		category: 'Layer 3',
		label: 'play_preset',
		bank: {
			style: 'text',
			text: 'Play',
			size: '18',
			color: self.rgb(0,0,0),
			bgcolor: self.rgb(255,255,0)
		},
		actions: [{
			action: 'Play',
			options: {
				playmodes: '0',
				layers_play: '3'
			}
		}]
	});
	presets.push({
		category: 'Layer 3',
		label: 'play_preset',
		bank: {
			style: 'text',
			text: 'Loop',
			size: '18',
			color: self.rgb(0,0,0),
			bgcolor: self.rgb(255,255,0)
		},
		actions: [{
			action: 'Play',
			options: {
				playmodes: '1',
				layers_play: '3'
			}
		}]
	});
	presets.push({
		category: 'Layer 3',
		label: 'play_preset',
		bank: {
			style: 'text',
			text: 'Bounce',
			size: '18',
			color: self.rgb(0,0,0),
			bgcolor: self.rgb(255,255,0)
		},
		actions: [{
			action: 'Play',
			options: {
				playmodes: '2',
				layers_play: '3'
			}
		}]
	});
	presets.push({
		category: 'Layer 3',
		label: 'stop_preset',
		bank: {
			style: 'text',
			text: 'Stop',
			size: '18',
			color: self.rgb(0,0,0),
			bgcolor: self.rgb(255,0,0)
		},
		actions: [{
			action: 'Stop',
			options: {
				layers_play: '3'
			}
		}]
	});
	presets.push({
		category: 'Layer 3',
		label: 'play_preset',
		bank: {
			style: 'text',
			text: 'Pause',
			size: '18',
			color: self.rgb(0,0,0),
			bgcolor: self.rgb(255,0,0)
		},
		actions: [{
			action: 'Pause',
			options: {
				layers_play: '3'
			}
		}]
	});
	presets.push({
	category: 'Layer 4',
	label: 'play_preset',
	bank: {
		style: 'text',
		text: 'Play',
		size: '18',
		color: self.rgb(0,0,0),
		bgcolor: self.rgb(255,255,0)
	},
	actions: [{
		action: 'Play',
		options: {
			playmodes: '0',
			layers_play: '4'
		}
	}]
	});
	presets.push({
		category: 'Layer 4',
		label: 'play_preset',
		bank: {
			style: 'text',
			text: 'Loop',
			size: '18',
			color: self.rgb(0,0,0),
			bgcolor: self.rgb(255,255,0)
		},
		actions: [{
			action: 'Play',
			options: {
				playmodes: '1',
				layers_play: '4'
			}
		}]
	});
	presets.push({
		category: 'Layer 4',
		label: 'play_preset',
		bank: {
			style: 'text',
			text: 'Bounce',
			size: '18',
			color: self.rgb(0,0,0),
			bgcolor: self.rgb(255,255,0)
		},
		actions: [{
			action: 'Play',
			options: {
				playmodes: '2',
				layers_play: '4'
			}
		}]
	});
	presets.push({
		category: 'Layer 4',
		label: 'stop_preset',
		bank: {
			style: 'text',
			text: 'Stop',
			size: '18',
			color: self.rgb(0,0,0),
			bgcolor: self.rgb(255,0,0)
		},
		actions: [{
			action: 'Stop',
			options: {
				layers_play: '4'
			}
		}]
	});
	presets.push({
		category: 'Layer 4',
		label: 'play_preset',
		bank: {
			style: 'text',
			text: 'Pause',
			size: '18',
			color: self.rgb(0,0,0),
			bgcolor: self.rgb(255,0,0)
		},
		actions: [{
			action: 'Pause',
			options: {
				layers_play: '4'
			}
		}]
	});
	self.setPresetDefinitions(presets);
}
instance.prototype.action = function(action) {
	var self = this;
	var id = action.action;

	switch (id) {
		case 'Play':
			if (self.client !== undefined) {
				if(action.options.layers_play == "1") {
					dmxadress = 6;
				}
				else if(action.options.layers_play == "2") {
					dmxadress = 106;
				}
				else if(action.options.layers_play == "3") {
					dmxadress = 206;
				}
				else if(action.options.layers_play == "4") {
					dmxadress = 306;
				}
				if (action.options.playmodes == '0') {
					self.data[dmxadress] = 4;
				}
				else if (action.options.playmodes == '1') {
					self.data[dmxadress] = 2;
				}
				else if (action.options.playmodes == '2') {
					self.data[dmxadress] = 8;
				}
				self.client.send(self.data);
			}
			break;

		case 'Stop':
			if(action.options.layers_stop == "1") {
				dmxadress = 6;
			}
			else if(action.options.layers_stop == "2") {
				dmxadress = 106;
			}
			else if(action.options.layers_stop == "3") {
				dmxadress = 206;
			}
			else if(action.options.layers_stop == "4") {
				dmxadress = 306;
			}
			if (self.client !== undefined) {
				self.data[dmxadress] = 6;
				self.client.send(self.data);
			}
			break;
		case 'Pause':
			if(action.options.layers_pause == "1") {
				dmxadress = 6;
			}
			else if(action.options.layers_pause == "2") {
				dmxadress = 106;
			}
			else if(action.options.layers_pause == "3") {
				dmxadress = 206;
			}
			else if(action.options.layers_pause == "4") {
				dmxadress = 306;
			}
			if (self.client !== undefined) {
				self.data[dmxadress] = 7;
				self.client.send(self.data);
			}
			break;

		case 'Intensity':
			if(action.options.layers_int == "1") {
				myint = action.options.Intensityid * 2.55;
				myint = Math.round(myint);
				if(action.options.choke == "1") {
					self.data[122] = 0;
					self.data[222] = 0;
					self.data[322] = 0;
				}
				self.data[22] = myint;
			}
			else if(action.options.layers_int == "2") {
				myint = action.options.Intensityid * 2.55;
				myint = Math.round(myint);
				if(action.options.choke == "1") {
					self.data[22] = 0;
					self.data[222] = 0;
					self.data[322] = 0;
				}
				self.data[122] = myint;
			}
			else if(action.options.layers_int == "3") {
				myint = action.options.Intensityid * 2.55;
				myint = Math.round(myint);
				if(action.options.choke == "1") {
					self.data[122] = 0;
					self.data[22] = 0;
					self.data[322] = 0;
				}
				self.data[222] = myint;
			}
			else if(action.options.layers_int == "4") {
				myint = action.options.Intensityid * 2.55;
				myint = Math.round(myint);
				if(action.options.choke == "1") {
					self.data[122] = 0;
					self.data[222] = 0;
					self.data[22] = 0;
				}
				self.data[322] = myint;
			}
			if (self.client !== undefined) {
				self.client.send(self.data);
			}
			break;

		case 'Speed':
			if(action.options.layers_spd == "1") {
				dmxadress = 7;
			}
			else if(action.options.layers_spd == "2") {
				dmxadress = 107;
			}
			else if(action.options.layers_spd == "3") {
				dmxadress = 207;
			}
			else if(action.options.layers_spd == "4") {
				dmxadress = 307;
			}
			if (self.client !== undefined) {
				myint = action.options.Speedid * 1.27;
				myint = Math.round(myint);
				self.data[dmxadress] = myint;
				self.client.send(self.data);
			}
			break;

		case 'Volume':
			if(action.options.layers_vol == "1") {
				dmxadress = 88;
			}
			else if(action.options.layers_vol == "2") {
				dmxadress = 188;
			}
			else if(action.options.layers_vol == "3") {
				dmxadress = 288;
			}
			else if(action.options.layers_vol == "4") {
				dmxadress = 388;
			}
			if (self.client !== undefined) {
				myint = action.options.Volumeid * 2.55;
				myint = Math.round(myint);
				self.data[dmxadress] = myint;
				self.client.send(self.data);
			}
			break;

		case 'Strobe':
			if(action.options.layers_str == "1") {
				dmxadress = 26;
			}
			else if(action.options.layers_str == "2") {
				dmxadress = 126;
			}
			else if(action.options.layers_str == "3") {
				dmxadress = 226;
			}
			else if(action.options.layers_str == "4") {
				dmxadress = 326;
			}
			if (self.client !== undefined) {
				myint = action.options.Strobeid * 2.55;
				myint = Math.round(myint);
				self.data[dmxadress] = myint;
				self.client.send(self.data);
			}
			break;

		case 'File':
			if(action.options.layers_file == "1")  {
				dmxadress = 0;
			}
			else if(action.options.layers_file == "2") {
				dmxadress = 100;
			}
			else if(action.options.layers_file == "3") {
				dmxadress = 200;
			}
			else if(action.options.layers_file == "4") {
				dmxadress = 300;
			}
			if (self.client !== undefined) {
				self.data[dmxadress] = action.options.Directoryid;
				self.data[dmxadress+1] = action.options.Fileid;
				self.client.send(self.data);
			}
			break;
			
		case 'Color':
			if(action.options.layers_col == "1") {
				dmxadress = 23;
			}
			else if(action.options.layers_col == "2") {
				dmxadress = 123;
			}
			else if(action.options.layers_col == "3") {
				dmxadress = 223;
			}
			else if(action.options.layers_col == "4") {
				dmxadress = 323;
			}
			hexcol = ("00000" + action.options.colorid.toString(16)).substr(-6);
			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexcol);
			self.data[dmxadress] = parseInt(result[1], 16);
			self.data[dmxadress+1] = parseInt(result[2], 16);
			self.data[dmxadress+2] = parseInt(result[3], 16);
			if (self.client !== undefined) {
				self.client.send(self.data);
			}
			break;
	}

};
instance_skel.extendedBy(instance);
exports = module.exports = instance;
