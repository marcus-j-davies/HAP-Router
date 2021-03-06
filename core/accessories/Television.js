const {
	Service,
	Characteristic,
	Categories,
	CharacteristicEventTypes
} = require('hap-nodejs');
const { BaseAccessory } = require('./BaseAccessory');

const Set = function (payload) {
	Object.keys(payload).forEach((K) => {
		switch (K) {
			case 'Active':
				this._Properties[K] = payload[K];
				this._service.setCharacteristic(Characteristic[K], payload[K]);
				this._Speaker.setCharacteristic(Characteristic[K], payload[K]);
				break;

			case 'VolumeSelector':
				this._Speaker.setCharacteristic(Characteristic[K], payload[K]);
				break;

			case 'RemoteKey':
			case 'PowerModeSelection':
				this._service.setCharacteristic(Characteristic[K], payload[K]);
				break;

			case 'ActiveIdentifier':
				this._Properties[K] = payload[K];
				this._service.setCharacteristic(Characteristic[K], payload[K]);
				break;
		}
	});
};

class TV extends BaseAccessory {
	constructor(Config) {
		super(Config, Categories[Config.category.replace(/ /g, '_')]);

		this._Inputs = [];

		this._service = new Service.Television(Config.name, Config.Name);
		this._service.setCharacteristic(Characteristic.ConfiguredName, Config.name);
		this._service.setCharacteristic(
			Characteristic.SleepDiscoveryMode,
			Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE
		);
		this._service.setCharacteristic(Characteristic.ActiveIdentifier, 1);
		this._service.setCharacteristic(Characteristic.Active, 0);
		this._Properties['Active'] = 0;
		this._Properties['ActiveIdentifier'] = 1;

		let EventStruct = {
			Get: ['Active', 'ActiveIdentifier'],
			Set: ['Active', 'RemoteKey', 'ActiveIdentifier', 'PowerModeSelection']
		};

		this._wireUpEvents(this._service, EventStruct);
		this._accessory.addService(this._service);

		// Speaker
		this._Speaker = new Service.TelevisionSpeaker('', '');
		this._Speaker.setCharacteristic(Characteristic.Active, 0);
		this._Speaker.setCharacteristic(
			Characteristic.VolumeControlType,
			Characteristic.VolumeControlType.ABSOLUTE
		);

		EventStruct = {
			Get: ['Active', 'VolumeSelector'],
			Set: ['VolumeSelector']
		};

		this._wireUpEvents(this._Speaker, EventStruct);
		this._accessory.addService(this._Speaker);

		// Inputs
		for (let i = 0; i < Config.inputs.length; i++) {
			if (Config.inputs[i].length < 1) {
				continue;
			}
			const Input = new Service.InputSource(Config.inputs[i], Config.inputs[i]);
			Input.setCharacteristic(Characteristic.Identifier, i + 1);
			Input.setCharacteristic(Characteristic.ConfiguredName, Config.inputs[i]);
			Input.setCharacteristic(
				Characteristic.IsConfigured,
				Characteristic.IsConfigured.CONFIGURED
			);
			Input.setCharacteristic(
				Characteristic.InputSourceType,
				Characteristic.InputSourceType.HDMI
			);
			Input.setCharacteristic(Characteristic.CurrentVisibilityState, 0);
			Input.setCharacteristic(Characteristic.TargetVisibilityState, 0);

			Input.getCharacteristic(Characteristic.TargetVisibilityState).on(
				CharacteristicEventTypes.SET,
				function (value, callback) {
					Input.setCharacteristic(Characteristic.CurrentVisibilityState, value);
					callback(null);
				}
			);

			this._accessory.addService(Input);
			this._service.addLinkedService(Input);

			this._Inputs.push(this.Input);
		}
	}
}
TV.prototype.setCharacteristics = Set;

module.exports = {
	TV: TV
};
