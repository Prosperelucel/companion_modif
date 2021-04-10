var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');
var debug;
var log;
var SeqStatus;
var CurrentSeqID;
var CurrentRemainingSeqID;

function instance(system, id, config) {
	let self = this;

	//COMMAND IDs
	self.CMD_SET_SEQ_TRANSPORT_MODE = 3;
	self.CMD_MOVE_SEQ_TO_CUE = 4;
	self.CMD_MOVE_SEQ_TO_LASTNEXTCUE = 7;
	self.CMD_RESET_ALL = 9;
	self.CMD_CLEAR_ALL_ACTIVE = 13;
	self.CMD_TOGGLE_FULLSCREEN = 17;
	self.CMD_STORE_ACTIVE = 25;
	self.CMD_CLEAR_SELECTION = 48;
	self.CMD_IGNORE_NEXT_CUE = 55;
	self.CMD_SAVE_PROJECT = 62;
	self.CMD_SET_SITE_IP = 71;
	self.CMD_APPLY_VIEW = 103;
	self.CMD_SET_SEQ_SELECTION = 299;
	self.CMD_GET_SEQ_TRANSPORTMODE = 72;
	self.CMD_GET_SEQ_TIME = 73;	
	self.CMD_GET_REMAINING_TIME_UNTIL_NEXT_CUE = 78;		

	self.feedbackstate = {
		seqstate: 'Stop',
		remainingQtime: 'Normal',
	};
	

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions();

	return self;
}

/**
 * The user updated the config.
 *
 * @param config         The new config object
 */
instance.prototype.updateConfig = function(config) {
	let self = this;

	// Reconnect to Pandoras Box if the IP changed
	if (self.config.host !== config.host || self.isConnected() === false) {
		self.config.host = config.host;
		self.init_tcp();
	}

	// Keep config around
	self.config = config;

	// Build actions
	self.actions();
}

/**
 * Initialize module & connect
 */
instance.prototype.init = function() {
	let self = this;

	debug = self.debug;
	log = self.log;

	self.init_tcp();
	self.init_variables();
	self.init_feedbacks();
}


instance.prototype.init_feedbacks = function() {
	var self = this;

	var feedbacks = {
		state_color: {
			label: 'Change color from Sequence State',
			description: 'Change the colors of a bank according to the Seq state',
			options: [
				{
					type: 'colorpicker',
					label: 'Running: Foreground color',
					id: 'run_fg',
					default: self.rgb(255,255,255)
				},
				{
					type: 'colorpicker',
					label: 'Running: Background color',
					id: 'run_bg',
					default: self.rgb(0,100,0)
				},
				{
					type: 'colorpicker',
					label: 'Paused: Foreground color',
					id: 'pause_fg',
					default: self.rgb(255,255,255)
				},
				{
					type: 'colorpicker',
					label: 'Paused: Background color',
					id: 'pause_bg',
					default: self.rgb(170,80,0)
				},
				{
					type: 'colorpicker',
					label: 'Stopped: Foreground color',
					id: 'stop_fg',
					default: self.rgb(255,0,0)
				},
				{
					type: 'colorpicker',
					label: 'Stopped: Background color',
					id: 'stop_bg',
					default: self.rgb(0,0,0)
				}
			],
			callback: function(feedback, bank) {
				if (self.feedbackstate.seqstate == 'Play') {
					return {
						color: feedback.options.run_fg,
						bgcolor: feedback.options.run_bg
					};
				}
				else if (self.feedbackstate.seqstate == 'Pause') {
					return {
						color: feedback.options.pause_fg,
						bgcolor: feedback.options.pause_bg
					}
				}
				else if (self.feedbackstate.seqstate == 'Stop') {
					return {
						color: feedback.options.stop_fg,
						bgcolor: feedback.options.stop_bg
					}
				}
			}
		},
		next_Q_color: {
			label: 'Change color depending on Cue remaining Time',
			description: 'Change the colors of a bank according to the Time until next Cue',
			options: [
				{
					type: 'colorpicker',
					label: 'Running more than 10 sec : Foreground color',
					id: 'countdown_fg',
					default: self.rgb(0,0,0)
				},
				{
					type: 'colorpicker',
					label: 'Running more than 10 sec: Background color',
					id: 'countdown_bg',
					default: self.rgb(255,255,0)
				},
				{
					type: 'colorpicker',
					label: 'Running 10 sec or less: Foreground color',
					id: 'less10_fg',
					default: self.rgb(255,0,0)
				},
				{
					type: 'colorpicker',
					label: 'Running 10 sec or less: Background color',
					id: 'less10_bg',
					default: self.rgb(255,153,51)
				},
				{
					type: 'colorpicker',
					label: 'Running 5 sec or less: Foreground color',
					id: 'less05_fg',
					default: self.rgb(255,255,255)
				},
				{
					type: 'colorpicker',
					label: 'Running 5 sec or less: Background color',
					id: 'less05_bg',
					default: self.rgb(255,0,0)
				}
			],
			callback: function(feedback, bank) {
				if (self.feedbackstate.remainingQtime == 'Normal') {
					return {
						color: feedback.options.countdown_fg,
						bgcolor: feedback.options.countdown_bg
					};
				}
				else if (self.feedbackstate.remainingQtime == 'Less10') {
					return {
						color: feedback.options.less10_fg,
						bgcolor: feedback.options.less10_bg
					}
				}
				else if (self.feedbackstate.remainingQtime == 'Less05') {
					return {
						color: feedback.options.less05_fg,
						bgcolor: feedback.options.less05_bg
					}
				}
			}
		}
	};

	self.setFeedbackDefinitions(feedbacks);
};

