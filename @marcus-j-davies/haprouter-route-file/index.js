'use strict';
const path = require('path');
const fs = require('fs');

/* UI Params */
const Params = [
	{
		id: 'directory',
		label: 'Storage Location/Directoy'
	}
];

/*  Metadata */
const Name = 'File Output';
const Icon = 'icon.png';

/* Route Class */
class File {
	/* Constructor */
	constructor(route, statusnotify) {
		this.Route = route;
		statusnotify(true);
	}
}

File.prototype.process = async function (payload) {
	const JSONs = JSON.stringify(payload);

	const Directory = this.Route.directory.replace(
		'{{AccessoryID}}',
		payload.accessory.AccessoryID
	);

	if (!fs.existsSync(Directory)) {
		try {
			fs.mkdirSync(Directory, { recursive: true });
		} catch (err) {
			console.log(' FILE Route error: ' + err);
			return;
		}
	}

	const DT = new Date().getTime();
	const FileName = DT + '_' + payload.accessory.AccessoryID + '.json';

	const _Path = path.join(Directory, FileName);

	try {
		fs.writeFileSync(_Path, JSONs, 'utf8');
	} catch (err) {
		console.log(' FILE Route error: ' + err);
	}
};

File.prototype.close = function (reason) {};

module.exports = {
	Route: File,
	Inputs: Params,
	Name: Name,
	Icon: Icon
};
