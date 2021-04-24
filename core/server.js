'use strict'
const EXPRESS = require('express')
const CRYPTO = require('crypto')
const HANDLEBARS = require('handlebars')
const FS = require('fs');
const ACCESSORY = require("./accessories/Types")
const UTIL = require('./util');
const CONFIG = require(UTIL.ConfigPath);
const COOKIEPARSER = require('cookie-parser')
const PATH = require('path');
const OS = require("os");
const ROUTING = require('./routing');
const QRCODE = require('qrcode');
const HAPPackage = require('hap-nodejs/package.json');
const RouterPackage = require("../package.json");

const Server = function (Accesories, Bridge, RouteSetup, AccessoryIniter) {

    // Vars
    let _Paired = false;
    const _ConfiguredAccessories = Accesories
    const _Bridge = Bridge;
    const _RouteSetup = RouteSetup
    const _AccessoryInitializer = AccessoryIniter;

    let _RestartRequired = false;


    // Template Files
    const Templates = {

        "Login": PATH.join(UTIL.RootAppPath, "ui/login.html"),
        "Main": PATH.join(UTIL.RootAppPath, "ui/main.html"),
        "Settings": PATH.join(UTIL.RootAppPath, "/ui/settings.html"),
        "Accessories": PATH.join(UTIL.RootAppPath, "/ui/accessories.html"),
        "AccessorTypes": PATH.join(UTIL.RootAppPath, "/ui/accessorytypes.html"),
        "NewAccessory": PATH.join(UTIL.RootAppPath, "/ui/createaccessory.html"),
        "EditAccessory": PATH.join(UTIL.RootAppPath, "/ui/editaccessory.html"),
        "Bridge": PATH.join(UTIL.RootAppPath, "/ui/bridge.html"),
        "Routes": PATH.join(UTIL.RootAppPath, "/ui/routing.html"),
        "RouteTypes": PATH.join(UTIL.RootAppPath, "/ui/routetypes.html"),
        "CreateRoute": PATH.join(UTIL.RootAppPath, "/ui/createroute.html"),
        "EditRoute":PATH.join(UTIL.RootAppPath, "/ui/editroute.html")

    }

    HANDLEBARS.registerHelper('eq', function (a, b, options) {
        if (a === b) {
            return options.fn(this)
        } else {
            return options.inverse(this);
        }
    });

    const CompiledTemplates = {}

    // Start Server
    this.Start = function (CB) {

        console.log(" Starting Web Server")
        console.log(" ")

        let TemplateKeys = Object.keys(Templates)

        // Compile TPLs
        for (let i = 0; i < TemplateKeys.length; i++) {
            CompiledTemplates[TemplateKeys[i]] = HANDLEBARS.compile(FS.readFileSync(Templates[TemplateKeys[i]], 'utf8'));
        }

        // Express
        const app = EXPRESS()

        // Middleware
        app.use(EXPRESS.json())
        app.use(COOKIEPARSER("2jS4khgKVTMaVhwVxYPx8Kjnwwpfyvxa"))

        // UI
        app.use('/ui/static', EXPRESS.static(PATH.join(UTIL.RootAppPath, "ui/static")))
        app.get('/ui/qrcode/', _DOQRCode)

        app.get('/', _Redirect);
        app.get('/ui/resources/accessoryicon/',_DoAccessoryIcon)
        app.get('/ui/resources/routeicon/',_DoRouteIcon)
        app.get('/ui/pairstatus/:ID',_DoCheckPair)
        app.get('/ui/login', _Login);
        app.post('/ui/login', _DoLogin);
        app.get('/ui/main', _Main);
        app.get('/ui/settings', _Settings);
        app.post('/ui/settings', _DoSettings);
        app.get('/ui/accessories', _Accessories);
        app.get('/ui/availableactypes', _ListAccessoryesTypes)
        app.get('/ui/createaccessory/:type', _CreateAccessory)
        app.post('/ui/createaccessory/:type', _DoCreateAccessory)
        app.get('/ui/editaccessory/:id', _EditAccessory)
        app.post('/ui/editaccessory/:id', _DoEditAccessory)
        app.get('/ui/routing', _Routes)
        app.get('/ui/routetypes', _RouteTypes)
        app.get('/ui/createroute',_CreateRoute)
        app.post('/ui/createroute',_DoCreateRoute)
        app.get('/ui/editroute', _EditRoute)
        app.post('/ui/editroute', _DoEditRoute)
        app.get('/ui/bridge', _BridgeWEB)
        app.post('/ui/bridge', _DoBridgeConfig)

        try {
            if (CONFIG.webInterfaceAddress === 'ALL') {
                app.listen(CONFIG.webInterfacePort)
            } else {
                app.listen(CONFIG.webInterfacePort, CONFIG.webInterfaceAddress)
            }

        } catch (err) {
            console.log(" Could not start Web Server : " + err);
            process.exit(0);
        }

        CB();
    }

  

    // edit Route
    function _EditRoute(req,res){

        if (!_CheckAuth(req, res)) {
            return;
        }

        let ID = req.query.name;
        let RC = CONFIG.routes[ID];
        let Type = ROUTING.Routes[RC.type];

        let Settings = [];
        Type.Inputs.forEach((RI) =>{
            let I = {
                label:RI.label,
                id:RI.id,
                value:RC[RI.id]
            }
            Settings.push(I);
        })

        let HTML = CompiledTemplates["EditRoute"]({
            Settings:Settings,
            name:ID,
            type:RC.type,
            inUse:(CONFIG.accessories.filter((AC) => AC.route === ID).length >0)
        });

        res.contentType('text/html')
        res.send(HTML)
    }

    // Do edit route
    function _DoEditRoute(req,res){

        if (!_CheckAuth(req, res)) {
            return;
        }

        let NRD = req.body;
        let Name = NRD.name;
        let ORD = CONFIG.routes[Name];

        delete NRD.name;
        NRD.type = ORD.type;

        CONFIG.routes[Name] = NRD;
        UTIL.updateRouteConfig(Name,NRD)

        _RouteSetup();

        res.contentType('application/json')
        res.send({success:true})


    }

    // Create Route
    function _CreateRoute(req,res){

        if (!_CheckAuth(req, res)) {
            return;
        }

        let Settings = [];
        let RP = ROUTING.Routes[req.query.type];
        RP.Inputs.forEach((RI) =>{
            let I = {
                label:RI.label,
                id:RI.id
            }
            Settings.push(I);
        })

        let HTML = CompiledTemplates["CreateRoute"]({
            type:req.query.type,
            Settings:Settings
        });

        res.contentType('text/html')
        res.send(HTML)
    }

    // Do Create Route
    function _DoCreateRoute(req,res){

        if (!_CheckAuth(req, res)) {
            return;
        }

        let RI = req.body

        let Route = {
            type:RI.type
        }

        let ParamKeys = Object.keys(RI).filter((K) => K !== 'name' && K !== 'type');
        ParamKeys.forEach((PK) =>{
            Route[PK] = RI[PK];
        })

        CONFIG.routes[RI.name] = Route;
        UTIL.updateRouteConfig(RI.name,Route)

        _RouteSetup();

        res.contentType('application/json')
        res.send({success:true})
    }

    // Route Types
    function _RouteTypes(req,res){

        if (!_CheckAuth(req, res)) {
            return;
        }

        let Types = []
        let RouteTypeKeys = Object.keys(ROUTING.Routes);
        RouteTypeKeys.forEach((RTK) =>{

            let Type = {
                type:RTK,
                label:ROUTING.Routes[RTK].Name
            }
            Types.push(Type);
        })

        let HTML = CompiledTemplates["RouteTypes"]({
            Types:Types
        });

        res.contentType('text/html')
        res.send(HTML)
    } 

     // Check Pair (web)
     function _DoCheckPair(req,res){

        if (!_CheckAuth(req, res)) {
            return;
        }

        let Result = checkPairStatus(req.params.ID);

        res.contentType('application/json')
        res.send({paired:Result});

    }
   

    // Delete Accessory
    function DeleteAccessory(ID, Destroy) {

        let Acc = _ConfiguredAccessories[ID]
        let AccCFG = Acc.getConfig();

        if (AccCFG.bridged) {

            _Bridge.removeAccessory(Acc.getAccessory())

        } else {

            if (Destroy) {

                Acc.unpublish(true);
            }
            else {

                Acc.unpublish(false);
            }

        }

        delete _ConfiguredAccessories[ID];

        if(Destroy){

            let WithoutThis = CONFIG.accessories.filter((A) => A.accessoryID !== ID)
            CONFIG.accessories = WithoutThis;
            UTIL.deleteAccessory(ID);
        }

    }



    // Set Pair Status
    this.setBridgePaired = function(IsPaired) {
        _Paired = IsPaired;
    }

    /* Check PairStatus */
    function checkPairStatus(ID) {

        const AccessoryFileName = PATH.join(UTIL.HomeKitPath, "AccessoryInfo." + ID + ".json");

        if (FS.existsSync(AccessoryFileName)) {

            delete require.cache[require.resolve(AccessoryFileName)];
            const IsPaired = Object.keys(require(AccessoryFileName).pairedClients)

            return IsPaired.length > 0;

        } else {
            return false
        }


    }

     /* Check Auth */
     function _CheckAuth(req, res) {
        if (req.signedCookies.Authentication === undefined || req.signedCookies.Authentication !== 'Success') {
            res.redirect("../../../ui/login");
            return false;
        }
        return true;
    }

    /* QR Code */
    async function  _DOQRCode(req,res){

        let Text = req.query.data;
        let Width = req.query.width

        let BUF = await QRCODE.toBuffer(Text,{margin:2,width:Width,type:'png'})

        res.contentType('image/png')
        res.send(BUF);


    }

    /* Redirect */
    function _Redirect(req, res) {
        res.redirect('./ui/main')
    }

    /* Accessory Icon */
    function _DoAccessoryIcon(req,res){

        if (!_CheckAuth(req, res)) {
            return;
        }

        res.contentType('image/png')

        let Icon = ACCESSORY.Types[req.query.type].Icon
        res.sendFile(PATH.join(UTIL.RootAppPath,"core","accessories","Icons",Icon));
     
    }

    /* Route Icon */
    function _DoRouteIcon(req,res){

        if (!_CheckAuth(req, res)) {
            return;
        }

        res.contentType('image/png')

        let Icon = ROUTING.Routes[req.query.type].Icon
        res.sendFile(Icon);
     
    }

      /* Routes */
    function _Routes(req, res) {

        if (!_CheckAuth(req, res)) {
            return;
        }

        let RouteList = [];
        let RouteNames = Object.keys(CONFIG.routes);

        RouteNames.forEach((RN) =>{

            let R = CONFIG.routes[RN];
            let RS = ROUTING.Routes[R.type];

            let UseCount = CONFIG.accessories.filter((A) => A.route === RN).length;

            let CR = {
                name:RN,
                type:RS.Type,
                typeName:RS.Name,
                useCount:(UseCount === 1 ? UseCount+" Accessory" : UseCount+" Accessories")
            }
            RouteList.push(CR);

        })

        let HTML = CompiledTemplates['Routes']({
            Routes:RouteList
        });

        res.contentType('text/html')
        res.send(HTML)

    }

    /* Login Page */
    function _Login(req, res) {

        let HTML = CompiledTemplates['Login']({
            "RouterPackage":RouterPackage
        });
        res.contentType('text/html')
        res.send(HTML)

    }

    /* Do Login */
    function _DoLogin(req, res) {

        const Data = req.body;

        const Username = Data.username;
        const Password = CRYPTO.createHash('md5').update(Data.password).digest("hex");

        if (Username === CONFIG.loginUsername && Password === CONFIG.loginPassword) {

            res.cookie('Authentication', 'Success', {
                'signed': true
            })

            res.contentType('application/json');

            let Response = {
                success: true,
                destination: '../../../ui/main'
            }
            res.send(JSON.stringify(Response))

        } else {

            res.contentType('application/json');
            let Response = {
                success: false
            }
            res.send(JSON.stringify(Response))
        }

    }

    /* Main Page */
    function _Main(req, res) {

        // Auth, Setup Check
        if (!_CheckAuth(req, res)) {
            return;
        }

        let HTML = CompiledTemplates['Main']({
            "HAPPackage":HAPPackage,
            "RouterPackage":RouterPackage
        });
        res.contentType('text/html')
        res.send(HTML)

    }

    /* Settings Page */
    function _Settings(req, res) {

        if (!_CheckAuth(req, res)) {
            return;
        }

        let Interfaces = OS.networkInterfaces();
        let Keys = Object.keys(Interfaces);
        let IPs = [];

        for (let i = 0; i < Keys.length; i++) {
            let Net = Interfaces[Keys[i]];
            Net.forEach((AI) => {
                if (AI.family === 'IPv4' && !AI.internal) {
                    IPs.push(AI.address)
                }
            })
        }

        let HTML = CompiledTemplates['Settings']({
            "Config": CONFIG, "Interfaces": IPs, "RestartRequired":_RestartRequired
        });

        res.contentType('text/html')
        res.send(HTML)

    }

    /* Do Settings */
    function _DoSettings(req, res) {

        if (!_CheckAuth(req, res)) {
            return;
        }

        let CFG = req.body;

        CONFIG.enableIncomingMQTT = CFG.enableIncomingMQTT;
        CONFIG.MQTTBroker = CFG.MQTTBroker;
        CONFIG.MQTTTopic = CFG.MQTTTopic;
        CONFIG.advertiser = CFG.advertiser;
        CONFIG.interface = CFG.interface;
        CONFIG.webInterfaceAddress = CFG.webInterfaceAddress;
        CONFIG.webInterfacePort = CFG.webInterfacePort;
        CONFIG.MQTTOptions.username = CFG.MQTTOptions.username
        CONFIG.MQTTOptions.password = CFG.MQTTOptions.password

        UTIL.updateOptions(CFG)

        _RestartRequired = true;

        let Response = {
            success: true
        }
        res.contentType('application/json')
        res.send(JSON.stringify(Response))
       
    }

    /* Accessories */
    function _Accessories(req,res) {

        if (!_CheckAuth(req, res)) {
            return;
        }
        
        let BridgedAccessories = []
        let UNBridgedAccessories = []
        let AccessoryIDs = Object.keys(_ConfiguredAccessories);

        AccessoryIDs.forEach((AID) => {

            let AC = _ConfiguredAccessories[AID]
            let AccessoryCFG = AC.getConfig();
            

            AccessoryCFG.typeDisplay = ACCESSORY.Types[AccessoryCFG.type].Label
            AccessoryCFG.isPaired = checkPairStatus(AccessoryCFG.accessoryID)
            AccessoryCFG.SetupURI = AC.getAccessory().setupURI();

            let ConfiguredRoute = CONFIG.routes[AccessoryCFG.route]

            let Element = {
                AccessoryCFG:AccessoryCFG,
                RouteCFG:{
                    name:AccessoryCFG.route,
                    type:ConfiguredRoute.type
                }
            }

            if(AccessoryCFG.bridged){
                BridgedAccessories.push(Element)
            }
            else{
                UNBridgedAccessories.push(Element)
            }
        })

        let HTML = CompiledTemplates['Accessories']({
            BridgedAccessories:BridgedAccessories,
            UNBridgedAccessories:UNBridgedAccessories
        });

        res.contentType('text/html')
        res.send(HTML)

    }

    /* List Accessory Type */
    function _ListAccessoryesTypes(req,res){

        if (!_CheckAuth(req, res)) {
            return;
        }
      
        let Available = []
        let Types = Object.keys(ACCESSORY.Types);
        Types.forEach((T)=>{

            Available.push({
                type:T,
                label:ACCESSORY.Types[T].Label
            })
        })

       
        let HTML = CompiledTemplates['AccessorTypes']({
            Types:Available
        });

        res.contentType('text/html')
        res.send(HTML)
    }

    /* Create Accessory */
    function _CreateAccessory(req,res){

        if (!_CheckAuth(req, res)) {
            return;
        }

        
        let PL = {
            Specification:ACCESSORY.Types[req.params.type],
            Routes:Object.keys(CONFIG.routes)
        }
        PL.Specification.type = req.params.type;

        let HTML = CompiledTemplates["NewAccessory"](PL);

        res.contentType('text/html')
        res.send(HTML)
    }

    /* DO Create Accessory */
    function _DoCreateAccessory(req,res){

        if (!_CheckAuth(req, res)) {
            return;
        }
        
        let NewAccessoryOBJ = req.body;

        NewAccessoryOBJ.pincode = UTIL.getRndInteger(100, 999) + "-" + UTIL.getRndInteger(10, 99) + "-" + UTIL.getRndInteger(100, 999)
        NewAccessoryOBJ.username =  UTIL.genMAC()
        NewAccessoryOBJ.setupID =  UTIL.makeID(4)
        if(NewAccessoryOBJ.serialNumber === undefined){
            NewAccessoryOBJ.serialNumber = UTIL.makeID(12);
        }

        UTIL.appendAccessoryToConfig(NewAccessoryOBJ)
        CONFIG.accessories.push(NewAccessoryOBJ)

        let QR = _AccessoryInitializer(NewAccessoryOBJ);

        res.contentType('application/json')
        res.send({
            success:true,
            SetupURI:QR,
            AID:NewAccessoryOBJ.accessoryID,
            SN:NewAccessoryOBJ.serialNumber,
            Name:NewAccessoryOBJ.name,
            Pincode:NewAccessoryOBJ.pincode,
            type:NewAccessoryOBJ.type

        })

       
    }

    /* Edit Accessory */
    function _EditAccessory(req,res){

        if (!_CheckAuth(req, res)) {
            return;
        }

        let ID = req.params.id;

        let AccessoryCFG = _ConfiguredAccessories[ID].getConfig();

        let PL = {
            AccessoryCFG:AccessoryCFG,
            Specification:ACCESSORY.Types[AccessoryCFG.type],
            Routes:Object.keys(CONFIG.routes)
        }
        PL.Specification.type = AccessoryCFG.type

        let HTML = CompiledTemplates['EditAccessory'](PL);

        res.contentType('text/html')
        res.send(HTML)
    }

    /* Do Edit Accessory */
    function _DoEditAccessory(req,res){

        if (!_CheckAuth(req, res)) {
            return;
        }
        let AID = req.params.id;

        DeleteAccessory(AID,false)

        let CurrentCFG = CONFIG.accessories.filter((A) => A.accessoryID === AID)[0];
        delete CurrentCFG.manufacturer;
        delete CurrentCFG.model;
        delete CurrentCFG.serialNumber;

        let NewCFG = req.body;

        Object.keys(NewCFG).forEach((OK) =>{
            CurrentCFG[OK] = NewCFG[OK];
        })

        if(CurrentCFG.serialNumber === undefined){
            CurrentCFG.serialNumber = UTIL.makeID(12);
        }
        
        UTIL.updateAccessory(CurrentCFG,AID)
        _AccessoryInitializer(CurrentCFG);
        
        res.contentType('application/json')
        res.send({success:true})
    }

    function _BridgeWEB(req,res){

        if (!_CheckAuth(req, res)) {
            return;
        }

        let AccessoryIDs = Object.keys(_ConfiguredAccessories);
        let BridgedAccessories = []

        AccessoryIDs.forEach((AID) => {

            let AccessoryCFG = _ConfiguredAccessories[AID].getConfig();
            if(!AccessoryCFG.bridged) {
                return;
            }

            AccessoryCFG.typeDisplay = ACCESSORY.Types[AccessoryCFG.type].Label
            AccessoryCFG.isPaired = checkPairStatus(AccessoryCFG.accessoryID)

            let ConfiguredRoute = CONFIG.routes[AccessoryCFG.route]

            let Element = {
                AccessoryCFG:AccessoryCFG,
                RouteCFG:{
                    name:AccessoryCFG.route,
                    type:ConfiguredRoute.type
                }
            }

            BridgedAccessories.push(Element)

           
        })

        let HTML = CompiledTemplates['Bridge']({
            BridgedAccessories:BridgedAccessories,
            bridgeEnabled:CONFIG.bridgeEnabled,
            bridgeInfo:{
                pinCode:CONFIG.bridgeConfig.pincode,
                serialNumber:CONFIG.bridgeConfig.serialNumber,
                setupURI:_Bridge.getAccessory().setupURI(),
                isPaired: checkPairStatus(CONFIG.bridgeConfig.username.replace(/:/g,'')),
                accessoryID:CONFIG.bridgeConfig.username.replace(/:/g,'')
            }
        });

        res.contentType('text/html')
        res.send(HTML)
    }

    function _DoBridgeConfig(req,res){

        if (!_CheckAuth(req, res)) {
            return;
        }

        if(req.body.enableBridge){
            console.log(" Publishing Bridge")
            _Bridge.publish()
        }
        else{
            _Bridge.unpublish(false);
        }
    }

}

module.exports = {
    Server: Server
}