instance.prototype.init_variables = function() {
	var self = this;

	var variables = [
		{
			label: 'Selected Sequence for Sequence Time',
			name: 'seqid'
		},
		{
			label: 'State of the timeline (Running, Stopped, Paused)',
			name: 'seqstate'
		},
		{
			label: 'Current time of Sequence (hh:mm:ss)',
			name: 'seqtime'
		},
		{
			label: 'Current time of Sequence (hours)',
			name: 'seqtime_h'
		},
		{
			label: 'Current time of Sequence (minutes)',
			name: 'seqtime_m'
		},
		{
			label: 'Current time of Sequence (seconds)',
			name: 'seqtime_s'
		},
		{
			label: 'Current time of Sequence (frames)',
			name: 'seqtime_f'
		},
		{
			label: 'Selected Sequence Remaining Cue Time',
			name: 'nextqid'
		},
		{
			label: 'Time until next Cue (hh:mm:ss)',
			name: 'nextqtime'
		},
		{
			label: 'Time until next Cue (hours)',
			name: 'nextqtime_h'
		},
		{
			label: 'Time until next Cue (minutes)',
			name: 'nextqtime_m'
		},
		{
			label: 'Time until next Cue (seconds)',
			name: 'nextqtime_s'
		},
		{
			label: 'Time until next Cue (frames)',
			name: 'nextqtime_f'
		}
	];

	self.updateNextQID(1);
	self.updateSeqID(1);
	self.setVariableDefinitions(variables);
};

instance.prototype.updateSeqID = function(changeseqid) {
	var self = this;
	self.setVariable('seqid', changeseqid);
	CurrentSeqID = changeseqid;
	self.send_getTimer(CurrentSeqID, CurrentRemainingSeqID);
};

instance.prototype.updateNextQID = function(changenextqid) {
	var self = this;
	self.setVariable('nextqid', changenextqid);
	CurrentRemainingSeqID = changenextqid;
	self.send_getTimer(CurrentSeqID, CurrentRemainingSeqID);
};

