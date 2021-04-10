var instance_skel = require('../../instance_skel');
var request = require("request");
var debug;
var log;

/**
 * Companion instance for Characterworks.
 * @author Eddie Wettach <ewettach@gmail.com>
 */

class instance extends instance_skel {

	constructor(system, id, config) {
		super(system, id, config);
		var self = this;

		// Characterworks Port #
		self.port = 5201;
		self.actions();
	}

	actions(system) {
		var self = this;

		self.system.emit('instance_actions', self.id, {
			'trigger_cw': {
				label: 'Trigger CharacterWorks',
				options: [
					{
						type: 'dropdown',
						label: 'Action',
						id: 'action_dropdown',
						default: 'play_motions',
						choices: [
								{ id: 'play_motions', label: 'play_motions' },
								{ id: 'stop_motions', label: 'stop_motions' },
								{ id: 'finish_motions', label: 'finish_motions' }
						]
					},
					{
						type:  'textinput',
						label: 'Motion Name',
						id:    'motion_name',
						regex: '/^[A-Za-z0-9_\-]*$/'
					},
					{
						type: 'dropdown',
						label: 'Channel',
						id: 'channel_dropdown',
						default: 'preview',
						choices: [
							{ id: 'live1', label: 'live1' },
							{ id: 'live2', label: 'live2' },
							{ id: 'preview', label: 'preview' }
						]
					}
				]
			},
			'set_text': {
				label: 'Set Text',
				options: [
					{
						type:  'textinput',
						label: 'Motion Name',
						id:    'motion_name',
						width: 12,
						regex: '/^[A-Za-z0-9_\-]*$/'
					},
					{
						type:  'textinput',
						label: 'Text Layer',
						id:    'text_layer',
						width: 12,
						default: 'CW text layer variable to replace'
					},
					{
						type:  'textinput',
						label: 'Text Value',
						id:    'text_value',
						width: 12,
						default: 'Sample Text'
					},
					{
						type: 'dropdown',
						label: 'Channel',
						id: 'channel_dropdown',
						default: 'preview',
						choices: [
							{ id: 'live1', label: 'live1' },
							{ id: 'live2', label: 'live2' },
							{ id: 'preview', label: 'preview' }
						]
					}
				]
			},
			'activate_grid': {
				label: 'Grid Button',
				options: [
					{
						type:  'textinput',
						label: 'Grid Name',
						id:    'grid_name',
						width: 12
					},
					{
						type:  'textinput',
						label: 'Grid Cell Coordinates (x,y)',
						id:    'grid_cell',
						default: '0,0',
						regex: '/^\\d+,\\d+$/'
					}
				]
			}
		});
	}

	action(action) {
		var self = this;
		var url = 'http://' + self.config.host + ':' + self.config.port;

		switch (action.action) {

			case 'trigger_cw':
				// create JSON data to HTTP POST to CW
				var requestData = {
					"action": action.options.action_dropdown,
					"motions": [
						action.options.motion_name
					],
					"channel": action.options.channel_dropdown
				};
				break;

			case "set_text":
				// create JSON data to HTTP POST to CW
				var requestData = {
					"action": 'set_text',
					"layer": action.options.motion_name + '\\' + action.options.text_layer,
					"value": action.options.text_value,
					"channel": action.options.channel_dropdown
				};
				break;

			case 'activate_grid':
				// Put row and column into an array of integers
				var data = action.options.grid_cell.split(',');
				var cw_gridrow = parseInt(data[0]);
				var cw_gridcolumn = parseInt(data[1]);
				var cw_cell_array = [cw_gridrow, cw_gridcolumn];

				// create JSON data to HTTP Post to CW
				var requestData= {
					action: "activate_grid_cell",
					grid: action.options.grid_name,
					cell: cw_cell_array
				};
				break;
		}

		// Send the request to Characterworks
		request({
			url: url,
			method: "POST",
			json: requestData
		}, function (error, response, body) {
			if (!error && response.statusCode === 200) {
				// ok
			}
			else {
				self.log("Characterworks Send Error: " + error);
				debug("response.statusCode: " + response.statusCode);
				debug("response.statusText: " + response.statusText);
			}
		});
	}

	// Web config fields
	config_fields () {
		var self = this;
		return [
			{
				type:    'textinput',
				id:      'host',
				label:   'Characterworks IP Address',
				tooltip: 'The IP of the Characterworks Server',
				width:   6,
				regex:   self.REGEX_IP
			},
			{
				type:    'textinput',
				id:      'port',
				label:   'Characterworks Port Number (default 5201)',
				tooltip: 'The Port Number that Characterworks is listening on.',
				width:   6,
				default: 5201,
				regex: self.REGEX_PORT
			}
		]
	}


	destroy() {
		var self = this;
		debug("destroy");
	}

	init() {
		var self = this;
		self.status(self.STATE_OK);
		debug = self.debug;
		log = self.log;
	}

	updateConfig(config) {
		var self = this;

		self.config = config;
	}
}

exports = module.exports = instance;
