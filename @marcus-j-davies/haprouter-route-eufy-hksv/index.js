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
        label: "Camera Serial Numbers (xxxx,xxxx)"
    }
]

/*  Metadata */
const Name = "EUFY Homekit SV";
const Icon = "icon.png";

/* Route Class */
class EUFYHK {

    /* Constructor */
    constructor(route) {
        this.Route = route
    }
}

EUFYHK.prototype.process = async function (payload) {

    // this route only works with a Basic Switch Accessory
    if (payload.accessory.AccessoryType === 'Basic Switch' && payload.eventType === 'characteristicUpdate' && payload.eventData.characteristic === 'On') {


        let Client = new HTTPApi(this.Route.UserID, this.Route.Password);

        await Client.updateDeviceInfo()
        let Devices = Client.getDevices();
        let Hubs = Client.getHubs();

        let Targets = this.Route.SNs.trim().split(",");

        Targets.forEach(async (TDS) => {

            let _DeviceInfo = Devices[TDS]
            let _Camera = new Camera(Client, _DeviceInfo);
            let _Station = new Station(Client, Hubs[_Camera.getStationSerial()]);

            _Station.on("connect", async () => {
                await _Station.setMotionDetection(_Camera, payload.eventData.value)
                _Station.close();
            })

            await _Station.connect(P2PConnectionType.ONLY_LOCAL, false);

        })
    }
}

EUFYHK.prototype.close = function (reason) {
}

module.exports = {
    "Route": EUFYHK,
    "Inputs": Params,
    "Name": Name,
    "Icon": Icon
}