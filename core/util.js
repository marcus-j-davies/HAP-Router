const FS = require('fs');
const PATH = require('path');
const READLINE = require('readline');
const CRYPTO = require('crypto');
const OS = require('os');
const ROOTPATH = PATH.join(OS.homedir(), 'HAPRouter');
const ROOTAPPPATH = PATH.join(__dirname, '../');
const CONFIGPATH = PATH.join(ROOTPATH, 'haprouter_config.json');
const HOMEKITPATH = PATH.join(ROOTPATH, 'HomeKitPersist');
const CACHEPATH = PATH.join(ROOTPATH, 'characteristic_cache.json');
const ROUTING = require('./routing');

const restoreBackup = function (Package) {
	try {
		allowSaveCharacteristicCache = false;

		reset();

		FS.writeFileSync(CONFIGPATH, JSON.stringify(Package.Config));

		if (Package.hasOwnProperty('CharacteristicCache')) {
			FS.writeFileSync(CACHEPATH, JSON.stringify(Package.CharacteristicCache));
		}

		FS.mkdirSync(HOMEKITPATH);

		Object.keys(Package.HKData).forEach((K) => {
			FS.writeFileSync(
				PATH.join(HOMEKITPATH, K),
				JSON.stringify(Package.HKData[K])
			);
		});
		return true;
	} catch (err) {
		return false;
	}
};

const performBackup = function () {
	const BUPackage = {};

	let S = FS.readFileSync(CONFIGPATH, 'utf8');
	BUPackage.Config = JSON.parse(S);

	if (FS.existsSync(CACHEPATH)) {
		S = FS.readFileSync(CACHEPATH, 'utf8');
		BUPackage.CharacteristicCache = JSON.parse(S);
	}

	BUPackage.HKData = {};
	FS.readdirSync(HOMEKITPATH).forEach((F) => {
		S = FS.readFileSync(PATH.join(HOMEKITPATH, F), 'utf8');
		BUPackage.HKData[F] = JSON.parse(S);
	});

	return BUPackage;
};

let allowSaveCharacteristicCache = true;
const saveCharacteristicCache = function (Cache) {
	if (allowSaveCharacteristicCache) {
		console.info('Saving current Characteristics...');

		try {
			FS.writeFileSync(CACHEPATH, JSON.stringify(Cache), 'utf8');
		} catch (err) {
			console.log('Could not right to the config file.');
		}
	}
};

const getCharacteristicCache = function () {
	if (FS.existsSync(CACHEPATH)) {
		const C = FS.readFileSync(CACHEPATH, 'utf8');
		return JSON.parse(C);
	}

	return undefined;
};

// new install check
const checkNewEV = function () {
	if (!FS.existsSync(CONFIGPATH)) {
		reset();
	}
};

const getRndInteger = function (min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
};

const genMAC = function () {
	const hexDigits = '0123456789ABCDEF';
	let macAddress = '';
	for (let i = 0; i < 6; i++) {
		macAddress += hexDigits.charAt(Math.round(Math.random() * 15));
		macAddress += hexDigits.charAt(Math.round(Math.random() * 15));
		if (i != 5) macAddress += ':';
	}
	return macAddress;
};

const makeID = function (length) {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
};

//  Route COnfig
const updateRouteConfig = function (Name, Route) {
	const CFF = FS.readFileSync(CONFIGPATH, 'utf8');
	const ConfigOBJ = JSON.parse(CFF);
	ConfigOBJ.routes[Name] = Route;
	saveConfig(ConfigOBJ);
};

//  delete Route
const deleteRoute = function (Name) {
	const CFF = FS.readFileSync(CONFIGPATH, 'utf8');
	const ConfigOBJ = JSON.parse(CFF);
	delete ConfigOBJ.routes[Name];
	saveConfig(ConfigOBJ);
};

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
	ConfigOBJ.routeInitDelay = Config.routeInitDelay;
	ConfigOBJ.MQTTOptions.username = Config.MQTTOptions.username;
	ConfigOBJ.MQTTOptions.password = Config.MQTTOptions.password;

	saveConfig(ConfigOBJ);
};

