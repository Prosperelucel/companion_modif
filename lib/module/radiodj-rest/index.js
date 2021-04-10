var instance_skel = require('../../instance_skel');
var debug;
var log;

/**
 * Companion instance class for the RadioDJ REST API.
 *
 * @extends instance_skel
 * @version 1.0.0
 * @since 1.0.0
 * @author Keith Rocheck <keith.rocheck@gmail.com>
 */
class instance extends instance_skel {

	/**
	 * Create an instance of a RadioDJ module.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @param {string} id - the instance ID
	 * @param {Object} config - saved user configuration parameters
	 * @since 1.0.0
	 */
	constructor(system, id, config) {
		super(system, id, config);

		this.CHOICES_DISABLE = [
			{ id: 0, label: 'Disable' },
			{ id: 1, label: 'Enable' }
		];

		this.CHOICES_PAUSE = [
			{ id: 0, label: 'Unpause' },
			{ id: 1, label: 'Pause' }
		];

		this.actions(); // export actions
	}

	/**
	 * Setup the actions.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @access public
	 * @since 1.0.0
	 */
	actions(system) {

		this.setActions({
			'PlayPlaylistTrack': {
				label: 'Play playlist track',
				options: [
					{
						type:    'textinput',
						id:      'arg',
						label:   'Track number (zero based)',
						default: 0,
						regex:   this.REGEX_NUMBER
					}
				]
			},
			'RemovePlaylistTrack': {
				label: 'Remove playlist track',
				options: [
					{
						type:    'textinput',
						id:      'arg',
						label:   'Track number (zero based)',
						default: 0,
						regex:   this.REGEX_NUMBER
					}
				]
			},
			'StopPlayer': {
				label: 'Stop player'
			},
			'PausePlayer': {
				label: 'Set pause state',
				options: [
					{
						 type:   'dropdown',
						 label:  'State',
						 id:     'arg',
						 default: 1,
						 choices: this.CHOICES_PAUSE
					}
				]
			},
			'RestartPlayer': {
				label: 'Restart player'
			},
			'PlayFromIntro': {
				label: 'Play from intro'
			},
			'ClearPlaylist': {
				label: 'Clear playlist'
			},
			'EnableAutoDJ': {
				label: 'Set Auto DJ state',
				options: [
					{
						 type:   'dropdown',
						 label:  'State',
						 id:     'arg',
						 default: 1,
						 choices: this.CHOICES_DISABLE
					}
				]
			},
			'EnableAssisted': {
				label: 'Set Assisted state',
				options: [
					{
						 type:   'dropdown',
						 label:  'State',
						 id:     'arg',
						 default: 1,
						 choices: this.CHOICES_DISABLE
					}
				]
			},
			'EnableEvents': {
				label: 'Set event run state',
				options: [
					{
						 type:   'dropdown',
						 label:  'State',
						 id:     'arg',
						 default: 1,
						 choices: this.CHOICES_DISABLE
					}
				]
			},
			'RefreshEvents': {
				label: 'Refresh events'
			},
			'EnableInput': {
				label: 'Set input state',
				options: [
					{
						 type:   'dropdown',
						 label:  'State',
						 id:     'arg',
						 default: 1,
						 choices: this.CHOICES_DISABLE
					}
				]
			},
			'PlaycartByNumber': {
				label: 'Play cart by number',
				options: [
					{
						type:    'textinput',
						id:      'arg',
						label:   'Cart #',
						default: 1,
						regex:   this.REGEX_NUMBER
					}
				]
			},
			'ShowMessage': {
				label: 'Display message in RadioDJ',
				options: [
					{
						type:    'textinput',
						id:      'arg',
						label:   'Message Text',
						default: 1,
						regex:   this.REGEX_SOMETHING
					}
				]
			}
		});
	}

	/**
	 * Executes the provided action.
	 *
	 * @param {Object} action - the action to be executed
	 * @access public
	 * @since 1.0.0
	 */
	action(action) {
		var id = action.action;
		var cmd;
		var opt = action.options;

		cmd = 'http://' + this.config.host + ':' + this.config.port + '/opt?auth=' + this.config.password + '&command=' + id;

		cmd = encodeURI(cmd);

		switch (action.action) {
			case 'PlayPlaylistTrack':
			case 'RemovePlaylistTrack':
			case 'PausePlayer':
			case 'EnableAutoDJ':
			case 'EnableAssisted':
			case 'EnableEvents':
			case 'EnableInput':
			case 'PlaycartByNumber':
			case 'ShowMessage':
				cmd += '&arg=' + encodeURIComponent(action.options.arg);
				break;
		}

		this.system.emit('rest_get', cmd, (err, result) => {
			if (err !== null) {
				this.log('error', 'HTTP GET Request failed (' + result.error.code + ')');
				this.status(this.STATUS_ERROR, result.error.code);
			}
			else {
				this.status(this.STATUS_OK);
			}
		});
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
				type:    'text',
				id:      'info',
				width:   12,
				label:   'Information',
				value:   'Make sure the \'Rest Server\' plugin is enabled and functioning properly.'
			},
			{
				type:    'textinput',
				id:      'host',
				label:   'Target IP',
				width:   6,
				default: '127.0.0.1',
				regex:   this.REGEX_IP
			},
			{
				type:    'textinput',
				id:      'port',
				label:   'Target Port',
				width:   4,
				default: '8080',
				regex:   this.REGEX_PORT
			},
			{
				type:    'textinput',
				id:      'password',
				label:   'Password',
				width:   6,
				default: 'changeme'
			}
		]
	}

	/**
	 * Clean up the instance before it is destroyed.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	destroy() {
		debug("destroy", this.id);
	}

	/**
	 * Main initialization function called once the module
	 * is OK to start doing things.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	init() {
		debug = this.debug;
		log = this.log;

		this.status(this.STATUS_UNKNOWN);
	}

	/**
	 * Process an updated configuration array.
	 *
	 * @param {Object} config - the new configuration
	 * @access public
	 * @since 1.0.0
	 */
	updateConfig(config) {
		this.config = config;
	}
}

exports = module.exports = instance;