instance.prototype.incomingData = function(data) {
	var self = this;

	let magic = 'PBAU';
	let domain = parseInt(self.config.domain);	
	var receivebuffer = data;

	var rcv_cmd_id = 0;
	var seq_state = 0;
	var seq_h = '00';
	var seq_m = '00';
	var seq_s = '00';
	var seq_f = '00';
	var seq_time = '00:00:00:00'
	var nextq_h = '00';
	var nextq_m = '00';
	var nextq_s = '00';
	var nextq_f = '00';
	var nextq_time = '00:00:00:00'

	if (receivebuffer.toString('utf8',0,4) == magic && receivebuffer.readInt32BE(5) == domain) {
		rcv_cmd_id = receivebuffer.readInt16BE(17);

		switch (rcv_cmd_id) {
			case 72 :
				seq_state = receivebuffer.readInt32BE(19);
				if (seq_state == 1){	
					self.feedbackstate.seqstate = 'Play';
					self.setVariable('seqstate', 'Play');
				} else if (seq_state == 2) {	
					self.feedbackstate.seqstate = 'Stop';
					self.setVariable('seqstate', 'Stop');
				} else if (seq_state == 3) {	
					self.feedbackstate.seqstate = 'Pause';
					self.setVariable('seqstate', 'Pause');
				};
				self.checkFeedbacks('state_color');
				break;

			case 73 :
				seq_h = receivebuffer.readInt32BE(19);
				seq_m = receivebuffer.readInt32BE(23);
				seq_s = receivebuffer.readInt32BE(27);
				seq_f = receivebuffer.readInt32BE(31);

				self.setVariable('seqtime_h', self.padZero(2,seq_h));
				self.setVariable('seqtime_m', self.padZero(2,seq_m));
				self.setVariable('seqtime_s', self.padZero(2,seq_s));
				self.setVariable('seqtime_f', self.padZero(2,seq_f));
				self.setVariable('seqtime', self.padZero(2,seq_h) +':'+self.padZero(2,seq_m)+':'+self.padZero(2,seq_s)+':'+self.padZero(2,seq_f));
				break;

			case 78 :
				nextq_h = receivebuffer.readInt32BE(19);
				nextq_m = receivebuffer.readInt32BE(23);
				nextq_s = receivebuffer.readInt32BE(27);
				nextq_f = receivebuffer.readInt32BE(31);

				self.setVariable('nextqtime_h', self.padZero(2,nextq_h));
				self.setVariable('nextqtime_m', self.padZero(2,nextq_m));
				self.setVariable('nextqtime_s', self.padZero(2,nextq_s));
				self.setVariable('nextqtime_f', self.padZero(2,nextq_f));
				self.setVariable('nextqtime', self.padZero(2,nextq_h) +':'+self.padZero(2,nextq_m)+':'+self.padZero(2,nextq_s)+':'+self.padZero(2,nextq_f));

				if (nextq_h == 0 && nextq_m == 0 && nextq_s < 5) {
					self.feedbackstate.remainingQtime = 'Less05';
				} else if  (nextq_h == 0 && nextq_m == 0 && nextq_s < 10) {
					self.feedbackstate.remainingQtime = 'Less10';
				} else {
					self.feedbackstate.remainingQtime = 'Normal';
				};
				self.checkFeedbacks('next_Q_color');
				break;
		}
	}
	//self.log("Buffer : " + receivebuffer + " - " + rcv_cmd_id);
	//debug("Buffer : ", receivebuffer);
};

instance.prototype.init_tcp = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	if (self.config.host) {
		self.socket = new tcp(self.config.host, 6211);

		self.socket.on('status_change', function(status, message) {
			self.status(status, message);
		});

		self.socket.on('error', function(err) {
			debug("Network error", err);
			self.status(self.STATE_ERROR, err);
			self.log('error',"Network error: " + err.message);
		});

		self.socket.on('connect', function() {
			self.status(self.STATE_OK);
			self.init_variables();
			//self.init_feedbacks();
			debug("Connected");
		})

		self.socket.on('data', function(data) {
			self.incomingData(data);
		});
	}
}

/**
 *
 * @param cmd {Buffer}
 * @returns {boolean}
 */
instance.prototype.send = function(cmd) {
	let self = this;

	if (self.isConnected()) {
		debug('sending', cmd, 'to', self.config.host);
		return self.socket.send(cmd);
	} else {
		debug('Socket not connected');
	}

	return false;
}

