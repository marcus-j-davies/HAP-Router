const { Service, Characteristic, Categories } = require('hap-nodejs');
const { BasicSet, BaseAccessory } = require('./BaseAccessory');

class Fan extends BaseAccessory {
	constructor(Config) {
		super(Config, Categories.FAN);

		this._service = new Service.Fan(Config.name, Config.name);

		this._service.setCharacteristic(Characteristic.On, false);
		this._service.setCharacteristic(Characteristic.RotationSpeed, 100);
		this._Properties['On'] = false;
		this._Properties['RotationSpeed'] = 100;

		const EventStruct = {
			Get: ['On', 'RotationSpeed'],
			Set: ['On', 'RotationSpeed']
		};

		this._wireUpEvents(this._service, EventStruct);
		this._accessory.addService(this._service);
	}
}
Fan.prototype.setCharacteristics = BasicSet;

module.exports = {
	Fan: Fan
};
