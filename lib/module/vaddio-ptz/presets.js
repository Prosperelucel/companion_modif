module.exports = {

	/**
	 * INTERNAL: initialize presets.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initPresets () {
		var presets = [];

		for (var pt in this.PRESETS_PT) {

			presets.push({
				category: 'Pan/Tilt',
				label: this.PRESETS_PT[pt].label,
				bank: {
					style: 'png',
					text: '',
					png64: this.PRESETS_PT[pt].icon,
					pngalignment: 'center:center',
					size: '18',
					color: this.rgb(255,255,255),
					bgcolor: this.rgb(0,0,0)
				},
				actions: [
					{
						action: this.PRESETS_PT[pt].id,
					}
				],
				release_actions: [
					{
						action: 'stop',
					}
				]
			});
		}

		presets.push({
			category: 'Pan/Tilt',
			label: 'HOME',
			bank: {
				style: 'png',
				text: 'HOME',
				size: '18',
				color: this.rgb(255,255,255),
				bgcolor: this.rgb(0,0,0)
			},
			actions: [
				{
					action: 'home',
				}
			]
		});

		for (var num = 1; num <= 16; num++) {
			for (var type in this.PRESETS_PRESETS) {

				presets.push({
					category: this.PRESETS_PRESETS[type].group,
					label: this.PRESETS_PRESETS[type].label + num,
					bank: {
						style: 'text',
						text: this.PRESETS_PRESETS[type].label + num,
						size: '14',
						color: this.rgb(255,255,255),
						bgcolor: this.rgb(0,0,0)
					},
					actions: [
						{
							action: this.PRESETS_PRESETS[type].id,
							options: {
								val: num,
								speed: this.PRESETS_PRESETS[type].speed,
								ccu: false
							}
						}
					]
				});
			}
		}

		for (var type in this.CHOICES_CCUSCENES_R) {

			presets.push({
				category: 'CCU Presets',
				label: 'Recall ' + this.CHOICES_CCUSCENES_R[type].label,
				bank: {
					style: 'text',
					text: 'Recall ' + this.CHOICES_CCUSCENES_R[type].label,
					size: '14',
					color: this.rgb(255,255,255),
					bgcolor: this.rgb(0,0,0)
				},
				actions: [
					{
						action: 'recallCCU',
						options: {
							speed: this.CHOICES_CCUSCENES_R[type].id
						}
					}
				]
			});
		}

		for (var type in this.CHOICES_CCUSCENES_S) {

			presets.push({
				category: 'CCU Presets',
				label: 'Save ' + this.CHOICES_CCUSCENES_S[type].label,
				bank: {
					style: 'text',
					text: 'Save ' + this.CHOICES_CCUSCENES_S[type].label,
					size: '14',
					color: this.rgb(255,255,255),
					bgcolor: this.rgb(0,0,0)
				},
				actions: [
					{
						action: 'saveCCU',
						options: {
							speed: this.CHOICES_CCUSCENES_S[type].id
						}
					}
				]
			});
		}

		for (var pt in this.PRESETS_STATES) {

			presets.push({
				category: this.PRESETS_STATES[pt].group,
				label: this.PRESETS_STATES[pt].label,
				bank: {
					style: 'text',
					text: this.PRESETS_STATES[pt].label,
					size: '14',
					color: this.rgb(255,255,255),
					bgcolor: this.rgb(0,0,0)
				},
				actions: [
					{
						action: this.PRESETS_STATES[pt].action,
						options: {
							mode: this.PRESETS_STATES[pt].actionValue
						}
					}
				],
				feedbacks: [
					{
						type: this.PRESETS_STATES[pt].feedback,
						options: {
							bg: this.rgb(255,255,0),
							fg: this.rgb(0,0,0),
							mode: this.PRESETS_STATES[pt].fbValue
						}
					}
				]
			});
		}

		for (var pt in this.PRESETS_VALUES) {

			let pst = {
				category: this.PRESETS_VALUES[pt].group,
				label: this.PRESETS_VALUES[pt].label,
				bank: {
					style: 'text',
					text: this.PRESETS_VALUES[pt].label,
					size: this.PRESETS_VALUES[pt].size,
					color: this.rgb(255,255,255),
					bgcolor: this.rgb(0,0,0)
				},
				actions: [
					{
						action: this.PRESETS_VALUES[pt].action
					}
				]
			};

			if (this.PRESETS_VALUES[pt].release !== undefined) {
				pst.release_Actions = [
					{
						action: this.PRESETS_VALUES[pt].release
					}
				]
			}

			presets.push(pst);
		}

		this.setPresetDefinitions(presets);
	}
}