'use strict'
const dgram = require("dgram");

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
    constructor(route) {

        this.Route = route;

        this.UDPServer = dgram.createSocket("udp4");
        this.UDPServer.bind(() => this.UDPConnected())
    }
}

UDP.prototype.process = async function (payload) {

    payload = CleanPayload(payload, "UDP")
    let JSONs = JSON.stringify(payload);
    this.UDPServer.send(JSONs, 0, JSONs.length, this.Route.port, this.Route.address, this.UDPDone);
}

UDP.prototype.close = function (reason) {
    this.UDPServer.close();
}

UDP.prototype.UDPConnected = function () {
    this.UDPServer.setBroadcast(true);
    console.log(" UDP Route ready.");
}

UDP.prototype.UDPDone = function (e, n) {
    if (e) {
        console.log(" UDP Route error: " + e);
    }
}

module.exports = {
    "Route": UDP,
    "Inputs": Params,
    "Name": Name,
    "Icon": Icon
}