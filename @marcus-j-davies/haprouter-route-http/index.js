'use strict';
const axios = require('axios');

/* UI Params */
const Params = [
	{
		id: 'destinationURI',
		label: 'HTTP URI'
	}
];

/*  Metadata */
const Name = 'HTTP POST Output';
const Icon = 'icon.png';

/* Route Class */
class HTTPRoute {
	/* Constructor */
	constructor(route, statusnotify) {
		this.Route = route;
		statusnotify(true);
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

	try {
		await axios.request(CFG);
	} catch (err) {
		console.log(' HTTP Route error: ' + err);
	}
};

HTTPRoute.prototype.close = function (reason) {};

module.exports = {
	Route: HTTPRoute,
	Inputs: Params,
	Name: Name,
	Icon: Icon
};
