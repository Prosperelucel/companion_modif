module.exports = {

	/**
	 * INTERNAL: initialize feedbacks.
	 *
	 * @access protected
	 * @since 1.3.0
	 */
	initFeedbacks() {
		// feedbacks
		var feedbacks = {};

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
}