var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	return self;
}

instance.prototype.CHOICES_predefined = [
	{ id: 'predefined1', label: 'Predefined Message #1'},
	{ id: 'predefined2', label: 'Predefined Message #2'},
	{ id: 'predefined3', label: 'Predefined Message #3'},
	{ id: 'predefined4', label: 'Predefined Message #4'},
	{ id: 'predefined5', label: 'Predefined Message #5'}
];

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;

	self.buildPredefinedArray();
	
	self.actions();
}

instance.prototype.init = function() {
	var self = this;

	self.status(self.STATE_OK);

	debug = self.debug;
	log = self.log;
	
	self.buildPredefinedArray();
	
	self.actions(); // export actions
}

instance.prototype.buildPredefinedArray = function() {
	var self = this;
	
	self.CHOICES_predefined[0].label = self.config.predefined1;
	self.CHOICES_predefined[1].label = self.config.predefined2;
	self.CHOICES_predefined[2].label = self.config.predefined3;
	self.CHOICES_predefined[3].label = self.config.predefined4;
	self.CHOICES_predefined[4].label = self.config.predefined5;
}

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;
	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'Use this module to send custom messages to your preconfigured Slack workspace and channel. Follow these instructions to set up your Slack Webhook Bot: <https://api.slack.com/messaging/webhooks>'
		},
		{
			type: 'textinput',
			id: 'slackURL',
			label: 'Slack Incoming Webhook URL',
			width: 12,
			required: true
		},
		{
			type: 'textinput',
			id: 'predefined1',
			label: 'Predefined Message #1',
			width: 12
		},
		{
			type: 'textinput',
			id: 'predefined2',
			label: 'Predefined Message #2',
			width: 12
		},
		{
			type: 'textinput',
			id: 'predefined3',
			label: 'Predefined Message #3',
			width: 12
		},
		{
			type: 'textinput',
			id: 'predefined4',
			label: 'Predefined Message #4',
			width: 12
		},
		{
			type: 'textinput',
			id: 'predefined5',
			label: 'Predefined Message #5',
			width: 12
		}
	]
}

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;
	debug("destroy");
}

instance.prototype.actions = function(system) {
	var self = this;

	self.setActions({
		'predefined': {
			label: 'Send A Predefined Message',
			options: [
				{
					type: 'dropdown',
					label: 'Message',
					id: 'message',
					default: 'predefined1',
					choices: self.CHOICES_predefined
				}
			]
		},
		'custom': {
			label: 'Send A Custom Message',
			options: [
				{
					type: 'textinput',
					label: 'Message',
					id: 'message',
					default: ''
				}
			]
		},
		'blockkit': {
			label: 'Send A Block Kit Message',
			options: [
				{
					type: 'textinput',
					label: 'Block Kit Body (JSON)',
					id: 'body',
					default: '{}'
				}
			]
		}
	});
}

instance.prototype.action = function(action) {
	var self = this;
	var cmd = self.config.slackURL;
	var body = {};
	
	switch(action.action) {
		case 'predefined':
			body.text = self.config[action.options.message];
			break;
		case 'custom':
			body.text = action.options.message;
			break;
		case 'blockkit':
			try {
				body = JSON.parse(action.options.body);
			} catch (e) {
				self.log('error', 'Slack Webhook Send Aborted: Malformed JSON Body (' + e.message+ ')');
				self.status(self.STATUS_ERROR, e.message);
				return;
			}
			break;
		default:
			break;
	};

	self.system.emit('rest', cmd, body, function (err, result) {
		if (err !== null) {
			self.log('error', 'Slack Webhook Send Failed (' + result.error.code + ')');
			self.status(self.STATUS_ERROR, result.error.code);
		}
		else {
			self.status(self.STATUS_OK);
		}
	});
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;