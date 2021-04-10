var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); 			// export actions
	self.init_presets();	// init presets

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;
	self.init_presets();

	self.config = config;

	self.actions();
}

instance.prototype.init = function() {
	var self = this;

	self.init_presets();
	self.status(self.STATE_OK);

	debug = self.debug;
	log = self.log;
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
			value: 'For this module to work, please in "media player classic" go to "View" -> "Options" -> "Player" -> "Web Interface" and toggle the checkbox: "Listen On Port:" = True'
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 6,
			default: '127.0.0.1',
			regex: self.REGEX_IP
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'Target Port',
			width: 2,
			default: 13579,
			regex: self.REGEX_PORT
		}
	]
}

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;
	debug("destroy");
}

instance.prototype.CHOICES_COMMANDS = [

	{ id: '800', label: 'Open File' },
	{ id: '801', label: 'Open DVD' },
	{ id: '802', label: 'Open Device' },
	{ id: '804', label: 'Close' },
	{ id: '805', label: 'Save As'	},
	{ id: '806', label: 'Save Image' },
	{ id: '807', label: 'Save Image (auto)'	},
	{ id: '808', label: 'Save thumbnails'	},
	{ id: '809', label: 'Load Subtitle' },
	{ id: '810', label: 'Save Subtitle' },
	{ id: '814', label: 'Properties' },
	{ id: '816', label: 'Exit' },
	{ id: '817', label: 'Toggle Caption&Menu' },
	{ id: '818', label: 'Toggle Seeker' },
	{ id: '819', label: 'Toggle Controls' },
	{ id: '820', label: 'Toggle Information' },
	{ id: '821', label: 'Toggle Statistics' },
	{ id: '822', label: 'Toggle Status' },
	{ id: '823', label: 'Toggle Subresync Bar' },
	{ id: '824', label: 'Toggle Playlist Bar' },
	{ id: '825', label: 'Toggle Capture Bar' },
	{ id: '826', label: 'Toggle Shader Editor Bar' },
	{ id: '827', label: 'View Minimal' },
	{ id: '828', label: 'View Compact' },
	{ id: '829', label: 'View Normal' },
	{ id: '830', label: 'Fullscreen' },
	{ id: '831', label: 'Fullscreen (w/o res.change)' },
	{ id: '832', label: 'Zoom 50%' },
	{ id: '833', label: 'Zoom 100%' },
	{ id: '834', label: 'Zoom 200`%' },
	{ id: '835', label: 'VidFrm Half' },
	{ id: '836', label: 'VidFrm Normal' },
	{ id: '837', label: 'VidFrm Double' },
	{ id: '838', label: 'VidFrm Stretch' },
	{ id: '839', label: 'VidFrm Inside' },
	{ id: '840', label: 'VidFrm Outside' },
	{ id: '860', label: 'Next AR Preset' },
	{ id: '861', label: 'PnS Reset' },
	{ id: '862', label: 'PnS Inc Size' },
	{ id: '863', label: 'PnS Dec Size' },
	{ id: '864', label: 'PnS Inc Width' },
	{ id: '865', label: 'PnS Dec Width' },
	{ id: '866', label: 'PnS Inc Height' },
	{ id: '867', label: 'PnS Dec Height' },
	{ id: '868', label: 'PnS Left' },
	{ id: '869', label: 'PnS Right' },
	{ id: '870', label: 'PnS Up' },
	{ id: '871', label: 'PnS Down' },
	{ id: '872', label: 'PnS Up/Left' },
	{ id: '873', label: 'PnS Up/Right' },
	{ id: '874', label: 'PnS Down/Left' },
	{ id: '875', label: 'PnS Down/Right' },
	{ id: '876', label: 'PnS Center' },
	{ id: '877', label: 'PnS Rotate X+' },
	{ id: '878', label: 'PnS Rotate X-' },
	{ id: '879', label: 'PnS Rotate Y+' },
	{ id: '880', label: 'PnS Rotate Y-' },
	{ id: '881', label: 'PnS Rotate Z+' },
	{ id: '882', label: 'PnS Rotate Z-' },
	{ id: '884', label: 'Always On Top' },
	{ id: '886', label: 'Options' },
	{ id: '887', label: 'Play' },
	{ id: '888', label: 'Pause' },
	{ id: '889', label: 'Play/Pause' },
	{ id: '890', label: 'Stop' },
	{ id: '891', label: 'Framestep' },
	{ id: '892', label: 'Framestep back' },
	{ id: '893', label: 'Go To' },
	{ id: '894', label: 'Decrease Rate' },
	{ id: '895', label: 'Increase Rate' },
	{ id: '896', label: 'Reset Rate' },
	{ id: '897', label: 'Jump Backward (keyframe)' },
	{ id: '898', label: 'Jump Forward (keyframe)' },
	{ id: '899', label: 'Jump Backward (small)' },
	{ id: '900', label: 'Jump Forward (small)' },
	{ id: '901', label: 'Jump Backward (medium)' },
	{ id: '902', label: 'Jump Forward (medium)' },
	{ id: '903', label: 'Jump Backward (large)' },
	{ id: '904', label: 'Jump Forward (large)' },
	{ id: '905', label: 'Audio Delay +10ms' },
	{ id: '906', label: 'Audio Delay -10ms' },
	{ id: '907', label: 'Volume Up' },
	{ id: '908', label: 'Volume Down' },
	{ id: '909', label: 'Volume Mute' },
	{ id: '918', label: 'Previous Playlist Item' },
	{ id: '919', label: 'Next Playlist Item' },
	{ id: '920', label: 'Previous' },
	{ id: '921', label: 'Next' },
	{ id: '922', label: 'DVD Title Menu' },
	{ id: '923', label: 'DVD Root Menu' },
	{ id: '924', label: 'DVD Subtitle Menu' },
	{ id: '925', label: 'DVD Audio Menu' },
	{ id: '926', label: 'DVD Angle Menu' },
	{ id: '927', label: 'DVD Chapter Menu' },
	{ id: '928', label: 'DVD Menu Left' },
	{ id: '929', label: 'DVD Menu Right' },
	{ id: '930', label: 'DVD Menu Up' },
	{ id: '931', label: 'DVD Menu Down' },
	{ id: '932', label: 'DVD Menu Activate' },
	{ id: '933', label: 'DVD Menu Back' },
	{ id: '934', label: 'DVD Menu Leave' },
	{ id: '943', label: 'Boss key' },
	{ id: '948', label: 'Player Menu (short)' },
	{ id: '949', label: 'Player Menu (long)' },
	{ id: '950', label: 'Filters Menu' },
	{ id: '951', label: 'Next Audio' },
	{ id: '952', label: 'Prev Audio' },
	{ id: '953', label: 'Next Subtitle' },
	{ id: '954', label: 'Prev Subtitle' },
	{ id: '955', label: 'On/Off Subtitle' },
	{ id: '956', label: 'Next Audio (OGM)' },
	{ id: '957', label: 'Prev Audio (OGM)' },
	{ id: '958', label: 'Next Subtitle (OGM)' },
	{ id: '959', label: 'Prev Subtitle (OGM)' },
	{ id: '960', label: 'Next Angle (DVD)' },
	{ id: '961', label: 'Prev Angle (DVD)' },
	{ id: '962', label: 'Next Audio (DVD)' },
	{ id: '963', label: 'Prev Audio (DVD)' },
	{ id: '964', label: 'Next Subtitle (DVD)' },
	{ id: '965', label: 'Prev Subtitle (DVD)' },
	{ id: '966', label: 'On/Off Subtitle (DVD)' },
	{ id: '967', label: 'Zoom Auto Fit' },
	{ id: '969', label: 'Volume boost increase' },
	{ id: '970', label: 'Volume boost decrease' },
	{ id: '971', label: 'Volume boost Min' },
	{ id: '972', label: 'Volume boost Max' },
	{ id: '2302', label: 'Reload Subtitles' },
	{ id: '24000', label: 'Subtitle Delay -' },
	{ id: '24001', label: 'Subtitle Delay +' },
	{ id: '32769', label: 'Tearing Test' },
	{ id: '32770', label: 'Toggle Pixel Shader' },
	{ id: '32778', label: 'Remaining Time' },
	{ id: '32779', label: 'Toggle Direct3D fullscreen' },
	{ id: '32780', label: 'Goto Prev Subtitle' },
	{ id: '32781', label: 'Goto Next Subtitle' },
	{ id: '32782', label: 'Shift Subtitle Left' },
	{ id: '32783', label: 'Shift Subtitle Right' },
	{ id: '32784', label: 'Display Stats' }

];

