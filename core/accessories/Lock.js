'use strict';

const { Service, Characteristic, Categories } = require('hap-nodejs');
const { BasicSet, BaseAccessory } = require('./BaseAccessory');

class Lock extends BaseAccessory {
	constructor(Config) {
		super(Config, Categories.DOOR_LOCK);

		this._service = new Service.LockMechanism(Config.name, Config.name);

		this._service.setCharacteristic(Characteristic.LockTargetState, 0);
		this._service.setCharacteristic(Characteristic.LockCurrentState, 0);
		this._Properties['LockTargetState'] = 0;
		this._Properties['LockCurrentState'] = 0;

		const EventStruct = {
			Get: ['LockTargetState', 'LockCurrentState'],
			Set: ['LockTargetState']
		};

		this._wireUpEvents(this._service, EventStruct);
		this._accessory.addService(this._service);
	}
}
Lock.prototype.setCharacteristics = BasicSet;

module.exports = {
	Lock: Lock
};
