var debug;
var log;

/**
 * Companion instance API class for Shure PSM1000.
 * Utilized to track the state of the receiver and channels.
 *
 * @version 1.0.0
 * @since 1.0.0
 * @author Joseph Adams <josephdadams@gmail.com>
 * @author Keith Rocheck <keith.rocheck@gmail.com>
 */
class instance_api {

	/**
	 * Create an instance of a Shure API module.
	 *
	 * @param {instance} instance - the parent instance
	 * @since 1.0.0
	 */
	constructor(instance) {
		this.instance = instance;

		this.receiver  = {
			deviceId:           '',    // DEVICE_NAME
		};

		this.channels  = [];
	}

	/**
	 * Returns the desired channel state object.
	 *
	 * @param {number} id - the channel to fetch
	 * @returns {Object} the desired channel object
	 * @access public
	 * @since 1.0.0
	 */
	getChannel(id) {

		if (this.channels[id] === undefined) {
			this.channels[id] = {
				//tx
				name:                 '',        // CHAN_NAME: (8)
				audioInLevel:         0,         // AUDIO_IN_LVL: -67 - 0 (4)
				group:                '',        // GROUP_CHAN: xx,yy (xx)
				channel:              '',        // GROUP_CHAN: xx,yy (yy)
				frequency:            '000.000', // FREQUENCY: xxx[.]yyy (6)
				rfTxLevel:            '',        // RF_TX_LVL: 10, 50, 100 (6)
				rfMute:               '',        // RF_MUTE: 1=mute, 0=unmute (4)
				audioTxMode:          '',        // AUDIO_TX_MODE: 1=mono, 2=point to point, 3=stereo (4)
				audioInLineLevel:     '',        // AUDIO_IN_LINE_LVL: 0=off/Aux, 1=on/Line
				audioInLevelL:        0,         // AUDIO_IN_LVL_L: unknown format (11)
				audioInLevelR:        0,         // AUDIO_IN_LVL_R: unknown format (11)
				meterRate:            0,         // METER_RATE: 0=off, in ms (11)
			};
		}

		return this.channels[id];
	}

	/**
	 * Returns the receiver state object.
	 *
	 * @returns {Object} the receiver state object
	 * @access public
	 * @since 1.0.0
	 */
	getReceiver() {

		return this.receiver;
	}

	/**
	 * Update a channel property.
	 *
	 * @param {number} id - the channel id
	 * @param {String} key - the command id
	 * @param {String} value - the new value
	 * @access public
	 * @since 1.0.0
	 */
	updateChannel(id, key, value) {
		var channel = this.getChannel(id);
		var prefix = 'ch_' + id + '_';
		var variable;

		if (value == 'UNKN' || value == 'UNKNOWN') {
			value = 'Unknown';
		}

		if (key == 'CHAN_NAME') {
			channel.name = value;
			this.instance.setVariable(prefix + 'name', channel.name);
			this.instance.actions();
			this.instance.initFeedbacks();
		}
		else if (key == 'METER_RATE') {
			channel.meterRate = parseInt(value);
			this.instance.setVariable(prefix + 'meter', variable);
		}
		else if (key == 'AUDIO_IN_LVL') {
			channel.audioGain = parseInt(value);
			variable = channel.audioGain.toString() + ' dB';
			this.instance.setVariable(prefix + 'audio_in_level', variable);
		}
		else if (key.match(/GROUP_CHAN/)) {
			this.instance.setVariable(prefix + 'group_chan', value);
			variable = value.split(',');
			channel.group   = variable[0];
			channel.channel = variable[1];
		}
		else if (key == 'FREQUENCY') {
			channel.frequency = value;
			variable = value.substr(0,3) + '.' + value.substr(3,3) + ' MHz';
			this.instance.setVariable(prefix + 'frequency', variable);
		}
		else if (key == 'RF_TX_LEVEL') {
			channel.rfTxLevel = value;
			variable = value + ' mW';
			this.instance.setVariable(prefix + 'rf_tx_level', variable);
			this.instance.checkFeedbacks('rf_tx_level');
		}
		else if (key == 'RF_MUTE') {
			switch(value) {
				case '0':
					variable = 'UNMUTED';
					break;
				case '1':
					variable = 'MUTED';
					break;
			}
			channel.rfMute = value;
			this.instance.setVariable(prefix + 'rf_mute', variable);
			this.instance.checkFeedbacks('rf_muted');
		}
		else if (key == 'AUDIO_TX_MODE') {
			switch(value) {
				case '1':
					variable = 'Mono';
					break;
				case '2':
					variable = 'Point to Point';
					break;
				case '3':
					variable = 'Stereo';
					break;
			}
			channel.audioTxMode = value;
			this.instance.setVariable(prefix + 'audio_tx_mode', variable);
			this.instance.checkFeedbacks('audio_tx_mode');
		}
		else if (key == 'AUDIO_IN_LINE_LVL') {
			switch(value) {
				case '0':
					variable = 'Aux (-10 dB)';
					break;
				case '1':
					variable = 'Line (+4 dB)';
					break;
			}
			channel.audioInLineLevel = value;
			this.instance.setVariable(prefix + 'audio_in_line_level', variable);
			this.instance.checkFeedbacks('audio_in_line_level');
		}
		else if (key == 'AUDIO_IN_LVL_L') {
			channel.audioInLevelL = parseInt(value);
			this.instance.setVariable(prefix + 'audio_in_level_l', channel.audioInLevelL);
		}
		else if (key == 'AUDIO_IN_LVL_R') {
			channel.audioInLevelR = parseInt(value);
			this.instance.setVariable(prefix + 'audio_in_level_r', channel.audioInLevelR);
		}
	}

	/**
	 * Update a receiver property.
	 *
	 * @param {String} key - the command id
	 * @param {String} value - the new value
	 * @access public
	 * @since 1.0.0
	 */
	updateReceiver(key, value) {

		if (value == 'UNKN' || value == 'UNKNOWN') {
			value = 'Unknown';
		}

		if (key == 'DEVICE_NAME') {
			this.receiver.deviceId = value;
			this.instance.setVariable('device_id', this.receiver.deviceId);
		}
	}
}

exports = module.exports = instance_api;