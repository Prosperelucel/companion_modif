/*
 Version 1.0.5
  Refined X32TC v2.9.1 OSC commands and added preset icons
  Removed unsupported passcode and example functions
  Added input validation and feedback to keypad
  Corrected product naming

 Version 1.0.4
	Added presets and actions to lock/unlock changes (Supported in X32TCv2.9.1).
	Added presets and actions for moving the selected cue (Supported in X32TCv2.9.1).
	Added presets and actions to Undo/Redo changes (Supported in X32TCv2.9.1).
	Added presets and actions to Add/Clone/Delete cues (Supported in X32TCv2.9.1).
	Changed preset colour to make more uniform.
	Changed preset font size to make more uniform.
	Added Numeric keypad presets and actions to allow entering a cue manually.
	Added User variable so that typed cue number can be seen in the outside of the module.
 
 Version 1.0.2
  Pulled from Git, indentation changed from hard space to tab.
  Changed "custom osc" commands to "currently unsupported" commands, but commented out as not yet implimented (currently used for testing purposes only)
 
 Version 1.0.1
    Added presets and actions to start & stop cues.
    Added preset and action to jump to a specific cue.

*/

var instance_skel = require('../../instance_skel');
var debug;
var log;

var keypad_jump_cue = "";

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;
};

instance.prototype.init = function() {
	var self = this;

	self.status(self.STATE_OK);

	debug = self.debug;
	log = self.log;

	self.init_presets();
	self.init_feedbacks();	
};

// Return config fields for web config
instance.prototype.config_fields = function() {
	var self = this;

	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'Controls X32 Theatre Control by <a href="http://jamesholt.audio/x32tc/" target="_new">James Holt</a>' + '<br>'
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 8,
			regex: self.REGEX_IP,
			default: '127.0.0.1'
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	debug("destroy");
};

instance.prototype.actions = function(system) {
	var self = this;

	self.system.emit('instance_actions', self.id, {
		'go': {
			label: 'Go'
		},
		'back': {
			label: 'Back'
		},
		'jump_cue': {
			label: 'Jump to cue',
			options: [
				{
					type: 'textinput',
					label: 'Cue number',
					id: 'jumpcue',
					default: "0"
				}
			],
		},
		'keypad_entry': {
			label: 'Keypad entry',
			options: [
				{
					type: 'dropdown',
					label: 'Key',
					id: 'key',
					default: '0',
					choices: [
						{ id: '0', label: '0' },
						{ id: '1', label: '1' },
						{ id: '2', label: '2' },
						{ id: '3', label: '3' },
						{ id: '4', label: '4' },
						{ id: '5', label: '5' },
						{ id: '6', label: '6' },
						{ id: '7', label: '7' },
						{ id: '8', label: '8' },
						{ id: '9', label: '9' },
						{ id: '.', label: '.' }
					]
				}
			],
		},
		'keypad_clear': {
			label: 'Keypad clear'
		},
		'jump_keypad': {
			label: 'Jump to keypad cue'
		},
		'select_current': {
			label: 'Select current cue'
		},
		'select_up': {
			label: 'Select up'
		},
		'select_down': {
			label: 'Select down'
		},
		'jump_selected': {
			label: 'Jump to selected cue'
		},
		'insert_cue': {
			label: 'Insert cue'
		},
		'clone_cue': {
			label: 'Clone cue'
		},
		'delete_cue': {
			label: 'Delete cue'
		},
		'undo': {
			label: 'Undo'
		},
		'redo': {
			label: 'Redo'
		},
		'unlock': {
			label: 'Unlock editing'
		},
		'lock': {
			label: 'Lock editing'
		},
		'toggle_backup': {
			label: 'Toggle backup channel',
			options: [
				{
					type: 'number',
					label: 'Main Channel',
					id: 'channel',
					min: 1,
					max: 500,
					required: true,
					default: 1
				}
			]
		}
	});
}

