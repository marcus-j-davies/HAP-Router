/* UI Params */
const Params = [];

/*  Metadata */
const Name = 'Silent Output';
const Icon = 'icon.png';

/* Route Class */
class Null {
	/* Constructor */
	constructor(route, statusnotify) {
		statusnotify(true);
	}
}

Null.prototype.process = async function () {};

Null.prototype.close = function () {};

module.exports = {
	Route: Null,
	Inputs: Params,
	Name: Name,
	Icon: Icon
};
