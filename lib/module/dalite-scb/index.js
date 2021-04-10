const TCP = require('../../tcp');
let debug;
let log;

/**
 * Companion instance for Da-Lite SCB.
 * @author Miguel Santana <santana1053@gmail.com>
 */
class instance extends require('../../instance_skel') {
	constructor(system, id, config) {
		super(system, id, config);
		this.constants();
		this.actions();
		this.data = {};
	}

	actions(system) {
		let actions = {};
		const commands = this.COMMANDS.filter(this.ACCESS.READWRITE, this.ACCESS.WRITEONLY);
		for (const [key, command] of commands) {
			let options = [];
			switch (command) {
				case this.COMMANDS.LOCATION:
				case this.COMMANDS.IP_ADDRESS:
				case this.COMMANDS.SUBNET_MASK:
				case this.COMMANDS.TARGET_POSITION:
					// Internal settings we don't want to have options for.
					continue;
				case this.COMMANDS.RELAY_STATUS:
					options.push({
						type:    'dropdown',
						label:   'Action',
						id:      'action',
						default: this.RELAY_STATUS.STOP,
						choices: this.choices(this.RELAY_STATUS),
					});
					break;
				case this.COMMANDS.SCREEN_POSITION:
					options.push({
						type:    'dropdown',
						label:   'Type',
						id:      'type',
						default: this.POSITION_TYPE.SET,
						choices: this.choices(this.POSITION_TYPE),
					}, {
						type:    'dropdown',
						label:   'Unit',
						id:      'unit',
						default: this.POSITION_UNITS.INCHES,
						choices: this.choices(this.POSITION_UNITS),
					}, {
						type:  'textinput',
						label: 'Value',
						id:    'value',
						regex: this.REGEX_NUMBER
					});
					break;
				case this.COMMANDS.ASPECT_RATIO:
					options.push({
						type:    'dropdown',
						label:   'Aspect Ratio',
						id:      'index',
						default: this.ASPECT_RATIO["Custom 1"],
						choices: this.choices(this.ASPECT_RATIO),
					});
					break;
				default:
					debug(`No button actions for command: ${key}`);
			}
			if (options.length > 0) {
				actions[command.value] = {label: key.toProperCase('_'), options: options};
			} else {
				debug(`No options found for ${key}`);
			}
		}
		this.system.emit('instance_actions', this.id, actions);
	}

	action(object) {
		const command = this.COMMANDS.find(object.action);
		const options = object.options;
		switch (command) {
			case this.COMMANDS.RELAY_STATUS:
				this.set(command, options.action);
				break;
			case this.COMMANDS.TARGET_POSITION:
			case this.COMMANDS.SCREEN_POSITION:
				if (options.value !== null) {
					const value = Math.round(options.unit * options.value);
					this.set(command, `${options.type} ${value}`);
				}
				break;
			case this.COMMANDS.ASPECT_RATIO:
				const index = (+options.index + 1) % 10;
				this.set(this.COMMANDS.TARGET_POSITION, `${command.value + index}`);
				break;
			default:
				this.log('error', `No button action handler for command: ${object.action}`);
				break;
		}
	}

	config_fields() {
		return [{
			type:    'textinput',
			id:      'host',
			label:   'SCB IP Address',
			tooltip: 'The IP of the Screen Control Board',
			width:   6,
			regex:   this.REGEX_IP
		}, {
			type:    'textinput',
			id:      'port',
			label:   'Target Port',
			width:   3,
			default: '3001',
			regex:   this.REGEX_PORT
		}];
	}

	destroy() {
		if (this.socket !== undefined) {
			this.socket.destroy();
			delete this.socket;
		}
		if (this.refreshInterval) clearInterval(this.refreshInterval);
		debug("destroy");
	}

	init() {
		this.status(this.STATE_OK);
		debug = this.debug;
		log = this.log;
		this.init_tcp();
		this.initVariables();
		this.initFeedbacks();
	}