// removeExtraData
function RemoveExtraData(CFG) {
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
};

const updateAccessory = function (AccessoryConfig, ID) {
	deleteAccessory(ID);
	appendAccessoryToConfig(AccessoryConfig);
};

// Save new bridge
const saveBridgeConfig = function (Config) {
	const CFF = FS.readFileSync(CONFIGPATH, 'utf8');
	const ConfigOBJ = JSON.parse(CFF);
	ConfigOBJ.bridgeConfig = Config;
	saveConfig(ConfigOBJ);
};

// Global write CFG
const saveConfig = function (Config) {
	try {
		FS.writeFileSync(CONFIGPATH, JSON.stringify(Config), 'utf8');
	} catch (err) {
		console.log('Could not right to the config file.');
		process.exit(0);
	}
};

// check password reset request
const checkPassword = function () {
	if (process.argv.length > 3) {
		if (process.argv[2] === 'passwd') {
			const NUSR = process.argv[3];
			const NPWD = process.argv[4];
			const PW = CRYPTO.createHash('md5').update(NPWD).digest('hex');
			const CFF = FS.readFileSync(CONFIGPATH, 'utf8');
			const ConfigOBJ = JSON.parse(CFF);
			ConfigOBJ.loginUsername = NUSR;
			ConfigOBJ.loginPassword = PW;
			saveConfig(ConfigOBJ);
			console.log('Username and Password has been set.');
			console.log('');
			process.exit(0);
		}
	}
};

// check password reset request
const checkInstallRequest = function () {
	if (process.argv.length > 3) {
		if (process.argv[2] === 'installmodule') {
			const Module = process.argv[3];

			ROUTING.install(Module);
			console.log('Module [' + Module + '] has been installed.');
			console.log('');
			process.exit(0);
		}
	}
};

// Delete Accessory
const deleteAccessory = function (AccessoryID) {
	const CFF = FS.readFileSync(CONFIGPATH, 'utf8');
	const ConfigOBJ = JSON.parse(CFF);
	const NA = ConfigOBJ.accessories.filter(
		(a) => a.username.replace(/:/g, '') !== AccessoryID
	);
	ConfigOBJ.accessories = NA;
	saveConfig(ConfigOBJ);
};

// check reset request
const checkReset = function () {
	if (process.argv.length > 2) {
		if (process.argv[2] === 'reset') {
			const rl = READLINE.createInterface({
				input: process.stdin,
				output: process.stdout
			});

			console.log('');
			console.log('-- WARNING --');
			console.log('');
			console.log('HAP Router is about to be RESET!!.');

			console.log('This will.');
			console.log('');
			console.log(' - Delete ALL your Accessories.');
			console.log(' - Destroy the Bridge.');
			console.log(' - Delete all HomeKit cache data.');
			console.log(' - Delete all HAP Router Configuration.');
			console.log(' - Discard any Accessory identification.');
			console.log(' - Reset the login details for the UI & API.');
			console.log('');
			console.log(
				'Evan if you recreate Accessories, you will need to re-enroll HAP Router on your iOS device.'
			);
			console.log('');

			rl.question('Continue? (y/n) :: ', function (value) {
				if (value.toUpperCase() === 'Y') {
					console.log('');
					reset();
					console.log('HAP Router has been reset.');
					console.log('');
					process.exit(0);
				} else {
					process.exit(0);
				}
			});
			return true;
		} else {
			return false;
		}
	}
};

// The acrtual reset script
const reset = function () {
	FS.rmdirSync(ROOTPATH, { recursive: true });
	FS.mkdirSync(ROOTPATH, { recursive: true });

	const DefaultFile = PATH.join(ROOTAPPPATH, 'haprouter_config.json.default');
	const SaveTo = PATH.join(ROOTPATH, 'haprouter_config.json');

	FS.copyFileSync(DefaultFile, SaveTo);
};

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
	updateAccessory: updateAccessory,
	deleteRoute: deleteRoute,
	performBackup: performBackup,
	restoreBackup: restoreBackup
};
