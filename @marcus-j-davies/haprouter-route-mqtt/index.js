const mqtt = require('mqtt');

/* UI Params */
const Params = [
	{
		id: 'mqttbroker',
		label: 'MQTT Broker'
	},
	{
		id: 'mqttusername',
		label: 'Username'
	},
	{
		id: 'mqttpassword',
		label: 'Password'
	},
	{
		id: 'mqtttopic',
		label: 'Topic'
	}
];

/*  Metadata */
const Name = 'MQTT Message';
const Icon = 'icon.png';

/* Route Class */
class MQTTRoute {
	/* Constructor */
	constructor(route, statusnotify) {
		this.Route = route;
		this.StatusNotify = statusnotify;

		const Options = {
			username: route.mqttusername,
			password: route.mqttpassword
		};

		try {
			this.MQTTBroker = mqtt.connect(route.mqttbroker, Options);
			this.MQTTBroker.on('connect', () => this.mqttConnected());
			this.MQTTBroker.on('error', (e) => this.mqttError(e));
			this.MQTTBroker.on('close', () => this.mqttClose());
		} catch (err) {
			statusnotify(false, err.message);
		}
	}
}

MQTTRoute.prototype.process = async function (payload) {
	if (this.MQTTBroker !== undefined) {
		const JSONs = JSON.stringify(payload);
		const T = this.Route.mqtttopic.replace(
			'{{AccessoryID}}',
			payload.accessory.AccessoryID
		);
		this.MQTTBroker.publish(T, JSONs, null, (e) => this.mqttError(e));
	}
};

MQTTRoute.prototype.close = function () {
	if (this.MQTTBroker !== undefined) {
		this.MQTTBroker.end();
	}
};

MQTTRoute.prototype.mqttClose = function () {
	this.StatusNotify(false, 'Connection was closed.');
};

MQTTRoute.prototype.mqttConnected = function () {
	this.StatusNotify(true);
};

MQTTRoute.prototype.mqttError = function (err) {
	if (err) {
		this.StatusNotify(false, err.message);
	} else {
		this.StatusNotify(true);
	}
};

module.exports = {
	Route: MQTTRoute,
	Inputs: Params,
	Name: Name,
	Icon: Icon
};
