'use strict'

const { Service, Characteristic, Categories} = require("hap-nodejs");
const { BaseAccessory } = require("./BaseAccessory")

const Set = function (payload) {

    Object.keys(payload).forEach((K) =>{

        switch(K){

          
            case "CurrentTemperature":
                this._Properties[K] = payload[K];
                this._tempService.setCharacteristic(Characteristic[K], payload[K])
                break;

            case "CurrentRelativeHumidity":
                this._Properties[K] = payload[K];
                this._humidityservice.setCharacteristic(Characteristic[K], payload[K])
                break;

            case "StatusActive":
            case "StatusFault":
            case "StatusTampered":
                this._Properties[K] = payload[K];
                this._tempService.setCharacteristic(Characteristic[K], payload[K])
                this._humidityservice.setCharacteristic(Characteristic[K], payload[K])
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

class TempHumidity extends BaseAccessory {

    constructor(Config) {

        super(Config, Categories.SENSOR);


        // Temp
        this._tempService = new Service.TemperatureSensor("Temperature Sensor", "Temperature Sensor");

        this._tempService.setCharacteristic(Characteristic.CurrentTemperature, 21);
        this._tempService.setCharacteristic(Characteristic.StatusActive, 1);
        this._tempService.setCharacteristic(Characteristic.StatusFault, 0);
        this._tempService.setCharacteristic(Characteristic.StatusTampered, 0);
        this._Properties["CurrentTemperature"] = 21;
        this._Properties["StatusActive"] = 1;
        this._Properties["StatusFault"] = 0;
        this._Properties["StatusTampered"] = 0;


        var EventStruct = {
            "Get": ["CurrentTemperature", "StatusActive", "StatusTampered", "StatusFault"],
            "Set": []
        }

        this._wireUpEvents(this._tempService, EventStruct);
        this._accessory.addService(this._tempService);

        // Humidity
        this._humidityservice = new Service.HumiditySensor("Humidity Sensor", "Humidity Sensor");

        this._humidityservice.setCharacteristic(Characteristic.CurrentRelativeHumidity, 25);
        this._humidityservice.setCharacteristic(Characteristic.StatusActive, 1);
        this._humidityservice.setCharacteristic(Characteristic.StatusFault, 0);
        this._humidityservice.setCharacteristic(Characteristic.StatusTampered, 0);
        this._Properties["CurrentRelativeHumidity"] = 25;

        EventStruct = {
            "Get": ["CurrentRelativeHumidity", "StatusActive", "StatusTampered", "StatusFault"],
            "Set": []
        }

        this._wireUpEvents(this._humidityservice, EventStruct);
        this._accessory.addService(this._humidityservice);

        this._createBatteryService();
    }
}
TempHumidity.prototype.setCharacteristics = Set;

module.exports  = {
    TempHumidity:TempHumidity
}