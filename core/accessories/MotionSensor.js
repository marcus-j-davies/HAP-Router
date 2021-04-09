'use strict'

const { Service, Characteristic, Categories} = require("hap-nodejs");
const {SetWithBattery,BaseAccessory} = require("./BaseAccessory")

class MotionSensor extends BaseAccessory {

    constructor(Config) {

        super(Config, Categories.SENSOR);

        this._service = new Service.MotionSensor(Config.name, Config.name);

        this._service.setCharacteristic(Characteristic.MotionDetected, false);
        this._service.setCharacteristic(Characteristic.StatusActive, 1);
        this._service.setCharacteristic(Characteristic.StatusFault, 0);
        this._service.setCharacteristic(Characteristic.StatusTampered, 0);
        this._Properties["MotionDetected"] = false;
        this._Properties["StatusActive"] = 1;
        this._Properties["StatusFault"] = 0;
        this._Properties["StatusTampered"] = 0;

        const EventStruct = {
            "Get": ["MotionDetected", "StatusActive", "StatusTampered", "StatusFault"],
            "Set": []
        }

        this._wireUpEvents(this._service, EventStruct);
        this._accessory.addService(this._service);

        this._createBatteryService();
    }
}
MotionSensor.prototype.setCharacteristics = SetWithBattery;

module.exports  = {
    MotionSensor:MotionSensor
}