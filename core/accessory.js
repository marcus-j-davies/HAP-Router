'use strict'
const HapNodeJS = require("hap-nodejs");
const Service = HapNodeJS.Service;
const Accessory = HapNodeJS.Accessory;
const Characteristic = HapNodeJS.Characteristic;
const uuid = HapNodeJS.uuid;
const CharacteristicEventTypes = HapNodeJS.CharacteristicEventTypes;
const AccessoryEventTypes = HapNodeJS.AccessoryEventTypes;
const EventEmitter = require("events");
const PKG = require('../package.json');
const CameraSource = require('./cameraSource');
const Util = require('./util');
const CameraController = HapNodeJS.CameraController;
const Catagories = HapNodeJS.Categories;
const BridgeCLS = HapNodeJS.Bridge;
const config = require(Util.ConfigPath);

let Initialised = false;

/** 
 * Common Accessory Class
 * A prototype class from which all accessories are based.
 * It contains the event emitter, the creation of the accessory its self, and attaching some needed events.
 */






/** 
 * CCTV Specific Sets
 */
const _CCTVSet = function(payload) {
    const Props = Object.keys(payload);

    const DoorBellTargets = ["ProgrammableSwitchEvent"]
    const MotionTargets = ["MotionDetected", "StatusActive", "StatusFault", "StatusTampered"]

    for (let i = 0; i < Props.length; i++) {
        this._Properties[Props[i]] = payload[Props[i]];

        if (DoorBellTargets.includes(Props[i])) {
            this._VDBService.setCharacteristic(Characteristic[Props[i]], payload[Props[i]])
        } else if (MotionTargets.includes(Props[i])) {
            this._MDService.setCharacteristic(Characteristic[Props[i]], payload[Props[i]])
        }

    }
}
/** 
 * CCTV Camera
 */
class Camera extends AccessoryCLS {

    constructor(Config) {
        // Door Bell?
        if (Config.enableDoorbellService == 'true') {
            super(Config, Catagories.VIDEO_DOORBELL);

            this._VDBService = new Service.Doorbell('', '');
            this._VDBService.setCharacteristic(Characteristic.ProgrammableSwitchEvent, null);
            this._Properties["ProgrammableSwitchEvent"] = null;

            const _VDBService_ES = {
                "Get": ["ProgrammableSwitchEvent"],
                "Set": []
            }

            this._wireUpEvents(this._VDBService, _VDBService_ES);
            this._accessory.addService(this._VDBService);
        } else {
            super(Config, Catagories.IP_CAMERA);
        }

        // Camera
        const Options = {
            supportedCryptoSuites: [HapNodeJS.SRTPCryptoSuites.AES_CM_128_HMAC_SHA1_80],
            video: {
                codec: {
                    profiles: [HapNodeJS.H264Profile.BASELINE, HapNodeJS.H264Profile.MAIN, HapNodeJS.H264Profile.HIGH],
                    levels: [HapNodeJS.H264Level.LEVEL3_1, HapNodeJS.H264Level.LEVEL3_2, HapNodeJS.H264Level.LEVEL4_0],
                }
            }
        }

        const videoResolutions = []

        this.maxFPS = Config.maxFPS > 30 ? 30 : Config.maxFPS
        this.maxWidth = Config.maxWidthHeight.split("x")[0];
        this.maxHeight = Config.maxWidthHeight.split("x")[1];

        if (this.maxWidth >= 320) {
            if (this.maxHeight >= 240) {
                videoResolutions.push([320, 240, this.maxFPS])
                if (this.maxFPS > 15) {
                    videoResolutions.push([320, 240, 15])
                }
            }
            if (this.maxHeight >= 180) {
                videoResolutions.push([320, 180, this.maxFPS])
                if (this.maxFPS > 15) {
                    videoResolutions.push([320, 180, 15])
                }
            }
        }
        if (this.maxWidth >= 480) {
            if (this.maxHeight >= 360) {
                videoResolutions.push([480, 360, this.maxFPS])
            }
            if (this.maxHeight >= 270) {
                videoResolutions.push([480, 270, this.maxFPS])
            }
        }
        if (this.maxWidth >= 640) {
            if (this.maxHeight >= 480) {
                videoResolutions.push([640, 480, this.maxFPS])
            }
            if (this.maxHeight >= 360) {
                videoResolutions.push([640, 360, this.maxFPS])
            }
        }
        if (this.maxWidth >= 1280) {
            if (this.maxHeight >= 960) {
                videoResolutions.push([1280, 960, this.maxFPS])
            }
            if (this.maxHeight >= 720) {
                videoResolutions.push([1280, 720, this.maxFPS])
            }
        }
        if (this.maxWidth >= 1920) {
            if (this.maxHeight >= 1080) {
                videoResolutions.push([1920, 1080, this.maxFPS])
            }
        }

        Options.video.resolutions = videoResolutions;

        if (Config.enableAudio == 'true') {
            Options.audio = {
                codecs: [{
                    type: HapNodeJS.AudioStreamingCodecType.AAC_ELD,
                    samplerate: HapNodeJS.AudioStreamingSamplerate.KHZ_16,
                    audioChannels: 1,
                    bitrate: HapNodeJS.AudioBitrate.VARIABLE
                }]
            }
        }

        this.CameraDelegate = new CameraSource.Camera(Config)
        this.Controller = new CameraController({
            cameraStreamCount: Config.maxStreams,
            delegate: this.CameraDelegate,
            streamingOptions: Options
        });

        this.CameraDelegate.attachController(this.Controller);
        this._accessory.configureController(this.Controller);

        // Motion?
        if (Config.enableMotionDetectionService == 'true') {
            this._MDService = new Service.MotionSensor('', '');
            this._MDService.setCharacteristic(Characteristic.MotionDetected, false);
            this._MDService.setCharacteristic(Characteristic.StatusActive, 1);
            this._MDService.setCharacteristic(Characteristic.StatusFault, 0);
            this._MDService.setCharacteristic(Characteristic.StatusTampered, 0);
            this._Properties["MotionDetected"] = false;
            this._Properties["StatusActive"] = 1;
            this._Properties["StatusFault"] = 0;
            this._Properties["StatusTampered"] = 0;

            const _MDService_ES = {
                "Get": ["MotionDetected", "StatusActive", "StatusTampered", "StatusFault"],
                "Set": []
            }

            this._wireUpEvents(this._MDService, _MDService_ES);
            this._accessory.addService(this._MDService);
        }

    }
}
Camera.prototype.setCharacteristics = _CCTVSet;



