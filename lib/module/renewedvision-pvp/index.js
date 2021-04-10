var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions();

	return self;
};


/**
 * Config updated by the user.
 */
instance.prototype.updateConfig = function(config) {
	var self = this;
	self.config = config;
	self.setPvpIps();
};


/**
 * Initializes the module.
 */
instance.prototype.init = function() {
	var self = this;

	self.status(self.STATE_OK);
	self.setPvpIps();

	debug = self.debug;
	log = self.log;

	self.init_presets();
};


/**
 * Creates an array of PVP instances to control.
 */
instance.prototype.setPvpIps = function() {
	var self = this;

	// Add the primary IP/port of PVP
	self.arrTargets = [{
		host  : self.config.host,
		https : self.config.https || false,
		port  : self.config.port,
		auth  : self.config.auth || ''
	}];

	// If a backup instance was defined, add it too.
	if (self.config.host_backup && self.config.port_backup) {
		self.arrTargets.push({
			host  : self.config.host_backup,
			https : self.config.https_backup || false,
			port  : self.config.port_backup,
			auth  : self.config.auth_backup || ''
		});
	}

};


/**
 * Return config fields for web config.
 */
instance.prototype.config_fields = function() {
	var self = this;

	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'This module will control Renewed Vision PVP 3.1 or above.'
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'PVP IP',
			width: 4,
			regex: self.REGEX_IP
		},
		{
			type: 'checkbox',
			id: 'https',
			label: 'HTTPS Connection',
			width: 2,
			tooltip: 'Check if PVP requires an HTTPS connection.',
			default: false
		},
		{
			type: 'textinput',
			id: 'auth',
			label: 'Authentication Token',
			width: 4
		},
		{
			type: 'number',
			id: 'port',
			label: 'Port',
			min: 1,
			max: 65535,
			width: 2,
			required: true
		},
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Backup Instance',
			value: "If you're running a backup instance of PVP, enter its connection details here. Leave empty to ignore."
		},
		{
			type: 'textinput',
			id: 'host_backup',
			label: 'PVP IP (Backup instance)',
			width: 4,
			// Regex borrowed from instance_skel's REGEX_IP, but made optional
			regex: '/^((?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))?$/'
		},
		{
			type: 'checkbox',
			id: 'https_backup',
			label: 'HTTPS Connection',
			width: 2,
			tooltip: 'Check if PVP requires an HTTPS connection.',
			default: false
		},
		{
			type: 'textinput',
			id: 'auth_backup',
			label: 'Authentication Token',
			width: 4
		},
		{
			type: 'number',
			id: 'port_backup',
			label: 'Port',
			width: 2,
			min: 1,
			max: 65535,
			required: false
		}
	];

};


/**
 * Cleanup when the module gets deleted.
 */
instance.prototype.destroy = function() {
	var self = this;
	debug("destroy");
};