instance.prototype.send_getTimer = function(gseqid, gnextqseqid) {
	let self = this;
	var gettimer;
	var nextqtimeid = gnextqseqid;
	var seqtimeid = gseqid;

	// Create all PBAutomation Commands
	message1 = self.shortToBytes(self.CMD_GET_SEQ_TIME)
				.concat(self.intToBytes(parseInt(seqtimeid)));
			buf1 = Buffer.from(self.prependHeader(message1));
	message2 = self.shortToBytes(self.CMD_GET_REMAINING_TIME_UNTIL_NEXT_CUE)
				.concat(self.intToBytes(parseInt(nextqtimeid)));
			buf2 = Buffer.from(self.prependHeader(message2));
	message3 = self.shortToBytes(self.CMD_GET_SEQ_TRANSPORTMODE)
				.concat(self.intToBytes(parseInt(seqtimeid)));
			buf3 = Buffer.from(self.prependHeader(message3));

	if (self.isConnected()) {
		clearInterval(self.gettimer_interval);
		var gettime_period = 80; // ms
		self.gettimer_interval = setInterval(gettimer, gettime_period);
		function gettimer(){
			self.socket.send(buf1);
			setTimeout(function() {
				self.socket.send(buf2);
				setTimeout(function() {
					self.socket.send(buf3)},18)
				},30);
		}
	} else {
		debug('Socket not connected');
	}
	return false;
}

/**
 * Returns if the socket is connected.
 *
 * @returns If the socket is connected {boolean}
 */
instance.prototype.isConnected = function() {
	let self = this;

	return self.socket !== undefined && self.socket.connected;
}

/**
 * Return config fields for web config.
 *
 * @returns      The config fields for the module {Object}
 */
instance.prototype.config_fields = function() {
	let self = this;
	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: "Christie Pandoras Box V6 Control using PBAutomation SDK"
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 6,
			regex: self.REGEX_IP
		},
		{
			type: 'textinput',
			id: 'domain',
			width: 5,
			label: 'Domain',
			value: "0",
			regex: self.REGEX_NUMBER
		}
	];
}

/**
 * Cleanup when the module gets deleted.
 */
instance.prototype.destroy = function() {
	let self = this;

	clearInterval(self.gettimer_interval);
	setTimeout(function() {
		debug('destroy', self.id);

		if (self.socket !== undefined) {
			self.socket.destroy();
			delete self.socket;
		}
	},100);
}

/**
 * Creates the actions for this module.
 */
