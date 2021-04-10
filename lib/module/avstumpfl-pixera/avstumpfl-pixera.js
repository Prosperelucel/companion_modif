var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	let self = this;

	instance_skel.apply(this, arguments);

	self.actions();

	return self;
}


instance.prototype.updateConfig = function(config) {
	let self = this;

	// Reconnect to Pixera if the IP changed
	if (self.config.host !== config.host || self.isConnected() === false) {
		self.config.host = config.host;
		self.init_tcp();
	}

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	// Keep config around
	self.config = config;

	// Build actions
	self.actions();
}

instance.prototype.init = function() {
	let self = this;

	debug = self.debug;
	log = self.log;

	self.init_tcp();
	self.init_feedbacks();

}

instance.prototype.init_variables = function() {
	var self = this;

	self.CHOICES_TIMELINENAME = [{label: '',id:0}];
	self.CHOICES_TIMELINEHANDLE = [];
	self.CHOICES_SCREENNAME = [{label: '',id:0}];
	self.CHOICES_SCREENHANDLE = [];
	self.CHOICES_CUENAME = [];
	self.CHOICES_CUEHANDLE = [];
	self.CHOICES_TIMELINEFEEDBACK = [];

	var variables = [{	}];

	let buf = undefined;
	var json_send = {'jsonrpc':'2.0', 'id':99, 'method':'Pixera.Utility.setShowContextInReplies','params':{'doShow':true}};//to get Pixera response with sending methode for filtering
	buf = self.prependHeader(JSON.stringify(json_send));

	if (buf !== undefined) {
		self.send(buf);
	}

};

//init to get timelines
instance.prototype.init_timelines = function() {
	var self = this;
	let buf = undefined;
	var json_send = {'jsonrpc':'2.0', 'id':11, 'method':'Pixera.Timelines.getTimelines'};

	buf = self.prependHeader(JSON.stringify(json_send));

	if (buf !== undefined) {
		self.send(buf);
	}
};

//init to get screens
instance.prototype.init_screens = function() {
	var self = this;
	let buf = undefined;
	var json_send = {'jsonrpc':'2.0', 'id':13, 'method':'Pixera.Screens.getScreens'};

	buf = self.prependHeader(JSON.stringify(json_send));

	if (buf !== undefined) {
		self.send(buf);
	}

	json_send = {'jsonrpc':'2.0', 'id':14, 'method':'Pixera.Screens.getScreenNames'};

	buf = self.prependHeader(JSON.stringify(json_send));

	if (buf !== undefined) {
		self.send(buf);
	}
};

