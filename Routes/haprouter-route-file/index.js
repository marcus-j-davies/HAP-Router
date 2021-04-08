'use strict'
const path = require("path");
const fs = require("fs");

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
    {
        id: "directory",
        label: "Storage Location/Directoy"
    }
]

/*  Metadata */
const Name = "File Output";
const Icon = "icon.png";

/* Route Class */
class File {

    /* Constructor */
    constructor(route) {
        this.Route = route;
    }

}

File.prototype.process = async function (payload) {

    payload = CleanPayload(payload, "FILE")
    let JSONs = JSON.stringify(payload);

    let Directory = this.Route.directory.replace("{{accessoryID}}", payload.accessory.accessoryID)

    if (!fs.existsSync(Directory)) {
        try {
            fs.mkdirSync(Directory, { recursive: true });
        }
        catch (err) {
            console.log(" FILE Route error: "+err)
            return;
        }
    }

    let DT = new Date().getTime();
    let FileName = DT + '_' + payload.accessory.accessoryID + ".json"

    let _Path = path.join(Directory, FileName);

    try {
        fs.writeFileSync(_Path, JSONs, 'utf8')
    }
    catch (err) {
        console.log(" FILE Route error: "+err)
    }
}

File.prototype.close = function (reason) {
}

module.exports = {
    "Route": File,
    "Inputs": Params,
    "Name": Name,
    "Icon": Icon
}