const AccessoryTypes = [{
        Name: "TEMP",
        Label: "Temperature Sensor",
        Icon: "Ac_Temp.png",
        SupportsRouting: false,
        Class: Temperature,
        ConfigProperties: [{
            Name: "name",
            Label: "Accessory Name",
            Default: "Living Room Temp",
            Type: "text"
        }]
    },
    {
        Name: "SMOKE_SENSOR",
        Label: "Smoke Alarm",
        Icon: "Ac_Smoke.png",
        SupportsRouting: false,
        Class: Smoke,
        ConfigProperties: [{
            Name: "name",
            Label: "Accessory Name",
            Default: "Hallway Smoke Alarm",
            Type: "text"
        }]
    },
    {
        Name: "LIGHT_SENSOR",
        Label: "Light Sensor",
        Icon: "Ac_LightSensor.png",
        SupportsRouting: false,
        Class: LightSensor,
        ConfigProperties: [{
            Name: "name",
            Label: "Accessory Name",
            Default: "Porch Ambience Sensor",
            Type: "text"
        }]
    },
    {
        Name: "LEAK_SENSOR",
        Label: "Leak Sensor",
        Icon: "Ac_Leak.png",
        SupportsRouting: false,
        Class: Leak,
        ConfigProperties: [{
            Name: "name",
            Label: "Accessory Name",
            Default: "Kitchen Leak Sensor",
            Type: "text"
        }]
    },
    {
        Name: "FAN",
        Label: "Smart Fan",
        Icon: "Ac_FAN.png",
        SupportsRouting: true,
        Class: Fan,
        ConfigProperties: [{
            Name: "name",
            Label: "Accessory Name",
            Default: "Kitchen Extractor Fan",
            Type: "text"
        }]
    },
    {
        Name: "LIGHTBULB",
        Label: "Smart Light Bulb",
        Icon: "Ac_LIGHTBULB.png",
        SupportsRouting: true,
        Class: LightBulb,
        ConfigProperties: [{
                Name: "name",
                Label: "Accessory Name",
                Default: "Hallway Light",
                Type: "text"
            },
            {
                Name: "supportsBrightness",
                Label: "Brightness Control",
                Default: "true",
                Type: "checkbox"
            },
            {
                Name: "colorMode",
                Label: "Color Mode",
                Default: "hue",
                Choices: ["hue", "temperature", "none"],
                Type: "choice"
            }
        ]
    },
    {
        Name: "THERMOSTAT",
        Label: "Smart Thermostat",
        Icon: "Ac_THERMOSTAT.png",
        SupportsRouting: true,
        Class: Thermostat,
        ConfigProperties: [{
            Name: "name",
            Label: "Accessory Name",
            Default: "Lounge Thermostat",
            Type: "text"
        }]
    },
    {
        Name: "GARAGE_DOOR",
        Label: "Garage Door",
        Icon: "Ac_GARAGE_DOOR.png",
        SupportsRouting: true,
        Class: GarageDoor,
        ConfigProperties: [{
            Name: "name",
            Label: "Accessory Name",
            Default: "Bugatti Veyron Garage",
            Type: "text"
        }]
    },
    {
        Name: "LOCK",
        Label: "Smart Lock",
        Icon: "Ac_LOCK.png",
        SupportsRouting: true,
        Class: Lock,
        ConfigProperties: [{
            Name: "name",
            Label: "Accessory Name",
            Default: "Comms Room Lock",
            Type: "text"
        }]
    },
    {
        Name: "MOTION_SENSOR",
        Label: "Motion Sensor",
        Icon: "Ac_MOTION_SENSOR.png",
        SupportsRouting: false,
        Class: Motion,
        ConfigProperties: [{
            Name: "name",
            Label: "Accessory Name",
            Default: "Entrance Hall Motion Sensor",
            Type: "text"
        }]
    },
    {
        Name: "CONTACT_SENSOR",
        Label: "Contact Sensor",
        Icon: "Ac_CONTACT_SENSOR.png",
        SupportsRouting: false,
        Class: Contact,
        ConfigProperties: [{
            Name: "name",
            Label: "Accessory Name",
            Default: "Loft Hatch",
            Type: "text"
        }]
    },
    {
        Name: "ALARM",
        Label: "Security Alarm",
        Icon: "Ac_ALARM.png",
        SupportsRouting: true,
        Class: Alarm,
        ConfigProperties: [{
            Name: "name",
            Label: "Accessory Name",
            Default: "Intruder Alarm",
            Type: "text"
        }]
    },
    {
        Name: "SWITCH",
        Label: "On/Off Switch",
        Icon: "Ac_SWITCH.png",
        SupportsRouting: true,
        Class: Switch,
        ConfigProperties: [{
            Name: "name",
            Label: "Accessory Name",
            Default: "Party Switch",
            Type: "text"
        }]
    },
    {
        Name: "OUTLET",
        Label: "Electrical Outlet",
        Icon: "Ac_OUTLET.png",
        SupportsRouting: true,
        Class: Outlet,
        ConfigProperties: [{
            Name: "name",
            Label: "Accessory Name",
            Default: "Hallway Socket",
            Type: "text"
        }]
    },
    {
        Name: "TV",
        Label: "Smart TV",
        Icon: "Ac_TV.png",
        SupportsRouting: true,
        Class: TV,
        ConfigProperties: [{
                Name: "name",
                Label: "Accessory Name",
                Default: "Cinema Room Plasma",
                Type: "text"
            },
            {
                Name: "inputs",
                Label: "Input Sources (1 per line)",
                Default: ["HDMI 1", "HDMI 2", "HDMI 3"],
                Type: "multi"
            }
        ]
    },
    {
        Name: "CAMERA",
        Label: "CCTV Camera",
        Icon: "Ac_CAMERA.png",
        SupportsRouting: false,
        Class: Camera,
        ConfigProperties: [{
                Name: "name",
                Label: "Accessory Name",
                Default: "Garage Camera",
                Type: "text"
            },
            {
                Name: "enableMotionDetectionService",
                Label: "Enable Motion Detection Feature",
                Default: "false",
                Type: "checkbox"
            },
            {
                Name: "enableDoorbellService",
                Label: "Enable Door Bell Feature",
                Default: "false",
                Type: "checkbox"
            },
            {
                Name: "processor",
                Label: "Video Processor",
                Default: "ffmpeg",
                Type: "text"
            },
            {
                Name: "liveStreamSource",
                Label: "Live Stream Input",
                Default: "-rtsp_transport tcp -i rtsp://username:password@ip:port/StreamURI",
                Type: "text"
            },
            {
                Name: "stillImageSource",
                Label: "Still Image Input",
                Default: "http://username:password@ip:port/SnapshotURI",
                Type: "text"
            },
            {
                Name: "maxWidthHeight",
                Label: "Max Width &amp; Height (WxH)",
                Default: "1280x720",
                Type: "text"
            },
            {
                Name: "maxFPS",
                Label: "Max FPS",
                Default: "10",
                Type: "text"
            },
            {
                Name: "maxStreams",
                Label: "Max No Of Viewers",
                Default: "2",
                Type: "text"
            },
            {
                Name: "encoder",
                Label: "Video Encoder",
                Default: "libx264",
                Type: "text"
            },
            {
                Name: "maxBitrate",
                Label: "Max Bit Rate",
                Default: "300",
                Type: "text"
            },
            {
                Name: "packetSize",
                Label: "Max Packet Size",
                Default: "1316",
                Type: "text"
            },
            {
                Name: "mapVideo",
                Label: "Video Map",
                Default: "0:0",
                Type: "text"
            },
            {
                Name: "additionalCommandline",
                Label: "Additional Processor Args",
                Default: "-tune zerolatency -preset ultrafast",
                Type: "text"
            },
            {
                Name: "adhereToRequestedSize",
                Label: "Honor Requested Resolution",
                Default: "true",
                Type: "checkbox"
            },
            {
                Name: "enableAudio",
                Label: "Enable Audio Streaming",
                Default: "false",
                Type: "checkbox"
            },
            {
                Name: "encoder_audio",
                Label: "Audio Encoder",
                Default: "libfdk_aac",
                Type: "text"
            },
            {
                Name: "mapAudio",
                Label: "Audio Map",
                Default: "0:1",
                Type: "text"
            }
        ]
    }
]

module.exports = {

    Types: AccessoryTypes,
    Bridge: Bridge

}