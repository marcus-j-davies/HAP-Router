'use strict'

const { Service, Characteristic, Categories } = require("hap-nodejs");
const { BasicSet, BaseAccessory } = require("./BaseAccessory")

class GarageDoor extends BaseAccessory {

    constructor(Config) {
        super(Config, Categories.GARAGE_DOOR_OPENER);

        this._service = new Service.GarageDoorOpener(Config.name, Config.name);

        this._service.setCharacteristic(Characteristic.CurrentDoorState, 0);
        this._service.setCharacteristic(Characteristic.TargetDoorState, 0);
        this._service.setCharacteristic(Characteristic.LockCurrentState, 0);
        this._service.setCharacteristic(Characteristic.LockTargetState, 0);
        this._service.setCharacteristic(Characteristic.ObstructionDetected, false);
        this._Properties["CurrentDoorState"] = 0;
        this._Properties["TargetDoorState"] = 0;
        this._Properties["LockCurrentState"] = 0;
        this._Properties["LockTargetState"] = 0;
        this._Properties["ObstructionDetected"] = false;

        const EventStruct = {
            "Get": ["CurrentDoorState", "TargetDoorState", "LockCurrentState", "LockTargetState", "ObstructionDetected"],
            "Set": ["TargetDoorState", "LockTargetState"]
        }

        this._wireUpEvents(this._service, EventStruct);
        this._accessory.addService(this._service);
    }
}
GarageDoor.prototype.setCharacteristics = BasicSet;

module.exports = {
    GarageDoor: GarageDoor
}