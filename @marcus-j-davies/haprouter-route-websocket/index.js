'use strict'
const WS = require("ws");

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