module.exports = {

	/**
	 * INTERNAL: Get the available feedbacks.
	 *
	 * @returns {Object[]} the available feedbacks
	 * @access protected
	 * @since 1.0.0
	 */
	getFeedbacks() {
		var feedbacks = {};

		feedbacks['standby'] = {
			label: 'Change background color by camera standby state',
			description: 'If the camera standby state specified is active, change background color of the bank',
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
					label: 'State',
					id: 'mode',
					default: '0',
					choices: this.CHOICES_ONOFF
				}
			],
			callback: (feedback, bank) => {
				if (this.state.standby == feedback.options.mode) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};

		feedbacks['auto_focus'] = {
			label: 'Change background color by auto focus state',
			description: 'If the auto focus state specified is active, change background color of the bank',
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
					label: 'State',
					id: 'mode',
					default: '0',
					choices: this.CHOICES_ONOFF
				}
			],
			callback: (feedback, bank) => {
				if (this.state.auto_focus == feedback.options.mode) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};

		feedbacks['auto_iris'] = {
			label: 'Change background color by auto iris state',
			description: 'If the auto iris state specified is active, change background color of the bank',
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
					label: 'State',
					id: 'mode',
					default: '0',
					choices: this.CHOICES_ONOFF
				}
			],
			callback: (feedback, bank) => {
				if (this.state.auto_iris == feedback.options.mode) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};

		feedbacks['auto_white_balance'] = {
			label: 'Change background color by auto white balance state',
			description: 'If the auto white balance state specified is active, change background color of the bank',
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
					label: 'State',
					id: 'mode',
					default: '0',
					choices: this.CHOICES_ONOFF
				}
			],
			callback: (feedback, bank) => {
				if (this.state.auto_white_balance == feedback.options.mode) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};

		feedbacks['backlight_compensation'] = {
			label: 'Change background color by backlight compensation state',
			description: 'If the backlight compensation state specified is active, change background color of the bank',
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
					label: 'State',
					id: 'mode',
					default: '0',
					choices: this.CHOICES_ONOFF
				}
			],
			callback: (feedback, bank) => {
				if (this.state.backlight_compensation == feedback.options.mode) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};

		feedbacks['led'] = {
			label: 'Change background color by LED state',
			description: 'If the front LED state specified is active, change background color of the bank',
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
					label: 'State',
					id: 'mode',
					default: '0',
					choices: this.CHOICES_ONOFF
				}
			],
			callback: (feedback, bank) => {
				if (this.state.led == feedback.options.mode) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};

		feedbacks['mute'] = {
			label: 'Change background color by video mute state',
			description: 'If the video mute state specified is active, change background color of the bank',
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
					label: 'State',
					id: 'mode',
					default: '0',
					choices: this.CHOICES_ONOFF
				}
			],
			callback: (feedback, bank) => {
				if (this.state.mute == feedback.options.mode) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};

		feedbacks['pt_speed'] = {
			label: 'Change background color by pan & tilt speed',
			description: 'If the the pan and tilt speeds selected are action, change background color of the bank',
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
					type: 'number',
					label: 'Pan Speed',
					id: 'panSpeed',
					min: 1,
					max: 24,
					default: 12,
					required: true,
					range: true
				},
				{
					type: 'number',
					label: 'Tilt Speed',
					id: 'tiltSpeed',
					min: 1,
					max: 20,
					default: 10,
					required: true,
					range: true
				}
			],
			callback: (feedback, bank) => {
				if (this.panSpeed == feedback.options.panSpeed && this.tiltSpeed == feedback.options.tiltSpeed) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};

		feedbacks['wide_dynamic_range'] = {
			label: 'Change background color by wide dynamic range state',
			description: 'If the wide dynamic range state specified is active, change background color of the bank',
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
					label: 'State',
					id: 'mode',
					default: '0',
					choices: this.CHOICES_ONOFF
				}
			],
			callback: (feedback, bank) => {
				if (this.state.wide_dynamic_range == feedback.options.mode) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};

		return feedbacks;
	}
}