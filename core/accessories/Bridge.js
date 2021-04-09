'use strict'

const { Service, Characteristic, Catagories} = require("hap-nodejs");
const {BaseAccessory} = require("./BaseAccessory")

class Bridge extends BaseAccessory {

    constructor(Config) {
        Config.name = "HAP Router Bridge"
        super(Config, Catagories.BRIDGE);
        this._accessory.getService(Service.AccessoryInformation)
            .setCharacteristic(Characteristic.Model, "HAP Router 4")

    }

}

module.exports  = {
    Bridge:Bridge
}
