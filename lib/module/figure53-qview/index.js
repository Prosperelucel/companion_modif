var instance_skel = require('../../instance_skel');

var debug;
var log;

/**
 * Companion instance class for Figure53 QView.
 *
 * @extends instance_skel
 * @version 1.0.0
 * @since 1.0.0
 * @author Keith Rocheck <keith.rocheck@gmail.com>
 */
class instance extends instance_skel {

	/**
	 * Create an instance of a QView module.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @param {string} id - the instance ID
	 * @param {Object} config - saved user configuration parameters
	 * @since 1.0.0
	 */
	constructor(system,id,config) {
		super(system,id,config);

		this.actions();
	}

	/**
	 * Setup the actions.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @access public
	 * @since 1.0.0
	 */
	actions(system) {
		var actions = {};

		actions['next']     = { label: 'Goto next page' };
		actions['previous'] = { label: 'Goto previous page' };

		actions['goto_page'] = {
			label: 'Goto page',
			options: [
				{
					label: 'Page',
					type: 'number',
					id: 'page',
					default: 1,
					min: 1,
					max: 9999
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
		let opt = action.options;
		let cmd = '';

		switch (action.action) {
			case 'next':
				cmd = `/goto/next`;
				break;
			case 'previous':
				cmd = `/goto/prev`;
				break;
			case 'goto_page':
				cmd = `/goto/page/${opt.page}`;
				break;
		}

		if (cmd != "" && this.config.host !== undefined && this.config.port !== undefined) {
			this.system.emit('osc_send', this.config.host, this.config.port, cmd);
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
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 8,
				regex: this.REGEX_IP
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Target Port',
				width: 4,
				regex: this.REGEX_PORT,
				default: 60000
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
		debug("destroy", this.id)
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

		this.status(this.STATE_OK);
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