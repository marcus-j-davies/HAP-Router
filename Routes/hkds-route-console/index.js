'use strict'

/* Clean Payload */
const CleanPayload = function (Payload, Type) {

    const Copy = JSON.parse(JSON.stringify(Payload));

    Copy["route_type"] = Type;
    Copy["route_name"] = Payload.accessory.route

    delete Copy.accessory.pincode;
    delete Copy.accessory.username;
    delete Copy.accessory.setupID;
    delete Copy.accessory.route;
    delete Copy.accessory.description;
    delete Copy.accessory.serialNumber;

    return Copy;

}

/* UI Params */
const Params = [
]

/*  Metadata */
const Name = "Console Output";
const Icon = "icon.png";

/* Route Class */
class ConsoleClass {

    /* Constructor */
    constructor(route) {
    }
}

ConsoleClass.prototype.process = async function (payload) {
    payload = CleanPayload(payload, "CONSOLE")
    console.log(payload)
}

ConsoleClass.prototype.close = function (reason) {
}

module.exports = {
    "Route": ConsoleClass,
    "Inputs": Params,
    "Name": Name,
    "Icon": Icon
}