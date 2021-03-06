var electron = require('electron')
var RPC = require('electron-rpc/server')
var app = electron.app
var BrowserWindow = electron.BrowserWindow;
var path = require('path')
var url = require('url')
var main = require('../app.js');
var system = main();
var fs = require("fs");
var path = require("path");
var window;
var exiting = false;
var AppTray = electron.Tray
var tray = null;

var skeleton_info = {
	appName: '',
	appBuild: '',
	appVersion: '',
	appURL: '',
	appStatus: '',
	configDir: app.getPath('appData'),
	startMinimised: '',
};

function packageinfo() {
	var self = this;
	var fileContents = fs.readFileSync(__dirname + '/../package.json');
	var object = JSON.parse(fileContents);
	return object;
};

/* Module should return true if this application should be single instance only */
system.emit('skeleton-single-instance-only', function (response) {
	if (response === true) {
		if (app.requestSingleInstanceLock) { // new api
			var lock = app.requestSingleInstanceLock();
			if (!lock) {
				exiting = true;

				if (window !== undefined) {
					window.close();
				}
				electron.dialog.showErrorBox('Multiple instances', 'Another instance is already running. Please close the other instance first.');
				app.quit();
				return;
			}
		} else { // old api
			var nolock = app.makeSingleInstance(function () {});
			if (nolock) {
				exiting = true;

				if (window !== undefined) {
					window.close();
				}
				electron.dialog.showErrorBox('Multiple instances', 'Another instance is already running. Please close the other instance first.');
				app.quit();
				return;
			}
		}
	}
});

function createWindow() {
	window = new BrowserWindow({
		show: false,
		width: 400,
		height: 470,
		minHeight: 600,
		minWidth: 440,
		maxHeight: 380,
		frame: false,
		resizable: false,
		icon: path.join(__dirname, 'assets/icon.png'),
		webPreferences: {
			pageVisibility: true,
			nodeIntegration: true
		}
	});

	window.loadURL(url.format({
		pathname: path.join(__dirname, 'window.html'),
		protocol: 'file:',
		slashes: true
	}));

	var rpc = new RPC();
	rpc.configure(window.webContents);

	rpc.on('info', function(req, cb) {
		cb(null, skeleton_info);
	});

	rpc.on('log', function(req, cb) {
		cb(null, "Started");
	});

	rpc.on('skeleton-close', function(req, cb) {
		system.emit('exit');
	});

	rpc.on('skeleton-minimize', function(req, cb) {
		window.hide();
	});

	rpc.on('skeleton-bind-ip', function(req, cb) {
		console.log("changed bind ip:",req.body)
		system.emit('skeleton-bind-ip', req.body);
	});

	rpc.on('skeleton-bind-port', function(req, cb) {
		console.log("changed bind port:",req.body)
		system.emit('skeleton-bind-port', req.body);
	});

	rpc.on('skeleton-start-minimised', function(req, cb) {
		console.log("changed start minimized:",req.body)
		system.emit('skeleton-start-minimised', req.body);
	});

	rpc.on('skeleton-ready', function(req, cb) {
		system.emit('skeleton-ready');
	});

	system.on('skeleton-ip-unavail', function() {
	});

	system.on('skeleton-info', function(key,val) {
		skeleton_info[key] = val;
		rpc.send('info', skeleton_info);
	});

	system.on('restart', function() {
		app.relaunch()
		app.exit()
	});

	system.on('skeleton-log', function(line) {
		rpc.send('log', line);
	});

	window.on('closed', function () {
		window = null
	});

	window.on('ready-to-show', function () {
		if (!skeleton_info.startMinimised) {
			showWindow();
		}
	});

	if (!exiting) {
		try {
			var build = fs.readFileSync(__dirname + "/../BUILD").toString().trim();
			var pkg = packageinfo();
			system.emit('skeleton-info', 'appVersion', pkg.version );
			system.emit('skeleton-info', 'appBuild', build.trim() );
			system.emit('skeleton-info', 'appName', pkg.description);
			system.emit('skeleton-info', 'appStatus', 'Starting');
			system.emit('skeleton-info', 'configDir', app.getPath('appData') );
		} catch (e) {
			console.log("Error reading BUILD and/or package info: ", e);
		}
	}
}

function createTray() {
	tray = new AppTray(
		process.platform == "darwin" ?
		path.join(__dirname, '..', 'assets', 'trayTemplate.png') :
		path.join(__dirname, '..', 'assets', 'icon.png')
	);
	tray.on('right-click', toggleWindow);
	tray.on('double-click', toggleWindow);
	tray.on('click', toggleWindow);
}

function toggleWindow() {
	if (window.isVisible()) {
		window.hide()
	} else {
		showWindow()
	}
}

function showWindow() {
	window.show()
	window.focus()
}

app.on('ready', function () {
	createTray();
	createWindow();

	electron.powerMonitor.on('suspend', () => {
		system.emit('skeleton-power', 'suspend');
	});

	electron.powerMonitor.on('resume', () => {
		system.emit('skeleton-power', 'resume');
	});

	electron.powerMonitor.on('on-ac', () => {
		system.emit('skeleton-power', 'ac');
	});

	electron.powerMonitor.on('on-battery', () => {
		system.emit('skeleton-power', 'battery');
	});

});

app.on('window-all-closed', function () {
	app.quit()
});

app.on('activate', function () {
	if (window === null) {
		createWindow();
	}
})
