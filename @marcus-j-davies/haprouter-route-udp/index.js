'use strict'
const dgram = require("dgram");

/* UI Params */
const Params = [
    {
        id: "address",
        label: "Broadcast Address"
    },
    {
        id: "port",
        label: "Broadcast Port"
    }
]

/*  Metadata */
const Name = "UDP Broadcast";
const Icon = "icon.png";

/* Route Class */
class UDP {

    /* Constructor */
    constructor(route,statusnotify) {

        this.Route = route;
        this.StatusNotify = statusnotify
        this.UDPServer = dgram.createSocket("udp4");
        this.UDPServer.bind(() => this.UDPConnected())
    }
}

UDP.prototype.process = async function (payload) {
    let JSONs = JSON.stringify(payload);
    this.UDPServer.send(JSONs, 0, JSONs.length, this.Route.port, this.Route.address, this.UDPDone);
}

UDP.prototype.close = function (reason) {
    this.UDPServer.close();
}

UDP.prototype.UDPConnected = function () {
    this.UDPServer.setBroadcast(true);
    this.StatusNotify(true);
}

UDP.prototype.UDPDone = function (e, n) {
}

module.exports = {
    "Route": UDP,
    "Inputs": Params,
    "Name": Name,
    "Icon": Icon
}