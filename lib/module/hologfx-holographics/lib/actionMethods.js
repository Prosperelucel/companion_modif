module.exports = {
	async setColor ({ colorvar, color }) {
		await this.Holographics.state.patch({ data: { style: { [colorvar]: color } }})
	},
	async setTheme ({ filename }) {
		await this.Holographics.state.patch({ data: { style: { activeTheme: filename } }})
	},
	async setWidgetVisibility ({ widget, visibility }) {
		await this.Holographics.widgets.toggle({ id: widget, data: { visibility: JSON.parse(visibility) }})
	},
	async setWidgetStyle ({ widget, horizontal_position, horizontal_offset, vertical_position, vertical_offset, font_size, widget_padding, global_padding, width, height }) {
		await this.Holographics.widgets.patch(
			{ 
				id: widget,
				data: { 
					style: {
						horizontal_position: horizontal_position === '' ? undefined : horizontal_position,
						vertical_position: vertical_position === '' ? undefined : vertical_position,
						horizontal_offset: horizontal_offset === '' ? undefined : Number(horizontal_offset),
						vertical_offset: vertical_offset === '' ? undefined : Number(vertical_offset),
						font_size: font_size === '' ? undefined : font_size,
						widget_padding: widget_padding === '' ? undefined : widget_padding,
						global_padding: global_padding === '' ? undefined : global_padding,
						width: width === '' ? undefined : width,
						height: height === '' ? undefined : height
					}
				}
			}
		)
	},
	async setEntryVisibility ({ entry, visibility }) {
		await this.Holographics.entries.patch({ id: entry, data: { visibility: JSON.parse(visibility) }})
	}
}