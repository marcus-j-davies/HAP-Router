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
class AccessoryCLS extends EventEmitter {
    constructor(AccessoryOBJ, Category) {
        super();

        this._Config = AccessoryOBJ;
        this._Properties = {};
        this._isBridge = (Category == Catagories.BRIDGE);

        this._Properties = {};

        if (!Initialised) {
            HapNodeJS.HAPStorage.setCustomStoragePath(Util.HomeKitPath);
            Initialised = true;
        }

        const UUID = uuid.generate('hap-nodejs:accessories:' + AccessoryOBJ.name + ':' + AccessoryOBJ.username);

        if (this._isBridge) {
            this._accessory = new BridgeCLS(AccessoryOBJ.name, UUID);
        } else {
            this._accessory = new Accessory(AccessoryOBJ.name, UUID);
        }

        this._accessory.getService(Service.AccessoryInformation)
            .setCharacteristic(Characteristic.SerialNumber, AccessoryOBJ.serialNumber)
            .setCharacteristic(Characteristic.Manufacturer, "Marcus Davies")
            .setCharacteristic(Characteristic.FirmwareRevision, PKG.version)
            .setCharacteristic(Characteristic.Name, AccessoryOBJ.name)

        this._accessory.username = AccessoryOBJ.username;
        this._accessory.pincode = AccessoryOBJ.pincode;
        this._accessory.category = Category;
        this._accessory.setupID = AccessoryOBJ.setupID;

        this._accessory.on(AccessoryEventTypes.IDENTIFY, (paired, callback) => {
            callback();
            this.emit("IDENTIFY", paired)
        });

        this._accessory.on(AccessoryEventTypes.LISTENING, (port) => {
            this.emit("LISTENING", port)
        });

        this._accessory.on(AccessoryEventTypes.PAIRED, () => {
            this.emit("PAIR_CHANGE", true);
        });

        this._accessory.on(AccessoryEventTypes.UNPAIRED, () => {
            this.emit("PAIR_CHANGE", false);
        });
    }
}

/** 
 * Helper method to attach get and set routines
 */
AccessoryCLS.prototype._wireUpEvents = function(targetService, EventStruct) {
    const GetHooks = EventStruct.Get;
    const SetHooks = EventStruct.Set;

    for (let i = 0; i < GetHooks.length; i++) {
        targetService.getCharacteristic(Characteristic[GetHooks[i]])
            .on(CharacteristicEventTypes.GET, (cb) => this._get(GetHooks[i], cb))
    }

    for (let i = 0; i < SetHooks.length; i++) {
        targetService.getCharacteristic(Characteristic[SetHooks[i]])
            .on(CharacteristicEventTypes.SET, (value, callback, ctx, connection) => this._set(SetHooks[i], value, callback, connection))
    }
}

/** 
 * Internal set
 */
AccessoryCLS.prototype._set = function(property, value, callback, connection) {
    this._Properties[property] = value;
    callback(null);

    const PL = {
        "characteristic": property,
        "value": value,
    }

    this.emit("STATE_CHANGE", PL, connection == null ? "API" : "iOS_DEVICE");

}
/** 
 * Internal get
 */
AccessoryCLS.prototype._get = function(property, callback) {
    if (this._Properties[property] != null) {
        callback(null, this._Properties[property]);
    } else {
        callback(null, null);
    }
}
/** 
 * Get Accessory
 */
AccessoryCLS.prototype.getAccessory = function() {
    return this._accessory;
}

/** 
 * Get Type
 */
AccessoryCLS.prototype.getAccessoryType = function() {
    return this._Config.type;
}
/** 
 * Publish
 */
AccessoryCLS.prototype.publish = function() {

    let CFG = {
        username: this._accessory.username,
        pincode: this._accessory.pincode,
        category: this._accessory.category,
        setupID: this._accessory.setupID,
        advertiser: config.advertiser
    }

    if (config.interface != 'ALL') {
        CFG.bind = config.interface
    }

    this._accessory.publish(CFG)
}
/** 
 * unpublish
 */
AccessoryCLS.prototype.unpublish = function(destroy) {
    if (destroy) {
        this._accessory.destroy();
    } else {
        this._accessory.unpublish()
    }
}
/** 
 * get all properties
 */
