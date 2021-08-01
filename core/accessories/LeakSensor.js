'use strict';

const { Service, Characteristic, Categories } = require('hap-nodejs');
const { SetWithBattery, BaseAccessory } = require('./BaseAccessory');

class Leak extends BaseAccessory {
	constructor(Config) {
		super(Config, Categories.SENSOR);

		this._service = new Service.LeakSensor(Config.name, Config.name);

		this._service.setCharacteristic(Characteristic.LeakDetected, 0);
		this._service.setCharacteristic(Characteristic.StatusActive, 1);
		this._service.setCharacteristic(Characteristic.StatusFault, 0);
		this._service.setCharacteristic(Characteristic.StatusTampered, 0);
		this._Properties['LeakDetected'] = 0;
		this._Properties['StatusActive'] = 1;
		this._Properties['StatusFault'] = 0;
		this._Properties['StatusTampered'] = 0;

		const EventStruct = {
			Get: ['LeakDetected', 'StatusActive', 'StatusTampered', 'StatusFault'],
			Set: []
		};

		this._wireUpEvents(this._service, EventStruct);
		this._accessory.addService(this._service);

		this._createBatteryService();
	}
}
Leak.prototype.setCharacteristics = SetWithBattery;

module.exports = {
	Leak: Leak
};
