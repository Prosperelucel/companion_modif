var instance_skel = require('../../instance_skel');
var debug;
var log;

/**
 * Companion instance class for the Sound/Video Devices PIXNET compatible devices.
 *
 * @extends instance_skel
 * @since 1.0.0
 * @author Phil ...
 * @author Keith Rocheck <keith.rocheck@gmail.com>
 */
class instance extends instance_skel {

	/**
	 * Create an instance of a PIXNET module.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @param {string} id - the instance ID
	 * @param {Object} config - saved user configuration parameters
	 * @since 1.0.0
	 */
	constructor(system, id, config) {
		super(system, id, config);

		this.currentModel    = {};
		this.currentInterval = {};
		this.states          = {};
		this.pollingActive   = 0;
		this.errorCount      = 0;
		this.testInterval    = 10000;
		this.pollUrl         = "";
		this.testUrl         = "";

		this.CONFIG_MODEL = {
			250: { id: 250, label: 'Video Devices PIX 250i', type: 'video', ports: ['TC', 'SYNC', 'LINE', 'AES', 'SDI', 'HDMI'] },
			260: { id: 260, label: 'Video Devices PIX 260i', type: 'video', ports: ['TC', 'SYNC', 'LINE', 'AES', 'DANTE', 'SDI', 'HDMI'] },
			270: { id: 270, label: 'Video Devices PIX 270i', type: 'video', ports: ['TC', 'SYNC', 'LINE', 'AES', 'DANTE', 'MADI', 'SDI', 'HDMI'] },
			970: { id: 970, label: 'Sound Devices 970',      type: 'audio', ports: ['TC', 'SYNC', 'LINE', 'AES', 'DANTE', 'MADI'] }
		};

		this.CHOICES_ACTION = [
			{ id: 'Accept', label: 'Accept' },
			{ id: 'Reject', label: 'Reject' }
		];

		this.CHOICES_DRIVELIST = [];

		this.CHOICES_DRIVEMODE = [
			{ id: 'Off',                         label: 'Off' },
			{ id: 'Record',                      label: 'Record' },
			{ id: 'Ethernet File Transfer',      label: 'Ethernet File Transfer' },
			{ id: 'Switch to Network upon Full', label: 'Switch to Network upon Full' }
		];

		this.CHOICES_FEEDBACK = [
			{ id: '0', label: 'No' },
			{ id: '1', label: 'Yes' }
		];

		this.CHOICES_KEYCODE = [
			{ id: '0x01000080', label: 'Play',   icon: '&#9205;' },
			{ id: '0x01000081', label: 'Stop',   icon: '&#9209;' },
			{ id: '0x01000082', label: 'RW',     icon: '&#9194;' },
			{ id: '0x01000083', label: 'FF',     icon: '&#9193;' },
			{ id: '0x01000084', label: 'Record', icon: '&#9210;' },
			{ id: '0x0100004e', label: 'Audio' },
			{ id: '0x0100004f', label: 'LCD' },
			{ id: '0x01000050', label: 'Files' },
			{ id: '0x01000051', label: 'Menu' },
			{ id: '0x01000004', label: 'Enter' }
		];

		this.CHOICES_KEYEVENTTYPE = [
			{ id: 'KeyPressAndRelease', label: 'Press &amp; Release' },
			{ id: 'KeyPress',           label: 'Press' },
			{ id: 'KeyRelease',         label: 'Release' }
		];

		this.CHOICES_MODEL = [
			{ id: '250', label: 'Video Devices PIX 250i' },
			{ id: '260', label: 'Video Devices PIX 260i' },
			{ id: '270', label: 'Video Devices PIX 270i' },
			{ id: '970', label: 'Sound Devices 970' }
		];

		this.CHOICES_PLAYBACKSPEED = [
			{ id: 'PlayX2',  label: 'x2' },
			{ id: 'PlayX16', label: 'x16' }
		];

		this.CHOICES_TRANSPORTSTATE = [
			{ id: 'play',  label: 'Play', icon: '&#9205;' },
			{ id: 'stop',  label: 'Stop', icon: '&#9209;' },
			{ id: 'rec',   label: 'Rec',  icon: '&#9210;' }
		];

		this.actions(); // export actions
	}