	init_tcp() {
		this.destroy();

		if (this.config.host && this.config.port) {
			this.status(this.STATE_WARNING, 'Connecting');
			this.socket = new TCP(this.config.host, this.config.port);

			this.socket.on('status_change', (status, message) => {
				this.status(status, message);
			});

			this.socket.on('error', (err) => {
				debug("Network error", err);
				this.status(this.STATE_ERROR, err);
				this.log('error', `Network error: ${err.message}`);
				if (this.refreshInterval) clearInterval(this.refreshInterval);
			});

			this.socket.on('connect', () => {
				this.status(this.STATE_OK);
				debug("Connected");
				this.refreshInterval = setInterval(this.refreshData.bind(this), 1000);
			});

			// separate buffered stream into lines with responses
			let receivebuffer = '';
			this.socket.on('data', (chunk) => {
				let i, line = '', offset = 0;
				receivebuffer += chunk;
				while ((i = receivebuffer.indexOf('\r', offset)) !== -1) {
					line = receivebuffer.substr(offset, i - offset);
					offset = i + 1;
					this.socket.emit('receiveline', line.toString());
				}
				Object.entries(this.data).forEach(data => {
					const command = this.COMMANDS.find(data[0]);
					switch (command) {
						case this.COMMANDS.SCREEN_HEIGHT:
						case this.COMMANDS.SCREEN_WIDTH:
						case this.COMMANDS.UPPER_LIMIT:
						case this.COMMANDS.LOWER_LIMIT:
						case this.COMMANDS.SCREEN_POSITION:
							Object.entries(this.POSITION_UNITS).forEach(u => {
								if (u[1] === 1) {
									this.setVariable(data[0], data[1]);
								} else {
									this.setVariable(data[0] + ':' + u[0], (data[1] / u[1]).toFixed(2));
								}
							});
							break;
						case this.COMMANDS.ASPECT_RATIO:
							Object.keys(data[1]).forEach(key => {
								this.setVariable(data[0] + key, data[1][(+key + 1) % 10]);
							});
							break;
						default:
							this.setVariable(data[0], data[1]);
							break;
					}
					this.checkFeedbacks(data[0]);
				});
				receivebuffer = receivebuffer.substr(offset);
			});
			this.socket.on('receiveline', (line) => {
				const parts   = line.split(' '),
							type    = parts[2],
							command = this.COMMANDS.find(parts[3]);
				let result = parts.slice(4).join(' ');
				switch (command) {
					case this.COMMANDS.ASPECT_RATIO:
						if (!this.data[command.value]) this.data[command.value] = {};
						this.data[command.value][parts[3][1]] = result;
						break;
					default:
						this.data[command.value] = result;
						break;
					case undefined:
						debug('Unknown SCB command response');
						return;
				}
			});
		}
	}

	initVariables() {
		let variables = [];
		const commands = this.COMMANDS.filter(this.ACCESS.READONLY, this.ACCESS.READWRITE);
		commands.forEach(c => {
			switch (c[1]) {
				case this.COMMANDS.SCREEN_HEIGHT:
				case this.COMMANDS.SCREEN_WIDTH:
				case this.COMMANDS.UPPER_LIMIT:
				case this.COMMANDS.LOWER_LIMIT:
				case this.COMMANDS.SCREEN_POSITION:
					Object.entries(this.POSITION_UNITS).forEach(u => {
						if (u[1] === 1) {
							variables.push({label: `${c[0].toProperCase('_')} (${u[0].toProperCase()})`, name: c[1].value});
						} else {
							variables.push({label: `${c[0].toProperCase('_')} (${u[0].toProperCase()})`, name: `${c[1].value}:${u[0]}`});
						}
					});
					break;
				case this.COMMANDS.ASPECT_RATIO:
					Object.entries(this.ASPECT_RATIO).forEach(a => {
						variables.push({label: `Aspect Ratio (${a[0]})`, name: c[1].value + a[1]});
					});
					break;
				default:
					variables.push({label: c[0].toProperCase('_'), name: c[1].value});
					break;
			}
		});
		this.setVariableDefinitions(variables);
	}

