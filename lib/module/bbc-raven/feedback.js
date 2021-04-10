exports = module.exports = function (feedback) {

	var self = this;
	var options = feedback.options;

	if (options === undefined || options.port === undefined) {
		return {};
	}

	// if configured port has a value in the states array
	if (self.states['portstates'][options.port] !== undefined) {

		// fetch state
		var portstate = self.states['portstates'][options.port];

		// match type
		if (feedback.type == 'is_playing') {

			// calculate result
			if (portstate == "PLAYINGP" || portstate == "LININGUPP") {
				return { color: self.color_white, bgcolor: self.color_green }
			}
			else {
				return {}
			}
		}

		// match type
		if (feedback.type == 'is_paused') {

			// calculate result
			if (portstate == "ALLOCATEDP" || portstate == "LOADEDP") {
				return { color: self.color_white, bgcolor: self.color_green }
			}
			else {
				return {}
			}
		}

		// match type
		if (feedback.type == 'is_idle') {

			// calculate result
			if (portstate == "IDLEP") {
				return { color: self.color_white, bgcolor: self.color_blue }
			}
			else {
				return {}
			}
		}

		// match type
		if (feedback.type == 'is_recording') {

			// calculate result
			if (portstate == "RECORDINGP") {
				return { color: self.color_white, bgcolor: self.color_red }
			}
			else {
				return {}
			}
		}

		// match type
		if (feedback.type == 'is_monitoring') {

			// calculate result
			if (portstate == "MONITORINGP") {
				return { color: self.color_white, bgcolor: self.color_blue }
			}
			else {
				return {}
			}
		}

	}

	return {}
};
