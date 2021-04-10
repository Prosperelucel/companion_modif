var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');
var videohub = require('../bmd-videohub/index');
var debug;
var log;

/**
 * Companion instance class for the Blackmagic MultiView 16.
 *
 * @extends videohub
 * @version 1.0.0
 * @since 1.0.0
 * @author Keith Rocheck <keith.rocheck@gmail.com>
 */
class instance extends videohub {

	/**
	 * Create an instance of a videohub module.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @param {string} id - the instance ID
	 * @param {Object} config - saved user configuration parameters
	 * @since 1.0.0
	 */
	constructor(system, id, config) {
		super(system, id, config);

		this.inputCount = 16;
		this.outputCount = 16;
		this.monitoringCount = 0;
		this.serialCount = 0;

		this.CHOICES_LAYOUT = [
			{ id: '2x2', label: '2x2',  preset: '2x2' },
			{ id: '3x3', label: '3x3',  preset: '3x3' },
			{ id: '4x4', label: '4x4',  preset: '4x4' }
		];

		this.CHOICES_OUTPUTFORMAT = [
			{ id: '50i', label: '50i',  preset: '50i' },
			{ id: '50p', label: '50p',  preset: '50p' },
			{ id: '60i', label: '60i',  preset: '60i' },
			{ id: '60p', label: '60p',  preset: '60p' }
		];

		this.CHOICES_TRUEFALSE = [
			{ id: 'true',  label: 'True',  preset: 'On' },
			{ id: 'false', label: 'False', preset: 'Off' }
		];

		this.PRESETS_SETTIGS = [
			{ action: 'set_solo',          feedback: 'solo_enabled',   label: 'Display SOLO ',   choices: this.CHOICES_TRUEFALSE    },
			{ action: 'set_layout',        feedback: 'layout',         label: 'Layout ',         choices: this.CHOICES_LAYOUT       },
			{ action: 'set_format',        feedback: 'output_format',  label: 'Output Format: ', choices: this.CHOICES_OUTPUTFORMAT },
			{ action: 'set_border',        feedback: 'display_border', label: 'Borders ',        choices: this.CHOICES_TRUEFALSE    },
			{ action: 'set_labels',        feedback: 'display_labels', label: 'Labels ',         choices: this.CHOICES_TRUEFALSE    },
			{ action: 'set_meters',        feedback: 'display_meters', label: 'Audio Meters ',   choices: this.CHOICES_TRUEFALSE    },
			{ action: 'set_tally',         feedback: 'display_tally',  label: 'Tally ',          choices: this.CHOICES_TRUEFALSE    },
			{ action: 'set_widescreen_sd', feedback: 'widescreen_sd',  label: 'Widescreen SD ',  choices: this.CHOICES_TRUEFALSE    }
		];
	}

