const { Service, Characteristic, Categories } = require('hap-nodejs');
const { BasicSet, BaseAccessory } = require('./BaseAccessory');

class Switch extends BaseAccessory {
	constructor(Config) {
		super(Config, Categories.SWITCH);

		this._service = new Service.Switch(Config.name, Config.name);

		this._service.setCharacteristic(Characteristic.On, false);
		this._Properties['On'] = false;

		const EventStruct = {
			Get: ['On'],
			Set: ['On']
		};

		this._wireUpEvents(this._service, EventStruct);
		this._accessory.addService(this._service);
	}
}
Switch.prototype.setCharacteristics = BasicSet;

module.exports = {
	Switch: Switch
};
