'use strict'

const { Service, Characteristic, Categories} = require("hap-nodejs");
const {SetWithBattery, BaseAccessory} = require("./BaseAccessory")

class Temperature extends BaseAccessory {

    constructor(Config) {
        super(Config, Categories.SENSOR);

        this._service = new Service.TemperatureSensor(Config.name, Config.name);

        this._service.setCharacteristic(Characteristic.CurrentTemperature, 21);
        this._service.setCharacteristic(Characteristic.StatusActive, 1);
        this._service.setCharacteristic(Characteristic.StatusFault, 0);
        this._service.setCharacteristic(Characteristic.StatusTampered, 0);
        this._Properties["CurrentTemperature"] = 21;
        this._Properties["StatusActive"] = 1;
        this._Properties["StatusFault"] = 0;
        this._Properties["StatusTampered"] = 0;

        const EventStruct = {
            "Get": ["CurrentTemperature", "StatusActive", "StatusTampered", "StatusFault"],
            "Set": []
        }

        this._wireUpEvents(this._service, EventStruct);
        this._accessory.addService(this._service);

        this._createBatteryService();
    }
}
Temperature.prototype.setCharacteristics = SetWithBattery;

module.exports  = {
    Temperature:Temperature
}