AccessoryCLS.prototype.getProperties = function() {
    return this._Properties;

}
/** 
 * add accessory (for bridge)
 */
AccessoryCLS.prototype.addAccessory = function(Accessory) {
    if (this._isBridge) {
        this._accessory.addBridgedAccessory(Accessory);

    }
}
/** 
 * remove accessory (for bridge)
 */
AccessoryCLS.prototype.removeAccessory = function(Accessory) {
    if (this._isBridge) {
        this._accessory.removeBridgedAccessory(Accessory, false)

    }
}
/** 
 * get accessories  (for bridge)
 */
AccessoryCLS.prototype.getAccessories = function() {
    if (this._isBridge) {
        return this._accessory.bridgedAccessories;

    }
}
/** 
 * helper method to create a battery service
 */
AccessoryCLS.prototype._createBatteryService = function() {
    this._batteryService = new Service.BatteryService('', '');
    this._batteryService.setCharacteristic(Characteristic.BatteryLevel, 100);
    this._batteryService.setCharacteristic(Characteristic.StatusLowBattery, 0);
    this._batteryService.setCharacteristic(Characteristic.ChargingState, 0);
    this._Properties["BatteryLevel"] = 100;
    this._Properties["StatusLowBattery"] = 0;
    this._Properties["ChargingState"] = 0;

    const EventStruct = {
        "Get": ["BatteryLevel", "StatusLowBattery", "ChargingState"],
        "Set": []
    }

    this._wireUpEvents(this._batteryService, EventStruct)
    this._accessory.addService(this._batteryService);
}

/** 
 * Main Bridge
 */
class Bridge extends AccessoryCLS {
    constructor(Config) {
        Config.name = "HomeKit Device Stack"
        super(Config, Catagories.BRIDGE);
        this._accessory.getService(Service.AccessoryInformation)
            .setCharacteristic(Characteristic.Model, "HKDS4")

    }
}

/** 
 * Public Basic Set
 */
const _basicSet = function(payload) {
    const Props = Object.keys(payload);

    for (let i = 0; i < Props.length; i++) {
        this._Properties[Props[i]] = payload[Props[i]];
        this._service.setCharacteristic(Characteristic[Props[i]], payload[Props[i]])

    }
}
/** 
 * Public Set with a possible battey service
 */
const _setWithBattery = function(payload) {
    const Props = Object.keys(payload);
    const BatteryTargets = ["BatteryLevel", "StatusLowBattery", "ChargingState"]

    for (let i = 0; i < Props.length; i++) {
        this._Properties[Props[i]] = payload[Props[i]];

        if (BatteryTargets.includes(Props[i])) {
            this._batteryService.setCharacteristic(Characteristic[Props[i]], payload[Props[i]])
        } else {
            this._service.setCharacteristic(Characteristic[Props[i]], payload[Props[i]])
        }

    }
}

/** 
 * Outlet Accessory
 */
