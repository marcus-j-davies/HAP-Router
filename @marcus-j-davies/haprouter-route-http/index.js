'use strict'
const axios = require('axios')

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
        id: "destinationURI",
        label: "HTTP URI"
    }
]

/*  Metadata */
const Name = "HTTP POST Output";
const Icon = "icon.png";

/* Route Class */
class HTTPRoute {

    /* Constructor */
    constructor(route) {
        this.Route = route
    }
}

HTTPRoute.prototype.process = async function (payload) {

    payload = CleanPayload(payload, "HTTP")

    let CFG = {
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'HAP Router'
        },
        method: 'post',
        url: this.Route.destinationURI.replace('{{accessoryID}}', payload.accessory.accessoryID),
        data: payload
    }
    
    try{
        let Res = await axios.request(CFG)
    }
    catch(err){
        console.log(" HTTP Route error: "+err)
    }
    
}

HTTPRoute.prototype.close = function (reason) {
}

module.exports = {
    "Route": HTTPRoute,
    "Inputs": Params,
    "Name": Name,
    "Icon": Icon
}