//get response from Pixera
instance.prototype.incomingData = function(data) {
	var self = this;

		let header = 'pxr1';
		var receivebuffer = data;

		if (receivebuffer.toString('utf8',0,4) == header) {

		var receivebufferarray = receivebuffer.toString().split("pxr1");
		for(var j = 1; j < receivebufferarray.length;j++)
		{
			var rcv_cmd = JSON.parse(receivebufferarray[j].substr(4).toString());
			//debug(rcv_cmd);    //debug for receive command
			switch (rcv_cmd["id"]) {

				case 11 :  //get timeline list
					var result = rcv_cmd['result'];
					self.CHOICES_TIMELINEHANDLE = result;
					for(var i = 0; i<result.length;i++){
						var json_send = {'jsonrpc':'2.0', 'id':12, 'method':'Pixera.Timelines.Timeline.getName', 'params':{'handle':result[i]}}; //send var to get timeline namen
						self.CHOICES_TIMELINEFEEDBACK.push({'handle': result[i],'timelineTransport':'0','timelinePositions':'0','timelineCountdowns':'0','name':'0'}); //set timeline variable for feedback
						let buf = undefined;
						buf = self.prependHeader(JSON.stringify(json_send));
						if (buf !== undefined) {
							self.send(buf);
						}
					}
					self.actions();
					break;

				case 12 :  //get timeline name
					var result = rcv_cmd['result'];
					for(var i = 0;i<self.CHOICES_TIMELINEHANDLE.length;i++){
						var context = rcv_cmd['context'];
						var handle = context['handle'];
						if(self.CHOICES_TIMELINEHANDLE[i] == handle){
							self.CHOICES_TIMELINENAME.push({ label: result, id: self.CHOICES_TIMELINEHANDLE[i]}); //set timeline name for dropdown menu
						}
						for(var k = 0; k<self.CHOICES_TIMELINEFEEDBACK.length;k++){
							if(self.CHOICES_TIMELINEFEEDBACK[k]['handle'] == handle){
								self.CHOICES_TIMELINEFEEDBACK[k]['name'] = result;//set timeline name for feedback
							}
						}
					}
					self.actions();
					break;

				case 13 :
					var result = rcv_cmd['result'];
					if(result != null){
						self.CHOICES_SCREENHANDLE = result;
					}
					self.actions();
					break;

				case 14 :
					var result = rcv_cmd['result'];
					if(result != null){
						for(var i = 0; i<result.length;i++){
							self.CHOICES_SCREENNAME.push({label: result[i],id:self.CHOICES_SCREENHANDLE[i]});
						}
					}
					self.actions();
					break;

				case 29 :
					var result = rcv_cmd['result'];
					if(result != null){
						var json_send = {'jsonrpc':'2.0', 'id':15, 'method':'Pixera.Timelines.Cue.apply', 'params':{'handle':result}};
						let buf = undefined;
						buf = self.prependHeader(JSON.stringify(json_send));
						if (buf !== undefined) {
								self.send(buf);
						}
					}
					self.actions();
					break;

				case 31 :
					var result = rcv_cmd['result'];
					if(result != null){
						var time = (((self.CHOICES_GOTOTIME_H * 60)*60)*parseInt(result))+((self.CHOICES_GOTOTIME_M*60)*parseInt(result))+(self.CHOICES_GOTOTIME_S*parseInt(result))+self.CHOICES_GOTOTIME_F;
						var json_send = {'jsonrpc':'2.0', 'id':16, 'method':'Pixera.Timelines.Timeline.setCurrentTime', 'params':{'handle':self.CHOICES_GOTOTIME_TIMELINE,'time':time}};
						let buf = undefined;
						buf = self.prependHeader(JSON.stringify(json_send));
						if (buf !== undefined) {
								self.send(buf);
						}
					}
					break;

				case 32 :
					var result = rcv_cmd['result'];
					if(result != null){
						var time = (((self.CHOICES_BLENDTIME_H * 60)*60)*parseInt(result))+((self.CHOICES_BLENDTIME_M*60)*parseInt(result))+(self.CHOICES_BLENDTIME_S*parseInt(result))+self.CHOICES_BLENDTIME_F;
						var json_send = {'jsonrpc':'2.0', 'id':17, 'method':'Pixera.Timelines.Timeline.blendToTime', 'params':{'handle':self.CHOICES_BLENDTIME_TIMELINE,'goalTime':time,'blendDuration':self.CHOICES_BLENDTIME_FRAMES}};
						let buf = undefined;
						buf = self.prependHeader(JSON.stringify(json_send));
						if (buf !== undefined) {
							self.send(buf);
						}
					}
					break;

				case 33 :
					var result = rcv_cmd['result'];
					if(result != null){
						var json_send = {'jsonrpc':'2.0', 'id':18, 'method':'Pixera.Timelines.Cue.getTime', 'params':{'handle':result}};
						let buf = undefined;
						buf = self.prependHeader(JSON.stringify(json_send));
						if (buf !== undefined) {
								self.send(buf);
						}
					}
					break;

				case 18 :
					var result = rcv_cmd['result'];
					if(result != null){
						var json_send = {'jsonrpc':'2.0', 'id':19, 'method':'Pixera.Timelines.Timeline.blendToTime', 'params':{'handle':self.CHOICES_BLENDNAME_TIMELINE, 'goalTime':result, 'blendDuration':self.CHOICES_BLENDNAME_FRAMES}};
						let buf = undefined;
						buf = self.prependHeader(JSON.stringify(json_send));
						if (buf !== undefined) {
								self.send(buf);
						}
					}
					break;

				case 9999 :
					var result = rcv_cmd['result'];
					if(result != null){
						log(result);
					}
					break;

				case 10000 :
					var result = rcv_cmd['result'];
					if(result != null){
						for(var c = 0; c<result.length ; c++){
							if(result[c]['name'] == 'timelineTransport'){
								var timelineTransport = result[c]['entries'];
								for(var b = 0; b<timelineTransport.length;b++){
									for(var t = 0;t<self.CHOICES_TIMELINEFEEDBACK.length;t++){
										if(timelineTransport[b]['handle'] == self.CHOICES_TIMELINEFEEDBACK[t]['handle']){
											self.CHOICES_TIMELINEFEEDBACK[t]['timelineTransport'] = timelineTransport[b]['value']
											self.checkFeedbacks('timeline_state');
											//debug('transport:',self.CHOICES_TIMELINEFEEDBACK);
										}
									}
								}
							}
						}
					}
					break;
			}
		}
			//self.actions();
		//debug('cue ',self.CHOICES_CUELIST);
		}
};

