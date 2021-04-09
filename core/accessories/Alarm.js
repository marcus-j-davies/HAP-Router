'use strict'

const { Service, Characteristic, Categories} = require("hap-nodejs");
const {BasicSet, BaseAccessory} = require("./BaseAccessory")

class Alarm extends BaseAccessory {

    constructor(Config) {

        super(Config, Categories.SECURITY_SYSTEM);

        this._service = new Service.SecuritySystem(Config.name, Config.name);

        this._service.setCharacteristic(Characteristic.StatusFault, 0);
        this._service.setCharacteristic(Characteristic.StatusTampered, 0);
        this._service.setCharacteristic(Characteristic.SecuritySystemCurrentState, 3);
        this._service.setCharacteristic(Characteristic.SecuritySystemTargetState, 3);
        this._Properties["StatusFault"] = 0;
        this._Properties["StatusTampered"] = 0;
        this._Properties["SecuritySystemCurrentState"] = 3;
        this._Properties["SecuritySystemTargetState"] = 3;

        const EventStruct = {
            "Get": ["SecuritySystemTargetState", "StatusFault", "StatusTampered", "SecuritySystemCurrentState"],
            "Set": ["SecuritySystemTargetState"]
        }

        this._wireUpEvents(this._service, EventStruct);
        this._accessory.addService(this._service);

    }
}
Alarm.prototype.setCharacteristics = BasicSet;

module.exports  = {
    Alarm:Alarm
}