/**
* Define button presets
*/
instance.prototype.init_presets = function () {
	var self = this;

	var presets = [
		/**
		* Presets for Layers
		*/
		{
			category: 'Layers',
			label: 'This button will clear the selected Layer.',
			bank: {
				style: 'text',
				text: 'Clear\\nLayer #',
				size: 'auto',
				color: self.rgb(255, 255, 255),
				bgcolor: self.rgb(255, 0, 0),
				latch: false
			},
			actions: [
				{
					action: 'clearLayer',
					options: {
						idx: 0,
					}
				}
			]
		},

		{
			category: 'Layers',
			label: 'This button will mute the selected Layer.',
			bank: {
				style: 'text',
				text: 'Mute\\nLayer #',
				size: 'auto',
				color: self.rgb(255, 255, 255),
				bgcolor: self.rgb(0, 153, 204),
				latch: false
			},
			actions: [
				{
					action: 'muteLayer',
					options: {
						idx: 0,
					}
				}
			]
		},

		{
			category: 'Layers',
			label: 'This button will unmute the selected Layer.',
			bank: {
				style: 'text',
				text: 'Unmute\\nLayer #',
				size: 'auto',
				color: self.rgb(255, 255, 255),
				bgcolor: self.rgb(0, 204, 0),
				latch: false
			},
			actions: [
				{
					action: 'unmuteLayer',
					options: {
						idx: 0
					}
				}
			]
		},

		{
			category: 'Layers',
			label: 'This button will mute and unmute the selected Layer.',
			bank: {
				style: 'text',
				text: 'Mute/\\nUnmute\\nLayer #',
				size: 'auto',
				color: self.rgb(255, 255, 255),
				bgcolor: self.rgb(204, 0, 204),
				latch: true
			},
			actions: [
				{
					action: 'muteLayer',
					options: {
						idx: 0
					}
				}
			],
			release_actions: [
				{
					action: 'unmuteLayer',
					options: {
						idx: 0,
					}
				}
			]
		},

		{
			category: 'Layers',
			label: 'This button will select and target a layer.',
			bank: {
				style: 'text',
				text: 'Select \\nLayer #',
				size: 'auto',
				color: self.rgb(255, 255, 255),
				bgcolor: self.rgb(0, 0, 0),
				latch: false
			},
			actions: [
				{
					action: 'selectLayer',
					options: {
						idx: 0,
						target: 'true',
					}
				}
			]
		},

		{
			category: 'Layers',
			label: 'This button will hide and unhide the selected Layer.',
			bank: {
				style: 'text',
				text: 'Hide/Show\\nLayer #',
				size: 'auto',
				color: self.rgb(255, 255, 255),
				bgcolor: self.rgb(0, 0, 0),
				latch: true
			},
			actions: [
				{
					action: 'hideLayer',
					options: {
						idx: 0
					}
				}
			],
			release_actions: [
				{
					action: 'unhideLayer',
					options: {
						idx: 0,
					}
				}
			]
		},

		{
			category: 'Layers',
			label: 'This button will select a Playlist.',
			bank: {
				style: 'text',
				text: 'Select\\nPlaylist',
				size: 'auto',
				color: self.rgb(255, 255, 255),
				bgcolor: self.rgb(0, 0, 0),
				latch: false
			},
			actions: [
				{
					action: 'selectPL',
					options: {
						pl: 0,
					}
				}
			]
		},

		{
			category: 'Layers',
			label: 'This button will trigger a Cue.',
			bank: {
				style: 'text',
				text: 'Trigger\\nCue',
				size: 'auto',
				color: self.rgb(255, 255, 255),
				bgcolor: self.rgb(0, 0, 0),
				latch: false
			},
			actions: [
				{
					action: 'triggerCue',
					options: {
						cue: 0,
					}
				}
			]
		},

		/**
		* Presets for Workspace
		*/

		{
			category: 'Workspace',
			label: 'This button will clear the Workspace.',
			bank: {
				style: 'text',
				text: 'Clear\\nWork\\nspace',
				size: 'auto',
				color: self.rgb(255, 255, 255),
				bgcolor: self.rgb(228, 0, 255),
				latch: false
			},
			actions: [
				{
					action: 'clearWs'
				}
			]
		},

		{
			category: 'Workspace',
			label: 'This button will mute the Workspace.',
			bank: {
				style: 'text',
				text: 'Mute\\nWork\\nspace',
				size: 'auto',
				color: self.rgb(255, 255, 255),
				bgcolor: self.rgb(0, 102, 255),
				latch: false
			},
			actions: [
				{
					action: 'muteWs'
				}
			]
		},

		{
			category: 'Workspace',
			label: 'This button will unmute the Workspace.',
			bank: {
				style: 'text',
				text: 'Unmute\\nWork\\nspace',
				size: 'auto',
				color: self.rgb(255, 255, 255),
				bgcolor: self.rgb(0, 153, 51),
				latch: false
			},
			actions: [
				{
					action: 'unmuteWs'
				}
			]
		},

		{
			category: 'Workspace',
			label: 'This button will mute and unmute the Workspace.',
			bank: {
				style: 'text',
				text: 'Mute\\nUnmute\\nWorknspace',
				size: 'auto',
				color: self.rgb(255, 255, 255),
				bgcolor: self.rgb(102, 0, 102),
				latch: true
			},
			actions: [
				{
					action: 'muteWs'
				}
			],
			release_actions: [
				{
					action: 'unmuteWs',
				}
			]
		},

	];
	self.setPresetDefinitions(presets);
}