// init tcp connection
instance.prototype.init_tcp = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

		if (self.config.host) {
		self.socket = new tcp(self.config.host, self.config.port);

		self.socket.on('status_change', function(status, message) {
			self.status(status, message);
		});

		self.socket.on('error', function(err) {
			debug("Network error", err);
			self.status(self.STATE_ERROR, err);
			self.log('error',"Network error: " + err.message);
					clearInterval(self.retry_interval);
		});

		self.socket.on('connect', function() {
			self.status(self.STATE_OK);
			self.init_variables();
			self.init_timelines();
			self.init_screens();
			self.retry_interval = setInterval(self.retry.bind(self), 80);//ms for pool timelinestate
			self.retry();
			debug("Connected");
		})

		self.socket.on('data', function(data) {
			self.incomingData(data);
		});
	}
}


instance.prototype.send = function(cmd) {
	let self = this;

	if (self.isConnected()) {
		//debug('sending', cmd, 'to', self.config.host);
		return self.socket.send(cmd);
	} else {
		//debug('Socket not connected');
	}

	return false;
}


instance.prototype.isConnected = function() {
	let self = this;

	return self.socket !== undefined && self.socket.connected;
}


instance.prototype.config_fields = function() {
	let self = this;
	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: "AV Stumpfl Pixera JSON/TCP API"
		},
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'API Function',
			value: "use API function at your own risk"
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
			id: 'port',
			width: 5,
			label: 'Port',
			default: 1400,
			regex: self.REGEX_NUMBER
		}
	];
}


instance.prototype.destroy = function() {
	let self = this;

	clearInterval(self.retry_interval);
	setTimeout(function() {
		debug('destroy', self.id);

		if (self.socket !== undefined) {
			self.socket.destroy();
			delete self.socket;
		}
	},100);
}


