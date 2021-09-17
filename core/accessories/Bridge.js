const { Categories } = require('hap-nodejs');
const { BaseAccessory } = require('./BaseAccessory');

class Bridge extends BaseAccessory {
	constructor(Config) {
		Config.name = 'HAP Router Bridge';
		Config.model = 'HAP Router V2';
		Config.manufacturer = 'Marcus Davies';
		super(Config, Categories.BRIDGE);
	}
}

module.exports = {
	Bridge: Bridge
};
