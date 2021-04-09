'use strict'

const { Service, Accessory, Characteristic, uuid, CharacteristicEventTypes, AccessoryEventTypes, Catagories, Bridge, HAPStorage } = require("hap-nodejs");
const { EventEmitter } = require("events");
const { version } = require("../../package.json");
const { HomeKitPath } = require("../util");

let Initialised = false;

class BaseAccessory extends EventEmitter {

    constructor(AccessoryOBJ, Category) {

        super();

        this._Config = AccessoryOBJ;
        this._Properties = {};
        this._isBridge = (Category === Catagories.BRIDGE);

        this._Properties = {};

        if (!Initialised) {
            HAPStorage.setCustomStoragePath(HomeKitPath);
            Initialised = true;
        }

        const UUID = uuid.generate('hap-nodejs:accessories:' + AccessoryOBJ.name + ':' + AccessoryOBJ.username);

        if (this._isBridge) {
            this._accessory = new Bridge(AccessoryOBJ.name, UUID);
        } else {
            this._accessory = new Accessory(AccessoryOBJ.name, UUID);
        }

        this._accessory.getService(Service.AccessoryInformation)
            .setCharacteristic(Characteristic.SerialNumber, AccessoryOBJ.serialNumber)
            .setCharacteristic(Characteristic.Manufacturer, "Marcus Davies")
            .setCharacteristic(Characteristic.FirmwareRevision, version)
            .setCharacteristic(Characteristic.Name, AccessoryOBJ.name)

        this._accessory.username = AccessoryOBJ.username;
        this._accessory.pincode = AccessoryOBJ.pincode;
        this._accessory.category = Category;
        this._accessory.setupID = AccessoryOBJ.setupID;

        this._accessory.on(AccessoryEventTypes.IDENTIFY, (paired, callback) => {
            callback();
            this.emit("IDENTIFY", paired)
        });

        this._accessory.on(AccessoryEventTypes.LISTENING, (port) => {
            this.emit("LISTENING", port)
        });

        this._accessory.on(AccessoryEventTypes.PAIRED, () => {
            this.emit("PAIR_CHANGE", true);
        });

        this._accessory.on(AccessoryEventTypes.UNPAIRED, () => {
            this.emit("PAIR_CHANGE", false);
        });
    }
}

BaseAccessory.prototype._wireUpEvents = function (targetService, EventStruct) {

    const GetHooks = EventStruct.Get;
    const SetHooks = EventStruct.Set;

    for (let i = 0; i < GetHooks.length; i++) {
        targetService.getCharacteristic(Characteristic[GetHooks[i]])
            .on(CharacteristicEventTypes.GET, (cb) => this._get(GetHooks[i], cb))
    }

    for (let i = 0; i < SetHooks.length; i++) {
        targetService.getCharacteristic(Characteristic[SetHooks[i]])
            .on(CharacteristicEventTypes.SET, (value, callback, ctx, connection) => this._set(SetHooks[i], value, callback, connection))
    }
}


BaseAccessory.prototype._set = async function (property, value, callback, connection) {

    this._Properties[property] = value;
    callback(null);

    const PL = {
        "characteristic": property,
        "value": value,
    }

    this.emit("STATE_CHANGE", PL, connection === undefined ? "API" : "iOS_DEVICE");

}

BaseAccessory.prototype._get = async function (property, callback) {

    if (this._Properties[property] !== undefined) {
        callback(null, this._Properties[property]);
    } else {
        callback(null, null);
    }
}

BaseAccessory.prototype.getAccessory = function () {

    return this._accessory;
}


BaseAccessory.prototype.getAccessoryType = function () {

    return this._Config.type;
}

BaseAccessory.prototype.publish = function () {

    let CFG = {
        username: this._accessory.username,
        pincode: this._accessory.pincode,
        category: this._accessory.category,
        setupID: this._accessory.setupID,
        advertiser: config.advertiser
    }

    if (config.interface !== 'ALL') {
        CFG.bind = config.interface
    }

    this._accessory.publish(CFG)
}

BaseAccessory.prototype.unpublish = function (destroy) {

    if (destroy) {
        this._accessory.destroy();
    } else {
        this._accessory.unpublish()
    }
}

BaseAccessory.prototype.getProperties = function () {

    return this._Properties;
}

BaseAccessory.prototype.addAccessory = function (Accessory) {
    if (this._isBridge) {
        this._accessory.addBridgedAccessory(Accessory);

    }
}

BaseAccessory.prototype.removeAccessory = function (Accessory) {

    if (this._isBridge) {
        this._accessory.removeBridgedAccessory(Accessory, false)

    }
}

BaseAccessory.prototype.getAccessories = function () {

    if (this._isBridge) {
        return this._accessory.bridgedAccessories;

    }
}

BaseAccessory.prototype._createBatteryService = function () {

    this._batteryService = new Service.BatteryService('', '');
    this._batteryService.setCharacteristic(Characteristic.BatteryLevel, 100);
    this._batteryService.setCharacteristic(Characteristic.StatusLowBattery, 0);
    this._batteryService.setCharacteristic(Characteristic.ChargingState, 0);
    this._Properties["BatteryLevel"] = 100;
    this._Properties["StatusLowBattery"] = 0;
    this._Properties["ChargingState"] = 0;

    const EventStruct = {
        "Get": ["BatteryLevel", "StatusLowBattery", "ChargingState"],
        "Set": []
    }

    this._wireUpEvents(this._batteryService, EventStruct)
    this._accessory.addService(this._batteryService);
}

const BasicSet = function(payload) {

    const Props = Object.keys(payload);

    for (let i = 0; i < Props.length; i++) {
        this._Properties[Props[i]] = payload[Props[i]];
        this._service.setCharacteristic(Characteristic[Props[i]], payload[Props[i]])

    }
}

const SetWithBattery = function(payload) {

    const Props = Object.keys(payload);
    const BatteryTargets = ["BatteryLevel", "StatusLowBattery", "ChargingState"]

    for (let i = 0; i < Props.length; i++) {
        this._Properties[Props[i]] = payload[Props[i]];

        if (BatteryTargets.includes(Props[i])) {
            this._batteryService.setCharacteristic(Characteristic[Props[i]], payload[Props[i]])
        } else {
            this._service.setCharacteristic(Characteristic[Props[i]], payload[Props[i]])
        }

    }
}

module.exports = {
    BaseAccessory: BaseAccessory,
    BasicSet:BasicSet,
    SetWithBattery:SetWithBattery
    
}
