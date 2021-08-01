'use strict';

const UTIL = require('./core/util');
UTIL.checkNewEV();

const CHALK = require('chalk');
const { Server } = require('./core/server');
const ACCESSORY = require('./core/accessories/Types');
const CONFIG = require(UTIL.ConfigPath);
const IP = require('ip');
const MQTT = require('./core/mqtt');
const NODECLEANUP = require('node-cleanup');
const ROUTING = require('./core/routing');
const { HAPStorage } = require('hap-nodejs');

// resgister process exit handler
NODECLEANUP(clean);

// Cleanup our mess
function clean(exitCode, signal) {
	cleanEV().then(() => {
		process.kill(process.pid, signal);
	});

	NODECLEANUP.uninstall();
	return false;
}

function cleanEV() {
	return new Promise((resolve) => {
		console.info(' Unpublishing Accessories...');
		Bridge.unpublish(false);

		const AccessoryIDs = Object.keys(Accesories);
		for (let i = 0; i < AccessoryIDs.length; i++) {
			const Acc = Accesories[AccessoryIDs[i]];
			if (!Acc.isBridged) {
				Acc.unpublish(false);
			}
		}

		const CharacteristicCache = {};

		for (let i = 0; i < AccessoryIDs.length; i++) {
			const Acc = Accesories[AccessoryIDs[i]];
			CharacteristicCache[AccessoryIDs[i]] = Acc.getProperties();
		}

		UTIL.saveCharacteristicCache(CharacteristicCache);

		console.info(' Cleaning up Routes...');
		const RouteKeys = Object.keys(Routes);
		RouteKeys.forEach((AE) => {
			Routes[AE].close('appclose');
		});

		resolve();
	});
}

// Check if we are being asked for a Reset.
if (UTIL.checkReset()) {
	process.exit(); // stop (whilst we check they know what they are doing.)
}

// Check password reset
if (UTIL.checkPassword()) {
	process.exit();
}

// Set routing module path
ROUTING.setPath(UTIL.RootPath);

// Check install module
if (UTIL.checkInstallRequest()) {
	process.exit();
}

// Banner
console.log(
	CHALK.keyword('orange')(
		'  _    _            _____   _____                _              '
	)
);
console.log(
	CHALK.keyword('orange')(
		' | |  | |    /\\    |  __ \\ |  __ \\              | |             '
	)
);
console.log(
	CHALK.keyword('orange')(
		' | |__| |   /  \\   | |__) || |__) | ___   _   _ | |_  ___  _ __ '
	)
);
console.log(
	CHALK.keyword('orange')(
		" |  __  |  / /\\ \\  |  ___/ |  _  / / _ \\ | | | || __|/ _ \\| '__|"
	)
);
console.log(
	CHALK.keyword('orange')(
		' | |  | | / ____ \\ | |     | | \\ \\| (_) || |_| || |_|  __/| |   '
	)
);
console.log(
	CHALK.keyword('orange')(
		' |_|  |_|/_/    \\_\\|_|     |_|  \\_\\\\___/  \\__,_| \\__|\\___||_|   '
	)
);
console.log(' ');
console.log(
	CHALK.keyword('white')(
		' ------- For the Smart Home Enthusiast, for the curios. -------'
	)
);
console.log(' ');

// Load Route Modules
ROUTING.loadModules();

if (!CONFIG.bridgeConfig.hasOwnProperty('pincode')) {
	// Genertae a Bridge
	CONFIG.bridgeConfig.pincode =
		UTIL.getRndInteger(100, 999) +
		'-' +
		UTIL.getRndInteger(10, 99) +
		'-' +
		UTIL.getRndInteger(100, 999);
	CONFIG.bridgeConfig.username = UTIL.genMAC();
	CONFIG.bridgeConfig.setupID = UTIL.makeID(4);
	CONFIG.bridgeConfig.serialNumber = UTIL.makeID(12);
	UTIL.saveBridgeConfig(CONFIG.bridgeConfig);

	// Create a demo accessory for new configs (accessories will heronin be created via the ui)
	const DemoAccessory = {
		type: 'SWITCH',
		name: 'Switch Accessory Demo',
		route: 'Output To Console',
		manufacturer: 'Marcus Davies',
		model: 'HR 1 Switch',
		pincode:
			UTIL.getRndInteger(100, 999) +
			'-' +
			UTIL.getRndInteger(10, 99) +
			'-' +
			UTIL.getRndInteger(100, 999),
		username: UTIL.genMAC(),
		setupID: UTIL.makeID(4),
		serialNumber: UTIL.makeID(12),
		bridged: true
	};
	CONFIG.accessories.push(DemoAccessory);
	UTIL.appendAccessoryToConfig(DemoAccessory);
}

