'use strict'
const mqtt = require('mqtt')

/* UI Params */
const Params = [
    {
        id: "mqttbroker",
        label: "MQTT Broker"
    },
    {
        id: "mqttusername",
        label: "Username"
    },
    {
        id: "mqttpassword",
        label: "Password"
    },
    {
        id: "mqtttopic",
        label: "Topic"
    }
]

/*  Metadata */
const Name = "MQTT Message";
const Icon = "icon.png";

/* Route Class */
class MQTTRoute {

    /* Constructor */
    constructor(route) {

        this.Route = route;

        let Options = {
            username: route.mqttusername,
            password: route.mqttpassword
        }

        this.MQTTBroker = mqtt.connect(route.mqttbroker, Options)
        this.MQTTBroker.on('connect', () => this.mqttConnected())
        this.MQTTBroker.on('error', (e) => this.mqttError(e))
    }
}

MQTTRoute.prototype.process = async function (payload) {
    let JSONs = JSON.stringify(payload);
    let T = this.Route.mqtttopic.replace("{{AccessoryID}}", payload.accessory.AccessoryID)
    this.MQTTBroker.publish(T, JSONs, null, () => { });
}

MQTTRoute.prototype.close = function (reason) {
    this.MQTTBroker.end();
}

MQTTRoute.prototype.mqttConnected = function () {
    console.log(" MQTT Route ready.");
}

MQTTRoute.prototype.mqttError = function (err) {
    console.log(" MQTT Route error: " + err);
}

module.exports = {
    "Route": MQTTRoute,
    "Inputs": Params,
    "Name": Name,
    "Icon": Icon
}