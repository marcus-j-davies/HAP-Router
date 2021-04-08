'use strict'
const mqtt = require('mqtt')
const util = require('./util');
const config = require(util.ConfigPath);

var MQTTC;
var _Accessories;
var CallBack;

const MQTTError = function(Error) {
    console.log(" Could not connect to MQTT Broker : " + Error);
    process.exit(0)
}

const MQTTConnected = function(Client) {
    MQTTC = Client;
    MQTTC.subscribe(config.MQTTTopic, MQTTSubscribeDone)
}

const MQTTSubscribeDone = function(error) {
    if (!error) {
        MQTTC.on('message', MQTTMessageReceved)
        CallBack();
    } else {
        console.log(" Could not subscribe to Topic : " + err);
        process.exit(0)
    }
}

const MQTTMessageReceved = function(topic, message) {
    try {
        const sPL = message.toString();
        const PL = JSON.parse(sPL);
        const TargetAccessory = topic.split('/').pop()

        const Ac = _Accessories[TargetAccessory]

        if (Ac != null) {
            Ac.setCharacteristics(PL)
        }
    } catch (e) {
        console.log(" MQTT input could not be actioned -> MSG: " + sPL + ", Accessory ID: " + TargetAccessory + "");
    }

}

const MQTT = function(Accesories, CB) {
    _Accessories = Accesories;
    CallBack = CB;

    if (config.hasOwnProperty("enableIncomingMQTT") && config.enableIncomingMQTT == 'true') {
        if (!config.hasOwnProperty("MQTTOptions")) {
            config.MQTTOptions = {};
        } else if (config.MQTTOptions.username.length < 1) {
            delete config.MQTTOptions["username"]
            delete config.MQTTOptions["password"]
        }

        console.log(" Starting MQTT Client")

        try {
            const _MQTTC = mqtt.connect(config.MQTTBroker, config.MQTTOptions)
            _MQTTC.on('error', MQTTError);
            _MQTTC.on('connect', () => MQTTConnected(_MQTTC))

        } catch (err) {
            console.log(" Could not connect to MQTT Broker : " + err);
            process.exit(0);
        }

    } else {
        CallBack();
    }

}

module.exports = {
    MQTT: MQTT
}