	initFeedbacks() {
		let feedbacks = {};
		const commands = this.COMMANDS.filter(this.ACCESS.READWRITE);
		for (const [key, command] of commands) {
			let options = [{
				type:    'colorpicker',
				label:   'Foreground color',
				id:      'fg',
				default: this.rgb(255, 255, 255)
			}, {
				type:    'colorpicker',
				label:   'Background color',
				id:      'bg',
				default: this.rgb(0, 255, 0)
			}];
			switch (command) {
				case this.COMMANDS.IP_ADDRESS:
				case this.COMMANDS.SUBNET_MASK:
				case this.COMMANDS.TARGET_POSITION:
				case this.COMMANDS.LOCATION:
					// Internal settings we don't want to have options for.
					continue;
				case this.COMMANDS.RELAY_STATUS:
					options.push({
						type:    'dropdown',
						label:   'Status',
						id:      'status',
						default: this.RELAY_STATUS.STOP,
						choices: this.choices(this.RELAY_STATUS)
					});
					break;
				case this.COMMANDS.ASPECT_RATIO:
					options.push({
						type:    'dropdown',
						label:   'Aspect Ratio',
						id:      'index',
						default: this.ASPECT_RATIO["Custom 1"],
						choices: this.choices(this.ASPECT_RATIO),
					});
					break;
				case this.COMMANDS.SCREEN_POSITION:
					options.push({
						type:    'dropdown',
						label:   'Unit',
						id:      'unit',
						default: this.POSITION_UNITS.INCHES,
						choices: this.choices(this.POSITION_UNITS),
					}, {
						type:  'textinput',
						label: 'Position',
						id:    'value',
						regex: this.REGEX_NUMBER
					});
					break;
			}
			feedbacks[command.value] = {label: key.toProperCase('_'), options: options};
		}
		this.setFeedbackDefinitions(feedbacks);
	}

	feedback(feedback, bank) {
		const command = this.COMMANDS.find(feedback.type),
					opt     = feedback.options,
					data    = this.data[command.value];
		let local = {},
				out   = {color: opt.fg, bgcolor: opt.bg};
		switch (command) {
			case this.COMMANDS.RELAY_STATUS:
				if (data !== opt.status) return;
				break;
			case this.COMMANDS.ASPECT_RATIO:
				local.value = +data[(+opt.index + 1) % 10];
				if (!local.value && local.value !== 0) return;
				local.floor = +this.data[this.COMMANDS.TARGET_POSITION.value] - 15;
				local.ceil = +this.data[this.COMMANDS.TARGET_POSITION.value] + 15;
				if (!(local.value >= local.floor && local.value <= local.ceil)) return;
				break;
			case this.COMMANDS.SCREEN_POSITION:
				if (!opt.value && opt.value !== 0) return;
				local.value = opt.value * opt.unit;
				local.floor = +data - 50;
				local.ceil = +data + 50;
				if (!(local.value >= local.floor && local.value <= local.ceil)) return;
				break;
			default:
				debug(`No feedback programmed for command: ${command.value}`);
				return;
		}
		return out;
	}

	refreshData() {
		const data = this.COMMANDS.filter(this.ACCESS.READONLY, this.ACCESS.READWRITE)
			.filter(c => c[1] !== this.COMMANDS.ASPECT_RATIO).map(c => c[1].value)
			.concat(Object.values(this.ASPECT_RATIO).map(a => `${this.COMMANDS.ASPECT_RATIO.value}${a}`))
			.map(value => `$ 0 GE ${value}\r`);
		this.socket.send(data.join(''));
	}

	updateConfig(config) {
		this.config = config;
		this.init_tcp();
	}

	isConnected() {
		return this.socket !== undefined && this.socket.connected;
	}

	get(command) {
		command = this.COMMANDS.find(command);
		if ([this.ACCESS.READONLY, this.ACCESS.READWRITE].indexOf(command.access) !== -1) {
			this.socket.send(`$ 0 GE ${command.value}\r`);
		}
	}

	set(command, value) {
		command = this.COMMANDS.find(command);
		if ([this.ACCESS.WRITEONLY, this.ACCESS.READWRITE].indexOf(command.access) !== -1) {
			this.socket.send(`# 0 SE ${command.value} ${value}\r`);
		}
	}