	/**
	 * Setup the actions.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @public
	 * @since 1.0.0
	 */
	actions(system) {

		if ( this.currentModel == undefined ) {
			this.currentModel = this.CONFIG_MODEL[270];
			this.log('error', 'No model selected.  Setting as PIX 270i temporarily.');
		}

		this.setActions({
			'play':              { label:   'Play' },
			'stop':              { label:   'Stop' },
			'rec':               { label:   'Record' },
			'fastForward':       {
				label:   'Fast Forward',
				tooltip: 'This command will have no effect when the transport state is \'Stop\' or \'Record\'.',
				options: [
					{
						type:    'dropdown',
						label:   'Speed',
						id:      'playbackSpeed',
						choices: this.CHOICES_PLAYBACKSPEED,
						default: 'PlayX2'
					}
				]
			},
			'fastReverse':       {
				label:   'Fast Reverse',
				tooltip: 'This command will have no effect when the transport state is \'Stop\' or \'Record\'.',
				options: [
					{
						type:    'dropdown',
						label:   'Speed',
						id:      'playbackSpeed',
						choices: this.CHOICES_PLAYBACKSPEED,
						default: 'PlayX2'
					}
				]
			},
			'falseTake':         {
				label:   'False Take',
				tooltip: 'This command will trigger an OK/Cancel dialog.  Use a \'Close Message Box\' action to complete.'
			},
			'jamReceivedTC':     { label:   'Jam Received TC' },
			'jamTimeOfDay':      { label:   'Jam Time-of-Day' },
			'keyPress':          {
				label:   'Key Press',
				options: [
					{
						type:    'dropdown',
						label:   'Key',
						id:      'keyCode',
						choices: this.CHOICES_KEYCODE,
						default: '0x01000051'
					},
					{
						type:    'dropdown',
						label:   'Event Type',
						id:      'keyEventType',
						choices: this.CHOICES_KEYEVENTTYPE,
						default: 'KeyPressAndRelease'
					}
				]
			},
			'closeMessageBox':   {
				label:   'Close Message Box',
				options: [
					{
						type:    'textinput',
						label:   'Button Text to Push (exactly as it appears on the LCD)',
						id:      'buttonText',
						regex:   '/^[a-zA-Z0-9_\-\s]*$/',
						default: 'OK'
					}
				]
			},
			'setDialogDismiss':  {
				label:   'Set Dialog Dismiss',
				options: [
					{
						type:    'textinput',
						label:   'Time (0 disables automatic dismissal)',
						id:      'time',
						regex:   '/^([0]?[0-9]|[1-5][0-9]|60)$/',
						default: '2'
					},
					{
						type:    'dropdown',
						label:   'Action',
						id:      'action',
						choices: this.CHOICES_ACTION,
						default: 'Accept'
					}
				]
			},
			'formatAllDrives':   {
				label:   'Format All Drives',
				options: [
					{
						type:    'textinput',
						label:   'Label',
						id:      'label',
						regex:   '/^[a-zA-Z0-9_\-]*$/',
						default: 'PIX'
					}
				]
			},
			'createSoundReport': { label:   'Create Sound Report' },
			'setDriveMode':      {
				label:   'Set Drive Mode',
				options: [
					{
						type:    'dropdown',
						label:   'Drive',
						id:      'id',
						choices: this.CHOICES_DRIVELIST,
						default: '1'
					},
					{
						type:    'dropdown',
						label:   'Mode',
						id:      'mode',
						choices: this.CHOICES_DRIVEMODE,
						default: 'Record'
					}
				]
			}
		});
	}

