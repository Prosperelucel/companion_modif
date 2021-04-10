exports = module.exports = function (action) {

	var self = this;
	var cmd;
	var options = action.options;

	if(options.port === undefined) {
		options.port = null;
	}

	switch (action.action) {

		// beep
		case "beep_startup":
			cmd = '/api/beep/startup?port=' + encodeURIComponent(options.port);
			break;

		// config
		case "config_set":
			config_data = {};
			config_data[options.configname] = options.configvalue;
			cmd = '/api/config/set?properties=' + JSON.stringify(config_data);
			break;

		// notifications
		case 'notification_message':
			cmd = '/api/notifications/message?text=' + encodeURIComponent(options.message);
			break;

		// record
		case 'record_monitor':
			cmd = '/api/record/monitor?port=' + encodeURIComponent(options.port);
			break;
		case 'record_stop':
			cmd = '/api/record/stop?port=' + encodeURIComponent(options.port);
			break;
		case 'record_start':
			cmd = '/api/record/start?port=' + encodeURIComponent(options.port);
			break;
		case 'record_chunknow':
			cmd = '/api/record/chunknow?port=' + encodeURIComponent(options.port);
			break;
		case 'record_keyframe':
			cmd = '/api/record/keyframe?port=' + encodeURIComponent(options.port);
			break;
		case 'record_grabstill':
			cmd = '/api/record/grabstill?port=' + encodeURIComponent(options.port);
			break;

		// port 
		case 'port_togglelock':
			cmd = '/api/port/toggleportlockstate?port=' + encodeURIComponent(options.port);
			break;
		case 'port_setlock':
			cmd = '/api/port/setlockstate?port=' + encodeURIComponent(options.port) + "&state=" + (encodeURIComponent(options.lockstate ? "1" : "0"));
			break;

		// port settings
		case 'portsettings_togglemodetype':
			cmd = '/api/portsettings/togglemodetype?port=' + encodeURIComponent(options.port);
			break;

		// playout
		case 'playout_eject':
			cmd = '/api/playout/eject?port=' + encodeURIComponent(options.port);
			break;
		case 'playout_repeatframes':
			cmd = '/api/playout/repeatframes?port=' + encodeURIComponent(options.port) + "&framecount=" + encodeURIComponent(options.framecount);
			break;
		case 'playout_dropframes':
			cmd = '/api/playout/dropframes?port=' + encodeURIComponent(options.port) + "&framecount=" + encodeURIComponent(options.framecount);
			break;
		case 'playout_removeall':
			cmd = '/api/playout/removeall?port=' + encodeURIComponent(options.port);
			break;
		case 'playout_keyframe':
			cmd = '/api/playout/keyframe?port=' + encodeURIComponent(options.port);
			break;
		case 'playout_play':
			cmd = '/api/playout/play?port=' + encodeURIComponent(options.port);
			break;
		case 'playout_pause':
			cmd = '/api/playout/pause?port=' + encodeURIComponent(options.port);
			break;
		case 'playout_previous':
			cmd = '/api/playout/previous?port=' + encodeURIComponent(options.port);
			break;
		case 'playout_previousstep':
			cmd = '/api/playout/previousstep?port=' + encodeURIComponent(options.port);
			break;
		case 'playout_previousframe':
			cmd = '/api/playout/previousframe?port=' + encodeURIComponent(options.port);
			break;
		case 'playout_next':
			cmd = '/api/playout/next?port=' + encodeURIComponent(options.port);
			break;
		case 'playout_nextstep':
			cmd = '/api/playout/nextstep?port=' + encodeURIComponent(options.port);
			break;
		case 'playout_nextframe':
			cmd = '/api/playout/nextframe?port=' + encodeURIComponent(options.port);
			break;
		case 'playout_add':
			cmd = '/api/playout/add?port=' + encodeURIComponent(options.port) + "&clipids=" + encodeURIComponent(options.clipids);
			break;
		case 'playout_loadnow':
			cmd = '/api/playout/loadnow?port=' + encodeURIComponent(options.port) + "&clipids=" + encodeURIComponent(options.clipids);
			break;
		case 'playout_playnow':
			cmd = '/api/playout/playnow?port=' + encodeURIComponent(options.port) + "&clipids=" + encodeURIComponent(options.clipids);
			break;
		case 'playout_load':
			cmd = '/api/playout/load?port=' + encodeURIComponent(options.port) + "&index=" + encodeURIComponent(options.index);
			break;
		case 'playout_seek':
			cmd = '/api/playout/seek?port=' + encodeURIComponent(options.port) + "&frame=" + encodeURIComponent(options.frame);
			break;
		case 'playout_stop':
			cmd = '/api/playout/stop?port=' + encodeURIComponent(options.port);
			break;
		case 'playout_togglefield':
			cmd = '/api/playout/togglefield?port=' + encodeURIComponent(options.port);
			break;
		case 'playout_pauseafter':
			cmd = '/api/playout/pauseafter?port=' + encodeURIComponent(options.port);
			break;
		case 'playout_loop':
			cmd = '/api/playout/loop?port=' + encodeURIComponent(options.port) + "&loopflag=" + (encodeURIComponent(options.loopflag ? "1" : "0"));
			break;
	}

	if (self.client !== undefined) {
		let url = 'http://' + self.config.host + cmd;
		self.log('debug', 'sending API command: ' + url);
		self.client.get(url, function (data, response) {
			if (data != "OK") {
				self.log('warn', 'ERROR from raven API :' + data);
			}
		});
	}
};
