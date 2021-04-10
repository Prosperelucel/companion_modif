exports = module.exports = function() {

	var self = this;
    var portLabel = "Port ID";

    self.system.emit('instance_actions', self.id, {
        // beep
		'beep_startup': {
			label: 'Play the startup tune',
			options: []
		},

        // config
        'config_set': {
			label: 'Set configuration properties',
			options: [
				{
					type: 'textinput',
					label: 'Name',
					id: 'configname',
                    required: true,
					default: ''
				},
				{
					type: 'textinput',
					label: 'Value',
					id: 'configvalue',
                    required: true,
					default: ''
				}

            ]
		},

        // notifications
        'notification_message': {
			label: 'Send a message to all users',
			options: [
				{
					type: 'textinput',
					label: "Message to send",
					id: 'message',
                    required: true,
					default: ''
				}
			]
		},

        // record
        'record_monitor': {
			label: 'Monitor Port (E-E)',
			options: [
				{
					type: 'dropdown',
					label: portLabel,
					id: 'port',
                    choices: self.PORTLIST_REC
				}
			]
		},
		'record_stop': {
			label: 'Stop Recording',
			options: [
				{
					type: 'dropdown',
					label: portLabel,
					id: 'port',
                    choices: self.PORTLIST_REC
				}
			]
		},
		'record_start': {
			label: 'Start Recording',
			options: [
				{
					type: 'dropdown',
					label: portLabel,
					id: 'port',
                    choices: self.PORTLIST_REC
				}
			]
		},
		'record_chunknow': {
			label: 'Chunk recording now',
			options: [
				{
					type: 'dropdown',
					label: portLabel,
					id: 'port',
                    choices: self.PORTLIST_REC
				}
			]
		},
		'record_keyframe': {
			label: 'Add keyframe while recording',
			options: [
				{
					type: 'dropdown',
					label: portLabel,
					id: 'port',
                    choices: self.PORTLIST_REC
				}
			]
		},
		'record_grabstill': {
			label: 'Grab still while recording',
			options: [
				{
					type: 'dropdown',
					label: portLabel,
					id: 'port',
                    choices: self.PORTLIST_REC
				}
			]
		},

        // port
		'port_togglelock': {
			label: 'Toggle the port lock',
			options: [
				{
					type: 'dropdown',
					label: portLabel,
					id: 'port',
                    choices: self.PORTLIST_ALL
				}
			]
		},
		'port_setlock': {
			label: 'Set the port lock',
			options: [
				{
					type: 'dropdown',
					label: portLabel,
					id: 'port',
                    choices: self.PORTLIST_ALL
				},
				{
					type: 'checkbox',
					label: 'Locked',
					id: 'lockstate',
					default: true
				}
			]
		},
		'portsettings_togglemodetype': {
			label: 'Toggle the port mode (HD/SD)',
			options: [
				{
					type: 'dropdown',
					label: portLabel,
					id: 'port',
                    choices: self.PORTLIST_ALL
				}
			]
		},

        // playout
		'playout_eject': {
			label: 'Eject the currently playing clip and clear the playlist',
			options: [
				{
					type: 'dropdown',
					label: portLabel,
					id: 'port',
                    choices: self.PORTLIST_PLAY
				}
			]
		},
		'playout_repeatframes': {
			label: 'Repeat the specified number of frames during playout',
			options: [
				{
					type: 'dropdown',
					label: portLabel,
					id: 'port',
                    choices: self.PORTLIST_PLAY
				},
				{
                    type: 'number',
					label: 'Number of frames',
					id: 'framecount',
                    required: true,
                    min: 1,
                    max: 9999,
                    default: 25,
				}
			]
		},
		'playout_dropframes': {
			label: 'Drop the specified number of frames during playout',
			options: [
				{
					type: 'dropdown',
					label: portLabel,
					id: 'port',
                    choices: self.PORTLIST_PLAY
				},
				{
                    type: 'number',
					label: 'Number of frames',
					id: 'framecount',
                    required: true,
                    min: 1,
                    max: 9999,
                    default: 25,
				}
			]
		},
		'playout_removeall': {
			label: 'Remove all items from the playlist',
			options: [
				{
					type: 'dropdown',
					label: portLabel,
					id: 'port',
                    choices: self.PORTLIST_PLAY
				}
			]
		},
		'playout_keyframe': {
			label: 'Create a user keyframe from the currently playing clip',
			options: [
				{
					type: 'dropdown',
					label: portLabel,
					id: 'port',
                    choices: self.PORTLIST_PLAY
				}
			]
		},
		'playout_play': {
			label: 'Start playout. If clip is not loaded, load and play it.',
			options: [
				{
					type: 'dropdown',
					label: portLabel,
					id: 'port',
                    choices: self.PORTLIST_PLAY
				}
			]
		},
		'playout_pause': {
			label: 'Pause playout. If clip is not loaded, load and pause it on the first frame',
			options: [
				{
					type: 'dropdown',
					label: portLabel,
					id: 'port',
                    choices: self.PORTLIST_PLAY
				}
			]
		},
		'playout_previous': {
			label: 'Load the previous clip in the playlist. If playing, go back to start of current clip',
			options: [
				{
					type: 'dropdown',
					label: portLabel,
					id: 'port',
                    choices: self.PORTLIST_PLAY
				}
			]
		},
		'playout_previousstep': {
			label: 'Skip back 10 frames in the currently loaded clip',
			options: [
				{
					type: 'dropdown',
					label: portLabel,
					id: 'port',
                    choices: self.PORTLIST_PLAY
				}
			]
		},
		'playout_previousframe': {
			label: 'Skip back 1 frame in the currently loaded clip',
			options: [
				{
					type: 'dropdown',
					label: portLabel,
					id: 'port',
                    choices: self.PORTLIST_PLAY
				}
			]
		},
		'playout_next': {
			label: 'Load the next clip in the playlist',
			options: [
				{
					type: 'dropdown',
					label: portLabel,
					id: 'port',
                    choices: self.PORTLIST_PLAY
				}
			]
		},
		'playout_nextstep': {
			label: 'Skip forward 10 frames in the currently loaded clip',
			options: [
				{
					type: 'dropdown',
					label: portLabel,
					id: 'port',
                    choices: self.PORTLIST_PLAY
				}
			]
		},
		'playout_nextframe': {
			label: 'Skip forward 1 frame in the currently loaded clip',
			options: [
				{
					type: 'dropdown',
					label: portLabel,
					id: 'port',
                    choices: self.PORTLIST_PLAY
				}
			]
		},
		'playout_add': {
			label: 'Add the specified clips to the playlist',
			options: [
				{
					type: 'dropdown',
					label: portLabel,
					id: 'port',
                    choices: self.PORTLIST_PLAY
				},
				{
					type: 'textinput',
					label: 'Clip IDs (comma separated)',
					id: 'clipids',
                    required: true,
					default: ''
				}
			]
		},
		'playout_loadnow': {
			label: 'Replace playlist with specified clips and hold on the first frame of first clip',
			options: [
				{
					type: 'dropdown',
					label: portLabel,
					id: 'port',
                    choices: self.PORTLIST_PLAY
				},
				{
					type: 'textinput',
					label: 'Clip IDs (comma separated)',
					id: 'clipids',
                    required: true,
					default: ''
				}
			]
		},
		'playout_playnow': {
			label: 'Replace playlist with specified clips and play first clip',
			options: [
				{
					type: 'dropdown',
					label: portLabel,
					id: 'port',
                    choices: self.PORTLIST_PLAY
				},
				{
					type: 'textinput',
					label: 'Clip IDs (comma separated)',
					id: 'clipids',
                    required: true,
					default: ''
				}
			]
		},
		'playout_load': {
			label: 'Load the specified clip index ready for playout',
			options: [
				{
					type: 'dropdown',
					label: portLabel,
					id: 'port',
                    choices: self.PORTLIST_PLAY
				},
				{
					type: 'number',
					label: 'Playlist Index to load',
                    id: 'index',
                    min: 0,
                    max: 9999,
                    default: 0,
                    required: true
				}
			]
		},
		'playout_seek': {
			label: 'Seek to the specified frame in the current clip',
			options: [
				{
					type: 'dropdown',
					label: portLabel,
					id: 'port',
                    choices: self.PORTLIST_PLAY
				},
				{
					type: 'number',
					label: 'Frame',
					id: 'frame',
                    required: true,
                    default: 0,
                    min: 0,
                    max: 999999999
				}
			]
		},
		'playout_stop': {
			label: 'Stop playout',
			options: [
				{
					type: 'dropdown',
					label: portLabel,
					id: 'port',
                    choices: self.PORTLIST_PLAY
				}
			]
		},
		'playout_togglefield': {
			label: 'Toggle field dominance for currently playling clip',
			options: [
				{
					type: 'dropdown',
					label: portLabel,
					id: 'port',
                    choices: self.PORTLIST_PLAY
				}
			]
		},
		'playout_pauseafter': {
			label: 'Toggle \'pauseafter\' mode for the port',
			options: [
				{
					type: 'dropdown',
					label: portLabel,
					id: 'port',
                    choices: self.PORTLIST_PLAY
				}
			]
		},
		'playout_loop': {
			label: 'Set \'loop\' mode for the port',
			options: [
				{
					type: 'dropdown',
					label: portLabel,
					id: 'port',
                    choices: self.PORTLIST_PLAY
				},
				{
					type: 'checkbox',
					label: 'Loop enabled',
					id: 'loopflag',
					default: true
				}
			]
		}
    });
};