	/**
	 * Setup the actions.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @access public
	 * @since 1.0.0
	 */
	actions(system) {

		this.setupChoices();
		var actions = this.getActions();

		// Handle some renames needed from videohub

		actions['rename_destination'].label = 'Rename view';
		actions['rename_destination'].options[0].label = 'View';
		actions['rename_destination'].options[1].default = 'View name';

		actions['route'].options[1].label = 'View';

		actions['select_destination'].label = 'Select view';
		actions['select_destination'].options[0].label = 'View';

		actions['route_source'].label = 'Route source to selected view';

		//----

		actions['route_solo'] = {
			label: 'Select SOLO source',
			options: [
				{
					type: 'dropdown',
					label: 'Source',
					id: 'source',
					default: '0',
					choices: this.CHOICES_INPUTS
				}
			]
		};
		actions['route_audio'] = {
			label: 'Select AUDIO source',
			options: [
				{
					type: 'dropdown',
					label: 'Source',
					id: 'source',
					default: '0',
					choices: this.CHOICES_INPUTS
				}
			]
		};
		actions['set_solo'] = {
			label: 'Display SOLO',
			options: [
				{
					type: 'dropdown',
					label: 'Value',
					id: 'setting',
					default: 'true',
					choices: this.CHOICES_TRUEFALSE
				}
			]
		};
		actions['set_layout'] = {
			label: 'Set layout',
			options: [
				{
					type: 'dropdown',
					label: 'Layout',
					id: 'setting',
					default: '2x2',
					choices: this.CHOICES_LAYOUT
				}
			]
		};
		actions['set_format'] = {
			label: 'Set output format',
			options: [
				{
					type: 'dropdown',
					label: 'Format',
					id: 'setting',
					default: '60p',
					choices: this.CHOICES_OUTPUTFORMAT
				}
			]
		};
		actions['set_border'] = {
			label: 'Display border',
			options: [
				{
					type: 'dropdown',
					label: 'Value',
					id: 'setting',
					default: 'true',
					choices: this.CHOICES_TRUEFALSE
				}
			]
		};
		actions['set_labels'] = {
			label: 'Display labels',
			options: [
				{
					type: 'dropdown',
					label: 'Value',
					id: 'setting',
					default: 'true',
					choices: this.CHOICES_TRUEFALSE
				}
			]
		};
		actions['set_meters'] = {
			label: 'Display audio meters',
			options: [
				{
					type: 'dropdown',
					label: 'Value',
					id: 'setting',
					default: 'true',
					choices: this.CHOICES_TRUEFALSE
				}
			]
		};
		actions['set_tally'] = {
			label: 'Display SDI tally',
			options: [
				{
					type: 'dropdown',
					label: 'Value',
					id: 'setting',
					default: 'true',
					choices: this.CHOICES_TRUEFALSE
				}
			]
		};
		actions['set_widescreen_sd'] = {
			label: 'Widescreen SD enable',
			options: [
				{
					type: 'dropdown',
					label: 'Value',
					id: 'setting',
					default: 'true',
					choices: this.CHOICES_TRUEFALSE
				}
			]
		};

		this.setActions(actions);
	}

	/**
	 * Executes the provided action.
	 *
	 * @param {Object} action - the action to be executed
	 * @access public
	 * @since 1.0.0
	 */
	action(action) {
		super.action(action);
		var cmd;
		var opt = action.options;

		// Note that main routing/naming actions are handled upstream in videohub
		switch (action.action) {
			case 'route_solo':
				cmd = "VIDEO OUTPUT ROUTING:\n"+this.outputCount+" "+opt.source+"\n\n";
				break;
			case 'route_audio':
				cmd = "VIDEO OUTPUT ROUTING:\n"+(this.outputCount+1)+" "+opt.source+"\n\n";
				break;
			case 'set_solo':
				cmd = "CONFIGURATION:\n"+"Solo enabled: "+opt.setting+"\n\n";
				break;
			case 'set_layout':
				cmd = "CONFIGURATION:\n"+"Layout: "+opt.setting+"\n\n";
				break;
			case 'set_format':
				cmd = "CONFIGURATION:\n"+"Output format: "+opt.setting+"\n\n";
				break;
			case 'set_border':
				cmd = "CONFIGURATION:\n"+"Display border: "+opt.setting+"\n\n";
				break;
			case 'set_labels':
				cmd = "CONFIGURATION:\n"+"Display labels: "+opt.setting+"\n\n";
				break;
			case 'set_meters':
				cmd = "CONFIGURATION:\n"+"Display audio meters: "+opt.setting+"\n\n";
				break;
			case 'set_tally':
				cmd = "CONFIGURATION:\n"+"Display SDI tally: "+opt.setting+"\n\n";
				break;
			case 'set_widescreen_sd':
				cmd = "CONFIGURATION:\n"+"Widescreen SD enable: "+opt.setting+"\n\n";
				break;
		}

		if (cmd !== undefined) {

			if (this.socket !== undefined && this.socket.connected) {
				this.socket.send(cmd);
			}
			else {
				this.debug('Socket not connected :(');
			}
		}
	}

	/**
	 * Creates the configuration fields for web config.
	 *
	 * @returns {Array} the config fields
	 * @access public
	 * @since 1.0.0
	 */
	config_fields() {

		return [
			{
				type: 'text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This module will connect to any Blackmagic Design MultiView 16 Device.'
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'MultiView IP',
				width: 6,
				regex: this.REGEX_IP
			},
			{
				type: 'checkbox',
				id: 'take',
				label: 'Enable Take?',
				width: 6,
				default: false,
			}
		]
	}