/**
 * Populates the supported actions.
 */
instance.prototype.actions = function(system) {
	var self = this;

	self.setActions({
		'clearLayer': {
			label: 'Clear Layer',
			options: [
				{
					type: 'textinput',
					label: 'Layer ID',
					id: 'idx',
					default: '0'
				}
			]
		},

		'muteLayer': {
			label: 'Mute Layer',
			options: [
				{
					type: 'textinput',
					label: 'Layer ID',
					id: 'idx',
					default: '0'
				}
			]
		},

		'unmuteLayer': {
			label: 'Unmute Layer',
			options: [
				{
					type: 'textinput',
					label: 'Layer ID',
					id: 'idx',
					default: '0'
				}
			]
		},

		'selectLayer': {
			label: 'Select Layer',
			options: [
				{
					type: 'textinput',
					label: 'Layer ID',
					id: 'idx',
					default: '0'
				},
				{
					type: 'dropdown',
					label: 'Target Layer?',
					id: 'target',
					default: 'true',
					choices: [ { id:'true', label:'Yes' }, { id:'false', label:'No' } ]
				}
			]
		},

		'hideLayer': {
			label: 'Hide Layer',
			options: [
				{
					type: 'textinput',
					label: 'Layer ID',
					id: 'idx',
					default: '0'
				}
			]
		},

		'unhideLayer': {
			label: 'Unhide Layer',
			options: [
				{
					type: 'textinput',
					label: 'Layer ID',
					id: 'idx',
					default: '0'
				}
			]
		},

		'selectPL': {
			label: 'Select Playlist',
			options: [
				{
					type: 'textinput',
					label: 'Playlist ID',
					id: 'pl',
					default: '0'
				}
			]
		},

		'triggerCue': {
			label: 'Trigger Cue',
			options: [
				{
					type: 'textinput',
					label: 'Cue ID',
					id: 'cue',
					default: '0'
				}
			]
		},

		'triggerPL': {
			label: 'Trigger Playlist',
			options: [
				{
					type: 'textinput',
					label: 'Playlist ID',
					id: 'pl',
					default: '0'
				}
			]
		},

		'triggerCuePL': {
			label: 'Trigger Cue in Playlist',
			options: [
				{
					type: 'textinput',
					label: 'Playlist ID',
					id: 'pl',
					default: '0'
				},
				{
					type: 'textinput',
					label: 'Cue ID',
					id: 'cue',
					default: '0'
				}
			]
		},

		'triggerCuePLLay': {
			label: 'Trigger Cue in Playlist on Layer',
			options: [
				{
					type: 'textinput',
					label: 'Playlist ID',
					id: 'pl',
					default: '0'
				},
				{
					type: 'textinput',
					label: 'Cue ID',
					id: 'cue',
					default: '0'
				},
				{
					type: 'textinput',
					label: 'Layer ID',
					id: 'idx',
					default: '0'
				}
			]
		},

		'selectTargetSet': {
			label: 'Layer Target Set',
			options: [
				{
					type: 'textinput',
					label: 'Layer ID',
					id: 'idx',
					default: '0'
				},
				{
					type: 'textinput',
					label: 'Target Set',
					id: 'ts',
					default: ''
				},
			]
		},

		'layerPreset': {
			label: "Layer Preset",
			options: [
				{
					type: 'textinput',
					label: 'Layer ID',
					id: 'idx',
					default: '0'
				},
				{
					type: 'textinput',
					label: 'Preset Name',
					id: 'lpn',
					default: 'Preset 1'
				}
			]
		},

		'layerEffectPreset': {
			label: "Layer Effect Preset",
			options: [
				{
					type: 'textinput',
					label: 'Layer ID',
					id: 'idx',
					default: '0'
				},
				{
					type: 'textinput',
					label: 'Effect Preset Name',
					id: 'epn',
					default: ''
				}
			]
		},

		'opacity': {
			label: "Layer Opacity",
			options: [
				{
					type: 'textinput',
					label: 'Layer ID',
					id: 'idx',
					default: '0'
				},
				{
					type: 'textinput',
					label: 'Opacity (%)',
					id: 'opacity',
					default: '100',
					regex: self.REGEX_SIGNED_NUMBER
				}
			]
		},

		'trackMatte': {
			label: "Track Matte",
			options: [
				{
					type: 'textinput',
					label: 'Layer ID',
					id: 'idx',
					default: '1'
				},
				{
					type: 'dropdown',
					label: 'Track Matte',
					id: 'trackMatte',
					default: 'Alpha Matte',
					choices: [
						{ id:'Alpha Matte', label:'Alpha Matte' },
						{ id:'Luma Matte', label:'Luma Matte' },
						{ id:'White Matte', label:'White Matte' },
					]
				},
				{
					type: 'checkbox',
					label: 'Invert Matte',
					id: 'invert',
					default: false,
					tooltip: 'Check to invert the track matte'
				}
			]
		},

		'blendMode': {
			label: "Layer Blend Mode",
			options: [
				{
					type: 'textinput',
					label: 'Layer ID',
					id: 'idx',
					default: '0'
				},
				{
					type: 'dropdown',
					label: 'Blend Mode',
					id: 'blendMode',
					default: 'Normal',
					choices: [
						{ id:'Normal', label:'Normal' },
						{ id:'Dissolve', label:'Dissolve' },
						{ id:'Darken', label:'Darken' },
						{ id:'Multiply', label:'Multiply' },
						{ id:'Color Burn', label:'Color Burn' },
						{ id:'Linear Burn', label:'Linear Burn' },
						{ id:'Darker Color', label:'Darker Color' },
						{ id:'Lighten', label:'Lighten' },
						{ id:'Screen', label:'Screen' },
						{ id:'Color Dodge', label:'Color Dodge' },
						{ id:'Linear Dodge', label:'Linear Dodge' },
						{ id:'Lighter Color', label:'Lighter Color' },
						{ id:'Overlay', label:'Overlay' },
						{ id:'Soft Light', label:'Soft Light' },
						{ id:'Hard Light', label:'Hard Light' },
						{ id:'Vivid Light', label:'Vivid Light' },
						{ id:'Linear Light', label:'Linear Light' },
						{ id:'Pin Light', label:'Pin Light' },
						{ id:'Hard Mix', label:'Hard Mix' },
						{ id:'Difference', label:'Difference' },
						{ id:'Exclusion', label:'Exclusion' },
						{ id:'Subtract', label:'Subtract' },
						{ id:'Divide', label:'Divide' },
						{ id:'Hue', label:'Hue' },
						{ id:'Saturation', label:'Saturation' },
						{ id:'Color', label:'Color' },
						{ id:'Luminosity', label:'Luminosity' },
					]
				}
			]
		},

		'clearWs':    { label: 'Clear Workspace'},
		'hideWs':     { label: 'Hide Workspace'},
		'unhideWs':   { label: 'Unhide Workspace'},
		'muteWs':     { label: 'Mute Workspace'},
		'unmuteWs':   { label: 'Unmute Workspace'},

		'workspaceEffectPreset': {
			label: "Workspace Effect Preset",
			options: [
				{
					type: 'textinput',
					label: 'Effect Preset Name',
					id: 'epn',
					default: ''
				}
			]
		}

	});
};


