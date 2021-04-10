const instance_skel = require('../../instance_skel')

const actionUI = require('./lib/actionUI')
const actionMethods = require('./lib/actionMethods')
const feedback = require('./lib/feedback')
const presets = require('./lib/presets')

const sdk = require('holographics-client-sdk')

class instance extends instance_skel {
	constructor (system, id, config) {
		super(system, id, config)
		Object.assign(this, {
			...actionUI,
			...actionMethods,
			...feedback,
			...presets
		})

		this.system.emit('instance_actions', this.id, this.getActions())

		return this
	}

	init () {
		this.updateConfig()
	}

	updateConfig (config) {
		if (config) this.config = config
		try {
			// Setup config defaults
			this.config.host = this.config.host || '127.0.0.1'
			this.config.port = this.config.port || '3000'

			// Setup the socket connection to Holographics
			this.Holographics = new sdk.Socket(`http://${this.config.host}:${this.config.port}`)

			// Make sure we only have a single event listener
			this.Holographics.socket.removeAllListeners('connect')
			this.Holographics.socket.removeAllListeners('disconnect')
			this.Holographics.socket.removeAllListeners('stateChanged')

			// When the Holographics state changes, make sure we update things relevant to our actions
			this.Holographics.socket.on('stateChanged', () => {
				this.updateHoloState()
			})
			
			// Show ready status when connected
			this.Holographics.socket.on('connect', () => {
				this.log('info', 'Connected to Holographics')
				this.status(this.STATUS_OK, 'Ready')
			})

			// Show disconnect message when disconnected
			this.Holographics.socket.on('disconnect', () => {
				this.handleConnectionError()
			})

			// If we're not connected on first setup, show a different warning
			if (!this.Holographics.socket.connected) this.status(this.STATUS_WARNING, 'Could not connect')

			// Update the state
			this.updateHoloState()
		} catch(e) {
			this.debug(e.message)
			this.status(this.STATUS_WARNING, 'Invalid URL')
		}
	}

	async updateHoloState () {
		let state = await this.Holographics.state.get()
		let themes = await this.Holographics.themes.find()
		let entries = await this.Holographics.entries.find({ data: {} })

		this.STATE = state

		this.WIDGETS = []
		if (state) {
			state.widgets.map((widget) => {
				this.WIDGETS.push({ id: widget.id, label: widget.name !== '' ? widget.name : widget.type })
			})
		}
		this.THEMES = []
		if (themes) {
			themes.map((theme) => {
				this.THEMES.push({ id: theme.filename, label: theme.filename })
			})
		}
		this.ENTRIES = []
		if (entries) {
			entries.map((entry) => {
				this.ENTRIES.push({ id: entry.id, label: Object.values(entry.props)[0] })
			})
		}

		this.system.emit('instance_actions', this.id, this.getActions())
		this.initPresets()
		this.initFeedbacks()
		this.checkFeedbacks('widget_active')
		this.checkFeedbacks('entry_active')
	}

	destroy () {
		// Prevent error messages on destroy
		this.Holographics.socket.removeAllListeners('connect')
		this.Holographics.socket.removeAllListeners('disconnect')
		this.Holographics.socket.removeAllListeners('stateChanged')
		// Close the socket
		this.Holographics.socket.close()
		delete this.Holographics
		// Log
		this.debug('destroy', this.id)
	}

	config_fields () {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 6,
				regex: this.REGEX_IP
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Port (default 3000)',
				width: 6,
				regex: this.REGEX_PORT
			},
		]
	}

	handleConnectionError() {
		this.log('error', 'Holographics connection lost')
		this.status(this.STATUS_ERROR, 'Connection error')
	}

	handleError(error) {
		if (error.code === 'ECONNREFUSED') {
			return this.handleConnectionError()
		} else {
			this.log('error', error.message)
			this.debug(error)
		}
	}

	action({ action, options }) {
		if (this.Holographics.socket.connected) {
			this[action](options)
				.then(() => { this.status(this.STATUS_OK, 'Ready') })
				.catch((e) => { this.handleError(e) })
		} else {
			this.log('error', 'Not connected to Holographics')
		}
	}
}

exports = module.exports = instance