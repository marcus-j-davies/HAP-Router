'use strict';
const WS = require('ws');

/* UI Params */
const Params = [
	{
		id: 'uri',
		label: 'Websocket Address'
	}
];

/*  Metadata */
const Name = 'Websocket';
const Icon = 'icon.png';

/* Route Class */
class WebsocketClass {
	/* Constructor */
	constructor(route, statusnotify) {
		this.StatusNotify = statusnotify;
		this.Websocket = new WS(route.uri);
		this.Websocket.on('open', () => this.HandleWSOpen());
		this.Websocket.on('error', (e) => this.WSError(e));
	}
}

WebsocketClass.prototype.process = async function (payload) {
	const JSONs = JSON.stringify(payload);
	this.Websocket.send(JSONs);
};

WebsocketClass.prototype.close = function (reason) {
	this.Websocket.close();
};

WebsocketClass.prototype.HandleWSOpen = function () {
	this.StatusNotify(true);
};

WebsocketClass.prototype.WSError = function (err) {
	this.StatusNotify(false, 'Error: ' + err.message);
};

module.exports = {
	Route: WebsocketClass,
	Inputs: Params,
	Name: Name,
	Icon: Icon
};
