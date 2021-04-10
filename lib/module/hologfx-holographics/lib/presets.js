module.exports = {
	initPresets() {
		let presets = []

		this.STATE.widgets.forEach((widget) => {
			presets.push({
				category: 'Widgets',
				label: 'Toggle Widget',
				bank: {
					style: 'text',
					text: widget.name === '' ? widget.type : widget.name,
					size: '18',
					color: this.rgb(255,255,255),
					bgcolor: this.rgb(0,0,0),
					latch: true
				},
				feedbacks: [
					{
						type: 'widget_active',
						options: {
							widget: widget.id,
							bg: this.rgb(255,0,0),
							fg: this.rgb(255,255,255),
						}
					}
				],
				actions: [
					{
						action: 'setWidgetVisibility',
						options: {
							visibility: 'true',
							widget: widget.id
						}
					}
				],
				release_actions: [
					{
						action: 'setWidgetVisibility',
						options: {
							visibility: 'false',
							widget: widget.id
						}
					}
				]
			})
		})

		this.STATE.entries.forEach((entry) => {
			let name = entry.props[Object.keys(entry.props)[0]]

			presets.push({
				category: 'Entries',
				label: 'Toggle Entry',
				bank: {
					style: 'text',
					text: name,
					size: '18',
					color: this.rgb(255,255,255),
					bgcolor: this.rgb(0,0,0),
					latch: true
				},
				feedbacks: [
					{
						type: 'entry_active',
						options: {
							entry: entry.id,
							bg: this.rgb(255,0,0),
							fg: this.rgb(255,255,255),
						}
					}
				],
				actions: [
					{
						action: 'setEntryVisibility',
						options: {
							visibility: 'true',
							entry: entry.id
						}
					}
				],
				release_actions: [
					{
						action: 'setEntryVisibility',
						options: {
							visibility: 'false',
							entry: entry.id
						}
					}
				]
			})
		})

		this.setPresetDefinitions(presets)
	}
}