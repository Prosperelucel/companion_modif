var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');

var actions       = require('./actions');
var feedback      = require('./feedback');
var presets       = require('./presets');
var variables     = require('./variables');

var debug;
var log;

/**
 * Companion instance class for the Vaddio PTZ cameras.
 *
 * @extends instance_skel
 * @version 1.0.0
 * @since 1.0.0
 * @author Keith Rocheck <keith.rocheck@gmail.com>
 */
class instance extends instance_skel {

	/**
	 * Create an instance of a vaddio ptz module.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @param {string} id - the instance ID
	 * @param {Object} config - saved user configuration parameters
	 * @since 1.0.0
	 */
	constructor(system, id, config) {
		super(system, id, config);

		this.deviceName   = '';
		this.loggedIn     = false;
		this.okToSend     = false;
		this.catchUp      = false;
		this.nextCommand  = '';
		this.lastPoll     = 0;
		this.pollTimer    = null;

		this.panSpeed     = 12;
		this.tiltSpeed    = 10;
		this.zoomSpeed    = 3;
		this.focusSpeed   = 5;

		this.state = {
			auto_focus:             'on',//
			auto_iris:              'on',//
			auto_white_balance:     'on',//
			backlight_compensation: 'off',//
			blue_gain:              128,
			chroma:                 7,
			detail:                 7,
			gain:                   0,
			gamma:                  0,
			iris:                   6,
			led:                    'on',
			mute:                   'off',
			red_gain:               128,
			standby:                'off',
			wide_dynamic_range:     'off'
		}

		Object.assign(this, {
			...actions,
			...feedback,
			...presets,
			...variables
		});

		this.POLL_COMMANDS = ['camera standby get', 'camera focus mode get', 'camera ccu get all', 'camera led get', 'video mute get'];

		this.PRESETS_PT = [
			{ id: 'up',        label: 'UP',         icon: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6AQMAAAApyY3OAAABS2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIi8+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgo8P3hwYWNrZXQgZW5kPSJyIj8+LUNEtwAAAARnQU1BAACxjwv8YQUAAAABc1JHQgCuzhzpAAAABlBMVEUAAAD///+l2Z/dAAAAAXRSTlMAQObYZgAAAIFJREFUKM+90EEKgzAQRmFDFy49ghcp5FquVPBighcRegHBjWDJ68D8U6F7m00+EnhkUlW3ru6rdyCV0INQzSg1zFLLKmU2aeCQQMEEJXIQORRsTLNyKJhNm3IoaPBg4mQorp2Mh1+00kKN307o/bZrpt5O/FlPU/c75X91/fPd6wPRD1eHyHEL4wAAAABJRU5ErkJggg==' },
			{ id: 'down',      label: 'DOWN',       icon: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6AQMAAAApyY3OAAABS2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIi8+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgo8P3hwYWNrZXQgZW5kPSJyIj8+LUNEtwAAAARnQU1BAACxjwv8YQUAAAABc1JHQgCuzhzpAAAABlBMVEUAAAD///+l2Z/dAAAAAXRSTlMAQObYZgAAAIlJREFUKM/F0DEOwyAMBVAjDxk5Qo7CtdiClIv1KJF6gUpZIhXxY2zTDJ2benoS8LFN9MsKbYjxF2XRS1UZ4bCeGFztFmNqphURpidm146kpwFvLDYJpPQtLSLNoySyP2bRpoqih2oSFW8K3lYAxmJGXA88XMnjeuDmih7XA8vXvNeeqX6U6aY6AacbWAQNWOPUAAAAAElFTkSuQmCC'},
			{ id: 'left',      label: 'LEFT',       icon: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6AQMAAAApyY3OAAABS2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIi8+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgo8P3hwYWNrZXQgZW5kPSJyIj8+LUNEtwAAAARnQU1BAACxjwv8YQUAAAABc1JHQgCuzhzpAAAABlBMVEUAAAD///+l2Z/dAAAAAXRSTlMAQObYZgAAAHpJREFUKM+1kTEOgCAQBM9Q2JjwA/mJPA2fxlN4giWF8TRBBhMpbKSaZie3i8gPb4Y8FNZKGm8YIAONkNWacIruQLejy+gyug1dQhfRqZa0v6gYA6QfqSWapZnto1B6XdUuFaVHoJunr2MD21nIdJYUEhLYfoGmP777BKKIXC0eYSD5AAAAAElFTkSuQmCC'},
			{ id: 'right',     label: 'RIGHT',      icon: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6AQMAAAApyY3OAAABS2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIi8+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgo8P3hwYWNrZXQgZW5kPSJyIj8+LUNEtwAAAARnQU1BAACxjwv8YQUAAAABc1JHQgCuzhzpAAAABlBMVEUAAAD///+l2Z/dAAAAAXRSTlMAQObYZgAAAHhJREFUKM+10LERgCAMQFE4CktHcBRWcRMYzVEcwdKCI+od+fGksVCq3/AuiXOfvZnaNXzRClVrEKtMLdSqP2RTRQAFMAFGwAlw7MAk0sAzGnhVoerLKg/F5Pv4NoFNZZNGpk9sxJYeLsDdL5T7S8IFOM/R3OZ+fQeQZV9pMy+bVgAAAABJRU5ErkJggg=='},
			{ id: 'upRight',   label: 'UP RIGHT',   icon: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6CAMAAAAk2e+/AAABS2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIi8+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgo8P3hwYWNrZXQgZW5kPSJyIj8+LUNEtwAAAARnQU1BAACxjwv8YQUAAAABc1JHQgCuzhzpAAABhlBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+X02G5AAAAgXRSTlMAAte32QZhZx7d+TywDTf8/d5VstYPOxULNvKmSY8TFBrxyeGCluJeELQ5uw7ULND4BedlKuv2P/vDA8UgCk30WO41s8+5X8dABAz6QhHVaR156JpPnihSfTJDNOMBm4bzSICqr23NsRjcGRbtjTCS2lzsOmyu9+WLKb2fTL8+RPDhqO4yAAABfElEQVRYw+3WZW/CUBQG4AO0FBsOwwcMm7sLc3d3d3e388/HGGs7lpD0tsm+9P3S5CT3SdPec+8BkCNHzv9FAVAAEABYdQDkA7jo9GNUIDMBzstb5vr0/Gx8Z35zOjI36R2xbu+619eWa2xCoK0FClF5h1cWxDHEwilEOyLlQc8hokoAlMRcESBh7siQlJBWKkijNaHuPrWBED9iYiDQ7Pv1D4Z4/DXyFo2JgeAghQEkEgAvT6IgNo/PIUmgd62oj80mqEIpINoXRkmg2j2UBDIWVXKLTSXEUIOF/xbV5aRQsJvvUOoqMqjZZ+c7FcX8ThYCtTbxHV0fkEGDA73D3Dpzi/6rWEYAdSn579PZ/t3IBJChkef0dLRlHXdkJ6TSmSnmiYPq1LQIiGHX9BvZYinJ7/+R6q1czUG0j9KSOTxDc6UhshZhMIQrS78mncwZtzErrNcYL6V2Zd0tJ6i7QFtAYPcvHv25W6J+/Y3BrRA/x6WGuGN5mpUjhyyfsGtrpKE95HoAAAAASUVORK5CYII='},
			{ id: 'upLeft',    label: 'UP LEFT',    icon: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6CAMAAAAk2e+/AAABS2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIi8+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgo8P3hwYWNrZXQgZW5kPSJyIj8+LUNEtwAAAARnQU1BAACxjwv8YQUAAAABc1JHQgCuzhzpAAABLFBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////9PVkEkAAAAY3RSTlMAAQ/6Uc0OEAvHTzL7TcudsMHvdwnfUwMcG8UGiIfTrIkg9QI+/ZTDe460km73LNovCo1vQUuR4Lwk45/OK+3UERTkekziZlSK8QQnoOsFaaXmLqOylvPZLYDRZTUWUpiTDfAuEmiSAAABUklEQVRYw+3WZ2+DMBAG4EtTygrQ7NHsJt1777333vv+/38o6gIMSo0dqf3AK1lIZ/mRjPEJgCBBgvxtQr8WqDKbCiWUG1AnYXU7C7UJqKQSR5oKQwqIPphsYW24nEPjJCYXilf9F+G+qeTmThTP5w8X8gK9NLqOGMGPhD8fdXtBkGihlmlsmF5aqK2xg9FmQe3/DupuEhTpoT41z/V1HVHfxWRRo/6ORBfyjILx9mRo+2MDlS3ggF5q4uP9qzmVNjfOA+EDdDLcWA8IW6FJEJPkCbFI3hCDZEFVPsmC7mQuyYJ0iUuyIAG4JDvEJTkgHskJcUgExC6RECmxQ4REDa24ILsU6wL/rfYHskmX9C87Pfi9aA5cUmnRx/kffDmncSCkat7X342KSzOIuesNR1WSl7GU8Xfbbs9Gyoo0TvRp6Tie8d2TOsyx51UMEiQIS94B13oTqqYgGGoAAAAASUVORK5CYII='},
			{ id: 'downRight', label: 'DOWN RIGHT', icon: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6CAMAAAAk2e+/AAABS2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIi8+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgo8P3hwYWNrZXQgZW5kPSJyIj8+LUNEtwAAAARnQU1BAACxjwv8YQUAAAABc1JHQgCuzhzpAAABXFBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////9jYfXuAAAAc3RSTlMAQ98Ox1j9gAtRNTqBPfgu9p/MTQ+G1Qfx7Y0VBYyJgjkGd3ysU+Zz1IQvMM20PgwBp8Mi4TSUiDvlPxylsaF2WfcjJh0S+wLzQLmY4l/ovX3ra1rPLAOSKa4RUEvgcZwbFHqPzodGbX7qPMvCtsEq1laguT+HEwAAAVlJREFUWMPt1sduwkAQgOGxDfFCIITe0nvvvZHee++992TeX4pJQIC9hPWaQ6T41x6skfY7WGPJAGZm/6qgZjIH4AMgOp2Lq32batTkdW/trPt9+qC70DVmSKS2BXF7A1fX9DDnN2FUSpe8y5hID3SZuJMmrcwmoSFm5vD0BDWSNTnCUmZoD1PZtJCDGfIgRUpBMjPkR4rEAwUtFIkHAkKRuCCaxAdRJE5IK/FCGumWF1JLEW5ILfFD2ST9UBaJA6JLPBCQ57xAJcp5NQbtSgBReJSsH8QI5No8ODo+u397ecL3T35IGhcRA4jig8E9qmjAX2OGnAV5ggrxr0ELOaByVmg6B1TGvEYyTvxcKUaMv/ii7xN/VAZYY2dfSHkkPOYY7Kpf7OmLzLfGPIFGd6izWrRUjdYt9Xfo+ULsLpgRKqGtGyadAEIUmnuhXSAwMAXD5j+omZlZRl+X30CWTm2dHwAAAABJRU5ErkJggg=='},
			{ id: 'downLeft',  label: 'DOWN LEFT',  icon: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6CAMAAAAk2e+/AAABS2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIi8+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgo8P3hwYWNrZXQgZW5kPSJyIj8+LUNEtwAAAARnQU1BAACxjwv8YQUAAAABc1JHQgCuzhzpAAABg1BMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8aT76cAAAAgHRSTlMAafwJfflezc+3WA7Z5Rk6PAvpBNE73kJT89QxZ48czNIv9A1DnI3qKQUaymjT4a7HdVuGf85LR20CVHr+tLBlA0GvYSTYZEnbAcazNPX4yB4GrAgnmL6Bcj4qIVKIe8kdVadIEe27B90bOG/3Er1rYJq1wibyh+4Q5CMzRllMXDo5euMAAAGfSURBVFjD7dblUwJBGAbw5aSlBJRGQERBkLC7u7u7u7veP90jDnaEcdhjP+k9X5h9Zu43O7PLe4eQECH/KGsIaUooOEcLK75LpehH628idSrE+nMANfyQ3MY2BRm0C6mM462tUwJAJtVyUB1WmsoSFZEk46D6TBcYS3UKPpCYawxD5VxHImVD/RHIxMQbGintkGQcppkcOkuutQPYfkDfmjck556ZTSydve2YY5UWk0Mww672VPh+XFqCU8tA+whtL+KOpa+bF3Rh8B4ymDNaSnSzG9IPIpsL34/HTPZfS58auMPYuYNMWcQXOsD3U9ZDOkZkkCvqwSIqUI2WfEDmgiQxRANiIp8GKtDLO6/Znw19oOdXhKoROtEUBr1F5Y9f4dt1XygqKgh6YqcHwMQkQBWICr1H6czTgrpoQde0IGnekJEWNEwLMv/GPDDB/M/fDioVeLYA5GqoYt+xNRY4toJkCiBUG7vTEVxJu2Z549RbqXQuba7uVDZWO66mgw6d7kYaEPvvCb+REIp/srGzLP4aa0n8zKFkKUSIkD+Qb9QrYMvxAbaBAAAAAElFTkSuQmCC'}
		];

		this.PRESETS_PRESETS = [
			{ id: 'recallPset', group: 'Recall Preset',           label: 'Recall ', speed: null },
			{ id: 'savePset',   group: 'Save Preset (very slow)', label: 'Save ',   speed: 1    },
			{ id: 'savePset',   group: 'Save Preset (slow)',      label: 'Save ',   speed: 6    },
			{ id: 'savePset',   group: 'Save Preset (medium)',    label: 'Save ',   speed: 12   },
			{ id: 'savePset',   group: 'Save Preset (fast)',      label: 'Save ',   speed: 18   },
			{ id: 'savePset',   group: 'Save Preset (very fast)', label: 'Save ',   speed: 24   }
			
		];

		this.PRESETS_STATES = [
			{ action: 'awbS',       feedback: 'auto_white_balance',     group: 'CCU Control',    label: 'AWB On',             actionValue: 'on',     fbValue: 'on'  },
			{ action: 'awbS',       feedback: 'auto_white_balance',     group: 'CCU Control',    label: 'AWB Off',            actionValue: 'off',    fbValue: 'off' },
			{ action: 'blcS',       feedback: 'backlight_compensation', group: 'CCU Control',    label: 'Backlight Comp On',  actionValue: 'on',     fbValue: 'on'  },
			{ action: 'blcS',       feedback: 'backlight_compensation', group: 'CCU Control',    label: 'Backlight Comp Off', actionValue: 'off',    fbValue: 'off' },
			{ action: 'aIrisS',     feedback: 'auto_iris',              group: 'CCU Control',    label: 'Auto Iris',          actionValue: 'on',     fbValue: 'on'  },
			{ action: 'aIrisS',     feedback: 'auto_iris',              group: 'CCU Control',    label: 'Manual Iris',        actionValue: 'off',    fbValue: 'off' },
			{ action: 'focusM',     feedback: 'auto_focus',             group: 'Lens',           label: 'Auto Focus',         actionValue: 'auto',   fbValue: 'on'  },
			{ action: 'focusM',     feedback: 'auto_focus',             group: 'Lens',           label: 'Manual Focus',       actionValue: 'manual', fbValue: 'off' },
			{ action: 'wdrS',       feedback: 'wide_dynamic_range',     group: 'CCU Control',    label: 'Wide Dyn Range On',  actionValue: 'on',     fbValue: 'on'  },
			{ action: 'wdrS',       feedback: 'wide_dynamic_range',     group: 'CCU Control',    label: 'Wide Dyn Range Off', actionValue: 'off',    fbValue: 'off' },
			{ action: 'setStandby', feedback: 'standby',                group: 'Camera Control', label: 'Standby On',         actionValue: 'on',     fbValue: 'on'  },
			{ action: 'setStandby', feedback: 'standby',                group: 'Camera Control', label: 'Standby Off',        actionValue: 'off',    fbValue: 'off' },
			{ action: 'setLed',     feedback: 'led',                    group: 'Camera Control', label: 'LED On',             actionValue: 'on',     fbValue: 'on'  },
			{ action: 'setLed',     feedback: 'led',                    group: 'Camera Control', label: 'LED Off',            actionValue: 'off',    fbValue: 'off' },
			{ action: 'setVidMute', feedback: 'mute',                   group: 'Camera Control', label: 'Video Mute On',      actionValue: 'on',     fbValue: 'on'  },
			{ action: 'setVidMute', feedback: 'mute',                   group: 'Camera Control', label: 'Video Mute Off',     actionValue: 'off',    fbValue: 'off' }
		];

		this.PRESETS_VALUES = [
			{ action: 'pSpeedU', release: null,     group: 'Pan/Tilt',    label: 'PAN\\nSPEED\\nUP\\n\\n$(vaddio:pan_speed)',       size: '7' },
			{ action: 'pSpeedD', release: null,     group: 'Pan/Tilt',    label: 'PAN\\nSPEED\\nDOWN\\n\\n$(vaddio:pan_speed)',     size: '7' },
			{ action: 'tSpeedU', release: null,     group: 'Pan/Tilt',    label: 'TILT\\nSPEED\\nUP\\n\\n$(vaddio:tilt_speed)',     size: '7' },
			{ action: 'tSpeedD', release: null,     group: 'Pan/Tilt',    label: 'TILT\\nSPEED\\nDOWN\\n\\n$(vaddio:tilt_speed)',   size: '7' },
			{ action: 'zoomI',   release: 'zoomS',  group: 'Lens',        label: 'ZOOM IN',                                         size: '18' },
			{ action: 'zoomO',   release: 'zoomS',  group: 'Lens',        label: 'ZOOM OUT',                                        size: '18' },
			{ action: 'zSpeedU', release: null,     group: 'Lens',        label: 'ZOOM\\nSPEED\\nUP\\n\\n$(vaddio:zoom_speed)',     size: '7' },
			{ action: 'zSpeedD', release: null,     group: 'Lens',        label: 'ZOOM\\nSPEED\\nDOWN\\n\\n$(vaddio:zoom_speed)',   size: '7' },
			{ action: 'focusN',  release: 'focusS', group: 'Lens',        label: 'FOCUS NEAR',                                      size: '18' },
			{ action: 'focusF',  release: 'focusS', group: 'Lens',        label: 'FOCUS FAR',                                       size: '18' },
			{ action: 'fSpeedU', release: null,     group: 'Lens',        label: 'FOCUS\\nSPEED\\nUP\\n\\n$(vaddio:focus_speed)',   size: '7' },
			{ action: 'fSpeedD', release: null,     group: 'Lens',        label: 'FOCUS\\nSPEED\\nDOWN\\n\\n$(vaddio:focus_speed)', size: '7' },
			{ action: 'gainU',   release: null,     group: 'CCU Control', label: 'GAIN\\nUP\\n\\n$(vaddio:gain)',                   size: '7' },
			{ action: 'gainD',   release: null,     group: 'CCU Control', label: 'GAIN\\nDOWN\\n\\n$(vaddio:gain)',                 size: '7' },
			{ action: 'rGainU',  release: null,     group: 'CCU Control', label: 'RED\\nGAIN\\nUP\\n\\n$(vaddio:red_gain)',         size: '7' },
			{ action: 'rGainD',  release: null,     group: 'CCU Control', label: 'RED\\nGAIN\\nDOWN\\n\\n$(vaddio:red_gain)',       size: '7' },
			{ action: 'bGainU',  release: null,     group: 'CCU Control', label: 'BLUE\\nGAIN\\nUP\\n\\n$(vaddio:blue_gain)',       size: '7' },
			{ action: 'bGainD',  release: null,     group: 'CCU Control', label: 'BLUE\\nGAIN\\nDOWN\\n\\n$(vaddio:blue_gain)',     size: '7' },
			{ action: 'irisU',   release: null,     group: 'CCU Control', label: 'IRIS\\nUP\\n\\n$(vaddio:iris)',                   size: '7' },
			{ action: 'irisD',   release: null,     group: 'CCU Control', label: 'IRIS\\nDOWN\\n\\n$(vaddio:iris)',                 size: '7' },
			{ action: 'detailU', release: null,     group: 'CCU Control', label: 'DETAIL\\nUP\\n\\n$(vaddio:detail)',               size: '7' },
			{ action: 'detailD', release: null,     group: 'CCU Control', label: 'DETAIL\\nDOWN\\n\\n$(vaddio:detail)',             size: '7' },
			{ action: 'chromaU', release: null,     group: 'CCU Control', label: 'CHROMA\\nUP\\n\\n$(vaddio:chroma)',               size: '7' },
			{ action: 'chromaD', release: null,     group: 'CCU Control', label: 'CHROMA\\nDOWN\\n\\n$(vaddio:chroma)',             size: '7' },
			{ action: 'gammaU',  release: null,     group: 'CCU Control', label: 'GAMMA\\nUP\\n\\n$(vaddio:gamma)',                 size: '7' },
			{ action: 'gammaD',  release: null,     group: 'CCU Control', label: 'GAMMA\\nDOWN\\n\\n$(vaddio:gamma)',               size: '7' }
		];

		this.CHOICES_AUTOMANUAL = [
			{ id: 'auto',   label: 'Auto'   },
			{ id: 'manual', label: 'Manual' }
		];

		this.CHOICES_CCUSCENES_R = [
			{ id: 'F1', label: 'Auto'            },
			{ id: 'F2', label: 'Incandescent Hi' },
			{ id: 'F3', label: 'Fluorescent Hi'  },
			{ id: 'F4', label: 'Outdoor'         },
			{ id: 'F5', label: 'Incandescent Lo' },
			{ id: 'F6', label: 'Fluorescent Lo'  },
			{ id: 'C1', label: 'Custom A'        },
			{ id: 'C2', label: 'Custom B'        },
			{ id: 'C3', label: 'Custom C'        }
		];

		this.CHOICES_CCUSCENES_S = [
			{ id: '1', label: 'Custom A' },
			{ id: '2', label: 'Custom B' },
			{ id: '3', label: 'Custom C' }
		];

		this.CHOICES_ONOFF = [
			{ id: 'on',  label: 'On'  },
			{ id: 'off', label: 'Off' }
			
		];

		this.CHOICES_ONOFFTOGGLE = [
			{ id: 'on',     label: 'On'     },
			{ id: 'off',    label: 'Off'    },
			{ id: 'toggle', label: 'Toggle' }
			
		];

		this.actions(); // export actions
	}

	/**
	 * Setup the actions.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @access public
	 * @since 1.0.0
	 */
	actions(system) {

		this.setActions(this.getActions());
	}

	/**
	 * Executes the provided action.
	 *
	 * @param {Object} action - the action to be executed
	 * @access public
	 * @since 1.0.0
	 */
	action(action) {
		var cmd;
		var opt = action.options;

		switch (action.action) {
			case 'left':
				cmd = 'camera pan left ' + this.panSpeed;
				this.sendCommand(cmd);
				break;
			case 'right':
				cmd = 'camera pan right ' + this.panSpeed;
				this.sendCommand(cmd);
				break;
			case 'up':
				cmd = 'camera tilt up ' + this.tiltSpeed;
				this.sendCommand(cmd);
				break;
			case 'down':
				cmd = 'camera tilt down ' + this.tiltSpeed;
				this.sendCommand(cmd);
				break;
			case 'upLeft':
				cmd = 'camera pan left ' + this.panSpeed;
				this.sendCommand(cmd);
				cmd = 'camera tilt up ' + this.tiltSpeed;
				this.sendCommand(cmd);
				break;
			case 'upRight':
				cmd = 'camera pan right ' + this.panSpeed;
				this.sendCommand(cmd);
				cmd = 'camera tilt up ' + this.tiltSpeed;
				this.sendCommand(cmd);
				break;
			case 'downLeft':
				cmd = 'camera pan left ' + this.panSpeed;
				this.sendCommand(cmd);
				cmd = 'camera tilt down ' + this.tiltSpeed;
				this.sendCommand(cmd);
				break;
			case 'downRight':
				cmd = 'camera pan right ' + this.panSpeed;
				this.sendCommand(cmd);
				cmd = 'camera tilt down ' + this.tiltSpeed;
				this.sendCommand(cmd);
				break;
			case 'stop':
				cmd = 'camera pan stop';
				this.sendCommand(cmd);
				cmd = 'camera tilt stop';
				this.sendCommand(cmd);
				break;
			case 'home':
				cmd = 'camera home';
				this.sendCommand(cmd);
				break;

			case 'pSpeedS':
				this.panSpeed = opt.speed;
				this.setVariable('pan_speed', this.panSpeed);
				this.checkFeedbacks('pt_speed');
				break;
			case 'pSpeedU':
				if (this.panSpeed < 24) {
					this.panSpeed++;
					this.setVariable('pan_speed', this.panSpeed);
					this.checkFeedbacks('pt_speed');
				}
				break;
			case 'pSpeedD':
				if (this.panSpeed > 1) {
					this.panSpeed--;
					this.setVariable('pan_speed', this.panSpeed);
					this.checkFeedbacks('pt_speed');
				}
				break;
			case 'tSpeedS':
				this.tiltSpeed = opt.speed;
				this.setVariable('tilt_speed', this.tiltSpeed);
				this.checkFeedbacks('pt_speed');
				break;
			case 'tSpeedU':
				if (this.tiltSpeed < 20) {
					this.tiltSpeed++;
					this.setVariable('tilt_speed', this.tiltSpeed);
					this.checkFeedbacks('pt_speed');
				}
				break;
			case 'tSpeedD':
				if (this.tiltSpeed > 1) {
					this.tiltSpeed--;
					this.setVariable('tilt_speed', this.tiltSpeed);
					this.checkFeedbacks('pt_speed');
				}
				break;

			case 'zoomO':
				cmd = 'camera zoom out ' + this.zoomSpeed;
				this.sendCommand(cmd);
				break;
			case 'zoomI':
				cmd = 'camera zoom in ' + this.zoomSpeed;
				this.sendCommand(cmd);
				break;
			case 'zoomS':
				cmd = 'camera zoom stop';
				this.sendCommand(cmd);
				break;
			case 'zSpeedS':
				this.zoomSpeed = opt.speed;
				this.setVariable('zoom_speed', this.zoomSpeed);
				break;
			case 'zSpeedU':
				if (this.zoomSpeed < 7) {
					this.zoomSpeed++;
					this.setVariable('zoom_speed', this.zoomSpeed);
				}
				break;
			case 'zSpeedD':
				if (this.zoomSpeed > 1) {
					this.zoomSpeed--;
					this.setVariable('zoom_speed', this.zoomSpeed);
				}
				break;

			case 'focusN':
				cmd = 'camera focus near ' + this.zoomSpeed;
				this.sendCommand(cmd);
				break;
			case 'focusF':
				cmd = 'camera focus far ' + this.zoomSpeed;
				this.sendCommand(cmd);
				break;
			case 'focusS':
				cmd = 'camera focus stop';
				this.sendCommand(cmd);
				break;
			case 'focusM':
				cmd = 'camera focus mode ' + opt.mode;
				this.sendCommand(cmd);
				break;
			case 'fSpeedS':
				this.focusSpeed = opt.speed;
				this.setVariable('focus_speed', this.focusSpeed);
				break;
			case 'fSpeedU':
				if (this.focusSpeed < 8) {
					this.focusSpeed++;
					this.setVariable('focus_speed', this.focusSpeed);
				}
				break;
			case 'fSpeedD':
				if (this.focusSpeed > 1) {
					this.focusSpeed--;
					this.setVariable('focus_speed', this.focusSpeed);
				}
				break;

			case 'gainS':
				cmd = 'camera ccu set gain ' + opt.value;
				this.sendCommand(cmd);
				cmd = 'camera ccu get gain';
				this.sendCommand(cmd);
				break;
			case 'gainU':
				if (this.state.gain < 11) {
					cmd = 'camera ccu set gain ' + (this.state.gain+1);
					this.sendCommand(cmd);
				}
				cmd = 'camera ccu get gain';
				this.sendCommand(cmd);
				break;
			case 'gainD':
				if (this.state.gain > 0) {
					cmd = 'camera ccu set gain ' + (this.state.gain-1);
					this.sendCommand(cmd);
				}
				cmd = 'camera ccu get gain';
				this.sendCommand(cmd);
				break;
			case 'awbS':
				cmd = 'camera ccu set auto_white_balance ' + opt.mode;
				this.sendCommand(cmd);
				cmd = 'camera ccu get auto_white_balance';
				this.sendCommand(cmd);
				break;
			case 'rGainS':
				cmd = 'camera ccu set red_gain ' + opt.value;
				this.sendCommand(cmd);
				cmd = 'camera ccu get red_gain';
				this.sendCommand(cmd);
				break;
			case 'rGainU':
				if (this.state.red_gain < 255) {
					cmd = 'camera ccu set red_gain ' + (this.state.red_gain+1);
					this.sendCommand(cmd);
				}
				cmd = 'camera ccu get red_gain';
				this.sendCommand(cmd);
				break;
			case 'rGainD':
				if (this.state.red_gain > 0) {
					cmd = 'camera ccu set red_gain ' + (this.state.red_gain-1);
					this.sendCommand(cmd);
				}
				cmd = 'camera ccu get red_gain';
				this.sendCommand(cmd);
				break;
			case 'bGainS':
				cmd = 'camera ccu set blue_gain ' + opt.value;
				this.sendCommand(cmd);
				cmd = 'camera ccu get blue_gain';
				this.sendCommand(cmd);
				break;
			case 'bGainU':
				if (this.state.blue_gain < 255) {
					cmd = 'camera ccu set blue_gain ' + (this.state.blue_gain+1);
					this.sendCommand(cmd);
				}
				cmd = 'camera ccu get blue_gain';
				this.sendCommand(cmd);
				break;
			case 'bGainD':
				if (this.state.blue_gain > 0) {
					cmd = 'camera ccu set blue_gain ' + (this.state.blue_gain-1);
					this.sendCommand(cmd);
				}
				cmd = 'camera ccu get blue_gain';
				this.sendCommand(cmd);
				break;
			case 'blcS':
				cmd = 'camera ccu set backlight_compensation ' + opt.mode;
				this.sendCommand(cmd);
				cmd = 'camera ccu get backlight_compensation';
				this.sendCommand(cmd);
				break;
			case 'aIrisS':
				cmd = 'camera ccu set auto_iris ' + opt.mode;
				this.sendCommand(cmd);
				cmd = 'camera ccu get auto_iris';
				this.sendCommand(cmd);
				break;
			case 'irisS':
				cmd = 'camera ccu set iris ' + opt.value;
				this.sendCommand(cmd);
				cmd = 'camera ccu get iris';
				this.sendCommand(cmd);
				break;
			case 'irisU':
				if (this.state.iris < 11) {
					cmd = 'camera ccu set iris ' + (this.state.iris+1);
					this.sendCommand(cmd);
				}
				cmd = 'camera ccu get iris';
				this.sendCommand(cmd);
				break;
			case 'irisD':
				if (this.state.iris > 0) {
					cmd = 'camera ccu set iris ' + (this.state.iris-1);
					this.sendCommand(cmd);
				}
				cmd = 'camera ccu get iris';
				this.sendCommand(cmd);
				break;
			case 'detailS':
				cmd = 'camera ccu set detail ' + opt.value;
				this.sendCommand(cmd);
				cmd = 'camera ccu get detail';
				this.sendCommand(cmd);
				break;
			case 'detailU':
				if (this.state.detail < 15) {
					cmd = 'camera ccu set detail ' + (this.state.detail+1);
					this.sendCommand(cmd);
				}
				cmd = 'camera ccu get detail';
				this.sendCommand(cmd);
				break;
			case 'detailD':
				if (this.state.detail > 0) {
					cmd = 'camera ccu set detail ' + (this.state.detail-1);
					this.sendCommand(cmd);
				}
				cmd = 'camera ccu get detail';
				this.sendCommand(cmd);
				break;
			case 'chromaS':
				cmd = 'camera ccu set chroma ' + opt.value;
				this.sendCommand(cmd);
				cmd = 'camera ccu get chroma';
				this.sendCommand(cmd);
				break;
			case 'chromaU':
				if (this.state.chroma < 14) {
					cmd = 'camera ccu set chroma ' + (this.state.chroma+1);
					this.sendCommand(cmd);
				}
				cmd = 'camera ccu get chroma';
				this.sendCommand(cmd);
				break;
			case 'chromaD':
				if (this.state.chroma > 0) {
					cmd = 'camera ccu set chroma ' + (this.state.chroma-1);
					this.sendCommand(cmd);
				}
				cmd = 'camera ccu get chroma';
				this.sendCommand(cmd);
				break;
			case 'gammaS':
				cmd = 'camera ccu set gamma ' + opt.value;
				this.sendCommand(cmd);
				cmd = 'camera ccu get gamma';
				this.sendCommand(cmd);
				break;
			case 'gammaU':
				if (this.state.gamma < 64) {
					cmd = 'camera ccu set gamma ' + (this.state.gamma+1);
					this.sendCommand(cmd);
				}
				cmd = 'camera ccu get gamma';
				this.sendCommand(cmd);
				break;
			case 'gammaD':
				if (this.state.gamma > -64) {
					cmd = 'camera ccu set gamma ' + (this.state.gamma-1);
					this.sendCommand(cmd);
				}
				cmd = 'camera ccu get gamma';
				this.sendCommand(cmd);
				break;
			case 'wdrS':
				cmd = 'camera ccu set wide_dynamic_range ' + opt.mode;
				this.sendCommand(cmd);
				cmd = 'camera ccu get wide_dynamic_range';
				this.sendCommand(cmd);
				break;

			case 'savePset':
				cmd = 'camera preset store ' + opt.val + ' ' + opt.speed + (opt.ccu === true ? ' save-ccu' : '');
				this.sendCommand(cmd);
				break;
			case 'recallPset':
				cmd = 'camera preset recall ' + opt.val;
				this.sendCommand(cmd);
				break;
			case 'saveCCU':
				cmd = 'camera ccu scene store custom ' + opt.preset;
				this.sendCommand(cmd);
				break;
			case 'recallCCU':
				cmd = 'camera ccu scene recall ' + (opt.preset.substring(0,1) == 'C' ? 'custom ' : 'factory ') + opt.preset.substring(1,2);
				this.sendCommand(cmd);
				cmd = 'camera ccu get all';
				this.sendCommand(cmd);
				break;
			case 'setLed':
				cmd = 'camera led ' + opt.mode;
				this.sendCommand(cmd);
				break;
			case 'setStandby':
				cmd = 'camera standby ' + opt.mode;
				this.sendCommand(cmd);
				break;
			case 'setVidMute':
				cmd = 'video mute ' + opt.mode;
				this.sendCommand(cmd);
				break;
		}
	}

	/**
	 * Creates the configuration fields for web config.
	 *
	 * @returns {Array} the config fields
	 * @access public
	 * @since 1.0.0
	 */
	config_fields() {

		return [
			{
				type: 'text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This module will connect to any Vaddio PTZ Camera via telnet.'
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Camera IP',
				width: 6,
				regex: this.REGEX_IP
			},
			{
				type: 'textinput',
				id: 'username',
				label: 'Username',
				width: 6,
				default: 'admin',
				regex: this.REGEX_SOMETHING
			},
			{
				type: 'textinput',
				id: 'password',
				label: 'Password',
				width: 6,
				default: 'password',
				regex: this.REGEX_SOMETHING
			},
			{
				type: 'checkbox',
				id: 'pollingOn',
				label: 'Enable Status Polling?',
				width: 2,
				default: true
			},
			{
				type: 'number',
				id: 'pollingInterval',
				label: 'Polling Interval (in s)',
				width: 4,
				min: 1,
				max: 999,
				default: 5,
				required: true
			}
		]
	}

	/**
	 * Clean up the instance before it is destroyed.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	destroy() {
		if (this.socket !== undefined) {
			this.socket.destroy();
		}

		if (this.pollTimer !== undefined) {
			clearInterval(this.pollTimer);
		}

		this.debug("destroy", this.id);
	}

	/**
	 * Main initialization function called once the module
	 * is OK to start doing things.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	init() {
		debug = this.debug;
		log = this.log;

		this.initVariables();
		this.initFeedbacks();
		this.initPresets();
		this.checkFeedbacks();

		this.initTCP();
	}

	/**
	 * INTERNAL: use setup data to initalize the tcp socket object.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initTCP() {
		var receivebuffer = '';

		if (this.socket !== undefined) {
			this.socket.destroy();
			delete this.socket;
		}

		if (this.pollTimer !== undefined) {
			clearInterval(this.pollTimer);
		}

		if (this.config.port === undefined) {
			this.config.port = 23;
		}

		if (this.config.host) {
			this.socket = new tcp(this.config.host, this.config.port);

			this.socket.on('status_change', (status, message) => {
				this.status(status, message);
			});

			this.socket.on('error', (err) => {
				this.debug("Network error", err);
				this.log('error',"Network error: " + err.message);
			});

			this.socket.on('connect', () => {
				this.debug("Connected");
			});

			this.socket.on('disconnect', () => {
				this.debug("Disconnected");
				this.loggedIn = false;
				this.okToSend = false;

				if (this.pollTimer !== undefined) {
					clearInterval(this.pollTimer);
				}
			});


			// separate buffered stream into lines with responses
			this.socket.on('data', (chunk) => {
				var i = 0, line = '', offset = 0;
				receivebuffer += chunk;

				// Process lines
				while ( (i = receivebuffer.indexOf('\n', offset)) !== -1) {
					line = receivebuffer.substr(offset, i - offset);
					offset = i + 1;
					this.socket.emit('receiveline', line.toString());
				}

				receivebuffer = receivebuffer.substr(offset);

				// Read current line
				if (receivebuffer.match(/[L|l]ogin:/)) {
					receivebuffer = '';
					this.socket.send(this.config.username + '\r\n');
				}
				else if (receivebuffer.match(/[P|p]assword:/)) {
					receivebuffer = '';
					this.socket.send(this.config.password + '\r\n');
				}
				else if (receivebuffer.match(/>/)) {
					this.loggedIn = true;

					if (this.deviceName == '') {
						receivebuffer = '';
						this.socket.send('version\r\n');
						this.catchUp = true;
						this.lastPoll = -1;
					}
					else if (this.catchUp == true) {
						let thisPoll = this.lastPoll + 1;

						if (thisPoll < this.POLL_COMMANDS.length) {
							this.socket.send(this.POLL_COMMANDS[thisPoll]+'\r\n');
							this.lastPoll = thisPoll;
						}
						else {
							this.catchUp = false;

							if (this.config.pollingOn === true) {
								this.pollTimer = setInterval(
									this.sendPollCommand.bind(this),
									(this.config.pollingInterval*1000)
								);
							}
						}
					}
					else {
						this.okToSend = true;
						this.sendCommand();
					}
				}
			});

			this.socket.on('receiveline', (line) => {

				if (this.loggedIn == false) {
					this.processLogin(line);
				}
				else {
					this.processCameraInformation(line);
				}
			});
		}
	}

	/**
	 * INTERNAL: initialize feedbacks.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initFeedbacks() {
		// feedbacks
		var feedbacks = this.getFeedbacks();

		this.setFeedbackDefinitions(feedbacks);
	}

	/**
	 * INTERNAL: Routes incoming data to the appropriate function for processing.
	 *
	 * @param {Object} data - the collected data
	 * @access protected
	 * @since 1.0.0
	 */
	processCameraInformation(data) {
		if (data.match(/System Version/)) {
			this.deviceName = data.substring(data.indexOf('Robo'));
			this.log('info', 'Connected to a ' + this.deviceName);
			this.sendCommand('camera ccu get all');
		}
		else if (data.startsWith('auto_focus')) {
			data = data.replace('auto_focus:','').trim();
			this.state.auto_focus = data;
			this.checkFeedbacks('auto_focus');
		}
		else if (data.startsWith('auto_iris')) {
			data = data.replace('auto_iris','').trim();
			this.state.auto_iris = data;
			this.checkFeedbacks('auto_iris');
		}
		else if (data.startsWith('auto_white_balance')) {
			data = data.replace('auto_white_balance','').trim();
			this.state.auto_white_balance = data;
			this.checkFeedbacks('auto_white_balance');
		}
		else if (data.startsWith('backlight_compensation')) {
			data = data.replace('backlight_compensation','').trim();
			this.state.backlight_compensation = data;
			this.checkFeedbacks('backlight_compensation');
		}
		else if (data.startsWith('blue_gain')) {
			data = data.replace('blue_gain','').trim();
			this.state.blue_gain = parseInt(data);
			this.setVariable('blue_gain', this.state.blue_gain);
		}
		else if (data.startsWith('chroma')) {
			data = data.replace('chroma','').trim();
			this.state.chroma = parseInt(data);
			this.setVariable('chroma', this.state.chroma);
		}
		else if (data.startsWith('detail')) {
			data = data.replace('detail','').trim();
			this.state.detail = parseInt(data);
			this.setVariable('detail', this.state.detail);
		}
		else if (data.startsWith('gain')) {
			data = data.replace('gain','').trim();
			this.state.gain = parseInt(data);
			this.setVariable('gain', this.state.gain);
		}
		else if (data.startsWith('gamma')) {
			data = data.replace('gamma','').trim();
			this.state.gamma = parseInt(data);
			this.setVariable('gamma', this.state.gamma);
		}
		else if (data.startsWith('iris')) {
			data = data.replace('iris','').trim();
			this.state.iris = parseInt(data);
			this.setVariable('iris', this.state.iris);
		}
		else if (data.startsWith('led')) {
			data = data.replace('led:','').trim();
			this.state.led = data;
			this.checkFeedbacks('led');
		}
		else if (data.startsWith('mute')) {
			data = data.replace('mute:','').trim();
			this.state.mute = data;
			this.checkFeedbacks('mute');
		}
		else if (data.startsWith('red_gain')) {
			data = data.replace('red_gain','').trim();
			this.state.red_gain = parseInt(data);
			this.setVariable('red_gain', this.state.red_gain);
		}
		else if (data.startsWith('standby')) {
			data = data.replace('standby:','').trim();
			this.state.standby = data;
			this.checkFeedbacks('standby');
		}
		else if (data.startsWith('wide_dynamic_range')) {
			data = data.replace('wide_dynamic_range','').trim();
			this.state.wide_dynamic_range = data;
			this.checkFeedbacks('wide_dynamic_range');
		}
	}

	/**
	 * INTERNAL: Processes data from telnet pre-login.
	 *
	 * @param {Object} data - the collected data
	 * @access protected
	 * @since 1.0.0
	 */
	processLogin(data) {
		if (data == ('Welcome ' + this.config.username)) {
			this.loggedIn = true;
		}
	}

	/**
	 * INTERNAL: Send a command to the camera
	 *
	 * @param {String} cmd - the command to send
	 * @access protected
	 * @since 1.0.0
	 */
	sendCommand(cmd = '') {
		if (this.okToSend === false && cmd != '') {
			this.nextCommand = cmd;
		}
		else if (this.okToSend === true && (cmd != '' || this.nextCommand != '')) {
			if (cmd == '') {
				cmd = this.nextCommand;
				this.nextCommand = '';
			}

			this.okToSend = false;
			this.socket.send(cmd + '\r\n');
		}
	}

	/**
	 * INTERNAL: Send a poll command to refresh status
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	sendPollCommand() {
		if (this.state.standby == 'off') {
			let thisPoll = this.lastPoll + 1;

			if (thisPoll >= this.POLL_COMMANDS.length) {
				thisPoll = 0;
			}

			this.sendCommand(this.POLL_COMMANDS[thisPoll]);
			this.lastPoll = thisPoll;
		}
		else {
			this.sendCommand('camera standby get');
		}
	}

	/**
	 * Process an updated configuration array.
	 *
	 * @param {Object} config - the new configuration
	 * @access public
	 * @since 1.0.0
	 */
	updateConfig(config) {
		var resetConnection = false;

		if (this.config.host != config.host) {
			resetConnection = true;
		}

		this.config = config;

		this.actions();
		this.initFeedbacks();
		this.initPresets();
		this.initVariables();

		if (resetConnection === true || this.socket === undefined) {
			this.initTCP();
		}
	}
}

exports = module.exports = instance;