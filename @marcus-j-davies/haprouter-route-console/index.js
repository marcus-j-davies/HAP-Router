'use strict'

/* UI Params */
const Params = [
]

/*  Metadata */
const Name = "Console Output";
const Icon = "icon.png";

/* Route Class */
class ConsoleClass {

    /* Constructor */
    constructor(route, statusnotify) {
        statusnotify(true)
    }
}

ConsoleClass.prototype.process = async function (payload) {
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