/**
 * Retrieves information from PVP (GET) and returns a Promise.
 *
 * @param cmd           The command to execute
 * @param target        The target PVP instance
 * @return              A Promise that's resolved after the GET.
 */
instance.prototype.getRest = function(cmd, target) {
	var self = this;
	return self.doRest('GET', cmd, target, { });
};


/**
 * Commands PVP to do something (POST) and returns a Promise.
 *
 * @param cmd           The command to execute
 * @param target        The target PVP instance
 * @param body          The body of the POST; an object.
 * @return              A Promise that's resolved after the POST.
 */
instance.prototype.postRest = function(cmd, target, body) {
	var self = this;
	return self.doRest('POST', cmd, target, body);
};


/**
 * Performs the REST command against PVP, either GET or POST.
 *
 * @param method        Either GET or POST
 * @param cmd           The command to execute
 * @param target        The target PVP instance
 * @param body          If POST, an object containing the POST's body
 */
instance.prototype.doRest = function(method, cmd, target, body) {
	var self = this;
	var url  = self.makeUrl(cmd, target);

	return new Promise(function(resolve, reject) {

		function handleResponse(err, result) {
			if (err === null && typeof result === 'object' && result.response.statusCode === 200) {
				// A successful response from PVP.

				var objJson = {};
				if (result.data.length > 0) {
					try {
						objJson = JSON.parse(result.data.toString());
					} catch(error) { }
				}
				resolve([ target, objJson ]);

			} else {
				// Failure. Reject the promise.
				var message = 'Unknown error';

				if (result !== undefined) {
					if (result.response !== undefined) {
						message = result.response.statusCode + ': ' + result.response.statusMessage;
					} else if (result.error !== undefined) {
						// Get the error message from the object if present.
						message = result.error.code +': ' + result.error.message;
					}
				}

				reject([ target, message ]);
			}
		}

		var headers = { };

		if (target.auth !== '') {
			// Add the Authorization header to the REST request
			headers['Authorization'] = 'Bearer ' + target.auth;
		}

		// Required if the scheme is https since PVP used self-signed certificates that will otherwise be rejected.
		// See https://github.com/aacerox/node-rest-client/issues/162
		var extra_args = {
			connection : { rejectUnauthorized : false }
		};

		switch(method) {
			case 'POST':
				self.system.emit('rest', url, body, function(err, result) {
						handleResponse(err, result);
					}, headers, extra_args
				);
				break;

			case 'GET':
				self.system.emit('rest_get', url, function(err, result) {
						handleResponse(err, result);
					}, headers, extra_args
				);
				break;

			default:
				throw new Error('Invalid method');

		}

	});

};