instance.prototype.init_presets = function () {
	var self = this;
	var presets = [];
	var pstSize = (this.config.presets == 1 ? 'auto' : '14')

	for (var input in self.CHOICES_COMMANDS) {
		presets.push({
			category: 'Commands',
			label: self.CHOICES_COMMANDS[input].label,
			bank: {
				style: 'text',
				text: self.CHOICES_COMMANDS[input].label,
				size: pstSize,
				color: '16777215',
				bgcolor: 0
			},
			actions: [{	
				action: self.CHOICES_COMMANDS[input].id, 
			}]
		});
	}
	
	self.setPresetDefinitions(presets);
}

instance.prototype.actions = function(system) {
	var self = this;

	self.system.emit('instance_actions', self.id, {

		'800': { label: 'Open File' },
		'801': { label: 'Open DVD' },
		'802': { label: 'Open Device' },
		'804': { label: 'Close' },
		'805': { label: 'Save As'	},
		'806': { label: 'Save Image' },
		'807': { label: 'Save Image (auto)'	},
		'808': { label: 'Save thumbnails'	},
		'809': { label: 'Load Subtitle' },
		'810': { label: 'Save Subtitle' },
		'814': { label: 'Properties' },
		'816': { label: 'Exit' },
		'817': { label: 'Toggle Caption&Menu' },
		'818': { label: 'Toggle Seeker' },
		'819': { label: 'Toggle Controls' },
		'820': { label: 'Toggle Information' },
		'821': { label: 'Toggle Statistics' },
		'822': { label: 'Toggle Status' },
		'823': { label: 'Toggle Subresync Bar' },
		'824': { label: 'Toggle Playlist Bar' },
		'825': { label: 'Toggle Capture Bar' },
		'826': { label: 'Toggle Shader Editor Bar' },
		'827': { label: 'View Minimal' },
		'828': { label: 'View Compact' },
		'829': { label: 'View Normal' },
		'830': { label: 'Fullscreen' },
		'831': { label: 'Fullscreen (w/o res.change)' },
		'832': { label: 'Zoom 50%' }, 
		'833': { label: 'Zoom 100%' },
		'834': { label: 'Zoom 200`%' },
		'835': { label: 'VidFrm Half' },
		'836': { label: 'VidFrm Normal' },
		'837': { label: 'VidFrm Double' },
		'838': { label: 'VidFrm Stretch' },
		'839': { label: 'VidFrm Inside' },
		'840': { label: 'VidFrm Outside' },
		'860': { label: 'Next AR Preset' },
		'861': { label: 'PnS Reset' },
		'862': { label: 'PnS Inc Size' },
		'863': { label: 'PnS Dec Size' },
		'864': { label: 'PnS Inc Width' },
		'865': { label: 'PnS Dec Width' },
		'866': { label: 'PnS Inc Height' },
		'867': { label: 'PnS Dec Height' },
		'868': { label: 'PnS Left' },
		'869': { label: 'PnS Right' },
		'870': { label: 'PnS Up' },
		'871': { label: 'PnS Down' },
		'872': { label: 'PnS Up/Left' },
		'873': { label: 'PnS Up/Right' },
		'874': { label: 'PnS Down/Left' },
		'875': { label: 'PnS Down/Right' },
		'876': { label: 'PnS Center' },
		'877': { label: 'PnS Rotate X+' },
		'878': { label: 'PnS Rotate X-' },
		'879': { label: 'PnS Rotate Y+' },
		'880': { label: 'PnS Rotate Y-' },
		'881': { label: 'PnS Rotate Z+' },
		'882': { label: 'PnS Rotate Z-' },
		'884': { label: 'Always On Top' },
		'886': { label: 'Options' },
		'887': { label: 'Play' },
		'888': { label: 'Pause' },
		'889': { label: 'Play/Pause' },
		'890': { label: 'Stop' },
		'891': { label: 'Framestep' },
		'892': { label: 'Framestep back' },
		'893': { label: 'Go To' },
		'894': { label: 'Decrease Rate' },
		'895': { label: 'Increase Rate' },
		'896': { label: 'Reset Rate' },
		'897': { label: 'Jump Backward (keyframe)' },
		'898': { label: 'Jump Forward (keyframe)' },
		'899': { label: 'Jump Backward (small)' },
		'900': { label: 'Jump Forward (small)' },
		'901': { label: 'Jump Backward (medium)' },
		'902': { label: 'Jump Forward (medium)' },
		'903': { label: 'Jump Backward (large)' },
		'904': { label: 'Jump Forward (large)' },
		'905': { label: 'Audio Delay +10ms' },
		'906': { label: 'Audio Delay -10ms' },
		'907': { label: 'Volume Up' },
		'908': { label: 'Volume Down' },
		'909': { label: 'Volume Mute' },
		'918': { label: 'Previous Playlist Item' },
		'919': { label: 'Next Playlist Item' },
		'920': { label: 'Previous' },
		'921': { label: 'Next' },
		'922': { label: 'DVD Title Menu' },
		'923': { label: 'DVD Root Menu' },
		'924': { label: 'DVD Subtitle Menu' },
		'925': { label: 'DVD Audio Menu' },
		'926': { label: 'DVD Angle Menu' },
		'927': { label: 'DVD Chapter Menu' },
		'928': { label: 'DVD Menu Left' },
		'929': { label: 'DVD Menu Right' },
		'930': { label: 'DVD Menu Up' },
		'931': { label: 'DVD Menu Down' },
		'932': { label: 'DVD Menu Activate' },
		'933': { label: 'DVD Menu Back' },
		'934': { label: 'DVD Menu Leave' },
		'943': { label: 'Boss key' },
		'948': { label: 'Player Menu (short)' },
		'949': { label: 'Player Menu (long)' },
		'950': { label: 'Filters Menu' },
		'951': { label: 'Next Audio' },
		'952': { label: 'Prev Audio' },
		'953': { label: 'Next Subtitle' },
		'954': { label: 'Prev Subtitle' },
		'955': { label: 'On/Off Subtitle' },
		'956': { label: 'Next Audio (OGM)' },
		'957': { label: 'Prev Audio (OGM)' },
		'958': { label: 'Next Subtitle (OGM)' },
		'959': { label: 'Prev Subtitle (OGM)' },
		'960': { label: 'Next Angle (DVD)' },
		'961': { label: 'Prev Angle (DVD)' },
		'962': { label: 'Next Audio (DVD)' },
		'963': { label: 'Prev Audio (DVD)' },
		'964': { label: 'Next Subtitle (DVD)' },
		'965': { label: 'Prev Subtitle (DVD)' },
		'966': { label: 'On/Off Subtitle (DVD)' },
		'967': { label: 'Zoom Auto Fit' },
		'969': { label: 'Volume boost increase' },
		'970': { label: 'Volume boost decrease' },
		'971': { label: 'Volume boost Min' },
		'972': { label: 'Volume boost Max' },
		'2302': { label: 'Reload Subtitles' },
		'24000': { label: 'Subtitle Delay -' },
		'24001': { label: 'Subtitle Delay +' },
		'32769': { label: 'Tearing Test' },
		'32770': { label: 'Toggle Pixel Shader' },
		'32778': { label: 'Remaining Time' },
		'32779': { label: 'Toggle Direct3D fullscreen' },
		'32780': { label: 'Goto Prev Subtitle' },
		'32781': { label: 'Goto Next Subtitle' },
		'32782': { label: 'Shift Subtitle Left' },
		'32783': { label: 'Shift Subtitle Right' },
		'32784': { label: 'Display Stats' }

	});
}

instance.prototype.action = function(action) {
	var self = this;
	var cmd;

	cmd = 'http://' + self.config.host + ':' + self.config.port + '/command.html?wm_command=' + action.action;

	self.system.emit('rest_get', cmd, function (err, result) {
		if (err !== null) {
			self.log('error', 'HTTP GET Request failed (' + result.error.code + ')');
			self.status(self.STATUS_ERROR, result.error.code);
		}
		else {
			self.status(self.STATUS_OK);
		}
	});
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;