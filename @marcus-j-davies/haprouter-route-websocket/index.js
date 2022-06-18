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

const _MaxRetries = 5;
const _RetryWaitTime = 10000;

/* Route Class */
class WebsocketClass {
	/* Constructor */
	constructor(route, statusnotify) {
		this.StatusNotify = statusnotify;
		this.Route = route;
		this.Retries = 0;
		this._init();
	}
}

WebsocketClass.prototype._init = function () {
	try {
		this.Websocket = new WS(this.Route.uri);
		this.Websocket.on('open', () => this.HandleWSOpen());
		this.Websocket.on('error', (e) => this.WSError(e));
		this.Websocket.on('close', () => this.HandleWSClose());
	} catch (err) {
		this.StatusNotify({ success: false, message: err.message });
	}
};

WebsocketClass.prototype.process = async function (payload) {
	if (this.Websocket !== undefined) {
		const JSONs = JSON.stringify(payload);
		this.Websocket.send(JSONs, (e) => this.WSError(e));
	}
};

WebsocketClass.prototype.close = function () {
	if (this.Websocket !== undefined) {
		this.Websocket.removeAllListeners();
		this.Websocket.close();
	}
};

WebsocketClass.prototype.HandleWSOpen = function () {
	this.Retries = 0;
	this.StatusNotify({ success: true });
};

WebsocketClass.prototype.WSError = function (err) {
	if (err) {
		this.StatusNotify({ success: false, message: err.message });
	} else {
		this.StatusNotify({ success: true });
	}
};

WebsocketClass.prototype.HandleWSClose = function () {
	if (this.Retries >= _MaxRetries) {
		this.StatusNotify({
			success: false,
			message: 'Connection was closed. Recovery Failed.'
		});
	} else {
		this.Retries++;
		this.StatusNotify({
			success: false,
			message:
				'Connection was closed. Recovery Scheduled (' +
				this.Retries +
				'/' +
				_MaxRetries +
				')'
		});
		setTimeout(() => {
			this._init();
		}, _RetryWaitTime);
	}
};

module.exports = {
	Route: WebsocketClass,
	Inputs: Params,
	Name: Name,
	Icon: Icon
};
