exports.getPresets = function(self) {

	var presets = [];

	presets.push({
		category: 'Basic control',
		bank: {
			style: 'text',
			text: 'GO',
			size: '14',
			color: self.rgb(255,255,255),
			bgcolor: self.rgb(51,51,255)
		},
		actions: [
			{
				action: 'go'
			}
		]
	})

	presets.push({
		category: 'Basic control',
		bank: {
			style: 'text',
			text: 'Stop All',
			size: '14',
			color: self.rgb(255,255,255),
			bgcolor: self.rgb(51,51,255)
		},
		actions: [
			{
				action: 'stop_all'
			}
		]
	})

	presets.push({
		category: 'Basic control',
		bank: {
			style: 'text',
			text: 'Pause',
			size: '14',
			color: self.rgb(255,255,255),
			bgcolor: self.rgb(51,51,255)
		},
		actions: [
			{
				action: 'pause'
			}
		]
	})

	presets.push({
		category: 'Basic control',
		bank: {
			style: 'text',
			text: 'Resume',
			size: '14',
			color: self.rgb(255,255,255),
			bgcolor: self.rgb(51,51,255)
		},
		actions: [
			{
				action: 'resume'
			}
		]
	})

	return(presets);
}
