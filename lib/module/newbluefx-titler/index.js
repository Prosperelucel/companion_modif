var instance_skel  = require('../../instance_skel');
const WebSocket    = require('ws');
var parseString    = require('xml2js').parseString;

var log;
var ws;
var currentState = new Object();
var variables = new Object();

function instance(system, id, config) {
	var self = this;
	var inst = this;
	// super-constructor
	instance_skel.apply(this, arguments);
	self.actions(); // export actions
	self.setupFeedbacks();

	if (!this.config || !this.config.host || !this.config.port){
		return self;
	}

	self.initWebSocket();


	return self;
}

instance.prototype.updateConfig = function(config) {
	//console.log('config updated');
	var self = this;
	self.config = config;
	self.setVariableDefinitions([{}]);
	self.initWebSocket();
};

instance.prototype.initWebSocket = function() {
	var self = this;
	var ip = this.config.host;
	var port = this.config.port;
	ws = new WebSocket(`ws://${ip}:${port}`);
	if (!ip || !port) {
		return self;
	}

	ws.on('open', function open() {
		//send init message
		ws.send('{"id":101,"type":3}');
		self.setupVariables();
		setInterval(() => {
			//self.getTitleStatuses()
		}, 1500);
	});

	ws.on('message', function message(data) {
		self.messageReceivedFromWebSocket(data);
	});

	ws.on('error', function incoming(data) {
		//console.log(`WebSocket error: ${data}`);
	});
};

instance.prototype.getTitleStatuses = function() {
	var playlistCount = this.config.playlistCount;
	for (var i = 0; i < playlistCount; i++) {
		ws.send(`{"type":6,"object":"scheduler","method":27,"args":["<newblue_ext command=\'readTitle\' channel=${i} />"],"id":${i}}`);
	}
};

instance.prototype.messageReceivedFromWebSocket = function(data) {
	var self = this;
	//console.log('message received');
	//console.log(data);

	//tile data was updated externally, reload all titles
	if (data && data.toString().indexOf('"object":"scheduler","signal":6,"type":1') > -1) {
		self.getTitleStatuses();
	}

	if (data && data.toString().indexOf('readTitle') > -1) {
		let json = JSON.parse(data);
		let playlistId = json.id;

		parseString(json.data, function(err, result) {
			if (!result.newblue_ext || !result.newblue_ext.title) {
				return;
			}
			result.newblue_ext.title.forEach(element => {
				var id = element.$.position;
				var tileName = element.$.name;
				var playStatus = element.running[0].$.playState;

				element.variables[0].variable.forEach(variable => {
					if (variable.$) {
						var value = variable.$.value;
						var name = variable.$.name;
						var firstWord = value.substr(0, value.indexOf(' '));
						const VAR_NAME_VARIABLES = `playlist-${playlistId}-title-${id}-var-${name}`;
						variables[VAR_NAME_VARIABLES] = {
							label: VAR_NAME_VARIABLES,
							name: VAR_NAME_VARIABLES
						};
						self.setVariable(VAR_NAME_VARIABLES, firstWord);
					}
				});

				const VAR_NAME_TILE_NAME = `playlist-${playlistId}-title-${id}-title-name}`;
				variables[VAR_NAME_TILE_NAME] = {
					label: VAR_NAME_TILE_NAME,
					name: VAR_NAME_TILE_NAME
				};
				self.setVariable(VAR_NAME_TILE_NAME, tileName);

				currentState[`${id}-${playlistId}`] = playStatus != 'Off';
			});

			let vars = [];
			for (var key in variables) {
				vars.push(variables[key]);
			}

			self.setVariableDefinitions(vars);
		});
	}

	self.checkFeedbacks();
};

instance.prototype.setupVariables = function() {
	var self = this;
	self.getTitleStatuses();
};

instance.prototype.action = function(system) {
	var self = this;
	setTimeout(() => {
		self.getTitleStatuses();
	}, 1000);

	setTimeout(() => {
		self.getTitleStatuses();
	}, 3000);
};

instance.prototype.init = function() {
	var self = this;
	self.status(self.STATE_OK); // status ok!
	debug = self.debug;
	log = self.log;
};

instance.prototype.config_fields = function() {
	var self = this;
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			tooltip: 'The IP of the web server',
			width: 6,
			regex: self.REGEX_IP
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'Port',
			tooltip: 'The port of the web socket server',
			width: 6,
			regex: self.REGEX_NUMBER
		},
		{
			type: 'textinput',
			id: 'playlistCount',
			label: 'Playlist Count',
			tooltip: 'The number of playlists',
			width: 6,
			default: 2,
			regex: self.REGEX_NUMBER
		}
	];
};

instance.prototype.setupFeedbacks = function() {
	var self = this;
	const feedbacks = {};
	feedbacks['on_air_status'] = {
		label: 'Change colors when On-Air',
		description: 'Change colors when On-Air',
		options: [
			{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: this.rgb(0, 0, 0)
			},
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: this.rgb(255, 0, 0)
			},
			{
				type: 'textinput',
				label: 'Position',
				id: 'position',
				default: 1,
				regex: self.REGEX_NUMBER
			},
			{
				type: 'textinput',
				label: 'Playlist Id (zero-based)',
				id: 'playlist',
				default: '0',
				regex: self.REGEX_NUMBER
			}
		]
	};
	self.setFeedbackDefinitions(feedbacks);
};

instance.prototype.feedback = function(event) {
	var self = this;
	var options = event.options;

	if (event.type == 'on_air_status') {
		if (currentState[`${options.position}-${options.playlist}`]) {
			return { color: options.fg, bgcolor: options.bg };
		}
	}
	return {};
};

instance.prototype.actions = function(system) {
	var self = this;
	self.system.emit('instance_actions', self.id, {
		set_on_air: {
			label: 'Update Feedback & Variables'
		}
	});
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