instance.prototype.init_presets = function() {
	var self = this;
	var presets = [
		{
			category: 'Cue Control',
			label: 'Back',
			bank: {
				style: 'png',
				text: '',
				size: 'auto',
				color: self.rgb(0, 0, 0),
				bgcolor: self.rgb(170, 0, 0),
				png64: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6BAMAAADhKQK+AAAAA3NCSVQICAjb4U/gAAAAGFBMVEX///////////////////////////////8pK8DIAAAACHRSTlMAESKqu8zd/03vFLEAAAAJcEhZcwAACvAAAArwAUKsNJgAAAAgdEVYdFNvZnR3YXJlAE1hY3JvbWVkaWEgRmlyZXdvcmtzIE1Yu5EqJAAAAE9JREFUeJxjYBhWgFGBCEWiSUQYFF5G2CjR8nIDwgaVlwoQYVDgqEGjBg0ag0SIMIg4RURZR5TDR40aNWpgjSJY2BNXbRBVATEwEmHQUAAAq+06kWIjJWUAAAAASUVORK5CYII='
			},
			actions: [
				{
					action: 'back',
				}
			]
		},
		{
			category: 'Cue Control',
			label: 'Go',
			bank: {
				style: 'png',
				text: '',
				size: 'auto',
				color: self.rgb(0, 0, 0),
				bgcolor: self.rgb(0, 170, 0),
				png64: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6BAMAAADhKQK+AAAAA3NCSVQICAjb4U/gAAAAFVBMVEX///////////////////////////9nSIHRAAAAB3RSTlMAESKqzN3/hRiFmAAAAAlwSFlzAAAK8AAACvABQqw0mAAAACB0RVh0U29mdHdhcmUATWFjcm9tZWRpYSBGaXJld29ya3MgTVi7kSokAAAAR0lEQVR4nGNgGBaASYAIRaqORBgUlkLYKOa0NMJGMbqlEWGUyKhRo0YNA6OIUUSUdaMGjRo0qAwiqrAnqtogqgIiriobQgAArH4x0amKFXsAAAAASUVORK5CYII='
			},
			actions: [
				{
					action: 'go',
				}
			]
		},
		{
			category: 'Cue Control',
			label: 'Jump to cue...',
			bank: {
				style: 'png',
				text: '0',
				size: '24',
				alignment: 'center:bottom',
				color: self.rgb(255, 255, 255),
				bgcolor: self.rgb(204, 102, 0),
				png64: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6BAMAAADhKQK+AAAAA3NCSVQICAjb4U/gAAAAGFBMVEX///////////////////////////////8pK8DIAAAACHRSTlMAESKqu8zd/03vFLEAAAAJcEhZcwAACvAAAArwAUKsNJgAAAAgdEVYdFNvZnR3YXJlAE1hY3JvbWVkaWEgRmlyZXdvcmtzIE1Yu5EqJAAAAJdJREFUeJztz7ENgCAQheHDCSy0NzFxADdwBCt7GydQ1teAKMfdcRaWvA7C/0UB/l5f0zsz4nO1zfRRe3ToPNidUGaxK46sJRS5u6qUYq4oxeCkYyAacl+ZliyUpiyUtAKEYwFCtQjFuQhFfQZ6gQz0CFkoEFnoNhTIIwrkKQ1ylAY5SoXUXwuUDgE0k/4GzAeorKysTNoJym86giWhNfUAAAAASUVORK5CYII='
			},
			actions: [
				{
					action: 'jump_cue',
					options: {
						jumpcue: '0',
					}
				}
			]
		},
		{
			category: 'Cue Keypad',
			label: '0',
			bank: {
				style: 'text',
				text: '0',
				size: '44',
				color: self.rgb(255, 255, 255),
				bgcolor: self.rgb(0, 0, 0)
			},
			actions: [
				{
					action: 'keypad_entry',
					options: {
						key: '0'
					}
				}
			]
		},
		{
			category: 'Cue Keypad',
			label: '1',
			bank: {
				style: 'text',
				text: '1',
				size: '44',
				color: self.rgb(255, 255, 255),
				bgcolor: self.rgb(0, 0, 0)
			},
			actions: [
				{
					action: 'keypad_entry',
					options: {
						key: '1'
					}
				}
			]
		},
		{
			category: 'Cue Keypad',
			label: '2',
			bank: {
				style: 'text',
				text: '2',
				size: '44',
				color: self.rgb(255, 255, 255),
				bgcolor: self.rgb(0, 0, 0)
			},
			actions: [
				{
					action: 'keypad_entry',
					options: {
						key: '2'
					}
				}
			]
		},
		{
			category: 'Cue Keypad',
			label: '3',
			bank: {
				style: 'text',
				text: '3',
				size: '44',
				color: self.rgb(255, 255, 255),
				bgcolor: self.rgb(0, 0, 0)
			},
			actions: [
				{
					action: 'keypad_entry',
					options: {
						key: '3'
					}
				}
			]
		},
		{
			category: 'Cue Keypad',
			label: '4',
			bank: {
				style: 'text',
				text: '4',
				size: '44',
				color: self.rgb(255, 255, 255),
				bgcolor: self.rgb(0, 0, 0)
			},
			actions: [
				{
					action: 'keypad_entry',
					options: {
						key: '4'
					}
				}
			]
		},
		{
			category: 'Cue Keypad',
			label: '5',
			bank: {
				style: 'text',
				text: '5',
				size: '44',
				color: self.rgb(255, 255, 255),
				bgcolor: self.rgb(0, 0, 0)
			},
			actions: [
				{
					action: 'keypad_entry',
					options: {
						key: '5'
					}
				}
			]
		},
		{
			category: 'Cue Keypad',
			label: '6',
			bank: {
				style: 'text',
				text: '6',
				size: '44',
				color: self.rgb(255, 255, 255),
				bgcolor: self.rgb(0, 0, 0)
			},
			actions: [
				{
					action: 'keypad_entry',
					options: {
						key: '6'
					}
				}
			]
		},
		{
			category: 'Cue Keypad',
			label: '7',
			bank: {
				style: 'text',
				text: '7',
				size: '44',
				color: self.rgb(255, 255, 255),
				bgcolor: self.rgb(0, 0, 0)
			},
			actions: [
				{
					action: 'keypad_entry',
					options: {
						key: '7'
					}
				}
			]
		},
		{
			category: 'Cue Keypad',
			label: '8',
			bank: {
				style: 'text',
				text: '8',
				size: '44',
				color: self.rgb(255, 255, 255),
				bgcolor: self.rgb(0, 0, 0)
			},
			actions: [
				{
					action: 'keypad_entry',
					options: {
						key: '8'
					}
				}
			]
		},
		{
			category: 'Cue Keypad',
			label: '9',
			bank: {
				style: 'text',
				text: '9',
				size: '44',
				color: self.rgb(255, 255, 255),
				bgcolor: self.rgb(0, 0, 0)
			},
			actions: [
				{
					action: 'keypad_entry',
					options: {
						key: '9'
					}
				}
			]
		},
		{
			category: 'Cue Keypad',
			label: 'Point',
			bank: {
				style: 'text',
				text: '.',
				size: '44',
				color: self.rgb(255, 255, 255),
				bgcolor: self.rgb(0, 0, 0)
			},
			actions: [
				{
					action: 'keypad_entry',
					options: {
						key: '.'
					}
				}
			]
		},
		{
			category: 'Cue Keypad',
			label: 'Clear',
			bank: {
				style: 'text',
				text: '',
				size: 'auto',
				color: self.rgb(0, 0, 0),
				bgcolor: self.rgb(0, 0, 0),
				png64: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6BAMAAADhKQK+AAAAA3NCSVQICAjb4U/gAAAAFVBMVEX///////////////////////////9nSIHRAAAAB3RSTlMAM0RVZqr/s5qSPgAAAAlwSFlzAAALEgAACxIB0t1+/AAAACB0RVh0U29mdHdhcmUATWFjcm9tZWRpYSBGaXJld29ya3MgTVi7kSokAAAAvUlEQVR4nO2UOw6EMAwFDVl6jsARUqXeipqKCwC+/xE2XonweZZ4dBS4SAGjAduxRd54fPR6DmQ+wDgQihByRAhl0ff4BKEsmuUKQhFCjgghRwRQEbV2VD60iprJzjR4UBGNGkWCLh60imrVrEqqHUJbavl9DH8SoC01AwxEaF+jZC2bnOz2NQoGRYTCodipiO5D1Oe4H6dKwBWTagvXYOqqcJeOur7cIFAjxQ0nNebcwqBWD7fEqHX4xlPiB4F9kpWeFoM0AAAAAElFTkSuQmCC'
			},
			actions: [
				{
					action: 'keypad_clear'
				}
			]
		},
		{
			category: 'Cue Keypad',
			label: 'Jump to keypad cue',
			bank: {
				style: 'png',
				text: '',
				size: '24',
				alignment: 'center:bottom',
				color: self.rgb(255, 255, 255),
				bgcolor: self.rgb(0, 0, 0),
				png64: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6BAMAAADhKQK+AAAAA3NCSVQICAjb4U/gAAAAGFBMVEX///////////////////////////////8pK8DIAAAACHRSTlMAESKqu8zd/03vFLEAAAAJcEhZcwAACvAAAArwAUKsNJgAAAAgdEVYdFNvZnR3YXJlAE1hY3JvbWVkaWEgRmlyZXdvcmtzIE1Yu5EqJAAAAJdJREFUeJztz7ENgCAQheHDCSy0NzFxADdwBCt7GydQ1teAKMfdcRaWvA7C/0UB/l5f0zsz4nO1zfRRe3ToPNidUGaxK46sJRS5u6qUYq4oxeCkYyAacl+ZliyUpiyUtAKEYwFCtQjFuQhFfQZ6gQz0CFkoEFnoNhTIIwrkKQ1ylAY5SoXUXwuUDgE0k/4GzAeorKysTNoJym86giWhNfUAAAAASUVORK5CYII='
			},
			actions: [
				{
					action: 'jump_keypad'
				}
			],
			feedbacks: [
				{
					type: 'keypad_entry'
				}
			]
		},
		{
			category: 'Selection',
			label: 'Select current cue',
			bank: {
				style: 'png',
				text: '',
				size: 'auto',
				color: self.rgb(0, 0, 0),
				bgcolor: self.rgb(0, 0, 0),
				png64: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6BAMAAADhKQK+AAAAA3NCSVQICAjb4U/gAAAAGFBMVEX///////////////////////////8AAKoflqwsAAAACHRSTlMAM1Vmd4j//8O1NiUAAAAJcEhZcwAACvAAAArwAUKsNJgAAAAgdEVYdFNvZnR3YXJlAE1hY3JvbWVkaWEgRmlyZXdvcmtzIE1Yu5EqJAAAANtJREFUeJztljESwjAMBA2BoeUJPCFVaipqKj4QuJqO72PLVjAJko8+13jGWm8aW0oImv2YVyCvwzUsc0NfQx0eS2YDjDU0AMclFXf7D9Tpme/odob0iKESyBBNBYEskVYSZIq0lCBbVGoRckRFFSFPlFWAK8oqwBeJKsUTiSrFFRWVLyqqhkhULZGomqKoaotC2J6MwuFl5LlCK/Q/VMe8dHWY60s9BOZJUY+TeeZUw2BaD9XEmHZINVamRVPNnhkb1ABiRhk1FJnxyg3qy3zk3398bjf/eThPpTcCHSGY7xxKegAAAABJRU5ErkJggg=='
			},
			actions: [
				{
					action: 'select_current',
				}
			]
		},
		{
			category: 'Selection',
			label: 'Select up',
			bank: {
				style: 'png',
				text: '',
				size: 'auto',
				color: self.rgb(0, 0, 0),
				bgcolor: self.rgb(0, 0, 0),
				png64: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6BAMAAADhKQK+AAAAA3NCSVQICAjb4U/gAAAAElBMVEX///////////////////////+65XQCAAAABnRSTlMAM1Vmd/910o15AAAACXBIWXMAAArwAAAK8AFCrDSYAAAAIHRFWHRTb2Z0d2FyZQBNYWNyb21lZGlhIEZpcmV3b3JrcyBNWLuRKiQAAACZSURBVHic7c67FcIwDIVhBzNARmAEGvU0TJDc/VfBehUcbCllwrFK34+flPI3d3scQLTlpgLPPASkqRbKU8QoSUkoS5GiMNVCG0BximeghilZgRKmZGwoSunWUJTSidE4ZQujccoGQaOUvwsapfxZUT+1+Ksi/s36q97WN1Sxd/7ubnlDhV69L1+/0dIzfo7Cm2iiiU6KLnIfZfo+OqWzTpAAAAAASUVORK5CYII='
			},
			actions: [
				{
					action: 'select_up',
				}
			]
		},
		{
			category: 'Selection',
			label: 'Select down',
			bank: {
				style: 'png',
				text: '',
				size: 'auto',
				color: self.rgb(0, 0, 0),
				bgcolor: self.rgb(0, 0, 0),
				png64: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6BAMAAADhKQK+AAAAA3NCSVQICAjb4U/gAAAAElBMVEX///////////////////////+65XQCAAAABnRSTlMAM1VmiP/m9nALAAAACXBIWXMAAArwAAAK8AFCrDSYAAAAIHRFWHRTb2Z0d2FyZQBNYWNyb21lZGlhIEZpcmV3b3JrcyBNWLuRKiQAAACVSURBVHic7cyxFYAgDEVRUAdwBEegsbdxAv37ryIEonI0wRYPvySPa8xvBrSoRS2qMBrzyL41w5ZH8/ISrXD3qMf+bCyw3aMZGJ+Vf3VX1POffPwcI/4iUBQJ0HmgSIL4EiIR4lOIZCjdfKRAifKRBkUKUKFIATpEVJgGERWmQonSoUQVIKJKEFFFyFNlyJhu+hBVsgNWEj467EESXQAAAABJRU5ErkJggg=='
			},
			actions: [
				{
					action: 'select_down',
				}
			]
		},
		{
			category: 'Selection',
			label: 'Jump to selected cue',
			bank: {
				style: 'png',
				text: '',
				size: 'auto',
				color: self.rgb(0, 0, 0),
				bgcolor: self.rgb(204, 102, 0),
				png64: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6BAMAAADhKQK+AAAAA3NCSVQICAjb4U/gAAAAGFBMVEX///////////////////////////////8pK8DIAAAACHRSTlMAESKqu8zd/03vFLEAAAAJcEhZcwAACvAAAArwAUKsNJgAAAAgdEVYdFNvZnR3YXJlAE1hY3JvbWVkaWEgRmlyZXdvcmtzIE1Yu5EqJAAAAKpJREFUeJzt0j0OwjAMBWCHE3QoO1KlHqA34AhM7CycoPX1WzUE4vivlSJgqLdY731KpADUnq7huzDQ8+l546HzdCHnHkdGhTs+aAmRUWy3tEpKWHFKwFlPgHhRumXZFKGyKkJFV4FoWYFIW4XyugplfQP6AAb0FkwoESb0MhwoIg4UKQ9aKQ9aKRdyn5YoHwJor34GwgboC4PG/C6k3/YIHaH9of/741VmBr2QwGLt2oKWAAAAAElFTkSuQmCC'
			},
			actions: [
				{
					action: 'jump_selected',
				}
			]
		},
		{
			category: 'Editing',
			label: 'Insert cue',
			bank: {
				style: 'png',
				text: '',
				size: 'auto',
				color: self.rgb(0, 0, 0),
				bgcolor: self.rgb(76, 0, 102),
				png64: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6BAMAAADhKQK+AAAAA3NCSVQICAjb4U/gAAAAMFBMVEX///////////////////////////////////////////////////////////////9Or7hAAAAAEHRSTlMAESIzRFVmd4iZqrvM3e7/dpUBFQAAAAlwSFlzAAAK8AAACvABQqw0mAAAACB0RVh0U29mdHdhcmUATWFjcm9tZWRpYSBGaXJld29ya3MgTVi7kSokAAABQklEQVR4nO3TP0oDQRQG8DdqYvxTDEjETnsbTyBrpZ14AdfcwQOksdYTiNgqwRNkey1ygiQoChICUygEdtf9nM26ee4yMwQbm/2qV/x25/FmHlGVKtPAkf9D9m4r5ETi6P7pQrrRZpBOe9xyofogu5PYgUQHSPp95by7XWDkEW10HEgECHfSYrELSAtaRdLKqoZC24J8vOblKd4YlXKWf7mMWFpQOPu9bs+zoBfuYR8PFnTFaA3PZIqPPUY1fBrRZSIZCTUxouCLGyBS4RxoGBlRr4jivx83V+N+NuQMLeHDiLZxw8g2zHXztRRTV5GcIb7gYsSQn0oDkTQiOuaX5nNZyopK2lm19ev5ls/TizB9CAsBzKNMk67UAVFTr/GtFdG1Xs7xQC/nu91Qrfez5p4DUbObmtGJy+jmD+8ez/MRfQNFbrVE2ACzGAAAAABJRU5ErkJggg=='
			},
			actions: [
				{
					action: 'insert_cue',
				}
			]
		},
		{
			category: 'Editing',
			label: 'Clone cue',
			bank: {
				style: 'png',
				text: '',
				size: 'auto',
				color: self.rgb(0, 0, 0),
				bgcolor: self.rgb(76, 0, 102),
				png64: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6BAMAAADhKQK+AAAAA3NCSVQICAjb4U/gAAAAJFBMVEX////////////////////////////////////////////////Vd7HLAAAADHRSTlMAESJEVWaImbvM7v88U0KyAAAACXBIWXMAAArwAAAK8AFCrDSYAAAAIHRFWHRTb2Z0d2FyZQBNYWNyb21lZGlhIEZpcmV3b3JrcyBNWLuRKiQAAABuSURBVHicY2CgP9iNBwycItyuHYmKcHFGFSEzvUFpaAt2RfAUxgGiGlCEMBUxgSgFAooYsnfv3sZASJHU7t0LsSpCBqy7dwdglUABs3cSVsNgvZkIRewF2MWpmYOppwiXL0YVjSoiR9HgS+P0AwCppKcBJcYC+wAAAABJRU5ErkJggg=='
			},
			actions: [
				{
					action: 'clone_cue',
				}
			]
		},
		{
			category: 'Editing',
			label: 'Delete cue',
			bank: {
				style: 'png',
				text: '',
				size: 'auto',
				color: self.rgb(0, 0, 0),
				bgcolor: self.rgb(76, 0, 102),
				png64: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6BAMAAADhKQK+AAAAA3NCSVQICAjb4U/gAAAAMFBMVEX///////////////////////////////////////////////////////////////9Or7hAAAAAEHRSTlMAESIzRFVmd4iZqrvM3e7/dpUBFQAAAAlwSFlzAAAK8AAACvABQqw0mAAAACB0RVh0U29mdHdhcmUATWFjcm9tZWRpYSBGaXJld29ya3MgTVi7kSokAAABhUlEQVR4nO2TvU4CURCFZxVWRIpNDMZOehuewGClHfEFXHkCKOylsdYnMMZWAz4Bayi14AmAaDQxhGQL/EnYdY8zC2SF3HtbG06xmWS/3Dn3zB2ipZaKBYP+D9K7XUJGyDq8ezp3zNCWJ2kPKybI7k1mEhogqwFE3a5vnN0uMCgRbTYMkOVhXJBitQU4GiiLqDKpMj7qGsjF66w8xlsCLehk9mcNoaOBxkQp4Wpir6SBXojKX+wtINrDvQa6pJS0bOKBNvBMKrkokg18ZsFAGh9K6CJir1Wgg7BAlv+thLwf/tjSts2FP9ZD3FQOIuoHSqgTQzkgbtQPDSc1p5lq2sXGs+KJs9IZdyXkJsIzOSqFkRLawTXPDG2+4EgbZk7G4vHVqqj9Gcu8bD9wKMegzXaSAc/L6su15IUUKYPAUUJUTl6am5QLWvej+qTa/vN8F/vxIhSlWPGgjlIkK7VPlOc1vtFCdMXLOezxcr7rGUp3pmteMkCUbwkzODIxbP7g9vF0FtEvek22Eq8W+gsAAAAASUVORK5CYII='
			},
			actions: [
				{
					action: 'delete_cue',
				}
			]
		},
		{
			category: 'Editing',
			label: 'Undo',
			bank: {
				style: 'png',
				text: '',
				size: 'auto',
				color: self.rgb(0, 0, 0),
				bgcolor: self.rgb(0, 85, 85),
				png64: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6BAMAAADhKQK+AAAAA3NCSVQICAjb4U/gAAAAIVBMVEX///////////////////////////////////////////9/gMdvAAAAC3RSTlMAESIzVWaIu93u/3I6PYEAAAAJcEhZcwAACvAAAArwAUKsNJgAAAAgdEVYdFNvZnR3YXJlAE1hY3JvbWVkaWEgRmlyZXdvcmtzIE1Yu5EqJAAAAKxJREFUeJztlDEOwjAQBB0B4QM8IE+gRFSpqahT0SHxAGpqOkRDjyBhXhlR+tbRuUTCW4/GJ/u8IZTEmeVA3cFnFrwzRLD2RbxyRPsi+i1RnMdZX3pnIRjaDIi+8Y775u4NvjqiC6hXsIGbpwrhRG8hVdXQuqrqysVXbXlaSFXLxC8UVa2Tq2rOoJBVVXwUEhUkIKtKQrYw0pCpnjRkSmwCiutwAopToDzoPzICBe2PkPCJqrEAAAAASUVORK5CYII='
			},
			actions: [
				{
					action: 'undo',
				}
			]
		},
		{
			category: 'Editing',
			label: 'Redo',
			bank: {
				style: 'png',
				text: '',
				size: 'auto',
				color: self.rgb(0, 0, 0),
				bgcolor: self.rgb(0, 85, 85),
				png64: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6BAMAAADhKQK+AAAAA3NCSVQICAjb4U/gAAAAIVBMVEX///////////////////////////////////////////9/gMdvAAAAC3RSTlMAESIzVWaIu93u/3I6PYEAAAAJcEhZcwAACvAAAArwAUKsNJgAAAAgdEVYdFNvZnR3YXJlAE1hY3JvbWVkaWEgRmlyZXdvcmtzIE1Yu5EqJAAAALFJREFUeJztlC0OAjEQRht2IUiusQ4LCm6AXoUjQaEQa1HsEbD8hLxTbu1Mp5lKEvrJ5uV1Mp1OCDVm1gXM4l0AnTm4TAMFqp4C1byqfkfVnO6oJKp21Ai8FDMbUiaBNgajr4uDxnXvFN7BTZ4YLRj4rLwOtHB0RUu+8sBq5ZanK4o/7eKKYt2yJPN1R3auKDwQDbDHBHyRgjLzJqDcwpCmzOqRUGaJSSizDhVkp0J/nQlt05ByT4pUOgAAAABJRU5ErkJggg=='
			},
			actions: [
				{
					action: 'redo',
				}
			]
		},
		{
			category: 'Editing',
			label: 'Unlock editing',
			bank: {
				style: 'png',
				text: '',
				size: 'auto',
				color: self.rgb(0, 0, 0),
				bgcolor: self.rgb(96, 0, 39),
				png64: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6BAMAAADhKQK+AAAAA3NCSVQICAjb4U/gAAAAMFBMVEX///////////////////////////////////////////////////////////////9Or7hAAAAAEHRSTlMAESIzRFVmd4iZqrvM3e7/dpUBFQAAAAlwSFlzAAAK8AAACvABQqw0mAAAACB0RVh0U29mdHdhcmUATWFjcm9tZWRpYSBGaXJld29ya3MgTVi7kSokAAAAp0lEQVR4nGNgGFDAXLnv7Q4DAmr2/weCvwH41DCt/w8GvxXwKNL9DwWP8Rj0/v//bY6iXUBVuJ2l9///ZhBt+///Q5yK1v//AWHM//8HlxqW//8bICyO//9xeZDn/28oi/H+/ws4FEm8/wRj2v//jMs+tgIYixvmOnyAHW4zHsD6/y9hRYz//xFWxPD//7BS9B8LGHhFRLh9VNGoolFFVFY0+MoC+gAAeVtOCLIYs+0AAAAASUVORK5CYII='
			},
			actions: [
				{
					action: 'unlock',
				}
			]
		},
		{
			category: 'Editing',
			label: 'Lock editing',
			bank: {
				style: 'png',
				text: '',
				size: 'auto',
				color: self.rgb(0, 0, 0),
				bgcolor: self.rgb(96, 0, 39),
				png64: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6BAMAAADhKQK+AAAAA3NCSVQICAjb4U/gAAAAIVBMVEX///////////////////////////////////////+ZmZmkrHixAAAAC3RSTlMAESIzVYi73e7//9NMVSMAAAAJcEhZcwAACvAAAArwAUKsNJgAAAAgdEVYdFNvZnR3YXJlAE1hY3JvbWVkaWEgRmlyZXdvcmtzIE1Yu5EqJAAAAK5JREFUeJztlKEOglAYRkFRK49gMBhtasM3MLHRLITb3CwSncGRHeB5BZ9SQNDt7v63Kc5xyv9t94STruN0yjA8XuKF3fESSorA5gwUNfnUIq1oOFuCyud4MwvLI2fN4VDdJZxESZH59YjIJceD7XONIBCkCUWz3IS9IK25GqZGxK6dYzJBUm1SFSWVJ+9a75Wnk+K30+UmSGDefyBhoHvprtFLvdRLn5d+7y/4Dg8ab9SNFf0otQAAAABJRU5ErkJggg=='
			},
			actions: [
				{
					action: 'lock',
				}
			]
		},
		{
			category: 'Backups',
			label: 'Toggle backup channel...',
			bank: {
				style: 'png',
				text: 'Alice',
				size: '18',
				alignment: 'center:bottom',
				color: self.rgb(255, 255, 255),
				bgcolor: self.rgb(0, 0, 85),
				png64: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6BAMAAADhKQK+AAAAA3NCSVQICAjb4U/gAAAAIVBMVEX///////////////////////////////////////////9/gMdvAAAAC3RSTlMAETNEZneImczu/ynKMzkAAAAJcEhZcwAACxIAAAsSAdLdfvwAAAAWdEVYdENyZWF0aW9uIFRpbWUAMDEvMDUvMjC9Qn5kAAAAIHRFWHRTb2Z0d2FyZQBNYWNyb21lZGlhIEZpcmV3b3JrcyBNWLuRKiQAAACOSURBVHicY2AY3GAVugDXglFFKIq4VkEAkgYIWECyogXo9q3CtI9rAcgsVEUgc9AVAQlURUB5XIqYQFwF/IoYs0Dc5QI4FEHcFAm2cdVU7G6COMQCEgqrVjVj890qHACbSUgAWzgRYx1UEczhU7CHOFQRYxWIXiaAVxFSYOJRBAO0VUS1lDkKRsEoGJoAAIEZjLd7xdiCAAAAAElFTkSuQmCC'
			},
			actions: [
				{
					action: 'toggle_backup',
					options: {
						channel: 1,
					}
				}
			]
		}
	];
	self.setPresetDefinitions(presets);
}

