var instance_skel = require('../../instance_skel');
var debug;
var log;

/**
 * Companion instance class for JustMacros.
 *
 * @extends instance_skel
 * @since 1.0.0
 * @author Keith Rocheck <keith.rocheck@gmail.com>
 */
class instance extends instance_skel {

	/**
	 * Create an instance of a JustMacros module.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @param {string} id - the instance ID
	 * @param {Object} config - saved user configuration parameters
	 * @since 1.0.0
	 */
	constructor(system, id, config) {
		super(system, id, config);
		var self = this;
		self.port = 39812;

		// super-constructor
		//instance_skel.apply(this, arguments);
		self.actions(); // export actions
		//return self;
	}

	/**
	 * Setup the actions.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @access public
	 * @since 1.0.0
	 */
	actions(system) {
		var self = this;
		self.system.emit('instance_actions', self.id, {
			'luaFunc': {
				label: 'Execute Function',
				options: [
					{
						type:  'textinput',
						label: 'Function Name',
						id:    'func',
						regex: '/^[A-Za-z0-9_\-]*$/'
					},
					{
						type:  'textinput',
						label: 'Parameters (comma separated)',
						id:    'params'
					}
				]
			},
			'luaScript': {
				label: 'Execute Script',
				options: [
					{
						type:  'textinput',
						label: 'Script Name',
						id:    'script',
						regex: '/^[A-Za-z0-9_\-]*$/'
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
		var self = this;
		var cmd  = "";
		var base = 'http://' + self.config.host + ':' + self.port + '/EXECUTELUA:';

		if (action.action == 'luaFunc') {
			if ( action.options.func != '' ) {
				cmd = base + action.options.func + '(' + action.options.params + ');';
			}
		}
		else if (action.action == 'luaScript') {
			if ( action.options.script != '' ) {
				cmd = base + 'ScriptExecute("' + action.options.script + '");';
			}
		}

		if (cmd.length > 0) {
			self.system.emit('rest_get', cmd, function (err, result) {
				if (err !== null) {
					self.log('error', 'LUA GET failed (' + result.error.code + ')');
					self.status(self.STATUS_ERROR, result.error.code);
				}
				else {
					self.status(self.STATUS_OK);
				}
			});
		}
		else {
			self.log('error', 'LUA request not sent.  Script/Function field is incomplete.');
		}
	}

	/**
	 * Creates the configuration fields for web config.
	 *
	 * @returns {Array} the config fields
	 * @access public
	 * @since 1.0.0
	 */
	config_fields () {
		var self = this;
		return [
			{
				type:    'textinput',
				id:      'host',
				label:   'Target IP',
				tooltip: 'The IP of the JustMacros instance',
				width:   6,
				regex:   self.REGEX_IP
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
		var self = this;
		debug("destroy");
	}

	/**
	 * Main initialization function called once the module
	 * is OK to start doing things.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	init() {
		var self = this;

		self.status(self.STATE_OK);

		debug = self.debug;
		log = self.log;
	}

	/**
	 * Process an updated configuration array
	 *
	 * @param {Object} config - the new configuration
	 * @access public
	 * @since 1.0.0
	 */
	updateConfig(config) {
		var self = this;

		self.config = config;
	}
}

//instance_skel.extendedBy(instance);
exports = module.exports = instance;