instance.prototype.actions = function(system) {
	let self = this;

	var actions = {
		'timeline_transport': {
			label: 'Timeline Transport',
			options: [
				{
					type: 'dropdown',
					label: 'Transport',
					id: 'mode',
					default: '1',
					choices: [
						{id: 1, label: 'Play'},
						{id: 2, label: 'Pause'},
						{id: 3, label: 'Stop'}
					]
				},
				{
					type: 'dropdown',
					label: 'Timeline Name',
					id: 'timelinename_state',
					default: 0,
					choices: self.CHOICES_TIMELINENAME
				}
			]
		},

		'timeline_next_cue': {
			label: 'Next Cue',
			options: [
				{
					type: 'dropdown',
					label: 'Timeline Name',
					id: 'timelinename_next',
					default: 0,
					choices: self.CHOICES_TIMELINENAME
				}
			]
		},

		'timeline_prev_cue': {
			label: 'Previous Cue',
			options: [
				{
					type: 'dropdown',
					label: 'Timeline Name',
					id: 'timelinename_prev',
					default: 0,
					choices: self.CHOICES_TIMELINENAME
				}
			]
		},

		'timeline_ignore_next_cue': {
			label: 'Ignore Next Cue',
			options: [
				{
					type: 'dropdown',
					label: 'Timeline Name',
					id: 'timelinename_ignore',
					default: 0,
					choices: self.CHOICES_TIMELINENAME
				}
			]
		},

		'timeline_store': {
			label: 'Timeline Store',
			options: [
				{
					type: 'dropdown',
					label: 'Timeline Name',
					id: 'timelinename_store',
					default: 0,
					choices: self.CHOICES_TIMELINENAME
				}
			]
		},

		'screen_visible': {
			label: 'Visible Screen',
			options: [
				{
					type: 'dropdown',
					label: 'Screen Name',
					id: 'visible_screen_name',
					default: 0,
					choices: self.CHOICES_SCREENNAME
				},
				{
					type: 'dropdown',
					label: 'Screen Visible',
					id: 'visible_screen_state',
					default: 'true',
					choices: [
						{id: true, label: true},
						{id: false, label: false}
					]
				}
			]
		},

		'screen_projectable': {
			label: 'Visible is Projectable',
			options: [
				{
					type: 'dropdown',
					label: 'Screen Name',
					id: 'visible_projectable_name',
					default: 0,
					choices: self.CHOICES_SCREENNAME
				},
				{
					type: 'dropdown',
					label: 'Screen Is Projectable',
					id: 'visible_projectable_state',
					default: 'true',
					choices: [
						{id: true, label: true},
						{id: false, label: false}
					]
				}
			]
		},

		'goto_time': {
			label: 'Goto Timecode',
			options: [
				{
					type: 'dropdown',
					label: 'Timeline Name',
					id: 'goto_time_timelinename',
					default: 0,
					choices: self.CHOICES_TIMELINENAME
				},
				{
					type: 'textinput',
					label: 'Hour',
					id: 'goto_time_h',
					default: '0',
					regex:   self.REGEX_NUMBER
				},
				{
					type: 'textinput',
					label: 'Minute',
					id: 'goto_time_m',
					default: '0',
					regex:   self.REGEX_NUMBER
				},
				{
					type: 'textinput',
					label: 'Second',
					id: 'goto_time_s',
					default: '0',
					regex:    self.REGEX_NUMBER
				},
				{
					type: 'textinput',
					label: 'Frame',
					id: 'goto_time_f',
					default: '0',
					regex:   self.REGEX_NUMBER
				}
			]
		},

		'goto_cue_name': {
			label: 'Goto Cue',
			options: [
				{
					type: 'dropdown',
					label: 'Timeline Name',
					id: 'timelinename_cuename',
					default: 0,
					choices: self.CHOICES_TIMELINENAME
				},
									{
					type: 'textinput',
					label: 'Cue Name',
					id: 'cue_name',
					default: '',
				}
			]
		},

		'goto_cue_index': {
			label: 'Goto Cue Index',
			options: [
				{
					type: 'textinput',
					label: 'Timeline Index',
					id: 'timelinecue_index',
					default: '',
					regex:   self.REGEX_NUMBER
				},
				{
					type: 'textinput',
					label: 'Cue Index',
					id: 'cue_index',
					default: '',
					regex:   self.REGEX_NUMBER
				}
			]
		},

		'blend_to_time': {
			label: 'Blend To Timecode',
			options: [
			{
					type: 'dropdown',
					label: 'Timeline Name',
					id: 'blend_time_timelinename',
					default: 0,
					choices: self.CHOICES_TIMELINENAME
				},
				{
					type: 'textinput',
					label: 'Hour',
					id: 'blend_time_h',
					default: '0',
					regex:   self.REGEX_NUMBER
				},
				{
					type: 'textinput',
					label: 'Minute',
					id: 'blend_time_m',
					default: '0',
					regex:   self.REGEX_NUMBER
				},
				{
					type: 'textinput',
					label: 'Second',
					id: 'blend_time_s',
					default: '0',
					regex:   self.REGEX_NUMBER
				},
				{
					type: 'textinput',
					label: 'Frame',
					id: 'blend_time_f',
					default: '0',
					regex:   self.REGEX_NUMBER
				},
				{
					type: 'textinput',
					label: 'Blendtime in Frames',
					id: 'blend_time_frames',
					default: '0',
					regex:   self.REGEX_NUMBER
				}
			]
		},

		'blend_cue_name': {
			label: 'Blend to Cue',
			options: [
				{
					type: 'dropdown',
					label: 'Timeline Name',
					id: 'timelinename_blendcuename',
					default: 0,
					choices: self.CHOICES_TIMELINENAME
				},
				{
					type: 'textinput',
					label: 'Cue Name',
					id: 'blend_cue_name',
					default: ''
				},
				{
					type: 'textinput',
					label: 'Blendtime in Frames',
					id: 'blend_name_frames',
					default: 0,
					regex:   self.REGEX_NUMBER
				}
			]
		},

		'api': {
			label: 'API',
			options: [
				{
					type: 'textinput',
					label: 'API',
					id: 'api_methode',
					default: ''
				}
			]
		}
	};
self.setActions(actions);

}


