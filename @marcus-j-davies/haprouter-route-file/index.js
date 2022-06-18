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
		statusnotify({success:true});
		this.StatusNotify = statusnotify;
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
			this.StatusNotify({success:false,message:err.message});
		
			return;
		}
	}

	const DT = new Date().getTime();
	const FileName = DT + '_' + payload.accessory.AccessoryID + '.json';

	const _Path = path.join(Directory, FileName);

	try {
		fs.writeFileSync(_Path, JSONs, 'utf8');
		this.StatusNotify({success:true});
	} catch (err) {
		this.StatusNotify({success:false,message:err.message});
	}
};

File.prototype.close = function () {};

module.exports = {
	Route: File,
	Inputs: Params,
	Name: Name,
	Icon: Icon
};