class Outlet extends AccessoryCLS {

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
Outlet.prototype.setCharacteristics = _basicSet;

/** 
 * Fan Accessory
 */
class Fan extends AccessoryCLS {
    constructor(Config) {
        super(Config, Catagories.FAN);

        this._service = new Service.Fan(Config.name, Config.name)

        this._service.setCharacteristic(Characteristic.On, false);
        this._Properties["On"] = false;
        this._service.setCharacteristic(Characteristic.RotationSpeed, 100);
        this._Properties["RotationSpeed"] = 100;

        const EventStruct = {
            "Get": ["On", "RotationSpeed"],
            "Set": ["On", "RotationSpeed"]
        }

        this._wireUpEvents(this._service, EventStruct);
        this._accessory.addService(this._service);

    }
}
Fan.prototype.setCharacteristics = _basicSet;

/** 
 * Switch Accessory
 */
class Switch extends AccessoryCLS {
    constructor(Config) {
        super(Config, Catagories.SWITCH);

        this._service = new Service.Switch(Config.name, Config.name)

        this._service.setCharacteristic(Characteristic.On, false);
        this._Properties["On"] = false;

        const EventStruct = {
            "Get": ["On"],
            "Set": ["On"]
        }

        this._wireUpEvents(this._service, EventStruct);
        this._accessory.addService(this._service);

    }
}
Switch.prototype.setCharacteristics = _basicSet;

/** 
 * Alarm Accessory
 */
class Alarm extends AccessoryCLS {
    constructor(Config) {
        super(Config, Catagories.SECURITY_SYSTEM);

        this._service = new Service.SecuritySystem(Config.name, Config.name);

        this._service.setCharacteristic(Characteristic.StatusFault, 0);
        this._service.setCharacteristic(Characteristic.StatusTampered, 0);
        this._service.setCharacteristic(Characteristic.SecuritySystemCurrentState, 3);
        this._service.setCharacteristic(Characteristic.SecuritySystemTargetState, 3);
        this._Properties["StatusFault"] = 0;
        this._Properties["StatusTampered"] = 0;
        this._Properties["SecuritySystemCurrentState"] = 3;
        this._Properties["SecuritySystemTargetState"] = 3;

        const EventStruct = {
            "Get": ["SecuritySystemTargetState", "StatusFault", "StatusTampered", "SecuritySystemCurrentState"],
            "Set": ["SecuritySystemTargetState"]
        }

        this._wireUpEvents(this._service, EventStruct);
        this._accessory.addService(this._service);

    }
}
Alarm.prototype.setCharacteristics = _basicSet;

/** 
 * TV Accessory Speaker Set support
 */
const _TVSet = function(payload) {
    const Props = Object.keys(payload);

    for (let i = 0; i < Props.length; i++) {
        this._Properties[Props[i]] = payload[Props[i]];

        this._service.setCharacteristic(Characteristic[Props[i]], payload[Props[i]])
        if (Props[i] == "Active") {
            // speaker and tv are one
            this._Speaker.setCharacteristic(Characteristic[Props[i]], payload[Props[i]])
        }

    }
}
/** 
 * TV Accessory
 */
class TV extends AccessoryCLS {

    constructor(Config) {
        super(Config, Catagories.TELEVISION);

        this._Inputs = [];

        this._service = new Service.Television(Config.name, Config.Name);
        this._service.setCharacteristic(Characteristic.ConfiguredName, Config.name);
        this._service.setCharacteristic(Characteristic.SleepDiscoveryMode, Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE);
        this._service.setCharacteristic(Characteristic.ActiveIdentifier, 1);
        this._service.setCharacteristic(Characteristic.Active, 0);
        this._Properties["Active"] = 0;
        this._Properties["ActiveIdentifier"] = 1;

        var EventStruct = {
            "Get": ["Active", "ActiveIdentifier"],
            "Set": ["Active", "RemoteKey", "ActiveIdentifier", "PowerModeSelection"]
        }

        this._wireUpEvents(this._service, EventStruct);
        this._accessory.addService(this._service);

        // Speaker
        this._Speaker = new Service.TelevisionSpeaker('', '')
        this._Speaker.setCharacteristic(Characteristic.Active, 0)
        this._Speaker.setCharacteristic(Characteristic.VolumeControlType, Characteristic.VolumeControlType.ABSOLUTE);

        EventStruct = {
            "Get": ["Active", "VolumeSelector"],
            "Set": ["VolumeSelector"]
        }

        this._wireUpEvents(this._Speaker, EventStruct);
        this._accessory.addService(this._Speaker);

        // Inputs
        for (let i = 0; i < Config.inputs.length; i++) {
            if (Config.inputs[i].length < 1) {
                continue;
            }
            const Input = new Service.InputSource(Config.inputs[i], Config.inputs[i])
            Input.setCharacteristic(Characteristic.Identifier, (i + 1))
            Input.setCharacteristic(Characteristic.ConfiguredName, Config.inputs[i])
            Input.setCharacteristic(Characteristic.IsConfigured, Characteristic.IsConfigured.CONFIGURED)
            Input.setCharacteristic(Characteristic.InputSourceType, Characteristic.InputSourceType.HDMI)
            Input.setCharacteristic(Characteristic.CurrentVisibilityState, 0);
            Input.setCharacteristic(Characteristic.TargetVisibilityState, 0);

            Input.getCharacteristic(Characteristic.TargetVisibilityState)
                .on(CharacteristicEventTypes.SET, function(value, callback, hap) {
                    Input.setCharacteristic(Characteristic.CurrentVisibilityState, value);
                    callback(null);
                })

            this._accessory.addService(Input);
            this._service.addLinkedService(Input);

            this._Inputs.push(this.Input);
        }

    }
}
TV.prototype.setCharacteristics = _TVSet;

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

/** 
 * Contact Accessory
 */
class Contact extends AccessoryCLS {

