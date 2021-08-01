'use strict';

const { Service, Characteristic, Categories } = require('hap-nodejs');
const { BasicSet, BaseAccessory } = require('./BaseAccessory');

class Thermostat extends BaseAccessory {
	constructor(Config) {
		super(Config, Categories.THERMOSTAT);

		this._service = new Service.Thermostat(Config.name, Config.name);

		this._service.setCharacteristic(
			Characteristic.CurrentHeatingCoolingState,
			0
		);
		this._service.setCharacteristic(
			Characteristic.TargetHeatingCoolingState,
			0
		);
		this._service.setCharacteristic(Characteristic.CurrentTemperature, 21);
		this._service.setCharacteristic(Characteristic.TargetTemperature, 21);
		this._service.setCharacteristic(Characteristic.TemperatureDisplayUnits, 0);
		this._service.setCharacteristic(
			Characteristic.CoolingThresholdTemperature,
			26
		);
		this._service.setCharacteristic(
			Characteristic.HeatingThresholdTemperature,
			18
		);

		this._Properties['CurrentHeatingCoolingState'] = 0;
		this._Properties['TargetHeatingCoolingState'] = 0;
		this._Properties['CurrentTemperature'] = 21;
		this._Properties['TargetTemperature'] = 21;
		this._Properties['TemperatureDisplayUnits'] = 0;
		this._Properties['CoolingThresholdTemperature'] = 26;
		this._Properties['HeatingThresholdTemperature'] = 18;

		const EventStruct = {
			Get: [
				'TargetHeatingCoolingState',
				'CurrentHeatingCoolingState',
				'TemperatureDisplayUnits',
				'CurrentTemperature',
				'TargetTemperature',
				'CoolingThresholdTemperature',
				'HeatingThresholdTemperature'
			],
			Set: [
				'TargetHeatingCoolingState',
				'TemperatureDisplayUnits',
				'TargetTemperature',
				'CoolingThresholdTemperature',
				'HeatingThresholdTemperature'
			]
		};

		this._wireUpEvents(this._service, EventStruct);
		this._accessory.addService(this._service);
	}
}
Thermostat.prototype.setCharacteristics = BasicSet;

module.exports = {
	Thermostat: Thermostat
};
