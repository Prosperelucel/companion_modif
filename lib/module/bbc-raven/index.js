// BBC Raven

var rest_client 	= require('node-rest-client').Client;
var instance_skel 	= require('../../instance_skel');
var debug;
var log;

instance.prototype.config_fields 	= require('./config');
instance.prototype.init_actions 	= require('./actions');
instance.prototype.action 			= require('./action');
instance.prototype.init_feedbacks 	= require('./feedbacks');
instance.prototype.feedback 		= require('./feedback');
instance.prototype.init_presets 	= require('./presets');

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	return self;
}

/* --- public methods --- */

instance.prototype.init = function () {
	var self = this;

	// init vars
	debug = self.debug;
	log = self.log;
	self.states = {
		"portstates": {}
	}
	self.lastnotificationid = 0;

	// other init methods
	self.init_colors();
	self.init_connection();
	self.init_presets();
}

instance.prototype.updateConfig = function (config) {
	var self = this;

	debug = self.debug;
	log = self.log;

	// save passed config
	self.config = config;

	// tear everything down
	self.destroy()

	// ... and start again
	self.init_colors();
	self.init_connection();
	self.init_presets();
}

instance.prototype.init_colors = function () {
	const self = this;
	self.color_red = self.rgb(177, 18, 17);
	self.color_white = self.rgb(255, 255, 255);
	self.color_black = self.rgb(0, 0, 0);
	self.color_green = self.rgb(34, 131, 41);
	self.color_blue = self.rgb(63, 68, 234);
}

instance.prototype.init_poller = function () {
	const self = this;

	// get the last notification id
	let url = `http://${self.config.host}/api/notifications/getlastid`

	self.client.get(url, function (data, response) {
		if (data != null) {
			self.lastnotificationid = data["id"];
			self.do_poll();
		}
		else {
			self.log('debug', 'Could not retrieve last notification id from web api');
		}
	});
}

instance.prototype.destroy = function () {
	var self = this;
	self.states = {
		"portstates": {}
	}
	self.client = null;
}

/* --- init --- */

instance.prototype.init_ports = function () {
	var self = this;

	// fetches a list of ports to use in configuration
	let url = `http://${self.config.host}/api/portlist/getall?addfriendlymachinenames=1`

	// we have to do this at the moment as there's a bug in companion which doesn't let you 
	//   save a single value in a dropdown
	self.PORTLIST_ALL = [{ "id": "0", "label": "none" }];
	self.PORTLIST_PLAY = [{ "id": "0", "label": "none" }];
	self.PORTLIST_REC = [{ "id": "0", "label": "none" }];

	self.client.get(url, function (data, response) {
		if (data != null) {
			for (var i in data) {
				// put it in the all-ports list
				self.PORTLIST_ALL.push({
					"id": data[i]["port"],
					"label": data[i]["portfriendlyname"]
				});

				if (data[i]["portmode"] == "play") {
					// add it to the playout list
					self.PORTLIST_PLAY.push({
						"id": data[i]["port"],
						"label": data[i]["portfriendlyname"]
					});
				}

				else if (data[i]["portmode"] == "rec") {
					// add it to the record list
					self.PORTLIST_REC.push({
						"id": data[i]["port"],
						"label": data[i]["portfriendlyname"]
					});
				}
			}
		}
		self.log('debug', 'found ' + self.PORTLIST_ALL.length + ' port(s) on raven server');
		self.init_actions();
		self.init_feedbacks();
		self.init_portstates();
	});
}

instance.prototype.init_portstates = function () {
	var self = this;

	self.log('debug', 'fetching port status from raven');

	for (var i in self.PORTLIST_ALL) {

		// probe the port for state
		var port = self.PORTLIST_ALL[i]["id"];
		if (port != "" && port != "0") {

			let url = `http://${self.config.host}/api/port/get?port=${port}`;
			self.client.get(url, function (data) {

				// we've got the portstate - now we can push it into the array
				// - just like the notification does later on
				self.push_portstate(data);
			});
		}
	}
}

instance.prototype.init_connection = function () {
	var self = this;
	self.client = new rest_client();

	// only connect when host is defined
	if (self.config.host === undefined || self.config.host == "") {
		return false;
	}

	// try to log in - make sure the raven is there
	let url = `http://${self.config.host}/api/hello`;

	self.log('debug', 'attempting connection to raven API');

	// generic error handler
	process.on('uncaughtException', function (err) {
		self.log('warn', "Faied to connect to raven API");
		self.status(self.STATE_ERROR, 'Cannot connect');
		console.log(err);
	});

	try {
		// connect to API
		self.client.get(url, function (data, response) {
			if (data == "Hello, world") {
				self.log('debug', 'connected OK');
				self.status(self.STATE_OK);
				self.init_ports();
				self.init_poller();
			}
			else {
				self.log('warn', 'failed to connect to raven API');
				console.log(data);
				self.status(self.STATE_ERROR, 'Cannot connect');
			}
		});
	}
	catch (err) {
		self.log('warn', err);
		self.status(self.STATE_ERROR, 'Cannot connect');
	}
}

/* --- notification polling --- */

instance.prototype.do_poll = function () {
	var self = this;

	let url = `http://${self.config.host}/api/notifications/get?timeout=20&id=${self.lastnotificationid}`;

	self.client.get(url, function (data, response) {
		for (index in data) {
			if (data[index]["type"] == "portstatuschanged") {
				self.push_portstate(data[index]["payload"]);
			}

			// store result of poll time for next call
			if (data[index]["_id"] > self.lastnotificationid) {
				self.lastnotificationid = parseInt(data[index]["_id"]);
			}
		}

		// we've either got a notification or it's timed out ... so repeat
		setTimeout(self.do_poll.bind(self), 100);
	});
}

instance.prototype.push_portstate = function (state) {
	var self = this;
	var port = state["port"];
	var portmode = state["portmode"];

	if (portmode == "play") {
		var state = state["properties"]["playportstate"];
	}
	else if (portmode == "rec") {
		var state = state["properties"]["recordportstate"];
	}

	// save it
	self.states['portstates'][port] = state;

	// raise feedback events
	if (portmode == "play") {
		self.checkFeedbacks('is_playing');
		self.checkFeedbacks('is_paused');
		self.checkFeedbacks('is_idle');
	}
	else if (portmode == "rec") {
		self.checkFeedbacks('is_recording');
		self.checkFeedbacks('is_monitoring');
		self.checkFeedbacks('is_idle');
	}
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;