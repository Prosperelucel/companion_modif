module.exports = {

	/**
	 * INTERNAL: initialize presets.
	 *
	 * @access protected
	 * @since 1.3.0
	 */
	initPresets () {
		var presets = [];

		for (var i = 0; i < this.inputCount; i++) {

			presets.push({
				category: 'Multiview',
				label: 'Solo: ' + this.getInput(i).name + '',
				bank: {
					style: 'text',
					text: 'Solo: $(videohub:input_' + (i+1) + ')',
					size: '14',
					color: this.rgb(255,255,255),
					bgcolor: this.rgb(0,0,0)
				},
				feedbacks: [
					{
						type: 'solo_source',
						options: {
							bg: this.rgb(255,255,0),
							fg: this.rgb(0,0,0),
							input: i
						}
					}
				],
				actions: [
					{
						action: 'solo',
						options: {
							inp: i
						}
					}
				]
			});
			presets.push({
				category: 'Multiview',
				label: 'Audio: ' + this.getInput(i).name + '',
				bank: {
					style: 'text',
					text: 'Audio: $(videohub:input_' + (i+1) + ')',
					size: '14',
					color: this.rgb(255,255,255),
					bgcolor: this.rgb(0,0,0)
				},
				feedbacks: [
					{
						type: 'audio_source',
						options: {
							bg: this.rgb(255,255,0),
							fg: this.rgb(0,0,0),
							input: i
						}
					}
				],
				actions: [
					{
						action: 'audio',
						options: {
							inp: i
						}
					}
				]
			});
		}

		for (var type in this.PRESETS_SETTIGS) {
			for (var choice in this.PRESETS_SETTIGS[type].choices) {

				presets.push({
					category: 'Settings',
					label: this.PRESETS_SETTIGS[type].label + this.PRESETS_SETTIGS[type].choices[choice].preset,
					bank: {
						style: 'text',
						text: this.PRESETS_SETTIGS[type].label + this.PRESETS_SETTIGS[type].choices[choice].preset,
						size: '14',
						color: this.rgb(255,255,255),
						bgcolor: this.rgb(0,0,0)
					},
					feedbacks: [
						{
							type: this.PRESETS_SETTIGS[type].feedback,
							options: {
								bg: this.rgb(255,255,0),
								fg: this.rgb(0,0,0),
								setting: this.PRESETS_SETTIGS[type].choices[choice].id
							}
						}
					],
					actions: [
						{
							action: this.PRESETS_SETTIGS[type].action,
							options: {
								setting: this.PRESETS_SETTIGS[type].choices[choice].id
							}
						}
					]
				});
			}
		}

		this.setPresetDefinitions(presets);
	}
}