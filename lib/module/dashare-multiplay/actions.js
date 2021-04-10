exports.getActions = function() {

	var actions = {
		'go': {
			label: 'GO'
		},
		'stop_all': {
			label: 'Stop all cue\'s'
		},
		'fade_all': {
			label: 'Fade all cue\'s'
		},
		'pause_all': {
			label: 'Pause all cue\'s'
		},
		'resume_all': {
			label: 'Resume all cue\'s'
		},
		'stopwatch_start': {
			label: 'Stopwatch start'
		},
		'stopwatch_stop': {
			label: 'Stopwatch stop'
		},
		'stopwatch_reset': {
			label: 'Stopwatch reset'
		},
		'advance': {
			label: 'Advance current GO position'
		},
		'pause': {
			label: 'Pause cue'
		},
		'resume': {
			label: 'Resume cue'
		},
		'stop': {
			label: 'Stop cue'
		},
		'jump': {
			label: 'Jump to near end of cue'
		},
		'next_track': {
			label: 'Next track in playlist'
		},
		'previous_track': {
			label: 'Previous track in playlist'
		}
	};

	return(actions);
}
