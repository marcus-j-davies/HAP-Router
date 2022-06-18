const UTIL = require('./core/util');
UTIL.checkNewEV();
const CONFIG = require(UTIL.ConfigPath);
const { Server } = require('./core/server');
const ACCESSORY = require('./core/accessories/Types');
const IP = require('ip');
const MQTT = require('./core/mqtt');
const ROUTING = require('./core/routing');
const { HAPStorage } = require('hap-nodejs');

let Bridge; // Bridge
const Routes = {}; // Rouets
const Cache = UTIL.getCharacteristicCache(); // Load up cache (if available)
const Accesories = {}; // Accessories
let UIServer; // UI Server

// eslint-disable-next-line no-unused-vars
let MQTTC; // MQTT Client

process.on('SIGINT', exitHandler.bind(null));
process.on('SIGTERM', exitHandler.bind(null));

function saveCache(unpublish){

	const AccessoryIDs = Object.keys(Accesories);

	if(unpublish){
		for (let i = 0; i < AccessoryIDs.length; i++) {
			const Acc = Accesories[AccessoryIDs[i]];
			if (!Acc.isBridged) {
				Acc.unpublish(false);
			}
		}
	}
	
	const CharacteristicCache = {};

	for (let i = 0; i < AccessoryIDs.length; i++) {
		const Acc = Accesories[AccessoryIDs[i]];
		CharacteristicCache[AccessoryIDs[i]] = Acc.getProperties();
	}

	UTIL.saveCharacteristicCache(CharacteristicCache);
}

function exitHandler() {
	console.info('Unpublishing Accessories...');
	Bridge.unpublish(false);

     saveCache(true);

	console.info('Cleaning up Routes...');
	const RouteKeys = Object.keys(Routes);
	RouteKeys.forEach((AE) => {
		Routes[AE].close('appclose');
	});

	process.off('SIGINT', exitHandler.bind(null));
	process.off('SIGTERM', exitHandler.bind(null));
	process.exit(0);
}

// Init
function Init() {
	// Check Reset
	if (UTIL.checkReset()) {
		return;
	}

	// Set Module Path
	ROUTING.setPath(UTIL.RootPath);

	// CHeck Install module request
	if (UTIL.checkInstallRequest()) {
		return;
	}

	// check password chnage
	if (UTIL.checkPassword()) {
		return;
	}

	console.clear();

	// Load Route Modules
	ROUTING.loadModules();

	// Generate A bridge and demo accessory
	if (!CONFIG.bridgeConfig.hasOwnProperty('pincode')) {
		// Genertae a Bridge
		CONFIG.bridgeConfig.pincode = `${UTIL.getRndInteger(
			100,
			999
		)}-${UTIL.getRndInteger(10, 99)}-${UTIL.getRndInteger(100, 999)}`;
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
			model: 'HR 2 Switch',
			pincode: `${UTIL.getRndInteger(100, 999)}-${UTIL.getRndInteger(
				10,
				99
			)}-${UTIL.getRndInteger(100, 999)}`,
			username: UTIL.genMAC(),
			setupID: UTIL.makeID(4),
			serialNumber: UTIL.makeID(12),
			bridged: true
		};
		CONFIG.accessories.push(DemoAccessory);
		UTIL.appendAccessoryToConfig(DemoAccessory);
	}

	console.log('Configuring HomeKit Bridge');
	HAPStorage.setCustomStoragePath(UTIL.HomeKitPath);

	// Configure Our Bridge
	Bridge = new ACCESSORY.Bridge(CONFIG.bridgeConfig);

	// Route Setup
	setTimeout(setupRoutes, CONFIG.routeInitDelay * 1000);

	// Configure Our Accessories
	for (let i = 0; i < CONFIG.accessories.length; i++) {
		const AccessoryOBJ = CONFIG.accessories[i];
		initAccessory(AccessoryOBJ);
	}

	if (CONFIG.bridgeEnabled) {
		// Publish Bridge
		console.log('Publishing Bridge');
		Bridge.publish();
	}

	console.log('Starting Client Services');

	// Web Server (started later)
	UIServer = new Server(Accesories, Bridge, setupRoutes, initAccessory);

	// MQTT Client (+ Start Server)
	MQTTC = new MQTT.MQTT(Accesories, MQTTDone);
}

function setupRoutes() {
	const Keys = Object.keys(Routes);

	for (let i = 0; i < Keys.length; i++) {
		Routes[Keys[i]].close('reconfigure');
		delete Routes[Keys[i]];
	}

	const RouteNames = Object.keys(CONFIG.routes);

	for (let i = 0; i < RouteNames.length; i++) {
		const RouteCFG = CONFIG.routes[RouteNames[i]];
		RouteCFG.readyStatus = 'Module is initializing...';
		RouteCFG.readyRGB = 'orange';
		RouteCFG.clientID = (RouteCFG.type + '' + RouteNames[i])
			.replace(/ /g, '')
			.replace(/\./g, '')
			.replace(/\//g, '')
			.replace(/@/g, '');
		console.log(`Configuring Route : ${RouteNames[i]} (${RouteCFG.type})`);
		const RouteClass = new ROUTING.Routes[RouteCFG.type].Class(RouteCFG, (PL) =>
			ModuleUpdate(PL, RouteCFG)
		);
		ModuleUpdate(undefined, RouteCFG);
		Routes[RouteNames[i]] = RouteClass;
	}
}

function ModuleUpdate(PL, CFG) {
	if (PL === undefined) {
		CFG.readyStatus = 'Module is initializing...';
		CFG.readyRGB = 'orange';
	} else {
		if (PL.success) {
			CFG.readyStatus = 'Module is ready.';
			CFG.readyRGB = 'limegreen';
		} else {
			CFG.readyStatus = `Module Error: ${PL.message}`;
			CFG.readyRGB = 'tomato';
		}
	}

	setTimeout(() => {
		UIServer.SendRouteStatus({
			id: CFG.clientID,
			status: CFG.readyStatus,
			RGB: CFG.readyRGB
		});
	}, 100);
}

// Main Accessory Initializer
function initAccessory(Config) {
	console.log(`Configuring Accessory : ${Config.name} (${Config.type})`);

	const TypeMetadata = ACCESSORY.Types[Config.type];
	Config.accessoryID = Config.username.replace(/:/g, '');
	const Acc = new TypeMetadata.Class(Config);

	if (Cache !== undefined) {
		if (Cache.hasOwnProperty(Config.accessoryID)) {
			console.log('Restoring Characteristics...');
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
		console.log(` Pin Code: ${Config.pincode}`);
		console.log(' Publishing Accessory (Unbridged)');
		Acc.publish();
	} else {
		Bridge.addAccessory(Acc.getAccessory());
	}

	return Acc.getAccessory().setupURI();
}

function MQTTDone() {
	UIServer.Start(UIServerDone);
}

// Server Started
function UIServerDone() {
	// All done.

	let IPAddress = IP.address();
	if (CONFIG.webInterfaceAddress !== 'ALL') {
		IPAddress = CONFIG.webInterfaceAddress;
	}

	console.log(
		`Goto http://${IPAddress}:${CONFIG.webInterfacePort}/ to start managing your installation.`
	);
	console.log(' ');
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

Init();

setTimeout(()=> saveCache(false),60000);