console.log(' Configuring HomeKit Bridge');

HAPStorage.setCustomStoragePath(UTIL.HomeKitPath);

// Configure Our Bridge
const Bridge = new ACCESSORY.Bridge(CONFIG.bridgeConfig);

// Routes
const Routes = {};

function setupRoutes() {
	const Keys = Object.keys(Routes);

	for (let i = 0; i < Keys.length; i++) {
		Routes[Keys[i]].close('reconfigure');
		delete Routes[Keys[i]];
	}

	const RouteNames = Object.keys(CONFIG.routes);

	for (let i = 0; i < RouteNames.length; i++) {
		const RouteCFG = CONFIG.routes[RouteNames[i]];
		RouteCFG.readyStatus =
			'<span style="color:orange">Module is initializing...</span>';
		console.log(
			' Configuring Route : ' + RouteNames[i] + ' (' + RouteCFG.type + ')'
		);

		const RouteClass = new ROUTING.Routes[RouteCFG.type].Class(
			RouteCFG,
			(success, message) => {
				if (success === undefined) {
					RouteCFG.readyStatus =
						'<span style="color:orange">Module is initializing...</span>';
				} else if (success) {
					RouteCFG.readyStatus =
						'<span style="color:greenyellow">Module Successfully Initialized.</span>';
				} else {
					RouteCFG.readyStatus =
						'<span style="color:tomato">Module Error: ' + message + '</span>';
				}
			}
		);
		Routes[RouteNames[i]] = RouteClass;
	}
}

setTimeout(setupRoutes, CONFIG.routeInitDelay * 1000);

// Load up cache (if available)
var Cache = UTIL.getCharacteristicCache();

// Main Accessory Initializer
function initAccessory(Config) {
	console.log(
		' Configuring Accessory : ' + Config.name + ' (' + Config.type + ')'
	);

	const TypeMetadata = ACCESSORY.Types[Config.type];
	Config.accessoryID = Config.username.replace(/:/g, '');
	const Acc = new TypeMetadata.Class(Config);

	if (Cache !== undefined) {
		if (Cache.hasOwnProperty(Config.accessoryID)) {
			console.log(' Restoring Characteristics...');
			Acc.setCharacteristics(Cache[Config.accessoryID]);
		}
	}

	Acc.on('STATE_CHANGE', (Payload, Originator) =>
		Change(Payload, Config, Originator)
	);
	Acc.on('IDENTIFY', (Paired) => Identify(Paired, Config));

	Accesories[Config.accessoryID] = Acc;

	if (!Config.bridged) {
		Acc.on('PAIR_CHANGE', (Paired) => Pair(Paired, Config));
		console.log('       Pin Code  ' + Config.pincode);
		console.log('       Publishing Accessory (Unbridged)');
		Acc.publish();
	} else {
		Bridge.addAccessory(Acc.getAccessory());
	}

	return Acc.getAccessory().setupURI();
}

// Configure Our Accessories
const Accesories = {};
for (let i = 0; i < CONFIG.accessories.length; i++) {
	const AccessoryOBJ = CONFIG.accessories[i];
	initAccessory(AccessoryOBJ);
}

if (CONFIG.bridgeEnabled) {
	// Publish Bridge
	console.log(' Publishing Bridge');
	Bridge.publish();
}

console.log(' Starting Client Services');

// Web Server (started later)
const UIServer = new Server(Accesories, Bridge, setupRoutes, initAccessory);

// MQTT Client (+ Start Server)
// eslint-disable-next-line no-unused-vars
const MQTTC = new MQTT.MQTT(Accesories, MQTTDone);

function MQTTDone() {
	UIServer.Start(UIServerDone);
}