	/**
	 * Executes the provided action.
	 *
	 * @param {Object} action - the action to be executed
	 * @public
	 * @since 1.0.0
	 */
	action(action) {
		var opt = action.options
		var cmd;

		switch (action.action) {
			case 'play':
				cmd = 'settransport/play';
				break;
			case 'stop':
				cmd = 'settransport/stop';
				break;
			case 'rec':
				cmd = 'settransport/rec';
				break;
			case 'fastForward':
				cmd = 'invoke/RemoteApi/fastForwardPlay(PlaybackSpeed)/1/10,' + opt.playbackSpeed;
				break;
			case 'fastReverse':
				cmd = 'invoke/RemoteApi/fastReversePlay(PlaybackSpeed)/1/10,' + opt.playbackSpeed;
				break;
			case 'falseTake':
				cmd = 'invoke/RemoteApi/falseTake()';
				break;
			case 'jamReceivedTC':
				cmd = 'invoke/RemoteApi/jamReceivedTc()';
				break;
			case 'jamTimeOfDay':
				cmd = 'invoke/RemoteApi/jamTimeOfDay()';
				break;
			case 'keyPress':
				cmd = 'invoke/RemoteApi/simulateKey(int,KeyEventType)/2/5,' + opt.keyCode + '/10,' + opt.keyEventType;
				break;
			case 'closeMessageBox':
				cmd = 'invoke/RemoteApi/closeMessageBox(QString)/1/10,' + opt.buttonText;
				break;
			case 'setDialogDismiss':
				cmd = 'invoke/RemoteApi/setAutoDismiss(int,DialogControl)/2/5,' + opt.time + '/10,' + opt.action;
				break;
			case 'formatAllDrives':
				cmd = 'invoke/RemoteApi/formatAllDrives(QString,QString)/2/10,' + opt.label + '/10,EXFAT';
				break;
			case 'createSoundReport':
				cmd = 'invoke/RemoteApi/createSoundReportCurrentReel()';
				break;
			case 'setDriveMode':
				cmd = 'setsetting/RecordToDrive' + opt.id + '=' + opt.mode;
				break;
		}

		if (cmd !== undefined && this.config.host !== undefined) {
			cmd = encodeURI('http://' + this.config.host + '/sounddevices/' + cmd);

			//this.system.emit('rest', cmd, {}, this.processResult.bind(this));

			this.system.emit('rest', cmd, {}, (err, result) => {

				if (err !== null) {
					this.log('error', 'HTTP POST Request failed (' + result.error.code + ')');
					this.status(this.STATUS_ERROR, result.error.code);
				}
				else {
					this.status(this.STATUS_OK);
				}
			});
		}
	}

	/**
	 * Creates the configuration fields for web config.
	 *
	 * @returns {Array} the config fields
	 * @public
	 * @since 1.0.0
	 */
	config_fields() {

		return [
			{
				type:    'textinput',
				id:      'host',
				label:   'Target IP',
				tooltip: 'The IP of the device',
				width:   6,
				regex:   this.REGEX_IP
			},
			{
				type:    'dropdown',
				id:      'model',
				label:   'Model',
				tooltip: 'The make/model of the device',
				choices: this.CHOICES_MODEL,
				default: 270
			}/**,
			{
				type:    'text',
				id:      'info',
				width:   12,
				label:   'Information',
				value:   'Enabling feedback can disrupt other PIXNET sessions.  Do not enable if you plan to also control the device via a web browser.  The recommended polling interval from Sound Devices is 200ms.  Companion default is 500ms to reduce overhead.  Shorter polling intervals could cause delays in other actions and feedbacks being processed.'
			},
			{
				type:    'dropdown',
				id:      'feedback',
				label:   'Enable Feedback?',
				tooltip: 'Determines if Companion will regularly request status from the device',
				choices: this.CHOICES_FEEDBACK,
				default: '0'
			},
			{
				type:    'textinput',
				id:      'pollInterval',
				label:   'Polling Interval (in ms)',
				tooltip: 'Sets the inerval at which Companion will check for status updates',
				width:   6,
				regex:   '/^([1-8][0-9]{2}|9[0-8][0-9]|99[0-9]|[1-4][0-9]{3}|5000)$/',
				default: '500'
			}**/
		]
	}

	/**
	 * Clean up the instance before it is destroyed.
	 *
	 * @public
	 * @since 1.0.0
	 */
	destroy() {
		debug("destory", this.id);
		//this.system.emit('rest_poll_destroy', this.id);
	}

	/**
	 * Main initialization function called once the module
	 * is OK to start doing things.
	 *
	 * @public
	 * @since 1.0.0
	 */
	init() {
		this.processConfig();

		debug = this.debug;
		log   = this.log;
	}

