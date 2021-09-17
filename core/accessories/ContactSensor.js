const { Service, Characteristic, Categories } = require('hap-nodejs');
const { SetWithBattery, BaseAccessory } = require('./BaseAccessory');

class ContactSensor extends BaseAccessory {
	constructor(Config) {
		super(Config, Categories.SENSOR);

		this._service = new Service.ContactSensor(Config.name, Config.name);

		this._service.setCharacteristic(Characteristic.ContactSensorState, 0);
		this._service.setCharacteristic(Characteristic.StatusFault, 0);
		this._service.setCharacteristic(Characteristic.StatusTampered, 0);
		this._service.setCharacteristic(Characteristic.StatusActive, 1);
		this._Properties['ContactSensorState'] = 0;
		this._Properties['StatusFault'] = 0;
		this._Properties['StatusTampered'] = 0;
		this._Properties['StatusActive'] = 1;

		const EventStruct = {
			Get: [
				'ContactSensorState',
				'StatusFault',
				'StatusTampered',
				'StatusActive'
			],
			Set: []
		};

		this._wireUpEvents(this._service, EventStruct);
		this._accessory.addService(this._service);

		this._createBatteryService();
	}
}

ContactSensor.prototype.setCharacteristics = SetWithBattery;

module.exports = {
	ContactSensor: ContactSensor
};