	/**
	 * INTERNAL: returns the device config object.
	 *
	 * @returns {Object} the device config object
	 * @access protected
	 * @since 1.1.0
	 */
	getConfig() {

		if (this.configuration === undefined) {
			this.configuration = {
				layout:        '4x4',
				outputFormat:  '60i',
				soloEnabled:   'false',
				widescreenSD:  'true',
				displayBorder: 'true',
				displayLabels: 'true',
				displayMeters: 'true',
				displayTally:  'true'
			};
		}

		return this.configuration;
	}

	/**
	 * INTERNAL: returns the desired output object.
	 *
	 * @param {number} id - the output to fetch
	 * @returns {Object} the desired output object
	 * @access protected
	 * @since 1.1.0
	 */
	getOutput(id) {

		if (this.outputs[id] === undefined) {
			this.outputs[id] = {
				label:      (id+1) + ': View ' + (id+1),
				name:       'View ' + (id+1),
				route:      id,
				status:     'BNC',
				lock:       'U'
			};
		}

		return this.outputs[id];
	}

	/**
	 * INTERNAL: initialize feedbacks.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initFeedbacks() {
		// feedbacks
		var feedbacks = this.getFeedbacks();

		// Handle some renames needed from videohub

		feedbacks['input_bg'].label = 'Change background color by view';
		feedbacks['input_bg'].description = 'If the input specified is in use by the view specified, change background color of the bank';
		feedbacks['input_bg'].options[3].label = 'View';

		feedbacks['selected_destination'].label = 'Change background color by selected view';
		feedbacks['selected_destination'].description = 'If the view specified is selected, change background color of the bank';
		feedbacks['selected_destination'].options[2].label = 'View';

		feedbacks['selected_source'].label = 'Change background color by route to selected view';
		feedbacks['selected_source'].description = 'If the input specified is in use by the selected view, change background color of the bank';

		//----

		feedbacks['solo_source'] = {
			label: 'Change background color by solo source',
			description: 'If the input specified is the solo source, change background color of the bank',
			options: [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: this.rgb(0,0,0)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(255,255,255)
				},
				{
					type: 'dropdown',
					label: 'Input',
					id: 'input',
					default: '0',
					choices: this.CHOICES_INPUTS
				}
			],
			callback: (feedback, bank) => {
				if (this.getOutput(this.outputCount).route == parseInt(feedback.options.input)) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};

		feedbacks['audio_source'] = {
			label: 'Change background color by audio source',
			description: 'If the input specified is the audio source, change background color of the bank',
			options: [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: this.rgb(0,0,0)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(255,255,255)
				},
				{
					type: 'dropdown',
					label: 'Input',
					id: 'input',
					default: '0',
					choices: this.CHOICES_INPUTS
				}
			],
			callback: (feedback, bank) => {
				if (this.getOutput(this.outputCount+1).route == parseInt(feedback.options.input)) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};

		feedbacks['layout'] = {
			label: 'Change background color by layout',
			description: 'If the layout specified is in use, change background color of the bank',
			options: [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: this.rgb(0,0,0)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(255,255,0)
				},
				{
					type: 'dropdown',
					label: 'View',
					id: 'setting',
					default: '0',
					choices: this.CHOICES_LAYOUT
				}
			],
			callback: (feedback, bank) => {
				if (this.getConfig().layout == feedback.options.setting) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};

		feedbacks['output_format'] = {
			label: 'Change background color by output format',
			description: 'If the output format specified is in use, change background color of the bank',
			options: [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: this.rgb(0,0,0)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(255,255,0)
				},
				{
					type: 'dropdown',
					label: 'Format',
					id: 'setting',
					default: '0',
					choices: this.CHOICES_OUTPUTFORMAT
				}
			],
			callback: (feedback, bank) => {
				if (this.getConfig().outputFormat == feedback.options.setting) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};

		feedbacks['solo_enabled'] = {
			label: 'Change background color by solo enable state',
			description: 'If the solo enable state specified is active, change background color of the bank',
			options: [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: this.rgb(0,0,0)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(255,255,0)
				},
				{
					type: 'dropdown',
					label: 'Value',
					id: 'setting',
					default: '0',
					choices: this.CHOICES_TRUEFALSE
				}
			],
			callback: (feedback, bank) => {
				if (this.getConfig().soloEnabled == feedback.options.setting) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};

		feedbacks['widescreen_sd'] = {
			label: 'Change background color by widescreen SD enable state',
			description: 'If the widescreen SD enable state specified is active, change background color of the bank',
			options: [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: this.rgb(0,0,0)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(255,255,0)
				},
				{
					type: 'dropdown',
					label: 'Value',
					id: 'setting',
					default: '0',
					choices: this.CHOICES_TRUEFALSE
				}
			],
			callback: (feedback, bank) => {
				if (this.getConfig().widescreenSD == feedback.options.setting) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};

		feedbacks['display_border'] = {
			label: 'Change background color by display border state',
			description: 'If the display border state specified is active, change background color of the bank',
			options: [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: this.rgb(0,0,0)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(255,255,0)
				},
				{
					type: 'dropdown',
					label: 'Value',
					id: 'setting',
					default: '0',
					choices: this.CHOICES_TRUEFALSE
				}
			],
			callback: (feedback, bank) => {
				if (this.getConfig().displayBorder == feedback.options.setting) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};

		feedbacks['display_labels'] = {
			label: 'Change background color by display labels state',
			description: 'If the display labels state specified is active, change background color of the bank',
			options: [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: this.rgb(0,0,0)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(255,255,0)
				},
				{
					type: 'dropdown',
					label: 'Value',
					id: 'setting',
					default: '0',
					choices: this.CHOICES_TRUEFALSE
				}
			],
			callback: (feedback, bank) => {
				if (this.getConfig().displayLabels == feedback.options.setting) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};

		feedbacks['display_meters'] = {
			label: 'Change background color by display audio meters state',
			description: 'If the display audio meters state specified is active, change background color of the bank',
			options: [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: this.rgb(0,0,0)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(255,255,0)
				},
				{
					type: 'dropdown',
					label: 'Value',
					id: 'setting',
					default: '0',
					choices: this.CHOICES_TRUEFALSE
				}
			],
			callback: (feedback, bank) => {
				if (this.getConfig().displayMeters == feedback.options.setting) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};

		feedbacks['display_tally'] = {
			label: 'Change background color by display SDI tally state',
			description: 'If the display SDI tally state specified is active, change background color of the bank',
			options: [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: this.rgb(0,0,0)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(255,255,0)
				},
				{
					type: 'dropdown',
					label: 'Value',
					id: 'setting',
					default: '0',
					choices: this.CHOICES_TRUEFALSE
				}
			],
			callback: (feedback, bank) => {
				if (this.getConfig().displayTally == feedback.options.setting) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};

		this.setFeedbackDefinitions(feedbacks);
	}

	/**
	 * INTERNAL: initialize presets.
	 *
	 * @access protected
	 * @since 1.1.0
	 */
	initPresets () {
		var presets = [];

		presets.push({
			category: 'Actions\n(XY only)',
			label: 'Take',
			bank: {
				style: 'text',
				text: 'Take',
				size: '18',
				color: this.rgb(255,255,255),
				bgcolor: this.rgb(0,0,0)
			},
			feedbacks: [
				{
					type: 'take',
					options: {
						bg: this.rgb(255,0,0),
						fg: this.rgb(255,255,255)
					}
				}
			],
			actions: [
				{
					action: 'take'
				}
			]
		});

		presets.push({
			category: 'Actions\n(XY only)',
			label: 'Clear',
			bank: {
				style: 'text',
				text: 'Clear',
				size: '18',
				color: this.rgb(128,128,128),
				bgcolor: this.rgb(0,0,0)
			},
			feedbacks: [
				{
					type: 'take',
					options: {
						bg: this.rgb(0,0,0),
						fg: this.rgb(255,255,255)
					}
				}
			],
			actions: [
				{
					action: 'clear'
				}
			]
		});

		for (var type in this.PRESETS_SETTIGS) {
			for (var choice in this.PRESETS_SETTIGS[type].choices) {

				presets.push({
					category: 'Settings',
					label: this.PRESETS_SETTIGS[type].label + this.PRESETS_SETTIGS[type].choices[choice].preset,
					bank: {
						style: 'text',
						text: this.PRESETS_SETTIGS[type].label + this.PRESETS_SETTIGS[type].choices[choice].preset,
						size: '14',
						color: this.rgb(255,255,255),
						bgcolor: this.rgb(0,0,0)
					},
					feedbacks: [
						{
							type: this.PRESETS_SETTIGS[type].feedback,
							options: {
								bg: this.rgb(255,255,0),
								fg: this.rgb(0,0,0),
								setting: this.PRESETS_SETTIGS[type].choices[choice].id
							}
						}
					],
					actions: [
						{
							action: this.PRESETS_SETTIGS[type].action,
							options: {
								setting: this.PRESETS_SETTIGS[type].choices[choice].id
							}
						}
					]
				});
			}
		}

		for (var i = 0; i < this.outputCount; i++) {

			presets.push({
				category: 'Select View (X)',
				label: 'Selection view button for ' + this.getOutput(i).name,
				bank: {
					style: 'text',
					text: '$(videohub:output_' + (i+1) + ')',
					size: '18',
					color: this.rgb(255,255,255),
					bgcolor: this.rgb(0,0,0)
				},
				feedbacks: [
					{
						type: 'selected_destination',
						options: {
							bg: this.rgb(255,255,0),
							fg: this.rgb(0,0,0),
							output: i
						}
					},
					{
						type: 'take_tally_dest',
						options: {
							bg: this.rgb(255,0,0),
							fg: this.rgb(255,255,255),
							output: i
						}
					}
				],
				actions: [
					{
						action: 'select_destination',
						options: {
							destination: i
						}
					}
				]
			});
		}

		for (var i = 0; i < this.inputCount; i++) {

			presets.push({
				category: 'Route Source (Y)',
				label: 'Route ' + this.getInput(i).name + ' to selected view',
				bank: {
					style: 'text',
					text: '$(videohub:input_' + (i+1) + ')',
					size: '18',
					color: this.rgb(255,255,255),
					bgcolor: this.rgb(0,0,0)
				},
				feedbacks: [
					{
						type: 'selected_source',
						options: {
							bg: this.rgb(255,255,255),
							fg: this.rgb(0,0,0),
							input: i
						}
					},
					{
						type: 'take_tally_source',
						options: {
							bg: this.rgb(255,0,0),
							fg: this.rgb(255,255,255),
							input: i
						}
					}
				],
				actions: [
					{
						action: 'route_source',
						options: {
							source: i
						}
					}
				]
			});
		}

		for (var out = 0; out < this.outputCount; out++) {
			for (var i = 0; i < this.inputCount; i++) {

				presets.push({
					category: 'View ' + (out+1),
					label: 'View ' + (out+1) + ' button for ' + this.getInput(i).name,
					bank: {
						style: 'text',
						text: '$(videohub:input_' + (i+1) + ')',
						size: '18',
						color: this.rgb(255,255,255),
						bgcolor: this.rgb(0,0,0)
					},
					feedbacks: [
						{
							type: 'input_bg',
							options: {
								bg: this.rgb(255,255,0),
								fg: this.rgb(0,0,0),
								input: i,
								output: out
							}
						}
					],
					actions: [
						{
							action: 'route',
							options: {
								source: i,
								destination: out
							}
						}
					]
				});
			}
		}

		this.setPresetDefinitions(presets);
	}

