'use strict'

const { Alarm } = require("./Alarm")
const { ContactSensor } = require("./ContactSensor")
const { Outlet } = require("./Outlet")
const { Bridge } = require("./Bridge")
const { Switch } = require("./Switch")
const { Fan } = require("./Fan")
const { MotionSensor } = require("./MotionSensor")
const { Lock } = require("./Lock")
const { LightBulb } = require("./LightBulb")

let Types = {

    "CONTACT_SENSOR": {
        Label: "Contact Sensor",
        Icon: "CONTACT_SENSOR.png",
        SupportsRouting: true,
        Class: ContactSensor,
        ConfigProperties: []
    },
    "ALARM": {
        Label: "Intruder Alarm",
        Icon: "INTRUDER_ALARM.png",
        SupportsRouting: true,
        Class: Alarm,
        ConfigProperties: []
    },
    "OUTLET": {
        Label: "Power Outlet",
        Icon: "OUTLET.png",
        SupportsRouting: true,
        Class: Outlet,
        ConfigProperties: []
    },
    "SWITCH": {
        Label: "Basic Switch",
        Icon: "SWITCH.png",
        SupportsRouting: true,
        Class: Switch,
        ConfigProperties: []
    },
    "FAN": {
        Label: "Fan",
        Icon: "FAN.png",
        SupportsRouting: true,
        Class: Fan,
        ConfigProperties: []
    },
    "MOTION_SENSOR": {
        Label: "Motion Sensor",
        Icon: "MOTION_SENSOR.png",
        SupportsRouting: true,
        Class: MotionSensor,
        ConfigProperties: []
    },
    "LOCK": {
        Label: "Lock",
        Icon: "LOCK.png",
        SupportsRouting: true,
        Class: Lock,
        ConfigProperties: []
    },
    "LIGHT_BULB": {
        Label: "Smart Bulb",
        Icon: "LIGHT.png",
        SupportsRouting: true,
        Class: LightBulb,
        ConfigProperties: [
            {id:"supportsBrightness", label:"Supports Brightness", type:"checkbox", default:false},
            {id:"colorMode", label:"Color Mode", type:"select", options:["hue","temperature"], default:"hue"}
        ]
    }
}

module.exports = {
    Types: Types,
    Bridge: Bridge
}
