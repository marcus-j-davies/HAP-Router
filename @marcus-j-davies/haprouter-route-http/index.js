const axios = require('axios');

/* UI Params */
const Params = [
	{
		id: 'destinationURI',
		label: 'HTTP URI'
	},
	{
		id: 'username',
		label: 'HTTP Username (optional)'
	},
	{
		id: 'password',
		label: 'HTTP Password (optional)',
		type: 'password'
	}
];

/*  Metadata */
const Name = 'HTTP POST Output';
const Icon = 'icon.png';

/* Route Class */
class HTTPRoute {
	/* Constructor */
	constructor(route, statusnotify) {
		this.StatusNotify = statusnotify;
		this.Route = route;
		statusnotify({ success: true });
	}
}

HTTPRoute.prototype.process = async function (payload) {
	const CFG = {
		headers: {
			'Content-Type': 'application/json',
			'User-Agent': 'HAP Router'
		},
		method: 'post',
		url: this.Route.destinationURI.replace(
			'{{AccessoryID}}',
			payload.accessory.AccessoryID
		),
		data: payload
	};

	if (
		this.Route.username !== undefined &&
		this.Route.username.length > 0 &&
		this.Route.password !== undefined &&
		this.Route.password.length > 0
	) {
		CFG.auth = {};
		CFG.auth.username = this.Route.username;
		CFG.auth.password = this.Route.password;
	}

	try {
		await axios.request(CFG);
		this.StatusNotify({ success: true });
	} catch (err) {
		if (err) {
			this.StatusNotify({ success: false, message: err.message });
		}
	}
};

HTTPRoute.prototype.close = function () {};

module.exports = {
	Route: HTTPRoute,
	Inputs: Params,
	Name: Name,
	Icon: Icon
};