	/**
	 * INTERNAL: initialize variables.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initVariables() {
		var variables = [];

		for (var i = 0; i < this.inputCount; i++) {

			if (this.getInput(i).status != 'None') {
				variables.push({
					label: 'Label of input ' + (i+1),
					name: 'input_' + (i+1)
				});

				this.setVariable('input_' + (i+1), this.getInput(i).name);
			}
		}

		for (var i = 0; i < this.outputCount; i++) {

			if (this.getOutput(i).status != 'None') {

				variables.push({
					label: 'Label of view ' + (i+1),
					name: 'output_' + (i+1)
				});

				this.setVariable('output_' + (i+1), this.getOutput(i).name);

				variables.push({
					label: 'Label of input routed to view ' + (i+1),
					name: 'output_' + (i+1) + '_input'
				});

				this.setVariable('output_' + (i+1) + '_input',  this.getInput(this.getOutput(i).route).name);
			}
		}

		variables.push({
			label: 'Label of SOLO',
			name: 'solo'
		});

		this.setVariable('solo', this.getOutput(this.outputCount).name);

		variables.push({
			label: 'Label of input routed to SOLO',
			name: 'solo_input'
		});

		this.setVariable('solo_input',  this.getInput(this.getOutput(this.outputCount).route).name);

		variables.push({
			label: 'Label of AUDIO',
			name: 'audio'
		});

		this.setVariable('audio', this.getOutput(this.outputCount+1).name);

		variables.push({
			label: 'Label of input routed to AUDIO',
			name: 'solo_audio'
		});

		this.setVariable('solo_audio',  this.getInput(this.getOutput(this.outputCount+1).route).name);

		variables.push({
			label: 'Label of selected view',
			name: 'selected_destination'
		});

		this.setVariable('selected_destination', this.getOutput(this.selected).name);

		variables.push({
			label: 'Label of input routed to selection',
			name: 'selected_source'
		});

		this.setVariable('selected_source', this.getInput(this.getOutput(this.selected).route).name);

		this.setVariableDefinitions(variables);
	}

	/**
	 * INTERNAL: Routes incoming data to the appropriate function for processing.
	 *
	 * @param {string} key - the command/data type being passed
	 * @param {Object} data - the collected data
	 * @access protected
	 * @since 1.0.0
	 */
	processVideohubInformation(key,data) {
		super.processVideohubInformation(key,data);

		// Note that main processing is handled upstream in videohub
		if (key == 'VIDEO OUTPUT ROUTING') {
			// Processing handled upstream
			this.checkFeedbacks('solo_source');
			this.checkFeedbacks('audio_source');
		}
		else if (key == 'MULTIVIEW DEVICE') {
			this.updateDevice(key,data);
			this.actions();
			this.initVariables();
			this.initFeedbacks();
			this.initPresets();
		}
		else if (key == 'CONFIGURATION') {
			this.updateDeviceConfig(key,data);
		}
		else {
			// TODO: find out more about the video hub from stuff that comes in here
		}
	}