    constructor(Config) {
        super(Config, Catagories.SENSOR);

        this._service = new Service.ContactSensor(Config.name, Config.name);

        this._service.setCharacteristic(Characteristic.ContactSensorState, 0);
        this._service.setCharacteristic(Characteristic.StatusFault, 0);
        this._service.setCharacteristic(Characteristic.StatusTampered, 0);
        this._service.setCharacteristic(Characteristic.StatusActive, 1);
        this._Properties["ContactSensorState"] = 0;
        this._Properties["StatusFault"] = 0;
        this._Properties["StatusTampered"] = 0;
        this._Properties["StatusActive"] = 1;

        const EventStruct = {
            "Get": ["ContactSensorState", "StatusFault", "StatusTampered", "StatusActive"],
            "Set": []
        }

        this._wireUpEvents(this._service, EventStruct);
        this._accessory.addService(this._service);

        this._createBatteryService();
    }
}
Contact.prototype.setCharacteristics = _setWithBattery;

/** 
 * Motion Sensor Accessory
 */
class Motion extends AccessoryCLS {

    constructor(Config) {
        super(Config, Catagories.SENSOR);

        this._service = new Service.MotionSensor(Config.name, Config.name);

        this._service.setCharacteristic(Characteristic.MotionDetected, false);
        this._service.setCharacteristic(Characteristic.StatusActive, 1);
        this._service.setCharacteristic(Characteristic.StatusFault, 0);
        this._service.setCharacteristic(Characteristic.StatusTampered, 0);
        this._Properties["MotionDetected"] = false;
        this._Properties["StatusActive"] = 1;
        this._Properties["StatusFault"] = 0;
        this._Properties["StatusTampered"] = 0;

        const EventStruct = {
            "Get": ["MotionDetected", "StatusActive", "StatusTampered", "StatusFault"],
            "Set": []
        }

        this._wireUpEvents(this._service, EventStruct);
        this._accessory.addService(this._service);

        this._createBatteryService();
    }
}
Motion.prototype.setCharacteristics = _setWithBattery;

/** 
 * Lock Accessory
 */
class Lock extends AccessoryCLS {

    constructor(Config) {
        super(Config, Catagories.DOOR_LOCK);

        this._service = new Service.LockMechanism(Config.name, Config.name);

        this._service.setCharacteristic(Characteristic.LockTargetState, 0);
        this._service.setCharacteristic(Characteristic.LockCurrentState, 0);
        this._Properties["LockTargetState"] = 0;
        this._Properties["LockCurrentState"] = 0;

        const EventStruct = {
            "Get": ["LockTargetState", "LockCurrentState"],
            "Set": ["LockTargetState"]
        }

        this._wireUpEvents(this._service, EventStruct);
        this._accessory.addService(this._service);
    }
}
Lock.prototype.setCharacteristics = _basicSet;

/** 
 * Light Accessory
 */
class LightBulb extends AccessoryCLS {