instance.prototype.action = function(action) {
	let self = this;
	var opt = action.options;

	let buf = undefined;
	let message = '';

	switch (action.action) {
		case 'timeline_transport':
			var json_send = {'jsonrpc':'2.0', 'id':22, 'method':'Pixera.Timelines.Timeline.setTransportMode', 'params':{'handle':parseInt(opt.timelinename_state), 'mode':parseInt(opt.mode)}};
			buf = self.prependHeader(JSON.stringify(json_send));
			break;

		case 'timeline_next_cue':
			var json_send = {'jsonrpc':'2.0', 'id':23, 'method':'Pixera.Timelines.Timeline.moveToNextCue', 'params':{'handle':parseInt(opt.timelinename_next)}};
			buf = self.prependHeader(JSON.stringify(json_send));
			break;

		case 'timeline_prev_cue':
			var json_send = {'jsonrpc':'2.0', 'id':24, 'method':'Pixera.Timelines.Timeline.moveToPreviousCue', 'params':{'handle':parseInt(opt.timelinename_prev)}};
			buf = self.prependHeader(JSON.stringify(json_send));
			break;

		case 'timeline_ignore_next_cue':
			var json_send = {'jsonrpc':'2.0', 'id':25, 'method':'Pixera.Timelines.Timeline.ignoreNextCue', 'params':{'handle':parseInt(opt.timelinename_ignore)}};
			buf = self.prependHeader(JSON.stringify(json_send));
			break;

		case 'timeline_store':
			var json_send = {'jsonrpc':'2.0', 'id':26, 'method':'Pixera.Timelines.Timeline.store', 'params':{'handle':parseInt(opt.timelinename_store)}};
			buf = self.prependHeader(JSON.stringify(json_send));
			break;

		case 'screen_visible':
			var json_send = {'jsonrpc':'2.0', 'id':27, 'method':'Pixera.Screens.Screen.setIsVisible', 'params':{'handle':parseInt(opt.visible_screen_name),'isVisible':JSON.parse(opt.visible_screen_state)}};
			buf = self.prependHeader(JSON.stringify(json_send));
			break;

		case 'screen_projectable':
			var json_send = {'jsonrpc':'2.0', 'id':28, 'method':'Pixera.Screens.Screen.setIsProjectable', 'params':{'handle':parseInt(opt.visible_screen_name),'isProjectable':JSON.parse(opt.visible_projectable_state)}};
			buf = self.prependHeader(JSON.stringify(json_send));
			break;

		case 'goto_cue_name':
			var json_send = {'jsonrpc':'2.0', 'id':29, 'method':'Pixera.Timelines.Timeline.getCueFromName', 'params':{'handle':parseInt(opt.timelinename_cuename),'name':opt.cue_name}};
			buf = self.prependHeader(JSON.stringify(json_send));
			break;

		case 'goto_cue_index':
			var json_send = {'jsonrpc':'2.0', 'id':30, 'method':'Pixera.Compound.applyCueAtIndexOnTimelineAtIndex', 'params':{'cueIndex':parseInt(opt.cue_index-1),'timelineIndex':parseInt(opt.timelinecue_index-1)}};
			buf = self.prependHeader(JSON.stringify(json_send));
			break;

		case 'goto_time':
			self.CHOICES_GOTOTIME_H = parseInt(opt.goto_time_h);
			self.CHOICES_GOTOTIME_M = parseInt(opt.goto_time_m);
			self.CHOICES_GOTOTIME_S = parseInt(opt.goto_time_s);
			self.CHOICES_GOTOTIME_F = parseInt(opt.goto_time_f);

			self.CHOICES_GOTOTIME_TIMELINE = parseInt(opt.goto_time_timelinename);
			var json_send = {'jsonrpc':'2.0', 'id':31, 'method':'Pixera.Timelines.Timeline.getFps', 'params':{'handle':parseInt(opt.goto_time_timelinename)}};
			buf = self.prependHeader(JSON.stringify(json_send));
			break;

		case 'blend_to_time':
			self.CHOICES_BLENDTIME_H = parseInt(opt.blend_time_h);
			self.CHOICES_BLENDTIME_M = parseInt(opt.blend_time_m);
			self.CHOICES_BLENDTIME_S = parseInt(opt.blend_time_s);
			self.CHOICES_BLENDTIME_F = parseInt(opt.blend_time_f);
			self.CHOICES_BLENDTIME_FRAMES = parseInt(opt.blend_time_frames);

			self.CHOICES_BLENDTIME_TIMELINE = parseInt(opt.blend_time_timelinename);
			var json_send = {'jsonrpc':'2.0', 'id':32, 'method':'Pixera.Timelines.Timeline.getFps', 'params':{'handle':parseInt(opt.blend_time_timelinename)}};
			buf = self.prependHeader(JSON.stringify(json_send));
			break;

		case 'blend_cue_name':
			self.CHOICES_BLENDNAME_TIMELINE = parseInt(opt.timelinename_blendcuename);
			self.CHOICES_BLENDNAME_FRAMES = parseInt(opt.blend_name_frames);

			var json_send = {'jsonrpc':'2.0', 'id':33, 'method':'Pixera.Timelines.Timeline.getCueFromName', 'params':{'handle':parseInt(opt.timelinename_blendcuename),'name':opt.blend_cue_name}};
			buf = self.prependHeader(JSON.stringify(json_send));
			break;

		case 'api':
			var json_send = JSON.parse(opt.api_methode);
			json_send['id'] = 9999;
			buf = self.prependHeader(JSON.stringify(json_send));
			break;

		}

		if (buf !== undefined) {
			self.send(buf);
	}

};