	/**
	 * Process an updated configuration array.
	 *
	 * @param {Object} config - the new configuration
	 * @access public
	 * @since 1.0.0
	 */
	updateConfig(config) {
		var resetConnection = false;

		if (this.config.host != config.host)
		{
			resetConnection = true;
		}

		this.config = config;

		this.actions();
		this.initFeedbacks();
		this.initVariables();

		if (resetConnection === true || this.socket === undefined) {
			this.init_tcp();
		}
	}

	/**
	 * INTERNAL: Updates device data from the Videohub
	 *
	 * @param {string} labeltype - the command/data type being passed
	 * @param {Object} object - the collected data
	 * @access protected
	 * @since 1.0.0
	 */
	updateDevice(labeltype, object) {

		for (var key in object) {
			var parsethis = object[key];
			var a = parsethis.split(/: /);
			var attribute = a.shift();
			var value = a.join(" ");

			switch (attribute) {
				case 'Model name':
					this.deviceName = value;
					this.log('info', 'Connected to a ' + this.deviceName);
					break;
			}
		}
	}

	/**
	 * INTERNAL: Updates device data from the Videohub
	 *
	 * @param {string} labeltype - the command/data type being passed
	 * @param {Object} object - the collected data
	 * @access protected
	 * @since 1.0.0
	 */
	updateDeviceConfig(labeltype, object) {

		for (var key in object) {
			var parsethis = object[key];
			var a = parsethis.split(/: /);
			var attribute = a.shift();
			var value = a.join(" ");

			switch (attribute) {
				case 'Layout':
					this.getConfig().layout = value;
					this.checkFeedbacks('layout');
					break;
				case 'Output format':
					this.getConfig().outputFormat = value;
					this.checkFeedbacks('output_format');
					break;
				case 'Solo enabled':
					this.getConfig().soloEnabled = value;
					this.checkFeedbacks('solo_enabled');
					break;
				case 'Widescreen SD enable':
					this.getConfig().widescreenSD = value;
					this.checkFeedbacks('widescreen_sd');
					break;
				case 'Display border':
					this.getConfig().displayBorder = value;
					this.checkFeedbacks('display_border');
					break;
				case 'Display labels':
					this.getConfig().displayLabels = value;
					this.checkFeedbacks('display_labels');
					break;
				case 'Display audio meters':
					this.getConfig().displayMeters = value;
					this.checkFeedbacks('display_meters');
					break;
				case 'Display SDI tally':
					this.getConfig().displayTally = value;
					this.checkFeedbacks('display_tally');
					break;
			}
		}
	}
}

exports = module.exports = instance;
