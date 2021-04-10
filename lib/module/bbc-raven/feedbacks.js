exports = module.exports = function () {

	var self = this;

	// feedbacks
	var feedbacks = {
		'is_playing': {
			label: 'Port is playing out',
			description: 'If currently playing out, highlight button',
			options: [
				{
					type: 'dropdown',
					label: "Port ID",
					id: 'port',
					choices: self.PORTLIST_PLAY
				}
			]
		},
		'is_paused': {
			label: 'Port is paused',
			description: 'If currently paused, highlight button',
			options: [
				{
					type: 'dropdown',
					label: "Port ID",
					id: 'port',
					choices: self.PORTLIST_PLAY
				}
			]
		},
		'is_recording': {
			label: 'Port is recording',
			description: 'If currently recording, highlight button',
			options: [
				{
					type: 'dropdown',
					label: "Port ID",
					id: 'port',
					choices: self.PORTLIST_REC
				}
			]
		},
		'is_monitoring': {
			label: 'Port is monitoring (E-E)',
			description: 'If currently in monitor mode, highlight button',
			options: [
				{
					type: 'dropdown',
					label: "Port ID",
					id: 'port',
					choices: self.PORTLIST_REC
				}
			]
		},
		'is_idle': {
			label: 'Port is idle',
			description: 'If currently idle, highlight button',
			options: [
				{
					type: 'dropdown',
					label: "Port ID",
					id: 'port',
					choices: self.PORTLIST_ALL
				}
			]
		}
	};

	self.setFeedbackDefinitions(feedbacks);
};
