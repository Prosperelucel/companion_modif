module.exports = {

	/**
	 * INTERNAL: Get the available actions.
	 *
	 * @returns {Object[]} the available actions
	 * @access protected
	 * @since 1.3.0
	 */
	getActions() {
		var actions = {};

		actions['mode'] = {
			label: 'Display Mode',
			options: [
				{
					type:    'dropdown',
					label:   'Display Mode',
					id:      'mode',
					choices: this.CHOICES_DISPLAYMODE
				}
			]
		};
		actions['audio'] = {
			label: 'Audio from Input',
			options: [
				{
					type:    'dropdown',
					label:   'Input',
					id:      'inp',
					choices: this.CHOICES_INPUTS
				}
			]
		};
		actions['solo'] = {
			label: 'Solo from Input',
			options: [
				{
					type:    'dropdown',
					label:   'Input',
					id:      'inp',
					choices: this.CHOICES_INPUTS
				}
			]
		};
		actions['label'] = {
			label: 'Input Label',
			options: [
				{
					type:    'textinput',
					label:   'Label',
					id:      'label'
				},
				{
					type:    'dropdown',
					label:   'Input',
					id:      'inp',
					choices: this.CHOICES_INPUTS
				}
			]
		};
		actions['set_format'] = {
			label: 'Set output format',
			options: [
				{
					type: 'dropdown',
					label: 'Format',
					id: 'setting',
					default: '60p',
					choices: this.CHOICES_OUTPUTFORMAT
				}
			]
		};
		actions['set_border'] = {
			label: 'Display border',
			options: [
				{
					type: 'dropdown',
					label: 'Value',
					id: 'setting',
					default: 'true',
					choices: this.CHOICES_TRUEFALSE
				}
			]
		};
		actions['set_labels'] = {
			label: 'Display labels',
			options: [
				{
					type: 'dropdown',
					label: 'Value',
					id: 'setting',
					default: 'true',
					choices: this.CHOICES_TRUEFALSE
				}
			]
		};
		actions['set_meters'] = {
			label: 'Display audio meters',
			options: [
				{
					type: 'dropdown',
					label: 'Value',
					id: 'setting',
					default: 'true',
					choices: this.CHOICES_TRUEFALSE
				}
			]
		};
		actions['set_tally'] = {
			label: 'Display SDI tally',
			options: [
				{
					type: 'dropdown',
					label: 'Value',
					id: 'setting',
					default: 'true',
					choices: this.CHOICES_TRUEFALSE
				}
			]
		};
		actions['set_widescreen_sd'] = {
			label: 'Widescreen SD enable',
			options: [
				{
					type: 'dropdown',
					label: 'Value',
					id: 'setting',
					default: 'true',
					choices: this.CHOICES_TRUEFALSE
				}
			]
		};

		return actions;
	}
}