instance.prototype.actions = function(system) {
	let self = this;

	self.setActions({
		'seq_transport': {
			label: 'Sequence Transport',
			options: [
				{
					type: 'dropdown',
					label: 'Transport',
					id: 'mode',
					default: '1',
					choices: [
						{id: 1, label: 'Play'},
						{id: 3, label: 'Pause'},
						{id: 2, label: 'Stop'}
					]
				},
				{
					type: 'textinput',
					label: 'Sequence ID',
					id: 'seq',
					default: '1',
					regex: '/^0*[1-9][0-9]*$/'
				}
			]
		},
		'seq_to_cue': {
			label: 'Goto Cue',
			options: [
				{
					type: 'textinput',
					label: 'Sequence ID',
					id: 'seq',
					default: '1',
					regex: '/^0*[1-9][0-9]*$/'
				},
				{
					type: 'textinput',
					label: 'Cue ID',
					id: 'cueid',
					default: '1',
					regex: '/^0*[1-9][0-9]*$/'
				}
			]
		},
		'seq_nextlast_cue': {
			label: 'Goto Next/Last Cue',
			options: [
				{
					type: 'textinput',
					label: 'Sequence ID',
					id: 'seq',
					default: '1',
					regex: '/^0*[1-9][0-9]*$/'
				},
				{
					type: 'dropdown',
					label: 'Next or Last',
					id: 'nextmode',
					default: '1',
					choices: [
						{id: 0, label: 'Last CUE'},
						{id: 1, label: 'Next CUE'}
					]
				}
			]
		},
		'seq_ignorenextcue': {
			label: 'Ignore Next CUE on Sequence',
			options: [
				{
					type: 'textinput',
					label: 'Sequence ID',
					id: 'seq',
					default: '1',
					regex: '/^0*[1-9][0-9]*$/'
				},
				{
					type: 'dropdown',
					label: 'Ignore / Not ignore next Cue',
					id: 'doignore',
					default: '1',
					choices: [
						{id: 0, label: 'Do not ignore next CUE'},
						{id: 1, label: 'Ignore next CUE'}
					]
				}
			]
		},
		'seq_selection': {
			label: 'Select Editing Sequence',
			options: [
				{
					type: 'textinput',
					label: 'Sequence ID',
					id: 'seq',
					default: '1',
					regex: '/^0*[1-9][0-9]*$/'
				}
			]
		},
		'recall_view': {
			label: 'Recall GUI View',
			options: [
				{
					type: 'textinput',
					label: 'View ID',
					id: 'view',
					default: '1',
					regex: '/^0*[1-9][0-9]*$/'
				}
			]
		},
		'save_project': { label: 'Save PandorasBox Project' },
		'toggle_fullscreenbyid': {
			label: 'Toggle Fullscreen by SiteID',
			options: [
				{
					type: 'textinput',
					label: 'SiteID',
					id: 'site',
					default: '1',
					regex: '/^0*[1-9][0-9]*$/'
				}
			]
		},
		'set_SiteIPbyid': {
			label: 'Set the IP Adress of a Site (Client) by its ID',
			options: [
				{
					type: 'textinput',
					label: 'SiteID',
					id: 'site',
					default: '1',
					regex: '/^0*[1-9][0-9]*$/'
				},
				{
					type: 'textinput',
					id: 'siteip',
					label: 'IP for Site',
					width: 6,
					regex: self.REGEX_IP
				}
			]
		},
		'clear_allactive': { label: 'Clear ALL Active Values' },
		'store_allactive': {
			label: 'Store ALL Active Values to Sequence',
			options: [
				{
					type: 'textinput',
					label: 'Sequence ID',
					id: 'seq',
					default: '1',
					regex: '/^0*[1-9][0-9]*$/'
				}
			]
		},
		'clear_selection': { label: 'Clear Device Selection' },
		'reset_all': { label: 'Reset All Values to Defaults' },
		'get_seq_state':   {
			label: 'Get State of Sequence',
			options: [
				{
					type: 'textinput',
					label: 'Sequence ID',
					id: 'seq',
					default: '1',
					regex: '/^0*[1-9][0-9]*$/'
				}
			]
		},
		'timer_seq_id': {
			label: 'Change Timer Seq ID',
			options: [
				{
					type: 'textinput',
					label: 'Timer Sequence ID',
					id: 'timerseq',
					default: '1',
					regex: '/^0*[1-9][0-9]*$/'
				}
			]
		},
		'nextq_seq_id': {
			label: 'Change Remaining Cue Time Seq ID',
			options: [
				{
					type: 'textinput',
					label: 'Remaining Cue Time Sequence ID',
					id: 'nextqseq',
					default: '1',
					regex: '/^0*[1-9][0-9]*$/'
				}
			]
		}
	});
}

/**
 * Executes the action and sends the TCP packet to Pandoras Box
 *
 * @param action      The action to perform
 */