	/**
	 * INTERNAL: initialize feedbacks
	 *
	 * @private
	 * @since 1.0.0
	 */
	initFeedbacks() {
		// feedbacks
		var feedbacks = {};
		/**
		feedbacks['transport'] = {
			label:       'Change colors from transport state',
			description: 'When the device is in the selected transport state, change colors of the bank',
			options:     [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: this.rgb(255,255,255)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(0,255,0)
				},
				{
					 type: 'dropdown',
					 label: 'Input',
					 id: 'state',
					 default: 'play',
					 choices: this.CHOICES_TRANSPORTSTATE
				}
			],
			callback: (feedback, bank) => {
				if (feedback.options.state == this.states['transport']) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};
		feedbacks['drive_mode'] = {
			label:       'Change colors from drive',
			description: 'When a drive is in a specific state, change colors of the bank',
			options:     [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: this.rgb(255,255,255)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(0,0,255)
				},
				{
					 type: 'dropdown',
					 label: 'Drive',
					 id: 'drive',
					 default: '1',
					 choices: this.CHOICES_DRIVELIST
				},
				{
					 type: 'dropdown',
					 label: 'Mode',
					 id: 'mode',
					 default: 'Record',
					 choices: this.CHOICES_DRIVEMODE
				}
			],
			callback: (feedback, bank) => {
				if (feedback.options.state == this.states['drive_mode_'+feedback.options.drive]) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};

		this.setFeedbackDefinitions(feedbacks);**/
	}

	/**
	 * INTERNAL: initialize presets
	 *
	 * @private
	 * @since 1.0.0
	 */
	initPresets() {
		var presets = [];

		// Downstream keyers
		for (var i in this.CHOICES_KEYCODE) {
			presets.push({
				category: 'Front Panel Buttons',
				label: this.CHOICES_KEYCODE[i].label,
				bank: {
					style: 'text',
					text: this.CHOICES_KEYCODE[i].label,
					size: '18',
					color: this.rgb(255,255,255),
					bgcolor: 0
				},
				/**feedbacks: [
					{
						type: 'keyState',
						options: {
							bg: this.rgb(255,0,0),
							fg: this.rgb(255,255,255),
							key: this.CHOICES_KEYCODE[i].id
						}
					}
				],**/
				actions: [
					{
						action: 'keyPress',
						options: {
							keyCode: this.CHOICES_KEYCODE[i].id,
							keyEventType: 'KeyPress'
						}
					}
				],
				release_actions: [
					{
						action: 'keyPress',
						options: {
							keyCode: this.CHOICES_KEYCODE[i].id,
							keyEventType: 'KeyRelease'
						}
					}
				]
			});
		}

		this.setPresetDefinitions(presets);
	}

	/**
	 * INTERNAL: initialize variables
	 *
	 * @private
	 * @since 1.0.0
	 */
	initVariables() {
		// nothing here yet
	}

	/**
	 * INTERNAL: process the configuration data and setup the module.
	 * Abstracted due to different call points needed within the class.
	 *
	 * @private
	 * @since 1.0.0
	 */
	processConfig() {
		//this.system.emit('rest_poll_destroy', this.id);

		this.pollUrl         = encodeURI('http://' + this.config.host + '/sounddevices/update');
		/* Test URL cannot be changed without also updating processResult() to account for different test response */
		this.testUrl         = encodeURI('http://' + this.config.host + '/sounddevices/devtbl');

		this.status(this.STATUS_UNKNOWN);

		this.currentInterval = {};

		if ( this.CONFIG_MODEL[ this.config.model ] !== undefined ) {
			this.currentModel = this.CONFIG_MODEL[ this.config.model ];
		}
		else {
			this.currentModel = this.CONFIG_MODEL[270];
			this.log('error', 'No model selected.  Setting as PIX 270i temporarily.');
		}

		this.CHOICES_DRIVELIST = [{ id: '1', label: 'D1' },{ id: '2', label: 'D2' }];

		if ( this.currentModel.id > 250 ) {
			this.CHOICES_DRIVELIST.push( { id: '3', label: 'D3' } );
			this.CHOICES_DRIVELIST.push( { id: '4', label: 'D4' } );
		}

		this.initPresets();

		// technically should be able to test pollInterval > 0 since its REGEX enforced, but meh
		/**if (this.config.host !== undefined && this.config.feedback == 1 && this.config.pollInterval >= 100 && this.config.pollInterval <= 5000 ) {
			this.initFeedbacks();
			this.initVariables();
			this.setupConnectivtyTester();
		}
		else {
			this.status(this.STATUS_OK);
		}*/
	}

