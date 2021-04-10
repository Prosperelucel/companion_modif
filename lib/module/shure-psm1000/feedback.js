module.exports = {

	/**
	 * INTERNAL: initialize feedbacks.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initFeedbacks() {
		// feedbacks
		var feedbacks = {};

		feedbacks['rf_tx_level'] = {
			label: 'RF TX Level',
			description: 'If the selected channel\'s RF is set to a level, change the color of the button.',
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: '1',
					choices: this.CHOICES_CHANNELS
				},
				{
					type: 'dropdown',
					label: 'Level (mW)',
					id: 'value',
					default: '1',
					choices: this.CHOICES_RFTXLEVEL
				},
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
					default: this.rgb(255,0,0)
				}
			],
			callback: ({ options }, bank) => {
				if (this.api.getChannel(parseInt(options.channel)).rfTxLevel == options.value) {
					return {
						color: options.fg,
						bgcolor: options.bg
					};
				}
			}
		};

		feedbacks['rf_muted'] = {
			label: 'RF Mute State',
			description: 'If the selected channel\'s RF is muted/unmuted, change the color of the button.',
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: '1',
					choices: this.CHOICES_CHANNELS
				},
				{
					type: 'dropdown',
					label: 'State',
					id: 'value',
					default: '1',
					choices: this.CHOICES_RFMUTE
				},
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
					default: this.rgb(255,0,0)
				}
			],
			callback: ({ options }, bank) => {
				if (this.api.getChannel(parseInt(options.channel)).rfMute == options.value) {
					return {
						color: options.fg,
						bgcolor: options.bg
					};
				}
			}
		};

		feedbacks['audio_tx_mode'] = {
			label: 'Audio TX Mode',
			description: 'If the selected channel\'s audio TX mode is set, change the color of the button.',
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: '1',
					choices: this.CHOICES_CHANNELS
				},
				{
					type: 'dropdown',
					label: 'State',
					id: 'value',
					default: '1',
					choices: this.CHOICES_AUDIOTXMODE
				},
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
					default: this.rgb(200,200,0)
				}
			],
			callback: ({ options }, bank) => {
				if (this.api.getChannel(parseInt(options.channel)).audioTxMode == options.value) {
					return {
						color: options.fg,
						bgcolor: options.bg
					};
				}
			}
		};

		feedbacks['audio_in_line_level'] = {
			label: 'Audio Input Line Level',
			description: 'If the selected channel\'s audio input line level is set, change the color of the button.',
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: '1',
					choices: this.CHOICES_CHANNELS
				},
				{
					type: 'dropdown',
					label: 'State',
					id: 'value',
					default: '1',
					choices: this.CHOICE_AUDIOINLINELEVEL
				},
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
					default: this.rgb(200,200,0)
				}
			],
			callback: ({ options }, bank) => {
				if (this.api.getChannel(parseInt(options.channel)).audioInLineLevel == options.value) {
					return {
						color: options.fg,
						bgcolor: options.bg
					};
				}
			}
		};

		this.setFeedbackDefinitions(feedbacks);
	}
}