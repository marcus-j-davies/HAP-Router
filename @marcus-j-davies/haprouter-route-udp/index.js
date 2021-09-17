const dgram = require('dgram');

/* UI Params */
const Params = [
	{
		id: 'address',
		label: 'Broadcast Address'
	},
	{
		id: 'port',
		label: 'Broadcast Port'
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
			statusnotify(false, err.message);
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
				this.UDPDone
			);
		} catch (err) {
			this.StatusNotify(false, err.message);
		}
	}
};

UDP.prototype.close = function () {
	if (this.UDPServer !== undefined) {
		this.UDPServer.close();
	}
};

UDP.prototype.UDPBindError = function (err) {
	this.StatusNotify(false, err.message);
};

UDP.prototype.UDPConnected = function () {
	this.UDPServer.setBroadcast(true);
	this.StatusNotify(true);
};

UDP.prototype.UDPDone = function (err) {
	if (err) {
		this.StatusNotify(false, err.message);
	} else {
		this.StatusNotify(true);
	}
};

module.exports = {
	Route: UDP,
	Inputs: Params,
	Name: Name,
	Icon: Icon
};
