'use strict'

const UTIL = require('./core/util');
UTIL.checkNewEV();

const FS = require('fs');
const CHALK = require('chalk');
const { Server } = require('./core/server');
const ACCESSORY = require('./core/accessories/Types');
const CONFIG = require(UTIL.ConfigPath);
const IP = require("ip");
const MQTT = require('./core/mqtt');
const PATH = require('path');
const NODECLEANUP = require('node-cleanup');
const ROUTING = require('./core/routing');
const { HAPStorage } = require("hap-nodejs");

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

    return new Promise((resolve, reject) => {
        console.info(' Unpublishing Accessories...');
        Bridge.unpublish(false);

        const AccessoryIDs = Object.keys(Accesories);
        for (let i = 0; i < AccessoryIDs.length; i++) {
            const Acc = Accesories[AccessoryIDs[i]];
            if (!Acc.isBridged) {
                Acc.unpublish(false);
            }
        }

        console.info(' Saving current Characteristics...');
        const CharacteristicCache = {};

        for (let i = 0; i < AccessoryIDs.length; i++) {
            const Acc = Accesories[AccessoryIDs[i]];
            CharacteristicCache[AccessoryIDs[i]] = Acc.getProperties();
        }

        UTIL.saveCharacteristicCache(CharacteristicCache);

        console.info(' Cleaning up Routes...');
        let RouteKeys = Object.keys(Routes);
        RouteKeys.forEach((AE) => {
            Routes[AE].close('appclose');
        })

        resolve();
    });
}

// Check if we are being asked for a Reset.
if (UTIL.checkReset()) {
    return; // stop (whilst we check they know what they are doing.)
}

// Check password reset
if (UTIL.checkPassword()) {
    return; // stop
}

// Set routing module path
ROUTING.setPath(UTIL.RootPath)


// Check install module
if (UTIL.checkInstallRequest()) {
    return; // stop
}

// Banner 
console.log(CHALK.keyword('orange')("  _    _            _____   _____                _              "))
console.log(CHALK.keyword('orange')(" | |  | |    /\\    |  __ \\ |  __ \\              | |             "))
console.log(CHALK.keyword('orange')(" | |__| |   /  \\   | |__) || |__) | ___   _   _ | |_  ___  _ __ "))
console.log(CHALK.keyword('orange')(" |  __  |  / /\\ \\  |  ___/ |  _  / / _ \\ | | | || __|/ _ \\| '__|"))
console.log(CHALK.keyword('orange')(" | |  | | / ____ \\ | |     | | \\ \\| (_) || |_| || |_|  __/| |   "))
console.log(CHALK.keyword('orange')(" |_|  |_|/_/    \\_\\|_|     |_|  \\_\\\\___/  \\__,_| \\__|\\___||_|   "))
console.log(" ")
console.log(CHALK.keyword('white')(" ------- For the Smart Home Enthusiast, for the curios. -------"))
console.log(" ")

// Load Route Modules
ROUTING.loadModules();

if (!CONFIG.bridgeConfig.hasOwnProperty("pincode")) {

    // Genertae a Bridge
    CONFIG.bridgeConfig.pincode = UTIL.getRndInteger(100, 999) + "-" + UTIL.getRndInteger(10, 99) + "-" + UTIL.getRndInteger(100, 999);
    CONFIG.bridgeConfig.username = UTIL.genMAC();
    CONFIG.bridgeConfig.setupID = UTIL.makeID(4);
    CONFIG.bridgeConfig.serialNumber = UTIL.makeID(12)
    UTIL.saveBridgeConfig(CONFIG.bridgeConfig)

    // Create a demo accessory for new configs (accessories will heronin be created via the ui)
    const DemoAccessory = {
        "type": "SWITCH",
        "name": "Switch Accessory Demo",
        "route": "Output To Console",
        "manufacturer": "Marcus Davies",
        "model": "HR 1 Switch",
        "pincode": UTIL.getRndInteger(100, 999) + "-" + UTIL.getRndInteger(10, 99) + "-" + UTIL.getRndInteger(100, 999),
        "username": UTIL.genMAC(),
        "setupID": UTIL.makeID(4),
        "serialNumber": UTIL.makeID(12),
        "bridged": true
    }
    CONFIG.accessories.push(DemoAccessory)
    UTIL.appendAccessoryToConfig(DemoAccessory)
}

console.log(" Configuring HomeKit Bridge")

HAPStorage.setCustomStoragePath(UTIL.HomeKitPath);

// Configure Our Bridge
const Bridge = new ACCESSORY.Bridge(CONFIG.bridgeConfig)
Bridge.on('PAIR_CHANGE', Paired)
Bridge.on('LISTENING', getsetupURI)

// Routes
const Routes = {}

