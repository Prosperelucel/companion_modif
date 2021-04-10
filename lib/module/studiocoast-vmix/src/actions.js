exports.getActions = function() {
	const mixSelect = {
		type: 'dropdown',
		label: 'Mix',
		id: 'mix',
		default: 0,
		choices: [1, 2, 3, 4].map((id, index) => ({ id: index, label: id }))
	};

	const input = {
		type: 'textinput',
		label: 'Input',
		id: 'input'
	};

	const audioBusMaster = {
		type: 'dropdown',
		label: 'Bus',
		id: 'value',
		default: 'Master',
		choices: ['Master', 'A', 'B', 'C', 'D', 'E', 'F', 'G'].map(id => ({ id, label: id }))
	};

	const audioBus = {
		type: 'dropdown',
		label: 'Bus',
		id: 'value',
		default: 'A',
		choices: ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(id => ({ id, label: id }))
	};

	return {
		PreviewInput: {
			label: 'Input - Send Input to Preview',
			options: [input, mixSelect]
		},

		PreviewInputNext: { label: 'Input - Send Next input to Preview' },

		PreviewInputPrevious: { label: 'Input - Send Previous input to Preview' },

		programCut: {
			label: 'Transition - Send Input to Program',
			options: [input, mixSelect]
		},

		transitionMix: {
			label: 'Transition - Transition mix',
			options: [
				mixSelect,
				{
					type: 'dropdown',
					label: 'Select transition',
					id: 'functionID',
					default: 'Cut',
					choices: [
						'Cut',
						'Fade',
						'Zoom',
						'Wipe',
						'Slide',
						'Fly',
						'CrossZoom',
						'FlyRotate',
						'Cube',
						'CubeZoom',
						'VerticalWipe',
						'VerticalSlide',
						'Merge',
						'WipeReverse',
						'SlideReverse',
						'VerticalWipeReverse',
						'VerticalSlideReverse'
					].map(transition => ({ id: transition, label: transition }))
				},
				{
					type: 'textinput',
					label: 'Duration',
					id: 'duration',
					default: 1000
				}
			]
		},

		transition: {
			label: 'Transition - Auto Transition',
			options: [
				{
					type: 'dropdown',
					label: 'Select transition',
					id: 'functionID',
					default: 'Transition1',
					choices: [
						{ id: 'Transition1', label: 'Transition 1' },
						{ id: 'Transition2', label: 'Transition 2' },
						{ id: 'Transition3', label: 'Transition 3' },
						{ id: 'Transition4', label: 'Transition 4' },
						{ id: 'Stinger1', label: 'Stinger 1' },
						{ id: 'Stinger2', label: 'Stinger 2' }
					]
				}
			]
		},

		QuickPlay: {
			label: 'Transition - Quick Play input to Program',
			options: [input]
		},

		outputSet: {
			label: 'Output - Set Output Source',
			options: [
				{
					type: 'dropdown',
					label: 'Select Output',
					id: 'functionID',
					default: 'SetOutput2',
					choices: [
						{ id: 'SetOutput2', label: 'Output 2' },
						{ id: 'SetOutput3', label: 'Output 3' },
						{ id: 'SetOutput4', label: 'Output 4' },
						{ id: 'SetOutputExternal2', label: 'Output External 2' },
						{ id: 'SetOutputFullscreen', label: 'Output Fullscreen 1' },
						{ id: 'SetOutputFullscreen2', label: 'Output Fullscreen 2' }
					]
				},
				{
					type: 'dropdown',
					label: 'Select Input Type',
					id: 'value',
					default: 'Output',
					choices: [
						{ id: 'Output', label: 'Output (Program)' },
						{ id: 'Preview', label: 'Preview' },
						{ id: 'MultiView', label: 'Multiview' },
						{ id: 'Input', label: 'Input' }
					]
				},
				input
			]
		},

		toggleFunctions: {
			label: 'Output - Toggle Functions',
			options: [
				{
					type: 'dropdown',
					label: 'Toggle Function',
					id: 'functionID',
					default: 'StartStopMultiCorder',
					choices: [
						{ id: 'StartStopMultiCorder', label: 'Start / Stop MultCorder' },
						{ id: 'StartStopRecording', label: 'Start / Stop Recording' },
						{ id: 'StartStopStreaming', label: 'Start / Stop Stream' },
						{ id: 'StartStopExternal', label: 'Start / Stop External' },
						{ id: 'Fullscreen', label: 'Start / Stop Fullscreen' },
						{ id: 'FadeToBlack', label: 'Fade To Black' }
					]
				}
			]
		},

		playListFunctions: {
			label: 'Playlist - Functions',
			options: [
				{
					type: 'dropdown',
					label: 'Playlist Function',
					id: 'functionID',
					default: 'StartPlayList',
					choices: [
						{ id: 'StartPlayList', label: 'Start Play List' },
						{ id: 'StopPlayList', label: 'Stop Play List' },
						{ id: 'NextPlayListEntry', label: 'Next Item in Play List' },
						{ id: 'PreviousPlayListEntry', label: 'Previous Item in Play List' }
					]
				}
			]
		},

		SelectPlayList: {
			label: 'Playlist - Open Playlist',
			options: [
				{
					type: 'textinput',
					label: 'Playlist name',
					id: 'playlistName'
				}
			]
		},

		overlayFunctions: {
			label: 'Overlay - Functions',
			options: [
				{
					type: 'dropdown',
					label: 'Select Overlay Function',
					id: 'functionID',
					default: 'OverlayInput1',
					choices: [
						{ id: 'OverlayInput1', label: 'Toggle Overlay 1 on program' },
						{ id: 'OverlayInput2', label: 'Toggle Overlay 2 on program' },
						{ id: 'OverlayInput3', label: 'Toggle Overlay 3 on program' },
						{ id: 'OverlayInput4', label: 'Toggle Overlay 4 on program' },
						{ id: 'PreviewOverlayInput1', label: 'Toggle Overlay 1 on preview' },
						{ id: 'PreviewOverlayInput2', label: 'Toggle Overlay 2 on preview' },
						{ id: 'PreviewOverlayInput3', label: 'Toggle Overlay 3 on preview' },
						{ id: 'PreviewOverlayInput4', label: 'Toggle Overlay 4 on preview' },
						{ id: 'OverlayInput1In', label: 'Transition Overlay 1 on' },
						{ id: 'OverlayInput2In', label: 'Transition Overlay 2 on' },
						{ id: 'OverlayInput3In', label: 'Transition Overlay 3 on' },
						{ id: 'OverlayInput4In', label: 'Transition Overlay 4 on' },
						{ id: 'OverlayInput1Out', label: 'Transition Overlay 1 off' },
						{ id: 'OverlayInput2Out', label: 'Transition Overlay 2 off' },
						{ id: 'OverlayInput3Out', label: 'Transition Overlay 3 off' },
						{ id: 'OverlayInput4Out', label: 'Transition Overlay 4 off' },
						{ id: 'OverlayInput1Off', label: 'Set Overlay 1 off' },
						{ id: 'OverlayInput2Off', label: 'Set Overlay 2 off' },
						{ id: 'OverlayInput3Off', label: 'Set Overlay 3 off' },
						{ id: 'OverlayInput4Off', label: 'Set Overlay 4 off' },
						{ id: 'OverlayInputAllOff', label: 'Set All Overlays off' },
						{ id: 'OverlayInput1Zoom', label: 'Zoom PIP Overlay 1 to/from fulscreen' },
						{ id: 'OverlayInput2Zoom', label: 'Zoom PIP Overlay 2 to/from fulscreen' },
						{ id: 'OverlayInput3Zoom', label: 'Zoom PIP Overlay 3 to/from fulscreen' },
						{ id: 'OverlayInput4Zoom', label: 'Zoom PIP Overlay 4 to/from fulscreen' }
					]
				},
				input
			]
		},

		SetVolumeFade: {
			label: 'Audio - Set Volume Fade',
			options: [
				{
					type: 'textinput',
					label: 'Fade to volume',
					id: 'fadeMin',
					default: '0',
					regex: '/^[0-9]*$/'
				},
				{
					type: 'textinput',
					label: 'Fade time in ms',
					id: 'fadeTime',
					default: '2000',
					regex: '/^(?!(0))[0-9]*$/'
				},
				input
			]
		},

		AudioBus: {
			label: 'Audio - Route Input to Bus',
			options: [input, audioBusMaster]
		},

		BusXSendToMaster: {
			label: 'Audio - Route Bus to Master',
			options: [audioBus]
		},

		BusXAudio: {
			label: 'Audio - Bus Mute',
			options: [audioBusMaster]
		},

		Audio: {
			label: 'Audio - Input Mute',
			options: [input]
		},

		BusXSolo: {
			label: 'Audio - Bus Solo',
			options: [audioBus]
		},

		Solo: {
			label: 'Audio - Input Solo',
			options: [input]
		},

		StartCountdown: {
			label: 'Title - Start Countdown',
			options: [input]
		},

		StopCountdown: {
			label: 'Title - Stop Countdown',
			options: [input]
		},

		PauseCountdown: {
			label: 'Title - Pause Countdown',
			options: [input]
		},

		SetCountdown: {
			label: 'Title - Set Countdown Time',
			options: [
				{
					type: 'textinput',
					label: 'Time (00:00:00)',
					id: 'value',
					default: '00:10:00',
					regex: '/^[0-9][0-9]:[0-9][0-9]:[0-9][0-9]$/'
				},
				input
			]
		},

		SetText: {
			label: 'Title - Adjust title text',
			options: [
				input,
				{
					type: 'textinput',
					label: 'Layer',
					id: 'selectedIndex',
					default: 0
				},
				{
					type: 'dropdown',
					label: 'Adjustment',
					id: 'adjustment',
					default: 'Set',
					choices: ['Set', 'Increment', 'Decrement'].map(item => ({ id: item, label: item }))
				},
				{
					type: 'textinput',
					label: 'value',
					id: 'value',
					default: ''
				}
			]
		},

		replayACamera: {
			label: 'Replay - Replay A Camera',
			options: [
				{
					type: 'dropdown',
					label: 'Camera',
					id: 'functionID',
					default: 'ReplayACamera1',
					choices: ['ReplayACamera1', 'ReplayACamera2', 'ReplayACamera3', 'ReplayACamera4'].map((item, index) => ({ id: item, label: `Camera ${index + 1}` }))
				}
			]
		},

		replayBCamera: {
			label: 'Replay - Replay B Camera',
			options: [
				{
					type: 'dropdown',
					label: 'Camera',
					id: 'functionID',
					default: 'ReplayBCamera1',
					choices: ['ReplayBCamera1', 'ReplayBCamera2', 'ReplayBCamera3', 'ReplayBCamera4'].map((item, index) => ({ id: item, label: `Camera ${index + 1}` }))
				}
			]
		},

		replayMark: {
			label: 'Replay - Mark Functions',
			options: [
				{
					type: 'dropdown',
					label: 'Function',
					id: 'functionID',
					default: 'ReplayMarkIn',
					choices: [
						'ReplayMarkCancel',
						'ReplayMarkIn',
						'ReplayMarkInLive',
						'ReplayMarkInOut',
						'ReplayMarkInOutLive',
						'ReplayMarkInOutRecorded',
						'ReplayMarkInRecorded',
						'ReplayMarkInRecordedNow',
						'ReplayMarkOut'
					].map(item => ({ id: item, label: item.substr(10) }))
				},
				{
					type: 'textinput',
					label: 'Seconds (when used)',
					id: 'value',
					default: ''
				}
			]
		},

		replayMoveInOut: {
			label: 'Replay - Move Selected Event In/Out',
			options: [
				{
					type: 'dropdown',
					label: 'In / Out',
					id: 'functionID',
					default: 'ReplayMoveSelectedInPoint',
					choices: [
						{ id: 'ReplayMoveSelectedInPoint', label: 'Move In Point' },
						{ id: 'ReplayMoveSelectedOutPoint', label: 'Move Out Point' }
					]
				},
				{
					type: 'textinput',
					label: 'Frames',
					id: 'value',
					default: '30'
				}
			]
		},

		replayUpdateInOut: {
			label: 'Replay - Move Selected Event In/Out to Now',
			options: [
				{
					type: 'dropdown',
					label: 'In / Out',
					id: 'functionID',
					default: 'ReplayUpdateSelectedInPoint',
					choices: [
						{ id: 'ReplayUpdateSelectedInPoint', label: 'Move In Point' },
						{ id: 'ReplayUpdateSelectedOutPoint', label: 'Move Out Point' }
					]
				}
			]
		},

		replaySelectEvents: {
			label: 'Replay - Replay Select Events',
			options: [
				{
					type: 'dropdown',
					label: 'Events',
					id: 'functionID',
					default: 'ReplaySelectEvents1',
					choices: [
						'ReplaySelectEvents1',
						'ReplaySelectEvents2',
						'ReplaySelectEvents3',
						'ReplaySelectEvents4',
						'ReplaySelectEvents5',
						'ReplaySelectEvents6',
						'ReplaySelectEvents7',
						'ReplaySelectEvents8'
					].map((item, index) => ({ id: item, label: `Events ${index + 1}` }))
				}
			]
		},

		ReplayChangeDirection: { label: 'Replay - Change Direction' },

		ReplayChangeSpeed: {
			label: 'Replay - Change Speed',
			options: [
				{
					type: 'textinput',
					label: 'Change -1 to 1',
					id: 'value',
					default: '0.1'
				}
			]
		},

		replayMoveEvent: {
			label: 'Replay - Move event',
			options: [
				{
					type: 'dropdown',
					label: 'Last/Slected',
					id: 'functionID',
					default: 'ReplaySelectEvents1',
					choices: [
						{ id: 'ReplayMoveLastEvent', label: 'Move Last' },
						{ id: 'ReplayMoveSelectedEvent', label: 'Move Selected' }
					]
				},
				{
					type: 'dropdown',
					label: 'Destination',
					id: 'value',
					default: 0,
					choices: [0, 1, 2, 3, 4, 5, 6, 7].map((item, index) => ({ id: item, label: `Events ${index + 1}` }))
				}
			]
		},

		ReplayMoveEventUpDown: {
			label: 'Replay - Move Selected Event Up/Down',
			options: [
				{
					type: 'dropdown',
					label: 'Direction',
					id: 'functionID',
					default: 'ReplayMoveSelectedEventUp',
					choices: [
						{ id: 'ReplayMoveSelectedEventUp', label: 'Move Up' },
						{ id: 'ReplayMoveSelectedEventDown', label: 'Move Down' }
					]
				}
			]
		},

		replayFastForwardBackward: {
			label: 'Replay - Fast Forward/Backward',
			options: [
				{
					type: 'dropdown',
					label: 'Direction',
					id: 'functionID',
					default: 'ReplayFastForward',
					choices: [
						{ id: 'ReplayFastForward', label: 'Forward' },
						{ id: 'ReplayFastBackward', label: 'Backward' }
					]
				},
				{
					type: 'textinput',
					label: 'Seconds',
					id: 'value',
					default: '10'
				}
			]
		},

		ReplayJumpFrames: {
			label: 'Replay - Jump Frames',
			options: [
				{
					type: 'textinput',
					label: 'Frames',
					id: 'value',
					default: '60'
				}
			]
		},

		replayRecording: {
			label: 'Replay - Recording Start/Stop/Toggle',
			options: [
				{
					type: 'dropdown',
					label: 'Recording',
					id: 'functionID',
					default: 'ReplayToggleRecording',
					choices: [
						{ id: 'ReplayStartRecording', label: 'Start' },
						{ id: 'ReplayStopRecording', label: 'Stop' },
						{ id: 'ReplayToggleRecording', label: 'Toggle' }
					]
				}
			]
		},

		ReplayJumpToNow: { label: 'Replay - Jump To Now' },

		ReplayLiveToggle: { label: 'Replay - Toggle Live' },

		ReplayPlay: { label: 'Replay - Play' },

		ReplayPause: { label: 'Replay - Pause' },

		ReplayPlayEvent: {
			label: 'Replay - Play Event',
			options: [
				{
					type: 'textinput',
					label: 'Event ID',
					id: 'value',
					default: '0'
				}
			]
		},

		replayToggleCamera: {
			label: 'Replay - Toggle Selected Event Camera',
			options: [
				{
					type: 'dropdown',
					label: 'Destination',
					id: 'camera',
					default: '1',
					choices: ['1', '2', '3', '4'].map(item => ({ id: item, label: `Camera ${item}` }))
				}
			]
		},

		NextPicture: {
			label: 'Input - Next Picture/Slide',
			options: [input]
		},

		PreviousPicture: {
			label: 'Input - Previous Picture/Slide',
			options: [input]
		},

		dataSourceAutoNext: {
			label: 'DataSource - AutoNext',
			options: [
				{
					type: 'dropdown',
					label: 'AutoNext State',
					id: 'functionID',
					defaut: 'DataSourceAutoNextOn',
					choices: [
						{ id: 'DataSourceAutoNextOn', label: 'On' },
						{ id: 'DataSourceAutoNextOff', label: 'Off' },
						{ id: 'DataSourceAutoNextOnOff', label: 'On/Off' }
					]
				},
				{
					type: 'textinput',
					label: 'Name,Table',
					id: 'value'
				}
			]
		},

		DataSourceNextRow: {
			label: 'DataSource - Next Row',
			options: [
				{
					type: 'textinput',
					label: 'Name,Table',
					id: 'value'
				}
			]
		},

		DataSourcePreviousRow: {
			label: 'DataSource - Previous Row',
			options: [
				{
					type: 'textinput',
					label: 'Name,Table',
					id: 'value'
				}
			]
		},

		DataSourceSelectRow: {
			label: 'DataSource - Select Row',
			options: [
				{
					type: 'textinput',
					label: 'Name,Table,Index',
					id: 'value'
				}
			]
		},

		KeyPress: {
			label: 'General - KeyPress',
			options: [
				{
					type: 'textinput',
					label: 'Key',
					id: 'value'
				}
			]
		},

		ScriptStart: {
			label: 'Scripting - Script start',
			options: [
				{
					type: 'textinput',
					label: 'Script name',
					id: 'value'
				}
			]
		},

		ScriptStop: {
			label: 'Scripting - Script stop',
			options: [
				{
					type: 'textinput',
					label: 'Script name',
					id: 'value'
				}
			]
		},

		ScriptStopAll: { label: 'Scripting - Script stop all' },

		command: {
			label: 'Run custom command',
			options: [
				{
					type: 'textinput',
					label: 'Command',
					id: 'command',
					default: ''
				}
			]
		}
	};
};

