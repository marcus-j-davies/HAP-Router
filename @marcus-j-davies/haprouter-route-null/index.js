'use strict'

/* UI Params */
const Params = [
]

/*  Metadata */
const Name = "Silent Output";
const Icon = "icon.png";

/* Route Class */
class Null {

    /* Constructor */
    constructor(route) {
    }
}

Null.prototype.process = async function (payload) {
}

Null.prototype.close = function (reason) {
}

module.exports = {
    "Route": Null,
    "Inputs": Params,
    "Name": Name,
    "Icon": Icon
}