    constructor(Config) {
        super(Config, Catagories.LIGHTBULB);

        this._service = new Service.Lightbulb(Config.name, Config.name);

        this._service.setCharacteristic(Characteristic.On, false);
        this._Properties["On"] = false;

        const EventStruct = {
            "Get": ["On"],
            "Set": ["On"]
        }

        if (Config.supportsBrightness == 'true') {
            this._service.setCharacteristic(Characteristic.Brightness, 100);
            this._Properties["Brightness"] = 100;
            EventStruct.Get.push("Brightness")
            EventStruct.Set.push("Brightness")
        }

        switch (Config.colorMode) {
            case "hue":
                this._service.setCharacteristic(Characteristic.Hue, 0);
                this._Properties["Hue"] = 0;
                EventStruct.Get.push("Hue")
                EventStruct.Set.push("Hue")

                this._service.setCharacteristic(Characteristic.Saturation, 0);
                this._Properties["Saturation"] = 0;
                EventStruct.Get.push("Saturation")
                EventStruct.Set.push("Saturation")

                break;

            case "temperature":
                this._service.setCharacteristic(Characteristic.ColorTemperature, 50);
                this._Properties["ColorTemperature"] = 50;
                EventStruct.Get.push("ColorTemperature")
                EventStruct.Set.push("ColorTemperature")

                break;
        }

        this._wireUpEvents(this._service, EventStruct);
        this._accessory.addService(this._service);
    }
}
LightBulb.prototype.setCharacteristics = _basicSet;

/** 
 * Garage Door Accessory
 */
class GarageDoor extends AccessoryCLS {

    constructor(Config) {
        super(Config, Catagories.GARAGE_DOOR_OPENER);

        this._service = new Service.GarageDoorOpener(Config.name, Config.name);

        this._service.setCharacteristic(Characteristic.CurrentDoorState, 0);
        this._service.setCharacteristic(Characteristic.TargetDoorState, 0);
        this._service.setCharacteristic(Characteristic.LockCurrentState, 0);
        this._service.setCharacteristic(Characteristic.LockTargetState, 0);
        this._service.setCharacteristic(Characteristic.ObstructionDetected, false);
        this._Properties["CurrentDoorState"] = 0;
        this._Properties["TargetDoorState"] = 0;
        this._Properties["LockCurrentState"] = 0;
        this._Properties["LockTargetState"] = 0;
        this._Properties["ObstructionDetected"] = false;

        const EventStruct = {
            "Get": ["CurrentDoorState", "TargetDoorState", "LockCurrentState", "LockTargetState", "ObstructionDetected"],
            "Set": ["TargetDoorState", "LockTargetState"]
        }

        this._wireUpEvents(this._service, EventStruct);
        this._accessory.addService(this._service);
    }
}
GarageDoor.prototype.setCharacteristics = _basicSet;

/** 
 * Thermotsat Accessory
 */
class Thermostat extends AccessoryCLS {

    constructor(Config) {
        super(Config, Catagories.THERMOSTAT);

        this._service = new Service.Thermostat(Config.name, Config.name);

        this._service.setCharacteristic(Characteristic.CurrentHeatingCoolingState, 0);
        this._service.setCharacteristic(Characteristic.TargetHeatingCoolingState, 0);
        this._service.setCharacteristic(Characteristic.CurrentTemperature, 21);
        this._service.setCharacteristic(Characteristic.TargetTemperature, 21);
        this._service.setCharacteristic(Characteristic.TemperatureDisplayUnits, 0);
        this._service.setCharacteristic(Characteristic.CoolingThresholdTemperature, 26);
        this._service.setCharacteristic(Characteristic.HeatingThresholdTemperature, 18);

        this._Properties["CurrentHeatingCoolingState"] = 0;
        this._Properties["TargetHeatingCoolingState"] = 0;
        this._Properties["CurrentTemperature"] = 21;
        this._Properties["TargetTemperature"] = 21;
        this._Properties["TemperatureDisplayUnits"] = 0;
        this._Properties["CoolingThresholdTemperature"] = 26;
        this._Properties["HeatingThresholdTemperature"] = 18;

        const EventStruct = {
            "Get": ["TargetHeatingCoolingState", "CurrentHeatingCoolingState", "TemperatureDisplayUnits", "CurrentTemperature", "TargetTemperature", "CoolingThresholdTemperature", "HeatingThresholdTemperature"],
            "Set": ["TargetHeatingCoolingState", "TemperatureDisplayUnits", "TargetTemperature", "CoolingThresholdTemperature", "HeatingThresholdTemperature"]
        }

        this._wireUpEvents(this._service, EventStruct);
        this._accessory.addService(this._service);
    }
}
Thermostat.prototype.setCharacteristics = _basicSet;

/** 
 * Temperature Sensor Accessory
 */
class Temperature extends AccessoryCLS {

