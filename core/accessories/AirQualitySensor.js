'use strict';

const { Service, Characteristic, Categories } = require('hap-nodejs');
const { SetWithBattery, BaseAccessory } = require('./BaseAccessory');

class AirQualitySensor extends BaseAccessory {
	constructor(Config) {
		super(Config, Categories.SENSOR);

		this._service = new Service.AirQualitySensor(Config.name, Config.name);

		this._service.setCharacteristic(Characteristic.StatusActive, 1);
		this._service.setCharacteristic(Characteristic.StatusFault, 0);
		this._service.setCharacteristic(Characteristic.StatusTampered, 0);

		this._service.setCharacteristic(Characteristic.AirQuality, 1);
		this._service.setCharacteristic(Characteristic.OzoneDensity, 500);
		this._service.setCharacteristic(Characteristic.NitrogenDioxideDensity, 500);
		this._service.setCharacteristic(Characteristic.SulphurDioxideDensity, 500);
		this._service.setCharacteristic(Characteristic.PM2_5Density, 500);
		this._service.setCharacteristic(Characteristic.PM10Density, 500);
		this._service.setCharacteristic(Characteristic.VOCDensity, 500);
		this._Properties['AirQuality'] = 1;
		this._Properties['OzoneDensity'] = 500;
		this._Properties['NitrogenDioxideDensity'] = 500;
		this._Properties['SulphurDioxideDensity'] = 500;
		this._Properties['PM2_5Density'] = 500;
		this._Properties['PM10Density'] = 500;
		this._Properties['VOCDensity'] = 500;

		this._Properties['StatusActive'] = 1;
		this._Properties['StatusFault'] = 0;
		this._Properties['StatusTampered'] = 0;

		const EventStruct = {
			Get: [
				'VOCDensity',
				'PM10Density',
				'PM2_5Density',
				'SulphurDioxideDensity',
				'NitrogenDioxideDensity',
				'AirQuality',
				'OzoneDensity',
				'StatusActive',
				'StatusTampered',
				'StatusFault'
			],
			Set: []
		};

		this._wireUpEvents(this._service, EventStruct);
		this._accessory.addService(this._service);

		this._createBatteryService();
	}
}
AirQualitySensor.prototype.setCharacteristics = SetWithBattery;

module.exports = {
	AirQualitySensor: AirQualitySensor
};