	/**
	 * INTERNAL: Callback for REST calls to process the return
	 *
	 * @param {?boolean} err - null if a normal result, true if there was an error
	 * @param {Object} result - data: & response: if normal; error: if error
	 * @private
	 * @since 1.0.0
	 */
	processResult(err, result) {

		if (err !== null) {
			if ( result.error.code !== undefined ) {
				this.log('error', result.error.code);
			}
			else {
				this.log('error', "general HTTP failure");
			}

			this.status(this.STATUS_ERROR, 'NOT CONNECTED');

			if (this.pollingActive === 1) {
				this.errorCount++;
			}

			if (this.errorCount > 10) {
				this.setupConnectivtyTester();
			}
		}
		else {
			this.status(this.STATUS_OK);

			if ( Array.isArray(result) ) {
				for (var key in result) {
					switch(key) {
						case 'DevTable':
							this.setupPolling();
							break;
						case 'Transpoprt':
							this.states['transport'] = result[key];
							this.checkFeedbacks('transport');
							break;
						case 'FileName':
							break;
					}
				}
			}

		}
	}

	/**
	 * INTERNAL: uses rest_poll to create an interval to, effectively, ping
	 * the device to see if its there.  This uses a longer interval so we're
	 * not firing a ton of poll calls to a non-responsive device.
	 *
	 * @private
	 * @since 1.0.0
	 */
	setupConnectivtyTester() {

		this.errorCount    = 0;
		this.pollingActive = 0;
		this.system.emit('rest_poll_destroy', this.id);

		this.system.emit(
			'rest_poll',
			this.id,
			this.testInterval,
			this.testUrl,
			{},
			function (err, pollInstance) {
				if (pollInstance.id !== undefined) {
					this.currentInterval = pollInstance;
				}
				else {
					this.currentInterval = {};
					this.status(this.STATUS_ERROR, 'Connectivity Failed');
					this.log('error', 'Failed to create connectivity interval timer');
				}
			},
			this.processResult.bind(this)
		);
	}

	/**
	 * INTERNAL: uses rest_poll to create an interval to run the active polling.
	 *
	 * @private
	 * @since 1.0.0
	 */
	setupPolling() {
		this.errorCount = 0;
		this.system.emit('rest_poll_destroy', this.id);
		this.syncState();

		this.system.emit(
			'rest_poll',
			this.id,
			parseInt(this.config.pollInterval),
			this.pollUrl,
			{},
			function (err, pollInstance) {
				if (pollInstance.id !== undefined) {
					this.currentInterval = pollInstance;
					this.pollingActive = 1;
				}
				else {
					this.currentInterval = {};
					this.status(this.STATUS_ERROR, 'Polling Failed');
					this.log('error', 'Failed to create polling interval timer');
				}
			},
			this.processResult.bind(this)
		);
	}

	/**
	 * INTERNAL: prior to starting active polling this will fire a bunch of rest
	 * calls to get the feedback up to date.
	 *
	 * @private
	 * @since 1.0.0
	 */
	syncState() {
		var queries = [
			'transport',
			'getsettings/RecordToDrive1,RecordToDrive2,RecordToDrive3,RecordToDive4'
		];

		for (var key in queries) {
			var cmd = encodeURI('http://' + this.config.host + '/sounddevices/' + queries[key]);

			this.system.emit('rest', cmd, {}, this.processResult.bind(this));
		}
	}

	/**
	 * Process an updated configuration array
	 *
	 * @param {Object} config - the new configuration
	 * @public
	 * @since 1.0.0
	 */
	updateConfig(config) {
		this.config = config;

		this.processConfig();
	}
}

exports = module.exports = instance;
