'use strict'

const { Service, Characteristic, Categories} = require("hap-nodejs");
const {SetWithBattery, BaseAccessory} = require("./BaseAccessory")

class HumiditySensor extends BaseAccessory {

    constructor(Config) {
        super(Config, Categories.SENSOR);

        this._service = new Service.HumiditySensor(Config.name, Config.name);

        this._service.setCharacteristic(Characteristic.CurrentRelativeHumidity, 25);
        this._service.setCharacteristic(Characteristic.StatusActive, 1);
        this._service.setCharacteristic(Characteristic.StatusFault, 0);
        this._service.setCharacteristic(Characteristic.StatusTampered, 0);
        this._Properties["CurrentRelativeHumidity"] = 25;
        this._Properties["StatusActive"] = 1;
        this._Properties["StatusFault"] = 0;
        this._Properties["StatusTampered"] = 0;


        const EventStruct = {
            "Get": ["CurrentRelativeHumidity", "StatusActive", "StatusTampered", "StatusFault"],
            "Set": []
        }

        this._wireUpEvents(this._service, EventStruct);
        this._accessory.addService(this._service);

        this._createBatteryService();
    }
}
HumiditySensor.prototype.setCharacteristics = SetWithBattery;

module.exports  = {
    HumiditySensor:HumiditySensor
}