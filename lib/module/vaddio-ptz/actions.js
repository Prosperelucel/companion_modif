module.exports = {

	/**
	 * INTERNAL: Get the available actions.
	 *
	 * @returns {Object[]} the available actions
	 * @access protected
	 * @since 1.0.0
	 */
	getActions() {
		var actions = {};

		actions['left']      = { label: 'Pan Left' };
		actions['right']     = { label: 'Pan Right' };
		actions['up']        = { label: 'Tilt Up' };
		actions['down']      = { label: 'Tilt Down' };
		actions['upLeft']    = { label: 'Up Left' };
		actions['upRight']   = { label: 'Up Right' };
		actions['downLeft']  = { label: 'Down Left' };
		actions['downRight'] = { label: 'Down Right' };
		actions['stop']      = { label: 'P/T Stop' };
		actions['home']      = { label: 'P/T Home' };

		actions['pSpeedS']   = {
			label: 'Pan Speed',
			options: [
				{
					type: 'number',
					label: 'Speed',
					id: 'speed',
					min: 1,
					max: 24,
					default: 12,
					required: true,
					range: true
				}
			]
		};
		actions['pSpeedU']   = { label: 'Pan Speed Up' };
		actions['pSpeedD']   = { label: 'Pan Speed Down' };
		actions['tSpeedS']   = {
			label: 'Tilt Speed',
			options: [
				{
					type: 'number',
					label: 'Speed',
					id: 'speed',
					min: 1,
					max: 20,
					default: 10,
					required: true,
					range: true
				}
			]
		};
		actions['tSpeedU']   = { label: 'Tilt Speed Up' };
		actions['tSpeedD']   = { label: 'Tilt Speed Down' };

		actions['zoomI']   = { label: 'Zoom In' };
		actions['zoomO']   = { label: 'Zoom Out' };
		actions['zoomS']   = { label: 'Zoom Stop' };
		actions['zSpeedS'] = {
			label: 'Zoom Speed',
			options: [
				{
					type: 'number',
					label: 'Speed',
					id: 'speed',
					min: 1,
					max: 7,
					default: 3,
					required: true,
					range: true
				}
			]
		};
		actions['zSpeedU']   = { label: 'Zoom Speed Up' };
		actions['zSpeedD']   = { label: 'Zoom Speed Down' };

		actions['focusN']  = { label: 'Focus Near' };
		actions['focusF']  = { label: 'Focus Far' };
		actions['focusS']  = { label: 'Focus Stop' };
		actions['focusM'] = {
			label: 'Focus Mode',
			options: [
				{
					type: 'dropdown',
					label: 'Focus mode',
					id: 'mode',
					default: 'auto',
					choices: this.CHOICES_AUTOMANUAL
				}
			]
		};
		actions['fSpeedS'] = {
			label: 'Focus Speed',
			options: [
				{
					type: 'number',
					label: 'Speed',
					id: 'speed',
					min: 1,
					max: 8,
					default: 4,
					required: true,
					range: true
				}
			]
		};
		actions['fSpeedU']   = { label: 'Focus Speed Up' };
		actions['fSpeedD']   = { label: 'Focus Speed Down' };

		actions['gainS'] = {
			label: 'Set Gain',
			options: [
				{
					type: 'number',
					label: 'Value',
					id: 'value',
					min: 0,
					max: 11,
					default: 6,
					required: true,
					range: true
				}
			]
		};
		actions['gainU']   = { label: 'Gain Up' };
		actions['gainD']   = { label: 'Gain Down' };
		actions['awbS'] = {
			label: 'Set Auto White Balance on/off',
			options: [
				{
					type: 'dropdown',
					label: 'State',
					id: 'mode',
					default: 'on',
					choices: this.CHOICES_ONOFF
				}
			]
		};
		actions['rGainS']  = {
			label: 'Set Red Gain',
			options: [
				{
					type: 'number',
					label: 'Value',
					id: 'value',
					min: 0,
					max: 255,
					default: 128,
					required: true,
					range: true
				}
			]
		};
		actions['rGainU']   = { label: 'Red Gain Up' };
		actions['rGainD']   = { label: 'Red Gain Down' };
		actions['bGainS']  = {
			label: 'Set Blue Gain',
			options: [
				{
					type: 'number',
					label: 'Value',
					id: 'value',
					min: 0,
					max: 255,
					default: 128,
					required: true,
					range: true
				}
			]
		};
		actions['bGainU']   = { label: 'Blue Gain Up' };
		actions['bGainD']   = { label: 'Blue Gain Down' };

		actions['blcS'] = {
			label: 'Set Backlight Compensation on/off',
			options: [
				{
					type: 'dropdown',
					label: 'State',
					id: 'mode',
					default: 'on',
					choices: this.CHOICES_ONOFF
				}
			]
		};
		actions['aIrisS'] = {
			label: 'Set Auto Iris on/off',
			options: [
				{
					type: 'dropdown',
					label: 'State',
					id: 'mode',
					default: 'on',
					choices: this.CHOICES_ONOFF
				}
			]
		};
		actions['irisS'] = {
			label: 'Set Iris',
			options: [
				{
					type: 'number',
					label: 'Value',
					id: 'value',
					min: 0,
					max: 11,
					default: 6,
					required: true,
					range: true
				}
			]
		};
		actions['irisU']   = { label: 'Iris Up' };
		actions['irisD']   = { label: 'Iris Down' };
		actions['detailS'] = {
			label: 'Set Detail',
			options: [
				{
					type: 'number',
					label: 'Value',
					id: 'value',
					min: 0,
					max: 15,
					default: 8,
					required: true,
					range: true
				}
			]
		};
		actions['detailU']   = { label: 'Detail Up' };
		actions['detailD']   = { label: 'Detail Down' };
		actions['chromaS'] = {
			label: 'Set Chroma',
			options: [
				{
					type: 'number',
					label: 'Value',
					id: 'value',
					min: 0,
					max: 14,
					default: 7,
					required: true,
					range: true
				}
			]
		};
		actions['chromaU']   = { label: 'Chroma Up' };
		actions['chromaD']   = { label: 'Chroma Down' };
		actions['gammaS'] = {
			label: 'Set Gamma',
			options: [
				{
					type: 'number',
					label: 'Value',
					id: 'value',
					min: -64,
					max: 64,
					default: 0,
					required: true,
					range: true
				}
			]
		};
		actions['gammaU']   = { label: 'Gamma Up' };
		actions['gammaD']   = { label: 'Gamma Down' };
		actions['wdrS'] = {
			label: 'Set Wide Dynamic Range on/off',
			options: [
				{
					type: 'dropdown',
					label: 'State',
					id: 'mode',
					default: 'on',
					choices: this.CHOICES_ONOFF
				}
			]
		};

		actions['savePset'] = {
			label: 'Save Preset',
			options: [
				{
					type: 'number',
					label: 'Preset #',
					id: 'val',
					min: 1,
					max: 16,
					default: 1,
					required: true,
					range: true
				},
				{
					type: 'number',
					label: 'Speed',
					id: 'speed',
					min: 1,
					max: 24,
					default: 1,
					required: true,
					range: true
				},
				{
					type: 'checkbox',
					label: 'Include color data?',
					id: 'ccu',
					default: false
				}
			]
		};
		actions['recallPset'] = {
			label: 'Recall Preset',
			options: [
				{
					type: 'number',
					label: 'Preset #',
					id: 'val',
					min: 1,
					max: 16,
					default: 1,
					required: true,
					range: true
				}
			]
		};
		actions['saveCCU'] = {
			label: 'Save CCU Preset',
			options: [
				{
					type: 'dropdown',
					label: 'Preset',
					id: 'preset',
					default: '1',
					choices: this.CHOICES_CCUSCENES_S
				}
			]
		};
		actions['recallCCU'] = {
			label: 'Recall CCU Preset',
			options: [
				{
					type: 'dropdown',
					label: 'Preset',
					id: 'preset',
					default: 'F1',
					choices: this.CHOICES_CCUSCENES_R
				}
			]
		};
		actions['setLed'] = {
			label: 'Set LED on/off',
			options: [
				{
					type: 'dropdown',
					label: 'State',
					id: 'mode',
					default: 'on',
					choices: this.CHOICES_ONOFF
				}
			]
		};
		actions['setStandby'] = {
			label: 'Set standby',
			options: [
				{
					type: 'dropdown',
					label: 'State',
					id: 'mode',
					default: 'toggle',
					choices: this.CHOICES_ONOFFTOGGLE
				}
			]
		};
		actions['setVidMute'] = {
			label: 'Set video mute',
			options: [
				{
					type: 'dropdown',
					label: 'State',
					id: 'mode',
					default: 'toggle',
					choices: this.CHOICES_ONOFFTOGGLE
				}
			]
		};

		return actions;
	}
}