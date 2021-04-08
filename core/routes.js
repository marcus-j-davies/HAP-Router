'use strict'
const fs = require('fs');
const dgram = require("dgram");
const mqtt = require('mqtt')
const axios = require('axios')
const util = require('./util')
const Websocket = require('ws')
const Path = require('path');

var UDPServer;
const MQTTCs = {};
const Websockets = {}

/* Clean Payload */
const CleanPayload = function(Payload, Type) {
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

/* WS */
const WEBSOCKET = function(route, payload) {
    payload = CleanPayload(payload, "WEBSOCKET")

    if (Websockets.hasOwnProperty(route.uri)) {
        Websockets[route.uri].send(JSON.stringify(payload));
    } else {
        const WS = new Websocket(route.uri);
        WS.on('open', () => HandleWSOpen(route, WS, payload));
        WS.on('error', (e) => WSError(e))
    }

}

const WSError = function(err) {
    console.log(" Could not connect to Websocket : " + err);
}

const HandleWSOpen = function(route, WS, Payload) {

    Websockets[route.uri] = WS;
    Websockets[route.uri].send(JSON.stringify(Payload));
}

/* HTTP */
const HTTP = function(route, payload) {
    payload = CleanPayload(payload, "HTTP")

    const CFG = {
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Homekit Device Stack'
        },
        url: route.destinationURI.replace('{{accessoryID}}', payload.accessory.accessoryID),
        method: 'post',
        data: payload
    }

    axios.request(CFG)
        .then(function(res) {})
        .catch(function(err) {
            console.log(" Could not send HTTP request : " + err);
        })
}

/* UDP */
const UDP = function(route, payload) {
    payload = CleanPayload(payload, "UDP");
    let JSONs = JSON.stringify(payload);

    if (UDPServer == null) {
        UDPServer = dgram.createSocket("udp4");
        UDPServer.bind(() => UDPConnected(JSONs, route))
    } else {
        UDPServer.send(JSONs, 0, JSONs.length, route.port, route.address, UDPDone)
    }
}

const UDPConnected = function(JSONString, Route) {
    UDPServer.setBroadcast(true);
    UDPServer.send(JSONString, 0, JSONString.length, Route.port, Route.address, UDPDone);
}

const UDPDone = function(e, n) {
    if (e) {
        console.log(" Could not broadcast UDP: " + e);
    }
}

/* MQTT */
const MQTT = function(route, payload) {
    payload = CleanPayload(payload, "MQTT");
    let JSONs = JSON.stringify(payload);

    if (MQTTCs.hasOwnProperty(route.broker)) {
        let Topic = route.topic.replace('{{accessoryID}}', payload.accessory.accessoryID);
        MQTTCs[route.broker].publish(Topic, JSONs, null, MQTTDone);
    } else {
        if (!route.hasOwnProperty("MQTTOptions")) {
            route.MQTTOptions = {};
        } else if (route.MQTTOptions.hasOwnProperty("username") && route.MQTTOptions.username.length < 1) {
            delete route.MQTTOptions["username"]
            delete route.MQTTOptions["password"]
        }
        const MQTTC = mqtt.connect(route.broker, route.MQTTOptions)
        let Topic = route.topic.replace('{{accessoryID}}', payload.accessory.accessoryID);
        MQTTC.on('error', MQTTError);
        MQTTC.on('connect', () => MQTTConnected(JSONs, route, Topic, MQTTC));
    }
}

const MQTTError = function(err) {
    console.log(" Could not connect to MQTT Broker : " + err);
}

const MQTTConnected = function(JSONString, Route, Topic, Client) {
    MQTTCs[Route.broker] = Client;
    MQTTCs[Route.broker].publish(Topic, JSONString, null, MQTTDone);
}

const MQTTDone = function() {}

/* FILE */
const FILE = function(route, payload) {
    payload = CleanPayload(payload, "FILE");

    let DirPath = Path.join(util.RootPath, route.directory.replace('{{accessoryID}}', payload.accessory.accessoryID))

    fs.mkdirSync(DirPath, {
        recursive: true
    }, function(err) {
        if (err) {
            console.log(" Could not write output to file.");
        }
    });

    const DT = new Date().getTime();
    const FileName = DT + '_' + payload.accessory.accessoryID + ".json"
    let _Path = Path.join(DirPath, FileName);

    fs.writeFile(_Path, JSON.stringify(payload), 'utf8', FileDone);
}

const FileDone = function(err) {
    if (err) {
        console.log(" Could not write output to file.");
    }
}

module.exports = {
    "HTTP": HTTP,
    "UDP": UDP,
    "FILE": FILE,
    "MQTT": MQTT,
    "WEBSOCKET": WEBSOCKET
}