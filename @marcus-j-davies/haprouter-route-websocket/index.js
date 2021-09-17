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

		try {
			this.Websocket = new WS(route.uri);
			this.Websocket.on('open', () => this.HandleWSOpen());
			this.Websocket.on('error', (e) => this.WSError(e));
			this.Websocket.on('close', () => this.HandleWSClose());
		} catch (err) {
			statusnotify(false, err.message);
		}
	}
}

WebsocketClass.prototype.process = async function (payload) {
	if (this.Websocket !== undefined) {
		const JSONs = JSON.stringify(payload);
		this.Websocket.send(JSONs, (e) => this.WSError(e));
	}
};

WebsocketClass.prototype.close = function () {
	if (this.Websocket !== undefined) {
		this.Websocket.close();
	}
};

WebsocketClass.prototype.HandleWSOpen = function () {
	this.StatusNotify(true);
};

WebsocketClass.prototype.WSError = function (err) {
	if (err) {
		this.StatusNotify(false, err.message);
	} else {
		this.StatusNotify(true);
	}
};

WebsocketClass.prototype.HandleWSClose = function () {
	this.StatusNotify(false, 'Connection was closed.');
};

module.exports = {
	Route: WebsocketClass,
	Inputs: Params,
	Name: Name,
	Icon: Icon
};