instance.prototype.init_feedbacks = function() {
	var self = this;
	var feedbacks = {};

	feedbacks['keypad_entry'] = {
		label: 'Keypad entry',
		description: 'Update jump button display based on keypad input',
		callback: (feedback, bank) => {
			if (keypad_jump_cue != "") {
				return {
					bgcolor: self.rgb(204, 102, 0),
					text: keypad_jump_cue
				};
			} else {
				return {
					bgcolor: self.rgb(0, 0, 0),
					text: ""
				};
			}
		}
	};

	self.setFeedbackDefinitions(feedbacks);
};

instance.prototype.sendOSC = function(node, arg) {
	var self = this;
	var host = "127.0.0.1";

	if (self.config.host !== undefined && self.config.host !== "") {
		host = self.config.host;
	}

	self.system.emit('osc_send', host, 32000, node, arg);
};


instance.prototype.action = function(action) {
	var self = this;
	var cmd;
	var arg;

	debug('action: ', action);
	
	switch (action.action) {

		case 'go':
			arg = null;
			cmd = '/go';
			break;

		case 'back':
			arg = null;
			cmd = '/back';
			break;

		case 'jump_cue':
			var bol = {
				type: "s",
				value: "" + action.options.jumpcue
			};
			arg = bol;
			cmd = '/jump';
			break;

		case 'unlock':
			arg = null;
			cmd = '/unlock';
			break;

		case 'lock':
			arg = null;
			cmd = '/lock';
			break;

		case 'select_up':
			var bol = {
				type: "s",
				value: "up"
			};
			arg = bol;
			cmd = '/select';
			break;

		case 'select_down':
			var bol = {
				type: "s",
				value: "down"
			};
			arg = bol;
			cmd = '/select';
			break;

		case 'select_current':
			var bol = {
				type: "s",
				value: "current"
			};
			arg = bol;
			cmd = '/select';
			break;

		case 'jump_selected':
			var bol = {
				type: "s",
				value: "selected"
			};
			arg = bol;
			cmd = '/jump';
			break;

		case 'insert_cue':
			arg = null;
			cmd = '/insertcue';
			break;

		case 'clone_cue':
			arg = null;
			cmd = '/clonecue';
			break;

		case 'delete_cue':
			arg = null;
			cmd = '/deletecue';
			break;

		case 'undo':
			arg = null;
			cmd = '/undo';
			break;

		case 'redo':
			arg = null;
			cmd = '/redo';
			break;

		case 'toggle_backup':
			var bol = {
				type: "i",
				value: action.options.channel
			};
			arg = bol;
			cmd = '/togglebackup';
			break;

		case 'keypad_entry':
			if (keypad_jump_cue == "" && action.options.key == ".") {
				// prepend 0 to empty point input
				keypad_jump_cue = keypad_jump_cue + "0" + action.options.key;
			} else if (keypad_jump_cue == "0" && action.options.key != ".") {
				// strip leading 0 if not a point input
				keypad_jump_cue = action.options.key;
			} else if (!(keypad_jump_cue.includes(".") && action.options.key == ".") && keypad_jump_cue.length < 7) {
				// prohibit multiple points in input
				// x32tc maximum cue number is 9999.99 => 7 characters
				if (keypad_jump_cue.includes(".") && keypad_jump_cue.length > 3) {
					if (keypad_jump_cue.substring(keypad_jump_cue.length - 3, keypad_jump_cue.length - 2) != ".") {
						// only accept two digits after a point
						keypad_jump_cue = keypad_jump_cue + action.options.key;
					}
				} else if (!(keypad_jump_cue.length == 4 && !keypad_jump_cue.includes(".") && action.options.key != ".")) {
					// x32tc maximum whole cue number is 9999, after 4 digits only accept a point
					keypad_jump_cue = keypad_jump_cue + action.options.key;
				}
			}
			self.checkFeedbacks('keypad_entry');
			break;

		case 'keypad_clear':
			keypad_jump_cue = "";
			self.checkFeedbacks('keypad_entry');
			break;

		case 'jump_keypad':
			if (keypad_jump_cue != "") {
				if (keypad_jump_cue.endsWith(".")) {
					// strip off trailing point
					keypad_jump_cue = keypad_jump_cue.slice(0, -1);
				}

				var bol = {
					type: "s",
					value: "" + keypad_jump_cue
				};
				arg = bol;
				cmd = '/jump';
			}
			keypad_jump_cue = "";
			self.checkFeedbacks('keypad_entry');

			break;

	}

	if (arg == null) {
		arg = [];
	}
	if (cmd !== undefined) {
		debug('sending', cmd, arg, "to", self.config.host);
		self.sendOSC(cmd, arg);
	}
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
