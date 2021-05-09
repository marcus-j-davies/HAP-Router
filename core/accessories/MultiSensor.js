'use strict'

const { Service, Characteristic, Categories} = require("hap-nodejs");
const {BaseAccessory} = require("./BaseAccessory")

const Set = function (payload) {

    Object.keys(payload).forEach((K) =>{

        switch(K){

            case "MotionDetected":
                this._Properties[K] = payload[K];
                this._MotionService.setCharacteristic(Characteristic[K], payload[K])
                break;

            case "CurrentAmbientLightLevel":
                this._Properties[K] = payload[K];
                this._LighService.setCharacteristic(Characteristic[K], payload[K])
                break;

            case "CurrentTemperature":
                this._Properties[K] = payload[K];
                this._TempService.setCharacteristic(Characteristic[K], payload[K])
                break;

            case "StatusActive":
            case "StatusFault":
            case "StatusTampered":
                this._Properties[K] = payload[K];
                this._TempService.setCharacteristic(Characteristic[K], payload[K])
                this._LighService.setCharacteristic(Characteristic[K], payload[K])
                this._MotionService.setCharacteristic(Characteristic[K], payload[K])
                break;

            case "BatteryLevel":
            case "StatusLowBattery":
            case "ChargingState":
                this._Properties[K] = payload[K];
                this._batteryService.setCharacteristic(Characteristic[K], payload[K])
                break;


        }

    })
}

class MultiSensor extends BaseAccessory {

    constructor(Config) {

        super(Config, Categories.SENSOR);

        // Motion
        this._MotionService = new Service.MotionSensor("Motion Sensor", "Motion Sensor");
        this._MotionService.setCharacteristic(Characteristic.MotionDetected, false);
        this._MotionService.setCharacteristic(Characteristic.StatusActive, 1);
        this._MotionService.setCharacteristic(Characteristic.StatusFault, 0);
        this._MotionService.setCharacteristic(Characteristic.StatusTampered, 0);
        this._Properties["MotionDetected"] = false;
        this._Properties["StatusActive"] = 1;
        this._Properties["StatusFault"] = 0;
        this._Properties["StatusTampered"] = 0;

        var EventStruct = {
            "Get": ["MotionDetected", "StatusActive", "StatusTampered", "StatusFault"],
            "Set": []
        }

        this._wireUpEvents(this._MotionService, EventStruct);
        this._accessory.addService(this._MotionService);

        // Light
        this._LighService = new Service.LightSensor("Light Sensor", "Light Sensor");

        this._LighService.setCharacteristic(Characteristic.CurrentAmbientLightLevel, 25);
        this._LighService.setCharacteristic(Characteristic.StatusActive, 1);
        this._LighService.setCharacteristic(Characteristic.StatusFault, 0);
        this._LighService.setCharacteristic(Characteristic.StatusTampered, 0);
        this._Properties["CurrentAmbientLightLevel"] = 25;
        this._Properties["StatusActive"] = 1;
        this._Properties["StatusFault"] = 0;
        this._Properties["StatusTampered"] = 0;

        EventStruct = {
            "Get": ["CurrentAmbientLightLevel", "StatusActive", "StatusTampered", "StatusFault"],
            "Set": []
        }

        this._wireUpEvents(this._LighService, EventStruct);
        this._accessory.addService(this._LighService);

        // Temp
        this._TempService = new Service.TemperatureSensor("Temperature Sensor", "Temperature Sensor");
        this._TempService.setCharacteristic(Characteristic.CurrentTemperature, 21);
        this._TempService.setCharacteristic(Characteristic.StatusActive, 1);
        this._TempService.setCharacteristic(Characteristic.StatusFault, 0);
        this._TempService.setCharacteristic(Characteristic.StatusTampered, 0);
        this._Properties["CurrentTemperature"] = 21;
        this._Properties["StatusActive"] = 1;
        this._Properties["StatusFault"] = 0;
        this._Properties["StatusTampered"] = 0;

        EventStruct = {
            "Get": ["CurrentTemperature", "StatusActive", "StatusTampered", "StatusFault"],
            "Set": []
        }

        this._wireUpEvents(this._TempService, EventStruct);
        this._accessory.addService(this._TempService);

        this._createBatteryService();
    }
}
MultiSensor.prototype.setCharacteristics = Set;

module.exports  = {
    MultiSensor:MultiSensor
}