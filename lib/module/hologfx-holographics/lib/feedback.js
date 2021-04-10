module.exports = {
	initFeedbacks() {
		this.setFeedbackDefinitions({
			widget_active: {
				label: 'Change background color by widget visibility',
				description: 'If the widget specified is visible on the renderer, change background color of the bank',
				options: [
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
					},
					{
						type: 'dropdown',
						label: 'Widget',
						id: 'widget',
						default: 1,
						choices: this.WIDGETS
					}
				],
				callback: (feedback) => {
					let widget = this.STATE.widgets.find(widget => widget.id === feedback.options.widget)

					let entries = this.STATE.entries.filter(entry => entry.widgetId === feedback.options.widget)

					let visible = {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					}

					if (widget && widget.props.visibility === true) return visible
					if (entries.some(entry => entry.visibility)) return visible
				}
			},
			entry_active: {
				label: 'Change background color by entry visibility',
				description: 'If the entry specified is visible on the renderer, change background color of the bank',
				options: [
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
					},
					{
						type: 'dropdown',
						label: 'Entry',
						id: 'entry',
						default: 1,
						choices: this.ENTRIES
					}
				],
				callback: (feedback) => {
					let entry = this.STATE.entries.find(entry => entry.id === feedback.options.entry)
					
					let visible = {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					}

					if (entry && entry.visibility === true) return visible
				}
			},
		})
	}
}