// Server Started
function UIServerDone() {
	// All done.

	var IPAddress = IP.address();
	if (CONFIG.webInterfaceAddress !== 'ALL') {
		IPAddress = CONFIG.webInterfaceAddress;
	}

	const Address = CHALK.keyword('red')(
		'http://' + IPAddress + ':' + CONFIG.webInterfacePort + '/ui/login'
	);
	console.log(
		' ' +
			CHALK.black.bgWhite(
				'┌─────────────────────────────────────────────────────────────────────────────┐'
			)
	);
	console.log(
		' ' +
			CHALK.black.bgWhite(
				'|    Goto ' + Address + ' to start managing your installation. |'
			)
	);
	console.log(
		' ' +
			CHALK.black.bgWhite(
				'|    Default username and password is admin                                   |'
			)
	);
	console.log(
		' ' +
			CHALK.black.bgWhite(
				'└─────────────────────────────────────────────────────────────────────────────┘'
			)
	);
}

// Device Change
function Change(ChangePayload, AccessoryCFG, Originator) {
	if (AccessoryCFG.hasOwnProperty('route') && AccessoryCFG.route.length > 0) {
		const Payload = {
			accessory: {
				AccessoryID: AccessoryCFG.username.replace(/:/g, ''),
				AccessoryType: ACCESSORY.Types[AccessoryCFG.type].Label,
				AccessoryName: AccessoryCFG.name,
				AccessorySerialNumber: AccessoryCFG.serialNumber,
				Manufacturer: AccessoryCFG.manufacturer,
				Model: AccessoryCFG.model,
				Bridged: AccessoryCFG.bridged
			},
			route: {
				Name: AccessoryCFG.route,
				Type: ROUTING.Routes[CONFIG.routes[AccessoryCFG.route].type].Name
			},
			eventType: 'characteristicUpdate',
			eventSource: Originator,
			eventData: ChangePayload
		};

		if (Routes.hasOwnProperty(AccessoryCFG.route)) {
			const R = Routes[AccessoryCFG.route];
			R.process(Payload);
		}
	}
}

// Device Pair
function Pair(paired, AccessoryCFG) {
	if (AccessoryCFG.hasOwnProperty('route') && AccessoryCFG.route.length > 0) {
		const Payload = {
			accessory: {
				AccessoryID: AccessoryCFG.username.replace(/:/g, ''),
				AccessoryType: ACCESSORY.Types[AccessoryCFG.type].Label,
				AccessoryName: AccessoryCFG.name,
				AccessorySerialNumber: AccessoryCFG.serialNumber,
				Manufacturer: AccessoryCFG.manufacturer,
				Model: AccessoryCFG.model,
				Bridged: AccessoryCFG.bridged
			},
			route: {
				Name: AccessoryCFG.route,
				Type: ROUTING.Routes[CONFIG.routes[AccessoryCFG.route].type].Name
			},
			eventType: 'pairStatusUpdate',
			eventData: paired
		};

		if (Routes.hasOwnProperty(AccessoryCFG.route)) {
			const R = Routes[AccessoryCFG.route];
			R.process(Payload);
		}
	}
}

// Device Identify
function Identify(paired, AccessoryCFG) {
	if (AccessoryCFG.hasOwnProperty('route') && AccessoryCFG.route.length > 0) {
		const Payload = {
			accessory: {
				AccessoryID: AccessoryCFG.username.replace(/:/g, ''),
				AccessoryType: ACCESSORY.Types[AccessoryCFG.type].Label,
				AccessoryName: AccessoryCFG.name,
				AccessorySerialNumber: AccessoryCFG.serialNumber,
				Manufacturer: AccessoryCFG.manufacturer,
				Model: AccessoryCFG.model,
				Bridged: AccessoryCFG.bridged
			},
			route: {
				Name: AccessoryCFG.route,
				Type: ROUTING.Routes[CONFIG.routes[AccessoryCFG.route].type].Name
			},
			eventType: 'identifyAccessory',
			eventData: paired
		};

		if (Routes.hasOwnProperty(AccessoryCFG.route)) {
			const R = Routes[AccessoryCFG.route];
			R.process(Payload);
		}
	}
}
