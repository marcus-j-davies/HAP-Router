'use strict';

const { Service, Characteristic, Categories } = require('hap-nodejs');
const { BasicSet, BaseAccessory } = require('./BaseAccessory');

class LightBulb extends BaseAccessory {
	constructor(Config) {
		super(Config, Categories.LIGHTBULB);

		this._service = new Service.Lightbulb(Config.name, Config.name);

		this._service.setCharacteristic(Characteristic.On, false);
		this._Properties['On'] = false;

		const EventStruct = {
			Get: ['On'],
			Set: ['On']
		};

		if (Config.supportsBrightness === true) {
			this._service.setCharacteristic(Characteristic.Brightness, 100);
			this._Properties['Brightness'] = 100;
			EventStruct.Get.push('Brightness');
			EventStruct.Set.push('Brightness');
		}

		switch (Config.colorMode) {
			case 'hue':
				this._service.setCharacteristic(Characteristic.Hue, 0);
				this._Properties['Hue'] = 0;
				EventStruct.Get.push('Hue');
				EventStruct.Set.push('Hue');

				this._service.setCharacteristic(Characteristic.Saturation, 0);
				this._Properties['Saturation'] = 0;
				EventStruct.Get.push('Saturation');
				EventStruct.Set.push('Saturation');

				break;

			case 'temperature':
				this._service.setCharacteristic(Characteristic.ColorTemperature, 50);
				this._Properties['ColorTemperature'] = 50;
				EventStruct.Get.push('ColorTemperature');
				EventStruct.Set.push('ColorTemperature');

				break;
		}

		this._wireUpEvents(this._service, EventStruct);
		this._accessory.addService(this._service);
	}
}
LightBulb.prototype.setCharacteristics = BasicSet;

module.exports = {
	LightBulb: LightBulb
};
