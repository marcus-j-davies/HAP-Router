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
const { TV } = require("./Television")
const { GarageDoor } = require("./GarageDoorOpener")
const { Thermostat } = require("./Thermostat")
const { Temperature } = require("./TemperatureSensor")
const { Smoke } = require("./SmokeSensor")
const { Leak } = require("./LeakSensor")
const { LightSensor } = require("./LightSensor")
const { Camera } = require("./Camera/Camera")


let Types = {

    "CONTACT_SENSOR": {
        Label: "Contact Sensor",
        Icon: "CONTACT_SENSOR.png",
        SupportsRouting: true,
        Class: ContactSensor,
        ConfigProperties: []
    },
    "INTRUDER_ALARM": {
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
            {id:"colorMode", label:"Color Mode", type:"select", options:["hue","temperature","none"], default:"hue"},
            {id:"supportsBrightness", label:"Supports Brightness", type:"checkbox", default:false}
        ]
    },
    "TELEVISION": {
        Label: "Smart TV",
        Icon: "TV.png",
        SupportsRouting: true,
        Class: TV,
        ConfigProperties: [
            {id:"inputs", label:"Source Inputs", type:"array", default:["HDMI 1","HDMI 2","HDMI 3"]}
        ]
    },
    "GARAG_DOOR_OPENER": {
        Label: "Garage Door Opener",
        Icon: "GARAGE.png",
        SupportsRouting: true,
        Class: GarageDoor,
        ConfigProperties: []
    },
    "THERMOSTAT": {
        Label: "Thermostat",
        Icon: "THERMOSTAT.png",
        SupportsRouting: true,
        Class: Thermostat,
        ConfigProperties: []
    },
    "TEMPERATURE_SENSOR": {
        Label: "Temperature Sensor",
        Icon: "TEMPERATURE_SENSOR.png",
        SupportsRouting: true,
        Class: Temperature,
        ConfigProperties: []
    },
    "SMOKE_SENSOR": {
        Label: "Smoke Sensor",
        Icon: "SMOKE_SENSOR.png",
        SupportsRouting: true,
        Class: Smoke,
        ConfigProperties: []
    },
    "LEAK_SENSOR": {
        Label: "Leak Sensor",
        Icon: "LEAK_SENSOR.png",
        SupportsRouting: true,
        Class: Leak,
        ConfigProperties: []
    },
    "LIGHT_SENSOR": {
        Label: "Light Sensor",
        Icon: "LIGHT_SENSOR.png",
        SupportsRouting: true,
        Class: LightSensor,
        ConfigProperties: []
    },
    "CAMERA": {
        Label: "CCTV Camera",
        Icon: "CAMERA.png",
        SupportsRouting: true,
        Class: Camera,
        ConfigProperties: [
            {id:"processor", label:"Stream Processor", type:"text", default:"ffmpeg"},
            {id:"liveStreamSource", label:"Live Stream Source", type:"text", default:"-rtsp_transport tcp -i rtsp://username:password@ip:port/StreamURI"},
            {id:"stillImageSource", label:"Still Image Source", type:"text", default:"http://username:password@ip:port/SnapshotURI"},
            {id:"enableDoorbellService", label:"Enable Door Service", type:"checkbox", default:false},
            {id:"enableMotionDetectionService", label:"Enable Motion Detection Service", type:"checkbox", default:false},
            {id:"maxFPS", label:"Max FPS", type:"numeric", default:10},
            {id:"snapshotCacheTime", label:"Frame Snapshot Age (seconds)", type:"numeric", default:60},
            {id:"maxBitrate", label:"Max Bit Rate", type:"numeric", default:300},
            {id:"packetSize", label:"Max Packet Size", type:"numeric", default:1316},
            {id:"maxStreams", label:"Max Stream Clients", type:"numeric", default:2},
            {id:"maxWidthHeight", label:"Max Width/Hight (WxH)", type:"text", default:"1280x720"},
            {id:"mapVideo", label:"Video Map", type:"text", default:"0:0"},
            {id:"videoEncoder", label:"Video Encoder", type:"text", default:"libx264"},
            {id:"honourRequestedResolution", label:"Honour Requested Resolution", type:"checkbox", default:true},
            {id:"enableAudio", label:"Enable Audio Streaming", type:"checkbox", default:false},
            {id:"mapAudio", label:"Audio Map", type:"text", default:"0:1"},
            {id:"audioEncoder", label:"Audio Encoder", type:"text", default:"libfdk_aac"},
            {id:"additionalCommandline", label:"Additional Processor Args", type:"text", default:"-tune zerolatency -preset ultrafast"},
        ]
    }
}

module.exports = {
    Types: Types,
    Bridge: Bridge
}