	constants() {
		this.POSITION_UNITS = {
			MILLIMETERS: 1.0,
			CENTIMETERS: 10.0,
			INCHES:      25.4,
		};
		this.POSITION_TYPE = {
			SET:   'FIX',
			RAISE: 'DEC',
			LOWER: 'INC'
		};
		this.RELAY_STATUS = {
			STOP: 'ST',
			UP:   'UP',
			DOWN: 'DN',
		};
		this.ASPECT_RATIO = {
			'1:1':           0,
			'1.25:1':        1,
			'1.33:1 (4x3)':  2,
			'1.66:1 (5x4)':  3,
			'1.78:1 (16x9)': 4,
			'Custom 1':      5,
			'Custom 2':      6,
			'Custom 3':      7,
			'Custom 4':      8,
			'Custom 5':      9,
		};
		this.ACCESS = {
			READONLY:  {value: 'R'},
			WRITEONLY: {value: 'W'},
			READWRITE: {value: 'RW'},
		};
		this.COMMANDS = {
			// ALL:                 {value: 'AL', access: this.ACCESS.READONLY}, // Returns nothing
			ENABLED:          {value: 'EN', access: this.ACCESS.READONLY},
			LOCATION:         {value: 'LO', access: this.ACCESS.READONLY},
			VERSION:          {value: 'SV', access: this.ACCESS.READONLY},
			TARGET_DENSITY:   {value: 'TD', access: this.ACCESS.READONLY},
			ROLLER_DIAMETER:  {value: 'RD', access: this.ACCESS.READONLY},
			SLACK_WRAP:       {value: 'SL', access: this.ACCESS.READONLY},
			SCREEN_THICKNESS: {value: 'ST', access: this.ACCESS.READONLY},
			SCREEN_WIDTH:     {value: 'SW', access: this.ACCESS.READONLY},
			SCREEN_HEIGHT:    {value: 'SH', access: this.ACCESS.READONLY},
			MAC_ADDRESS:      {value: 'MA', access: this.ACCESS.READONLY},
			SENSOR_STATUS:    {value: 'SE', access: this.ACCESS.READONLY},
			// MASTER_SLAVE_STATUS: {value: 'MS', access: this.ACCESS.READONLY},
			RELAY_STATUS:     {value: 'RE', access: this.ACCESS.READWRITE},
			UPPER_LIMIT:      {value: 'UL', access: this.ACCESS.READONLY},
			LOWER_LIMIT:      {value: 'LM', access: this.ACCESS.READONLY},
			SCREEN_POSITION:  {value: 'MM', access: this.ACCESS.READWRITE},
			TARGET_POSITION:  {value: 'TA', access: this.ACCESS.READWRITE},
			ASPECT_RATIO:     {value: 'A', access: this.ACCESS.READWRITE},
			AC:               {value: 'AC', access: this.ACCESS.READONLY},
			IP_ADDRESS:       {value: 'IP', access: this.ACCESS.READONLY},
			SUBNET_MASK:      {value: 'SN', access: this.ACCESS.READONLY},
			DHCP:             {value: 'DH', access: this.ACCESS.READONLY},
			// SERIAL_FLASH:        {value: 'SF', access: this.ACCESS.READONLY},
			// RESET:               {value: 'RS', access: this.ACCESS.WRITEONLY},
			find:             (command) => {
				if (typeof command === 'string') {
					if (command.match(new RegExp(`^[${this.COMMANDS.ASPECT_RATIO.value}][${Object.values(this.ASPECT_RATIO).join('')}]$`))) {
						command = this.COMMANDS.ASPECT_RATIO.value;
					}
					command = Object.values(this.COMMANDS).find(prop => prop.value === command);
				}
				if (typeof command !== 'object') {
					debug('Unknown SCB command');
				}
				return command;
			},
			filter:           (...access) => {
				access = access.map(access => {
					if (typeof access === 'string') {
						access = Object.values(this.ACCESS).find(a => a.value === access);
					}
					if (typeof access !== 'object') {
						debug('Unknown access permission');
					}
					return access;
				});
				return Object.entries(this.COMMANDS).filter(c => access.indexOf(c[1].access) !== -1);
			}
		};
		this.choices = object => Object.entries(object).map(array => {
			return {id: array[1], label: array[0].toProperCase()};
		});
	}
}

String.prototype.toProperCase = function (split = ' ') {
	return this.split(split).map(w => {
		return w[0].toUpperCase() + w.substr(1).toLowerCase();
	}).join(' ');
};

exports = module.exports = instance;
