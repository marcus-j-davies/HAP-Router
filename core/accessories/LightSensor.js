'use strict'

const { Service, Characteristic, Categories} = require("hap-nodejs");
const {SetWithBattery, BaseAccessory} = require("./BaseAccessory")

class LightSensor extends BaseAccessory {

    constructor(Config) {
        super(Config, Categories.SENSOR);

        this._service = new Service.LightSensor(Config.name, Config.name);

        this._service.setCharacteristic(Characteristic.CurrentAmbientLightLevel, 25);
        this._service.setCharacteristic(Characteristic.StatusActive, 1);
        this._service.setCharacteristic(Characteristic.StatusFault, 0);
        this._service.setCharacteristic(Characteristic.StatusTampered, 0);
        this._Properties["CurrentAmbientLightLevel"] = 25;
        this._Properties["StatusActive"] = 1;
        this._Properties["StatusFault"] = 0;
        this._Properties["StatusTampered"] = 0;

        const EventStruct = {
            "Get": ["CurrentAmbientLightLevel", "StatusActive", "StatusTampered", "StatusFault"],
            "Set": []
        }

        this._wireUpEvents(this._service, EventStruct);
        this._accessory.addService(this._service);

        this._createBatteryService();
    }
}
LightSensor.prototype.setCharacteristics = SetWithBattery;

module.exports  = {
    LightSensor:LightSensor
}