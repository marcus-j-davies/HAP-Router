const dgram = require('dgram');

/* UI Params */
const Params = [
	{
		id: 'address',
		label: 'Broadcast Address'
	},
	{
		id: 'port',
		label: 'Broadcast Port',
		type: 'number'
	}
];

/*  Metadata */
const Name = 'UDP Broadcast';
const Icon = 'icon.png';

/* Route Class */
class UDP {
	/* Constructor */
	constructor(route, statusnotify) {
		this.Route = route;
		this.StatusNotify = statusnotify;

		try {
			this.UDPServer = dgram.createSocket('udp4');
			this.UDPServer.on('error', (e) => this.UDPBindError(e));
			this.UDPServer.bind(() => this.UDPConnected());
		} catch (err) {
			statusnotify({ success: false, message: err.message });
		}
	}
}

UDP.prototype.process = async function (payload) {
	if (this.UDPServer !== undefined) {
		const JSONs = JSON.stringify(payload);
		try {
			this.UDPServer.send(
				JSONs,
				0,
				JSONs.length,
				this.Route.port,
				this.Route.address,
				(e) => this.UDPDone(e)
			);
		} catch (err) {
			this.StatusNotify({ success: false, message: err.message });
		}
	}
};

UDP.prototype.close = function () {
	if (this.UDPServer !== undefined) {
		this.UDPServer.close();
	}
};

UDP.prototype.UDPBindError = function (err) {
	this.StatusNotify({ success: false, message: err.message });
};

UDP.prototype.UDPConnected = function () {
	this.UDPServer.setBroadcast(true);
	this.StatusNotify({ success: true });
};

UDP.prototype.UDPDone = function (err) {
	if (err) {
		this.StatusNotify({ success: false, message: err.message });
	} else {
		this.StatusNotify({ success: true });
	}
};

module.exports = {
	Route: UDP,
	Inputs: Params,
	Name: Name,
	Icon: Icon
};