exports.executeAction = function(action) {
	var opt = action.options || {};
	var cmd;

	if (action.action === 'programCut') {
		if (opt.mix === undefined || opt.mix === 0) {
			cmd = `FUNCTION CutDirect Input=${opt.input}`;
		} else {
			cmd = `FUNCTION Cut Input=${opt.input}&Mix=${opt.mix}`;
		}
	}
	
	else if (action.action === 'outputSet') {
		cmd = `FUNCTION ${opt.functionID} Value=${opt.value}`;
		if (opt.value === 'Input') {
			cmd += `&Input=${opt.input}`;
		}
	}
	
	else if (action.action === 'SelectPlayList') {
		cmd = `FUNCTION SelectPlayList ${opt.playlistName}`;
	}
	
	else if (action.action === 'SetVolumeFade') {
		cmd = `FUNCTION SetVolumeFade Value=${opt.fadeMin},${opt.fadeTime !== undefined ? opt.fadeTime : '2000'}&input=${opt.input}`;
	}
	
	else if (action.action === 'command') {
		cmd = `FUNCTION ${opt.command}`;
	}
	
	else if (action.action === 'SetText') {
		let text = opt.value;

		// URL Encode plus and equals symbols to perform addition/subtraction on value instead of setting to a value.
		if (opt.adjustment === 'Increment') {
			text = '%2b%3d' + text;
		} else if (opt.adjustment === 'Decrement') {
			text = '-%3d' + text;
		}

		cmd = `FUNCTION SetText Input=${opt.input}&SelectedIndex=${opt.selectedIndex}&Value=${text}`;
	}
	
	else if (action.action === 'replayRecording') {
		if ((opt.functionID = 'ReplayToggleRecording')) {
			cmd = `FUNCTION ${this.data.replay.recording ? 'ReplayStopRecording' : 'ReplayStartRecording'}`;
		} else {
			cmd = `FUNCTION ${opt.functionID}`;
		}
	}
	
	else if (action.action === 'replayToggleCamera') {
		cmd = `FUNCTION ReplayToggleSelectedEventCamera${opt.camera}`;
	}
	
	else {
		const vMixFunction = opt.functionID || action.action;
		const params = ['duration', 'input', 'mix', 'selectedIndex', 'value']
			.filter(param => opt[param] !== undefined)
			.map(param => `${param}=${opt[param]}`)
			.join('&');

		cmd = `FUNCTION ${vMixFunction} ${params}`;
	}

	if (cmd !== undefined) {
		this.debug(`sending ${cmd} to ${this.config.host}`);

		if (this.socket !== undefined && this.socket.connected) {
			this.socket.send(cmd + '\r\n');
		} else {
			this.debug('Socket not connected.');
		}
	}
};
