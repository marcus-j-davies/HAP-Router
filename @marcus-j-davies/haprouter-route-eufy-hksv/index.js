'use strict'
const { P2PConnectionType, HTTPApi, Camera, Station } = require("eufy-security-client");

/* UI Params */
const Params = [
    {
        id: "UserID",
        label: "EUFY Cloud Username"
    },
    {
        id: "Password",
        label: "EUFY Cloud Password"
    },
    {
        id: "SNs",
        label: "Camera Serial Numbers (xxxx, xxxx)"
    }
]

/*  Metadata */
const Name = "EUFY Homekit SV";
const Icon = "icon.png";

/* Route Class */
class EUFYHK {

    /* Constructor */
    constructor(route, statusnotify) {

        this.Route = route
        this.StatusNotify = statusnotify
        this.Hubs = []

        this.init();
    }

}

EUFYHK.prototype.init = async function(){

    this.Client = new HTTPApi(this.Route.UserID, this.Route.Password);
    await this.Client.updateDeviceInfo()

    let Devices = this.Client.getDevices();
    let Hubs = this.Client.getHubs();

    let Targets = this.Route.SNs.trim().replace(/ /g,"").split(",");
    let Connected = 0;

    for(let i = 0;i<Targets.length;i++){

        let _DeviceInfo = Devices[Targets[i]]
        let _Camera = new Camera(this.Client, _DeviceInfo);
        let _Station = new Station(this.Client, Hubs[_Camera.getStationSerial()]);

        _Station.on("close",()=>{
            this.StatusNotify(false, "Connection closed: "+Targets[i])
        })

        _Station.on("connect",()=>{

            this.Hubs.push({Station:_Station, Camera: _Camera})

            Connected++;
            if(Connected === Targets.length){
                this.StatusNotify(true)
            }
        })

        await _Station.connect(P2PConnectionType.ONLY_LOCAL, false);
    }
}

EUFYHK.prototype.process = async function (payload) {

    // this route only works with a Basic Switch Accessory
    if (payload.accessory.AccessoryType === 'Basic Switch' && payload.eventType === 'characteristicUpdate' && payload.eventData.characteristic === 'On') {
        this.Hubs.forEach(async (H) =>{
            await H.Station.setMotionDetection(H.Camera, payload.eventData.value)
        })
    }
}

EUFYHK.prototype.close = function (reason) {
    this.Hubs.forEach((H) =>{
        H.Station.close()
    })
}

module.exports = {
    "Route": EUFYHK,
    "Inputs": Params,
    "Name": Name,
    "Icon": Icon
}