instance.prototype.action = function(action) {
	let self = this;
	var opt = action.options;

	let buf = undefined;
	let message = '';

	switch (action.action) {
		case 'seq_transport':
			message = self.shortToBytes(self.CMD_SET_SEQ_TRANSPORT_MODE)
				.concat(self.intToBytes(parseInt(opt.seq)))
				.concat(self.intToBytes(parseInt(opt.mode)));
			buf = Buffer.from(self.prependHeader(message));
			break;

		case 'seq_to_cue':
			message = self.shortToBytes(self.CMD_MOVE_SEQ_TO_CUE)
				.concat(self.intToBytes(parseInt(opt.seq)))
				.concat(self.intToBytes(parseInt(opt.cueid)));
			buf = Buffer.from(self.prependHeader(message));
			break;

		case 'seq_nextlast_cue':
			message = self.shortToBytes(self.CMD_MOVE_SEQ_TO_LASTNEXTCUE)
				.concat(self.intToBytes(parseInt(opt.seq)))
				.concat([parseInt(opt.nextmode)]);
			buf = Buffer.from(self.prependHeader(message));
			break;

		case 'seq_ignorenextcue':
			message = self.shortToBytes(self.CMD_IGNORE_NEXT_CUE)
				.concat(self.intToBytes(parseInt(opt.seq)))
				.concat([parseInt(opt.doignore)]);
			buf = Buffer.from(self.prependHeader(message));
			break;

		case 'seq_selection':
			message = self.shortToBytes(self.CMD_SET_SEQ_SELECTION)
				.concat(self.intToBytes(parseInt(opt.seq)));
			buf = Buffer.from(self.prependHeader(message));
			break;

		case 'recall_view':
			message = self.shortToBytes(self.CMD_APPLY_VIEW)
				.concat(self.intToBytes(parseInt(opt.view)));
			buf = Buffer.from(self.prependHeader(message));
			break;

		case 'save_project':
			message = self.shortToBytes(self.CMD_SAVE_PROJECT);
			buf = Buffer.from(self.prependHeader(message));
			break;

		case 'toggle_fullscreenbyid':
			message = self.shortToBytes(self.CMD_TOGGLE_FULLSCREEN)
				.concat(self.intToBytes(parseInt(opt.site)));
			buf = Buffer.from(self.prependHeader(message));
			break;

		case 'set_SiteIPbyid':
			message = self.shortToBytes(self.CMD_SET_SITE_IP)
				.concat(self.intToBytes(parseInt(opt.site)))
				.concat(self.shortToBytes(opt.siteip.length))
				.concat(self.StrNarrowToBytes(opt.siteip));
			buf = Buffer.from(self.prependHeader(message));
			break;

		case 'clear_allactive':
			message = self.shortToBytes(self.CMD_CLEAR_ALL_ACTIVE);
			buf = Buffer.from(self.prependHeader(message));
			break;

		case 'store_allactive':
			message = self.shortToBytes(self.CMD_STORE_ACTIVE)
				.concat(self.intToBytes(parseInt(opt.seq)));
			buf = Buffer.from(self.prependHeader(message));
			break;

		case 'clear_selection':
			message = self.shortToBytes(self.CMD_CLEAR_SELECTION);
			buf = Buffer.from(self.prependHeader(message));
			break;

		case 'reset_all':
			message = self.shortToBytes(self.CMD_RESET_ALL);
			buf = Buffer.from(self.prependHeader(message));
			break;
		
		case 'timer_seq_id':
			self.updateSeqID(opt.timerseq);
			break;
		
		case 'nextq_seq_id':
			self.updateNextQID(opt.nextqseq);
			break;
		}

		if (buf !== undefined) {
			self.send(buf);
	}
};

instance.prototype.padZero = function(size, num) {
	var s = num+"";
	while (s.length < size) s = "0" + s;
	return s;
}


instance.prototype.intToBytes = function(int) {
	return [
		(int & 0xFF000000) >> 24,
		(int & 0x00FF0000) >> 16,
		(int & 0x0000FF00) >>  8,
		(int & 0x000000FF),
	];
}

instance.prototype.shortToBytes = function(int) {
	return [
		(int & 0xFF00) >>  8,
		(int & 0x00FF),
	];
}

instance.prototype.StrNarrowToBytes = function(str) {
	var ch, st, re = [];

	for (var i = 0; i < str.length; i++ ) {
		ch = str.charCodeAt(i);  
		st = [];

		do {
			st.push( ch & 0xFF );  
			ch = ch >> 8;
		}
		while ( ch );

		re = re.concat( st.reverse() );
	}

	return re;
}

/**
 * Prepends TCP header and returns complete message
 *
 * @param {Array}
 * @returns {Array}
 */
instance.prototype.prependHeader = function(body) {
	let self = this;

	let magic = [80, 66, 65, 85]; // PBAU
	let preHeader = [1]; // version number

	let domain = self.intToBytes(parseInt(self.config.domain));
	let postHeader = [
		Math.floor(body.length / 256), body.length % 256, // message length
		0, 0, 0, 0, // connection id, just 0
		0, // protocol: 0 = TCP
	];

	let header = preHeader.concat(domain).concat(postHeader);

	let checksum = header.reduce((p, c) => p + c, 0) % 256;

	return magic.concat(header).concat([checksum]).concat(body);
}


instance_skel.extendedBy(instance);
exports = module.exports = instance;