    constructor(Config) {
        super(Config, Catagories.SENSOR);

        this._service = new Service.TemperatureSensor(Config.name, Config.name);

        this._service.setCharacteristic(Characteristic.CurrentTemperature, 21);
        this._service.setCharacteristic(Characteristic.StatusActive, 1);
        this._service.setCharacteristic(Characteristic.StatusFault, 0);
        this._service.setCharacteristic(Characteristic.StatusTampered, 0);
        this._Properties["CurrentTemperature"] = 21;
        this._Properties["StatusActive"] = 1;
        this._Properties["StatusFault"] = 0;
        this._Properties["StatusTampered"] = 0;

        const EventStruct = {
            "Get": ["CurrentTemperature", "StatusActive", "StatusTampered", "StatusFault"],
            "Set": []
        }

        this._wireUpEvents(this._service, EventStruct);
        this._accessory.addService(this._service);

        this._createBatteryService();
    }
}
Temperature.prototype.setCharacteristics = _setWithBattery;

/** 
 * Smoke Sensor Accessory
 */
class Smoke extends AccessoryCLS {

    constructor(Config) {
        super(Config, Catagories.SENSOR);

        this._service = new Service.SmokeSensor(Config.name, Config.name);

        this._service.setCharacteristic(Characteristic.SmokeDetected, 0);
        this._service.setCharacteristic(Characteristic.StatusActive, 1);
        this._service.setCharacteristic(Characteristic.StatusFault, 0);
        this._service.setCharacteristic(Characteristic.StatusTampered, 0);
        this._Properties["SmokeDetected"] = 0;
        this._Properties["StatusActive"] = 1;
        this._Properties["StatusFault"] = 0;
        this._Properties["StatusTampered"] = 0;

        const EventStruct = {
            "Get": ["SmokeDetected", "StatusActive", "StatusTampered", "StatusFault"],
            "Set": []
        }

        this._wireUpEvents(this._service, EventStruct);
        this._accessory.addService(this._service);

        this._createBatteryService();
    }
}
Smoke.prototype.setCharacteristics = _setWithBattery;

/** 
 * Leak Sensor Accessory
 */
class Leak extends AccessoryCLS {

    constructor(Config) {
        super(Config, Catagories.SENSOR);

        this._service = new Service.LeakSensor(Config.name, Config.name);

        this._service.setCharacteristic(Characteristic.LeakDetected, 0);
        this._service.setCharacteristic(Characteristic.StatusActive, 1);
        this._service.setCharacteristic(Characteristic.StatusFault, 0);
        this._service.setCharacteristic(Characteristic.StatusTampered, 0);
        this._Properties["LeakDetected"] = 0;
        this._Properties["StatusActive"] = 1;
        this._Properties["StatusFault"] = 0;
        this._Properties["StatusTampered"] = 0;

        const EventStruct = {
            "Get": ["LeakDetected", "StatusActive", "StatusTampered", "StatusFault"],
            "Set": []
        }

        this._wireUpEvents(this._service, EventStruct);
        this._accessory.addService(this._service);

        this._createBatteryService();
    }
}
Leak.prototype.setCharacteristics = _setWithBattery;

/** 
 * Light Sensor Accessory
 */
class LightSensor extends AccessoryCLS {

    constructor(Config) {
        super(Config, Catagories.SENSOR);

        this._service = new Service.LightSensor(Config.name, Config.name);

        this._service.setCharacteristic(Characteristic.CurrentAmbientLightLevel, 25);
        this._service.setCharacteristic(Characteristic.StatusActive, 1);
        this._service.setCharacteristic(Characteristic.StatusFault, 0);
        this._service.setCharacteristic(Characteristic.StatusTampered, 0);
        this._Properties["CurrentAmbientLightLevel"] = 25;
        this._Properties["StatusActive"] = 1;
        this._Properties["StatusFault"] = 0;
        this._Properties["StatusTampered"] = 0;

        const EventStruct = {
            "Get": ["CurrentAmbientLightLevel", "StatusActive", "StatusTampered", "StatusFault"],
            "Set": []
        }

        this._wireUpEvents(this._service, EventStruct);
        this._accessory.addService(this._service);

        this._createBatteryService();
    }
}
LightSensor.prototype.setCharacteristics = _setWithBattery;

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