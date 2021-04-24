'use strict'

const FS = require('fs');
const PATH = require('path');
const READLINE = require("readline");
const CHALK = require('chalk');
const CRYPTO = require('crypto')
const OS = require('os');
const ROOTPATH = PATH.join(OS.homedir(), "HAPRouter");
const ROOTAPPPATH = PATH.join(__dirname, "../")
const CONFIGPATH = PATH.join(ROOTPATH, "haprouter_config.json");
const HOMEKITPATH = PATH.join(ROOTPATH, "HomeKitPersist");
const PKG = require('../package.json');
const CACHEPATH = PATH.join(ROOTPATH, "characteristic_cache.json");
const ROUTING = require("./routing");

const saveCharacteristicCache = function (Cache) {

    try {
        FS.writeFileSync(CACHEPATH, JSON.stringify(Cache), 'utf8')
    }
    catch (err) {
        console.log(" Could not right to the config file.");
    }

}

const getCharacteristicCache = function () {

    if (FS.existsSync(CACHEPATH)) {
        const C = FS.readFileSync(CACHEPATH, 'utf8');
        return JSON.parse(C);
    }

    return undefined;
}



// new install check
const checkNewEV = function () {

    if (!FS.existsSync(CONFIGPATH)) {
        reset();
    }
}

