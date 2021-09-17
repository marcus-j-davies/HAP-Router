const { Service, Characteristic, Categories } = require('hap-nodejs');
const { BaseAccessory } = require('./BaseAccessory');

const ServicesEnabled = {
	Motion: false,
	Light: false,
	Temp: false,
	Humidity: false
};

const Set = function (payload) {
	Object.keys(payload).forEach((K) => {
		switch (K) {
			case 'MotionDetected':
				if (ServicesEnabled.Motion) {
					this._Properties[K] = payload[K];
					this._MotionService.setCharacteristic(Characteristic[K], payload[K]);
				}
				break;

			case 'CurrentAmbientLightLevel':
				if (ServicesEnabled.Light) {
					this._Properties[K] = payload[K];
					this._LighService.setCharacteristic(Characteristic[K], payload[K]);
				}
				break;

			case 'CurrentTemperature':
				if (ServicesEnabled.Temp) {
					this._Properties[K] = payload[K];
					this._TempService.setCharacteristic(Characteristic[K], payload[K]);
				}
				break;

			case 'CurrentRelativeHumidity':
				if (ServicesEnabled.Humidity) {
					this._Properties[K] = payload[K];
					this._HumidityService.setCharacteristic(
						Characteristic[K],
						payload[K]
					);
				}
				break;

			case 'StatusActive':
			case 'StatusFault':
			case 'StatusTampered':
				this._Properties[K] = payload[K];
				if (ServicesEnabled.Temp)
					this._TempService.setCharacteristic(Characteristic[K], payload[K]);
				if (ServicesEnabled.Light)
					this._LighService.setCharacteristic(Characteristic[K], payload[K]);
				if (ServicesEnabled.Motion)
					this._MotionService.setCharacteristic(Characteristic[K], payload[K]);
				if (ServicesEnabled.Humidity)
					this._HumidityService.setCharacteristic(
						Characteristic[K],
						payload[K]
					);
				break;

			case 'BatteryLevel':
			case 'StatusLowBattery':
			case 'ChargingState':
				this._Properties[K] = payload[K];
				this._batteryService.setCharacteristic(Characteristic[K], payload[K]);
				break;
		}
	});
};

class MultiSensor extends BaseAccessory {
	constructor(Config) {
		super(Config, Categories.SENSOR);

		// Motion
		if (Config.enableMotionSensor) {
			ServicesEnabled.Motion = true;

			this._MotionService = new Service.MotionSensor(
				'Motion Sensor',
				'Motion Sensor'
			);
			this._MotionService.setCharacteristic(
				Characteristic.MotionDetected,
				false
			);
			this._MotionService.setCharacteristic(Characteristic.StatusActive, 1);
			this._MotionService.setCharacteristic(Characteristic.StatusFault, 0);
			this._MotionService.setCharacteristic(Characteristic.StatusTampered, 0);
			this._Properties['MotionDetected'] = false;
			this._Properties['StatusActive'] = 1;
			this._Properties['StatusFault'] = 0;
			this._Properties['StatusTampered'] = 0;

			const EventStruct = {
				Get: [
					'MotionDetected',
					'StatusActive',
					'StatusTampered',
					'StatusFault'
				],
				Set: []
			};

			this._wireUpEvents(this._MotionService, EventStruct);
			this._accessory.addService(this._MotionService);
		}

		// Temp
		if (Config.enableTempSensor) {
			ServicesEnabled.Temp = true;

			this._TempService = new Service.TemperatureSensor(
				'Temperature Sensor',
				'Temperature Sensor'
			);
			this._TempService.setCharacteristic(
				Characteristic.CurrentTemperature,
				21
			);
			this._TempService.setCharacteristic(Characteristic.StatusActive, 1);
			this._TempService.setCharacteristic(Characteristic.StatusFault, 0);
			this._TempService.setCharacteristic(Characteristic.StatusTampered, 0);
			this._Properties['CurrentTemperature'] = 21;
			this._Properties['StatusActive'] = 1;
			this._Properties['StatusFault'] = 0;
			this._Properties['StatusTampered'] = 0;

			const EventStruct = {
				Get: [
					'CurrentTemperature',
					'StatusActive',
					'StatusTampered',
					'StatusFault'
				],
				Set: []
			};

			this._wireUpEvents(this._TempService, EventStruct);
			this._accessory.addService(this._TempService);
		}

		// Lux Sensor
		if (Config.enableLuxSensor) {
			ServicesEnabled.Light = true;

			this._LighService = new Service.LightSensor(
				'Light Sensor',
				'Light Sensor'
			);
			this._LighService.setCharacteristic(
				Characteristic.CurrentAmbientLightLevel,
				25
			);
			this._LighService.setCharacteristic(Characteristic.StatusActive, 1);
			this._LighService.setCharacteristic(Characteristic.StatusFault, 0);
			this._LighService.setCharacteristic(Characteristic.StatusTampered, 0);
			this._Properties['CurrentAmbientLightLevel'] = 25;
			this._Properties['StatusActive'] = 1;
			this._Properties['StatusFault'] = 0;
			this._Properties['StatusTampered'] = 0;

			const EventStruct = {
				Get: [
					'CurrentAmbientLightLevel',
					'StatusActive',
					'StatusTampered',
					'StatusFault'
				],
				Set: []
			};

			this._wireUpEvents(this._LighService, EventStruct);
			this._accessory.addService(this._LighService);
		}

		// Humidity
		if (Config.enableHumiditySensor) {
			ServicesEnabled.Humidity = true;

			this._HumidityService = new Service.HumiditySensor(
				'Humidity Sensor',
				'Humidity Sensor'
			);
			this._HumidityService.setCharacteristic(
				Characteristic.CurrentRelativeHumidity,
				25
			);
			this._HumidityService.setCharacteristic(Characteristic.StatusActive, 1);
			this._HumidityService.setCharacteristic(Characteristic.StatusFault, 0);
			this._HumidityService.setCharacteristic(Characteristic.StatusTampered, 0);
			this._Properties['CurrentRelativeHumidity'] = 25;
			this._Properties['StatusActive'] = 1;
			this._Properties['StatusFault'] = 0;
			this._Properties['StatusTampered'] = 0;

			const EventStruct = {
				Get: [
					'CurrentRelativeHumidity',
					'StatusActive',
					'StatusTampered',
					'StatusFault'
				],
				Set: []
			};

			this._wireUpEvents(this._HumidityService, EventStruct);
			this._accessory.addService(this._HumidityService);
		}

		this._createBatteryService();
	}
}
MultiSensor.prototype.setCharacteristics = Set;

module.exports = {
	MultiSensor: MultiSensor
};
