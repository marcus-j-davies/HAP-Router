'use strict'
const mqtt = require('mqtt')

/* Clean Payload */
const CleanPayload = function (Payload, Type) {

    const Copy = JSON.parse(JSON.stringify(Payload));

    Copy["route_type"] = Type;
    Copy["route_name"] = Payload.accessory.route

    delete Copy.accessory.pincode;
    delete Copy.accessory.username;
    delete Copy.accessory.setupID;
    delete Copy.accessory.route;
    delete Copy.accessory.description;
    delete Copy.accessory.serialNumber;

    return Copy;

}

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

    payload = CleanPayload(payload, "MQTT")
    let JSONs = JSON.stringify(payload);

    let T = this.Route.mqtttopic.replace("{{accessoryID}}", payload.accessory.accessoryID)
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