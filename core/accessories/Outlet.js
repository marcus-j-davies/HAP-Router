'use strict'

const { Service, Characteristic, Catagories} = require("hap-nodejs");
const {BasicSet, BaseAccessory} = require("./BaseAccessory")

class Outlet extends BaseAccessory {

    constructor(Config) {

        super(Config, Catagories.OUTLET);

        this._service = new Service.Outlet(Config.name, Config.name);

        this._service.setCharacteristic(Characteristic.On, false);
        this._service.setCharacteristic(Characteristic.OutletInUse, false);
        this._Properties["On"] = false;
        this._Properties["OutletInUse"] = false;

        const EventStruct = {
            "Get": ["On", "OutletInUse"],
            "Set": ["On"]
        }

        this._wireUpEvents(this._service, EventStruct);
        this._accessory.addService(this._service);
    }
}
Outlet.prototype.setCharacteristics = BasicSet;

module.exports  = {
    Outlet:Outlet
}
