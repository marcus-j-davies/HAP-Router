'use strict'
const WS = require("ws");

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
        id: "uri",
        label: "Websocket Address"
    }
]

/*  Metadata */
const Name = "Websocket";
const Icon = "icon.png";


/* Route Class */
class WebsocketClass {

    /* Constructor */
    constructor(route) {

        this.Websocket = new WS(route.uri);

        this.Websocket.on('open', () => this.HandleWSOpen());
        this.Websocket.on('error', (e) => this.WSError(e))

    }
}


WebsocketClass.prototype.process = async function (payload) {

    payload = CleanPayload(payload, "WEBSOCKET")
    let JSONs = JSON.stringify(payload);

    this.Websocket.send(JSONs);

}

WebsocketClass.prototype.close = function () {
    this.Websocket.close();
}


WebsocketClass.prototype.HandleWSOpen = function () {
    console.log(" WEBSOCKET Route ready.");
}

WebsocketClass.prototype.WSError = function (err) {
    console.log(" WEBSOCKET Route error: " + err);
}

module.exports = {
    "Route": WebsocketClass,
    "Inputs": Params,
    "Name": Name,
    "Icon": Icon
}