const getRndInteger = function (min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

const genMAC = function () {
    var hexDigits = "0123456789ABCDEF";
    var macAddress = "";
    for (var i = 0; i < 6; i++) {
        macAddress += hexDigits.charAt(Math.round(Math.random() * 15));
        macAddress += hexDigits.charAt(Math.round(Math.random() * 15));
        if (i != 5) macAddress += ":";
    }
    return macAddress;
}

const makeID = function (length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// Flash Route COnfig
const updateRouteConfig = function (Name,Route) {

    const CFF = FS.readFileSync(CONFIGPATH, 'utf8');
    const ConfigOBJ = JSON.parse(CFF);
    ConfigOBJ.routes[Name] = Route
    saveConfig(ConfigOBJ);
}

// Adjust options
const updateOptions = function (Config) {

    const CFF = FS.readFileSync(CONFIGPATH, 'utf8');

    const ConfigOBJ = JSON.parse(CFF);

    ConfigOBJ.enableIncomingMQTT = Config.enableIncomingMQTT;
    ConfigOBJ.MQTTBroker = Config.MQTTBroker;
    ConfigOBJ.MQTTTopic = Config.MQTTTopic;
    ConfigOBJ.advertiser = Config.advertiser;
    ConfigOBJ.interface = Config.interface;
    ConfigOBJ.webInterfaceAddress = Config.webInterfaceAddress;
    ConfigOBJ.webInterfacePort = Config.webInterfacePort;
    ConfigOBJ.MQTTOptions.username = Config.MQTTOptions.username
    ConfigOBJ.MQTTOptions.password = Config.MQTTOptions.password
   

    saveConfig(ConfigOBJ);
}

  // removeExtraData
  function RemoveExtraData(CFG){

    delete CFG.accessoryID;
    delete CFG.typeDisplay;
    delete CFG.isPaired;
    delete CFG.SetupURI;
}

// Add Accessory
const appendAccessoryToConfig = function (Accessory) {

    RemoveExtraData(Accessory);

    const CFF = FS.readFileSync(CONFIGPATH, 'utf8');
    const ConfigOBJ = JSON.parse(CFF);
    ConfigOBJ.accessories.push(Accessory);
    saveConfig(ConfigOBJ);
}

const updateAccessory = function(AccessoryConfig, ID){

        deleteAccessory(ID);
        appendAccessoryToConfig(AccessoryConfig);
}

// Save new bridge
const saveBridgeConfig = function (Config) {
    const CFF = FS.readFileSync(CONFIGPATH, 'utf8');
    const ConfigOBJ = JSON.parse(CFF);
    ConfigOBJ.bridgeConfig = Config;
    saveConfig(ConfigOBJ);
}

// Global write CFG
const saveConfig = function (Config) {

    try {
        FS.writeFileSync(CONFIGPATH, JSON.stringify(Config), 'utf8')
    }
    catch (err) {
        console.log(" Could not right to the config file.");
        process.exit(0);
    }

}

// check password reset request
const checkPassword = function () {

    if (process.argv.length > 3) {

        if (process.argv[2] === "passwd") {

            const NUSR = process.argv[3];
            const NPWD = process.argv[4];
            const PW = CRYPTO.createHash('md5').update(NPWD).digest("hex");
            const CFF = FS.readFileSync(CONFIGPATH, 'utf8');
            const ConfigOBJ = JSON.parse(CFF);
            ConfigOBJ.loginUsername = NUSR;
            ConfigOBJ.loginPassword = PW;
            saveConfig(ConfigOBJ);
            console.log(CHALK.keyword('yellow')(" Username and Password has been set."))
            console.log('')
            process.exit(0);
        }
    }
}

// check password reset request
const checkInstallRequest = function () {

    if (process.argv.length > 3) {

        if (process.argv[2] === "installmodule") {
            const Module = process.argv[3];

            ROUTING.install(Module)
            console.log(CHALK.keyword('green')(" Module [" + Module + "] has been installed."))
            console.log('')
            process.exit(0);

        }
    }
}

// Delete Accessory
const deleteAccessory = function (AccessoryID) {

    const CFF = FS.readFileSync(CONFIGPATH, 'utf8');
    const ConfigOBJ = JSON.parse(CFF);
    const NA = ConfigOBJ.accessories.filter(a => a.username.replace(/:/g, "") !== AccessoryID)
    ConfigOBJ.accessories = NA;
    saveConfig(ConfigOBJ);
}

// check reset request
const checkReset = function () {

    if (process.argv.length > 2) {

        if (process.argv[2] === "reset") {

            const rl = READLINE.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            console.log(CHALK.keyword('yellow')(" -- WARNING --"))
            console.log('')
            console.log(CHALK.keyword('yellow')(" HAP Router is about to be RESET!!."))
            console.log(CHALK.keyword('yellow')(" This will."))
            console.log('')
            console.log(CHALK.keyword('yellow')(" - Delete all your Accessories (Including any CCTV Cameras)."))
            console.log(CHALK.keyword('yellow')(" - Destroy the Bridge hosting those Accessories."))
            console.log(CHALK.keyword('yellow')(" - Delete all HomeKit cache data."))
            console.log(CHALK.keyword('yellow')(" - Delete all HAP Router Configuration."))
            console.log(CHALK.keyword('yellow')(" - Discard any Accessory identification."))
            console.log(CHALK.keyword('yellow')(" - Reset the login details for the UI."))
            console.log('')
            console.log(CHALK.keyword('yellow')(" Evan if you recreate Accessories, you will need to re-enroll HAP Router on your iOS device."))
            console.log('')

            rl.question(" Continue? (y/n) :: ", function (value) {
                if (value.toUpperCase() === 'Y') {
                    console.log('')
                    reset();
                    console.log(' HAP Router has been reset.');
                    console.log('')
                    process.exit(0);
                } else {
                    process.exit(0);
                }
            });
            return true
        } else {
            return false;
        }
    }
}

// The acrtual reset script
const reset = function () {

    FS.rmdirSync(ROOTPATH, { recursive: true })
    FS.mkdirSync(ROOTPATH, { recursive: true })

    let DefaultFile = PATH.join(ROOTAPPPATH, "haprouter_config.json.default")
    let SaveTo = PATH.join(ROOTPATH, "haprouter_config.json");

    FS.copyFileSync(DefaultFile, SaveTo)


}

module.exports = {
    getRndInteger: getRndInteger,
    genMAC: genMAC,
    makeID: makeID,
    saveConfig: saveConfig,
    appendAccessoryToConfig: appendAccessoryToConfig,
    checkReset: checkReset,
    saveBridgeConfig: saveBridgeConfig,
    updateRouteConfig: updateRouteConfig,
    checkPassword: checkPassword,
    deleteAccessory: deleteAccessory,
    updateOptions: updateOptions,
    ConfigPath: CONFIGPATH,
    HomeKitPath: HOMEKITPATH,
    RootPath: ROOTPATH,
    RootAppPath: ROOTAPPPATH,
    checkNewEV: checkNewEV,
    saveCharacteristicCache: saveCharacteristicCache,
    getCharacteristicCache: getCharacteristicCache,
    checkInstallRequest: checkInstallRequest,
    updateAccessory:updateAccessory

}