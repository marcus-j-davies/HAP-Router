'use strict'

const { Service, Characteristic, Categories} = require("hap-nodejs");
const {BaseAccessory} = require("./BaseAccessory")

class Bridge extends BaseAccessory {

    constructor(Config) {
        Config.name = "HAP Router Bridge"
        super(Config, Categories.BRIDGE);
        this._accessory.getService(Service.AccessoryInformation)
            .setCharacteristic(Characteristic.Model, "HAP Router 4")

    }

}

module.exports  = {
    Bridge:Bridge
}
