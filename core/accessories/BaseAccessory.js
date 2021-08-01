'use strict';

const {
	Service,
	Accessory,
	Characteristic,
	uuid,
	CharacteristicEventTypes,
	AccessoryEventTypes,
	Categories,
	Bridge
} = require('hap-nodejs');
const { EventEmitter } = require('events');
const { version } = require('../../package.json');
const { ConfigPath } = require('../util');
const CONFIG = require(ConfigPath);

class BaseAccessory extends EventEmitter {
	constructor(AccessoryOBJ, Category) {
		super();

		this._Config = AccessoryOBJ;
		this._Properties = {};
		this._isBridge = Category === Categories.BRIDGE;

		this.isBridged = AccessoryOBJ.bridged;
		this.Type = AccessoryOBJ.type;

		this._Properties = {};

		const UUID = uuid.generate(
			'hap-nodejs:accessories:' +
				AccessoryOBJ.name +
				':' +
				AccessoryOBJ.username
		);

		if (this._isBridge) {
			this._accessory = new Bridge(AccessoryOBJ.name, UUID);
		} else {
			this._accessory = new Accessory(AccessoryOBJ.name, UUID);
		}

		this._accessory
			.getService(Service.AccessoryInformation)
			.setCharacteristic(Characteristic.Name, AccessoryOBJ.name)
			.setCharacteristic(Characteristic.SerialNumber, AccessoryOBJ.serialNumber)
			.setCharacteristic(Characteristic.FirmwareRevision, version);

		if (AccessoryOBJ.model !== undefined && AccessoryOBJ.model.length > 0) {
			this._accessory
				.getService(Service.AccessoryInformation)
				.setCharacteristic(Characteristic.Model, AccessoryOBJ.model);
		}
		if (
			AccessoryOBJ.manufacturer !== undefined &&
			AccessoryOBJ.manufacturer.length > 0
		) {
			this._accessory
				.getService(Service.AccessoryInformation)
				.setCharacteristic(
					Characteristic.Manufacturer,
					AccessoryOBJ.manufacturer
				);
		}

		this._accessory.username = AccessoryOBJ.username;
		this._accessory.pincode = AccessoryOBJ.pincode;
		this._accessory.category = Category;
		this._accessory.setupID = AccessoryOBJ.setupID;

		this._accessory.on(AccessoryEventTypes.IDENTIFY, (paired, callback) => {
			callback();
			this.emit('IDENTIFY', paired);
		});

		this._accessory.on(AccessoryEventTypes.LISTENING, (port) => {
			this.emit('LISTENING', port);
		});

		this._accessory.on(AccessoryEventTypes.PAIRED, () => {
			this.emit('PAIR_CHANGE', true);
		});

		this._accessory.on(AccessoryEventTypes.UNPAIRED, () => {
			this.emit('PAIR_CHANGE', false);
		});
	}
}

BaseAccessory.prototype._wireUpEvents = function (targetService, EventStruct) {
	const GetHooks = EventStruct.Get;
	const SetHooks = EventStruct.Set;

	for (let i = 0; i < GetHooks.length; i++) {
		targetService
			.getCharacteristic(Characteristic[GetHooks[i]])
			.on(CharacteristicEventTypes.GET, (cb) => this._get(GetHooks[i], cb));
	}

	for (let i = 0; i < SetHooks.length; i++) {
		targetService
			.getCharacteristic(Characteristic[SetHooks[i]])
			.on(CharacteristicEventTypes.SET, (value, callback, ctx, connection) =>
				this._set(SetHooks[i], value, callback, connection)
			);
	}
};

BaseAccessory.prototype._set = async function (
	property,
	value,
	callback,
	connection
) {
	if (this._Properties.hasOwnProperty(property)) {
		this._Properties[property] = value;
	}

	callback(undefined);

	const PL = {
		characteristic: property,
		value: value
	};

	this.emit(
		'STATE_CHANGE',
		PL,
		connection === undefined ? 'API' : 'iOS_DEVICE'
	);
};

BaseAccessory.prototype._get = async function (property, callback) {
	if (this._Properties[property] !== undefined) {
		callback(undefined, this._Properties[property]);
	} else {
		callback(undefined, undefined);
	}
};

BaseAccessory.prototype.getConfig = function () {
	return this._Config;
};

BaseAccessory.prototype.getAccessory = function () {
	return this._accessory;
};

BaseAccessory.prototype.publish = function () {
	const CFG = {
		username: this._accessory.username,
		pincode: this._accessory.pincode,
		category: this._accessory.category,
		setupID: this._accessory.setupID,
		advertiser: CONFIG.advertiser
	};

	if (CONFIG.interface !== 'ALL') {
		CFG.bind = CONFIG.interface;
	}

	this._accessory.publish(CFG);
};

BaseAccessory.prototype.unpublish = function (destroy) {
	if (destroy) {
		this._accessory.destroy();
	} else {
		this._accessory.unpublish();
	}
};

BaseAccessory.prototype.getProperties = function () {
	return this._Properties;
};

BaseAccessory.prototype.addAccessory = function (Accessory) {
	if (this._isBridge) {
		this._accessory.addBridgedAccessory(Accessory);
	}
};

BaseAccessory.prototype.removeAccessory = function (Accessory) {
	if (this._isBridge) {
		this._accessory.removeBridgedAccessory(Accessory, false);
	}
};

BaseAccessory.prototype.getAccessories = function () {
	if (this._isBridge) {
		return this._accessory.bridgedAccessories;
	}
};

BaseAccessory.prototype._createBatteryService = function () {
	this._batteryService = new Service.BatteryService('', '');
	this._batteryService.setCharacteristic(Characteristic.BatteryLevel, 100);
	this._batteryService.setCharacteristic(Characteristic.StatusLowBattery, 0);
	this._batteryService.setCharacteristic(Characteristic.ChargingState, 0);
	this._Properties['BatteryLevel'] = 100;
	this._Properties['StatusLowBattery'] = 0;
	this._Properties['ChargingState'] = 0;

	const EventStruct = {
		Get: ['BatteryLevel', 'StatusLowBattery', 'ChargingState'],
		Set: []
	};

	this._wireUpEvents(this._batteryService, EventStruct);
	this._accessory.addService(this._batteryService);
};

const BasicSet = function (payload) {
	Object.keys(payload).forEach((K) => {
		this._Properties[K] = payload[K];
		this._service.setCharacteristic(Characteristic[K], payload[K]);
	});
};

const SetWithBattery = function (payload) {
	Object.keys(payload).forEach((K) => {
		this._Properties[K] = payload[K];
		switch (K) {
			case 'BatteryLevel':
			case 'StatusLowBattery':
			case 'ChargingState':
				this._batteryService.setCharacteristic(Characteristic[K], payload[K]);
				break;

			default:
				this._service.setCharacteristic(Characteristic[K], payload[K]);
				break;
		}
	});
};

module.exports = {
	BaseAccessory: BaseAccessory,
	BasicSet: BasicSet,
	SetWithBattery: SetWithBattery
};
