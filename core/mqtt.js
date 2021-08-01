'use strict';
const mqtt = require('mqtt');
const UTIL = require('./util');
const CONFIG = require(UTIL.ConfigPath);

var MQTTC;
var _Accessories;
var CallBack;

const MQTTError = function (Error) {
	console.log(' Could not connect to MQTT Broker : ' + Error);
	process.exit(0);
};

const MQTTConnected = function (Client) {
	MQTTC = Client;
	MQTTC.subscribe(CONFIG.MQTTTopic, MQTTSubscribeDone);
};

const MQTTSubscribeDone = function (error) {
	if (!error) {
		MQTTC.on('message', MQTTMessageReceved);
		CallBack();
	} else {
		console.log(' Could not subscribe to Topic : ' + error);
		process.exit(0);
	}
};

const MQTTMessageReceved = function (topic, message) {
	try {
		const sPL = message.toString();
		const PL = JSON.parse(sPL);
		const TargetAccessory = topic.split('/').pop();

		const Ac = _Accessories[TargetAccessory];

		if (Ac !== undefined) {
			Ac.setCharacteristics(PL);
		}
	} catch (e) {
		console.log(
			' MQTT input could not be actioned -> MSG: ' +
				message.toString() +
				', Topic: ' +
				topic +
				''
		);
	}
};

const MQTT = function (Accesories, CB) {
	_Accessories = Accesories;
	CallBack = CB;

	if (CONFIG.enableIncomingMQTT === true) {
		const Options = {};

		const OptionKeys = Object.keys(CONFIG.MQTTOptions);
		OptionKeys.forEach((K) => {
			Options[K] = CONFIG.MQTTOptions[K];
		});

		if (Options.hasOwnProperty('username') && Options.username.length < 1) {
			delete Options.username;
			delete Options.password;
		}

		console.log(' Starting MQTT Client');

		try {
			const _MQTTC = mqtt.connect(CONFIG.MQTTBroker, Options);
			_MQTTC.on('error', MQTTError);
			_MQTTC.on('connect', () => MQTTConnected(_MQTTC));
		} catch (err) {
			console.log(' Could not connect to MQTT Broker : ' + err);
			process.exit(0);
		}
	} else {
		CallBack();
	}
};

module.exports = {
	MQTT: MQTT
};