/**
 * Runs the specified action.
 *
 * @param action
 */
instance.prototype.action = function(action) {
	var self = this;
	var opt = action.options;

	switch (action.action) {

		case 'clearLayer':
			self.doCommand('/clear/layer/' + opt.idx);
			return;

		case 'hideLayer':
			self.doCommand('/hide/layer/' + opt.idx);
			return;

		case 'muteLayer':
			self.doCommand('/mute/layer/' + opt.idx);
			return;

		case 'unmuteLayer':
			self.doCommand('/unmute/layer/' + opt.idx);
			return;

		case 'unhideLayer':
			self.doCommand('/unhide/layer/' + opt.idx);
			return;

		case 'selectLayer':
			// opt.target may not have been set originally. Assume true if not set
			var target = opt.target || 'true';
			self.doCommand('/select/layer/' + opt.idx + '?target=' + target);
			return;

		case 'selectPL':
			self.doCommand('/select/playlist/' + opt.pl);
			return;

		case 'triggerCue':
			self.doCommand('/trigger/cue/' + opt.cue);
			return;

		case 'triggerPL':
			self.doCommand('/trigger/playlist/' + opt.pl);
			return;

		case 'triggerCuePL':
			self.doCommand('/trigger/playlist/' + opt.pl + '/cue/' + opt.cue);
			return;

		case 'triggerCuePLLay':
			self.doCommand('/trigger/layer/' + opt.idx + '/playlist/' + opt.pl + '/cue/' + opt.cue);
			return;

		case 'clearWs':
			self.doCommand('/clear/workspace');
			return;

		case 'muteWs':
			self.doCommand('/mute/workspace');
			return;

		case 'unmuteWs':
			self.doCommand('/unmute/workspace');
			return;

		case 'hideWs':
			self.doCommand('/hide/workspace');
			return;

		case 'unhideWs':
			self.doCommand('/unhide/workspace');
			return;

		case 'selectTargetSet':
			self.doCommand('/targetSet/layer/' + opt.idx, { value: opt.ts });
			return;

		case 'layerPreset':
			self.doCommand('/layerPreset/layer/' + opt.idx, { value: opt.lpn });
			return;

		case 'layerEffectPreset':
			self.doCommand('/effectsPreset/layer/' + opt.idx, { value: opt.epn });
			if (opt.epn === '') {
				// This will clear all the effects from the layer
				self.doCommand('/effects/layer/' + opt.idx, { });
			}
			return;

		case 'workspaceEffectPreset':
			self.doCommand('/effectsPreset/workspace', { value: opt.epn });
			if (opt.epn === '') {
				// This will clear all the effects from the workspace
				self.doCommand('/effects/workspace/' + opt.idx, { });
			}
			return;

		case 'opacity':
			// Opacity needs to be posted as a double.

			if (opt.opacity[0] === '+' || opt.opacity[0] === '-') {
				// Relative opacity. First retrieve the layer's current opacity.

				// Do this command against the primary PVP and the backup PVP (if configured).
				for (var i=0; i<self.arrTargets.length; i++) {
					var target = self.arrTargets[i];

					self.getRest('/opacity/layer/'+opt.idx, target).then(function(arrResult) {
						var target = arrResult[0];

						// Convert the current opacity from a float to a percent, and add on the
						//  relative opacity.
						var opacity = parseFloat(arrResult[1].opacity.value) * 100;
						self.postRest('/opacity/layer/'+opt.idx, target,
							{ value: self.formatOpacity(opacity + parseInt(opt.opacity)) }
						).catch(function(arrResult) {
							self.log('error', arrResult[0].host + ':' + arrResult[0].port + ' - ' + arrResult[1]);
						})

					}).catch(function(arrResult) {
						self.log('error', arrResult[0].host + ':' + arrResult[0].port + ' - ' + arrResult[1]);
					});

				}

			} else {
				// Absolute opacity.
				self.doCommand('/opacity/layer/' + opt.idx, { value: self.formatOpacity(opt.opacity) });
			}
			return;

		case 'blendMode':
			self.doCommand('/blendMode/layer/' + opt.idx, { value: opt.blendMode });
			return;

		case 'trackMatte':
			// PVP 3.3.1: The API for layer blending (/blend/layer/) is either broken or incorrectly documented.
			//	This endpoint works but isn't officially documented anywhere.
			var trackMatte = {
				type: opt.trackMatte,
				base: { }
			};

			if (opt.trackMatte === 'Alpha Matte' || opt.trackMatte === 'Luma Matte') {
				// Only these track matte modes support the isInverted property. Add to object.
				trackMatte.base.isInverted = opt.invert;
			}

			self.doCommand('/layerBlend/layer/' + opt.idx, trackMatte);
			return;
	}

};