instance.prototype.prependHeader = function(body) {
	let self = this;
		var result = [];

		for (i=0; i<body.length; i++) {
			hex = body.charCodeAt(i).toString(16);
			result = result.concat(roughScale(hex,16));
		}
		//debug('debug result 1 : ',result[0]);
		var preHeader = [112,120,114,49,body.length,0,0,0];

		const buf = Buffer.from(preHeader.concat(result));
		//debug('Send-body:',body);

		let message = preHeader.concat(body);
//debug('Send-Message:',preHeader);

		return buf;
}

function roughScale(x, base) {
	var parsed = parseInt(x, base);
	if (isNaN(parsed)) { return 0 }
	return parsed;
}


instance.prototype.updateConfig = function (config) {
	var self = this;

	if (self.config.host !== config.host || self.isConnected() === false) {
		self.config.host = config.host;
		self.init_tcp();
	}
	self.config = config;
}

instance.prototype.init_feedbacks = function() {
	var self = this;
	var feedbacks = {
		timeline_state:{
				label: 'Change color from Timeline State',
				options: [
				{
					type: 'textinput',
					label: 'Timeline Name',
					id: 'timelinename_feedback',
					default: 0,
				},
				{
						type: 'colorpicker',
						label: 'Play: Foreground color',
						id: 'run_fg',
						default: self.rgb(255,255,255)
				},
				{
						type: 'colorpicker',
						label: 'Play: Background color',
						id: 'run_bg',
						default: self.rgb(0,255,0)
				},
				{
						type: 'colorpicker',
						label: 'Pause: Foreground color',
						id: 'pause_fg',
						default: self.rgb(255,255,255)
				},
				{
						type: 'colorpicker',
						label: 'Pause: Background color',
						id: 'pause_bg',
						default: self.rgb(255,255,0)
				},
				{
						type: 'colorpicker',
						label: 'Stop: Foreground color',
						id: 'stop_fg',
						default: self.rgb(255,255,255)
				},
				{
						type: 'colorpicker',
						label: 'Stop: Background color',
						id: 'stop_bg',
						default: self.rgb(255,0,0)
				}
				],
				callback: function(feedback, bank) {
					for(var i = 0; i<self.CHOICES_TIMELINEFEEDBACK.length;i++){
						if(self.CHOICES_TIMELINEFEEDBACK[i]['name']==feedback.options.timelinename_feedback){
							if (self.CHOICES_TIMELINEFEEDBACK[i]['timelineTransport'] == 1) {//Play
								return {
									color: feedback.options.run_fg,
									bgcolor: feedback.options.run_bg
								}
							}
							else if (self.CHOICES_TIMELINEFEEDBACK[i]['timelineTransport'] == 2) {//Pause
								return {
									color: feedback.options.pause_fg,
									bgcolor: feedback.options.pause_bg
								}
							}
							else if (self.CHOICES_TIMELINEFEEDBACK[i]['timelineTransport'] == 3) {//Stop
								return {
									color: feedback.options.stop_fg,
									bgcolor: feedback.options.stop_bg
								}
							}
						}
					}
				}//close callback
			}//close timeline state
		};//close feedbacks
	self.setFeedbackDefinitions(feedbacks);
}

instance.prototype.pool = function() {
	var self = this;

	let buf = undefined;
	var json_send = {'jsonrpc':'2.0', 'id':10000, 'method':'Pixera.Utility.pollMonitoring'};

	buf = self.prependHeader(JSON.stringify(json_send));

	if (buf !== undefined) {
		self.send(buf);
	}
}


instance.prototype.retry = function() {
	var self = this;
	self.pool();
}


instance_skel.extendedBy(instance);
exports = module.exports = instance;
