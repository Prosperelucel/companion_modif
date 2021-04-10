exports = module.exports = function () {

	var self = this;

	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'This module allows you to control a BBC Raven video server. Sadly this is an internal product and not yet released outside of the BBC.'
		},
		{
			type: 'text',
			id: 'info-compat',
			width: 12,
			label: 'Compatibility',
			value: 'This module will only control a Raven v4 server.'
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'IP Address',
			width: 6,
			default: '',
			regex: self.REGEX_IP
		}
	]
};