/**
 * Runs the [POST] command against PVP.
 *
 * @param cmd           The command the run. Must start with '/'
 * @param body          The body of the POST content
 */
instance.prototype.doCommand = function(cmd, body) {
	var self = this;
	body = body || {};

	// Do this command against the primary PVP and the backup PVP (if configured).
	for (var i=0; i<self.arrTargets.length; i++) {
		var target = self.arrTargets[i];

		self.postRest(cmd, target, body).then(function(objJson) {
			// Success
		}).catch(function(message) {
			self.log('error', target.host + ':' + target.port + ' - ' + message);
		});

	}

};


/**
 * Changes the opacity from a whole number (0 to 100) to a double (0.0 to 1.0).
 *
 * @param opacity       A whole number percentage from 0 to 100
 * @return              The opacity as a double
 */
instance.prototype.formatOpacity = function(opacity) {
	var self = this;

	// Force the percentage bounds and convert to a double.
	var opacity = Math.min(100, Math.max(0, parseInt(opacity)));
	return Math.round(opacity) / 100.0;

};


/**
 * Makes the complete URL.
 *
 * @param cmd           Must start with a /
 * @param target        The target PVP instance
 */
instance.prototype.makeUrl = function(cmd, target) {
	var self = this;

	if (cmd[0] !== '/') {
		throw new Error('cmd must start with a /');
	}

	return (target.https ? 'https://' : 'http://') + target.host + ':' + target.port + '/api/0' + cmd;

};


instance_skel.extendedBy(instance);
exports = module.exports = instance;