function setupRoutes() {

    const Keys = Object.keys(Routes);

    for (let i = 0; i < Keys.length; i++) {
        Routes[Keys[i]].close('reconfigure')
        delete Routes[Keys[i]];
    }

    const RouteNames = Object.keys(CONFIG.routes);

    for (let i = 0; i < RouteNames.length; i++) {

        let RouteCFG = CONFIG.routes[RouteNames[i]]
        console.log(" Configuring Route : " + RouteNames[i] + " (" + RouteCFG.type + ")")

        let RouteClass = new ROUTING.Routes[RouteCFG.type].Class(RouteCFG);

        Routes[RouteNames[i]] = RouteClass;

    }
}

// This is also called externally (i.e when updating routes via the UI)
setupRoutes();

// Load up cache (if available)
var Cache = UTIL.getCharacteristicCache();

// Main Accessory Initializer
function initAccessory(Config){

    console.log(" Configuring Accessory : " + Config.name + " (" + Config.type + ")")

    let TypeMetadata = ACCESSORY.Types[Config.type];
    Config.accessoryID = Config.username.replace(/:/g, "");
    let Acc = new TypeMetadata.Class(Config);

    if (Cache !== undefined) {
        if (Cache.hasOwnProperty(Config.accessoryID)) {
            console.log(" Restoring Characteristics...")
            Acc.setCharacteristics(Cache[Config.accessoryID]);
        }
    }

    Acc.on('STATE_CHANGE', (PL, O) => Change(PL, Config, O))
    Acc.on('IDENTIFY', (P) => Identify(P, Config))

    Accesories[Config.accessoryID] = Acc;

    if (!Config.bridged) {

        Acc.on('PAIR_CHANGE', (P) => Pair(P, Config))
        console.log("       Pin Code  " + Config.pincode)
        console.log("       Publishing Accessory (Unbridged)")
        Acc.publish();

    } else {

        Bridge.addAccessory(Acc.getAccessory())
    }

    return Acc.getAccessory().setupURI();
}

// Configure Our Accessories 
const Accesories = {}
for (let i = 0; i < CONFIG.accessories.length; i++) {

    let AccessoryOBJ = CONFIG.accessories[i]
    initAccessory(AccessoryOBJ);

}

// Publish Bridge
console.log(" Publishing Bridge")
Bridge.publish();

console.log(" Starting Client Services")

// Web Server (started later)
const UIServer = new Server(Accesories, Bridge, setupRoutes, initAccessory);

// MQTT Client (+ Start Server)
let MQTTC = new MQTT.MQTT(Accesories, MQTTDone)

function MQTTDone() {
    UIServer.Start(UIServerDone)
}

// Server Started
function UIServerDone() {
    const BridgeFileName = PATH.join(UTIL.HomeKitPath, "AccessoryInfo." + CONFIG.bridgeConfig.username.replace(/:/g, "") + ".json");
    if (FS.existsSync(BridgeFileName)) {
        const IsPaired = Object.keys(require(BridgeFileName).pairedClients)
        UIServer.setBridgePaired(IsPaired.length > 0);
    } else {
        UIServer.setBridgePaired(false);
    }

    // All done.

    var IPAddress = IP.address();
    if (CONFIG.webInterfaceAddress !== 'ALL') {
        IPAddress = CONFIG.webInterfaceAddress
    }

    const Address = CHALK.keyword('red')("http://" + IPAddress + ":" + CONFIG.webInterfacePort + "/ui/login")
    console.log(" " + CHALK.black.bgWhite("┌─────────────────────────────────────────────────────────────────────────────┐"))
    console.log(" " + CHALK.black.bgWhite("|    Goto " + Address + " to start managing your installation. |"))
    console.log(" " + CHALK.black.bgWhite("|    Default username and password is admin                                   |"))
    console.log(" " + CHALK.black.bgWhite("└─────────────────────────────────────────────────────────────────────────────┘"))
}

// Called when bridge is listenting and online
function getsetupURI(port) {
    CONFIG.bridgeConfig.QRData = Bridge.getAccessory().setupURI();
}

// Bridge Pair Change
function Paired(IsPaired) {
    UIServer.setBridgePaired(IsPaired);
}

// Device Change
function Change(PL, Object, Originator) {
    if (Object.hasOwnProperty("route") && Object.route.length > 0) {
        const Payload = {
            "accessory": Object,
            "type": "change",
            "change": PL,
            "source": Originator
        }

        if (Routes.hasOwnProperty(Object.route)) {
            const R = Routes[Object.route];
            R.process(Payload);
        }

    }
}

// Device Pair
function Pair(paired, Object) {
    if (Object.hasOwnProperty("route") && Object.route.length > 0) {
        const Payload = {
            "accessory": Object,
            "type": "pair",
            "isPaired": paired,
        }

        if (Routes.hasOwnProperty(Object.route)) {
            const R = Routes[Object.route];
            R.process(Payload);
        }
    }
}

// Device Identify
function Identify(paired, Object) {
    if (Object.hasOwnProperty("route") && Object.route.length > 0) {
        const Payload = {
            "accessory": Object,
            "type": "identify",
            "isPaired": paired,
        }

        if (Routes.hasOwnProperty(Object.route)) {
            const R = Routes[Object.route];
            R.process(Payload);
        }
    }
}