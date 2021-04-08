'use strict'
const EXPRESS = require('express')
const CRYPTO = require('crypto')
const HANDLEBARS = require('handlebars')
const FS = require('fs');
const BODYPARSER = require('body-parser')
const ACCESSORY = require('./accessory');
const UTIL = require('./util');
const CONFIG = require(UTIL.ConfigPath);
const COOKIEPARSER = require('cookie-parser')
const PATH = require('path');
const OS = require("os");
const ROUTING = require('./routing');

const Server = function(Accesories, ChangeEvent, IdentifyEvent, Bridge, RouteSetup, PairEvent) {

    // Vars
    let _Paired = false;
    const _Accessories = Accesories
    const _ChangeEvent = ChangeEvent;
    const _IdentifyEvent = IdentifyEvent
    const _Bridge = Bridge;
    const _RouteSetup = RouteSetup
    const _PairEvent = PairEvent;

    // Template Files
    const Templates = {
        "Login": process.cwd() + "/ui/login.tpl",
        "Setup": process.cwd() + "/ui/setup.tpl",
        "Main": process.cwd() + "/ui/main.tpl",
        "Create": process.cwd() + "/ui/create.tpl",
        "Edit": process.cwd() + "/ui/edit.tpl",
    }

    HANDLEBARS.registerHelper('ifvalue', function(conditional, options) {
        if (options.hash.equals === conditional) {
            return options.fn(this)
        } else {
            return options.inverse(this);
        }
    });

    const CompiledTemplates = {}

    // Start Server
    this.Start = function(CB) {

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
        app.use(BODYPARSER.json())
        app.use(COOKIEPARSER("2jS4khgKVTMaVhwVxYPx8Kjnwwpfyvxa"))

        // UI
        app.use('/ui/static', EXPRESS.static(process.cwd() + '/ui/static'))
        app.get('/', _Redirect);
        app.get('/ui/main', _Main);
        app.get('/ui/setup', _Setup);
        app.get('/ui/getroutemeta/:module_name', _GetRouteMeta);
        app.get('/ui/login', _Login);
        app.get('/ui/createaccessory/:type', _CreateAccessory);
        app.get('/ui/editaccessory/:type/:id', _EditAccessory);
        app.get('/ui/pairstatus', _PairStatus);
        app.get('/ui/pairstatus/:id', _PairStatus);
        app.get('/ui/backup', _Backup);
        app.post('/ui/login', _DoLogin);
        app.post('/ui/deleteroute', _DoDeleteRoute);
        app.post('/ui/setconfig', _DoSaveConfig);
        app.post('/ui/deleteaccessory', _DoDeleteAccessory);
        app.post('/ui/restore', _DoRestore);
        app.post('/ui/createroute', _DoCreateRoute);
        app.post('/ui/connect', _DoConnect);
        app.post('/ui/disconnect', _DoDisconnect);
        app.post('/ui/createaccessory', _DoCreateAccessory);
        app.post('/ui/editaccessory', _DoEditAccessory);

        // API
        app.get('/:pwd/accessories/', _processAccessoriesGet);
        app.get('/:pwd/accessories/:id', _processAccessoryGet);
        app.put('/:pwd/accessories/:id', _processAccessorySet);

        try {
            if (CONFIG.webInterfaceAddress == 'ALL') {
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

    function _GetRouteMeta(req,res){

        if (!_CheckAuth(req, res)) {
            return;
        }

        let ModuleName = req.params.module_name;
        let RouteType = ROUTING.Routes[ModuleName];

        let _Buffer = FS.readFileSync(RouteType.Icon)

        let MD = {
            Inputs:RouteType.Inputs,
            Icon:_Buffer.toString("base64"),
            Name:RouteType.Name
        }

        res.contentType('application/json');
        res.send(MD);

    }

    function _Redirect(req,res){
        res.redirect('./ui/main')
    }

    function _DoEditAccessory(req, res) {

        if (!_CheckAuth(req, res)) {
            return;
        }

        let Data = req.body

        const Acs = _Accessories[Data.username.replace(/:/g, "")];
        const CurrentProps = Acs.getProperties();

        _DeleteAccessory(Data.username.replace(/:/g, ""), Data.username, Data.bridged, false);

        let URI = _AddAccessory(Data, CurrentProps);
        res.contentType('application/json');
        if (!Data.bridged) {
            res.send('{"OK":true,"URI":"' + URI + '","Pin":"' + Data.pincode + '","ID":"' + Data.username.replace(/:/g, "") + '"}');
        } else {
            res.send('{"OK":true}');
        }

    }

    function _DoCreateAccessory(req, res) {

        if (!_CheckAuth(req, res)) {
            return;
        }

        let Data = req.body

        Data["pincode"] = UTIL.getRndInteger(100, 999) + "-" + UTIL.getRndInteger(10, 99) + "-" + UTIL.getRndInteger(100, 999);
        Data["username"] = UTIL.genMAC();
        Data["setupID"] = UTIL.makeID(4);
        Data["serialNumber"] = UTIL.makeID(12);

        let URI = _AddAccessory(Data);
        res.contentType('application/json');
        if (!Data.bridged) {
            res.send('{"OK":true,"URI":"' + URI + '","Pin":"' + Data.pincode + '","ID":"' + Data.username.replace(/:/g, "") + '"}');
        } else {
            res.send('{"OK":true}');
        }
    }

    function _DoConnect(req, res) {

        if (!_CheckAuth(req, res)) {
            return;
        }

        let Data = req.body

        _ReRoute(Data.SID, Data.TID);
        res.contentType('application/json');
        res.send('{"OK":true}');

    }

    function _DoDisconnect(req, res) {

        if (!_CheckAuth(req, res)) {
            return;
        }

        let Data = req.body

        _Unroute(Data.SID);
        res.contentType('application/json');
        res.send('{"OK":true}');

    }

    function _DoCreateRoute(req, res) {

        if (!_CheckAuth(req, res)) {
            return;
        }

        let Data = req.body

        _AddRoute(Data);
        res.contentType('application/json');
        res.send('{"OK":true}');

    }

    function _DoRestore(req, res) {

        if (!_CheckAuth(req, res)) {
            return;
        }

        let Result = UTIL.restore(req.body);

        if (Result == "Version") {
            res.contentType('application/json');
            res.send('{"OK":false,"Reason":"VersionMismatch"}');
            return;
        }
        if (Result == "Invalid") {
            res.contentType('application/json');
            res.send('{"OK":false,"Reason":"InvalidFile"}');
            return;
        }

        if (Result == true) {
            res.contentType('application/json');
            res.send('{"OK":true}');
            process.exit(0);
        }

    }

    function _DoDeleteAccessory(req, res) {

        if (!_CheckAuth(req, res)) {
            return;
        }

        const Data = req.body;

        _DeleteAccessory(Data.username.replace(/:/g, ""), Data.username, Data.bridged, true);
        res.contentType('application/json');
        res.send('{"OK":true}');

    }

    function _DoSaveConfig(req, res) {

        if (!_CheckAuth(req, res)) {
            return;
        }

        const Data = req.body;

        UTIL.updateOptions(Data);
        res.contentType('application/json');
        res.send('{"OK":true}');

    }

    function _DoLogin(req, res) {

        const Data = req.body;

        const Username = Data.username;
        const Password = CRYPTO.createHash('md5').update(Data.password).digest("hex");
        if (Username == CONFIG.loginUsername && Password == CONFIG.loginPassword) {
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

    function _DoDeleteRoute(req, res) {

        if (!_CheckAuth(req, res)) {
            return;
        }

        const Data = req.body;
        _DeleteRoute(Data.name)
        res.contentType('application/json');
        res.send('{"OK":true}');

    }

    /* Main Page */
    function _Main(req, res) {

        // Auth, Setup Check
        if (!_CheckAuth(req, res)) {
            return;
        }

        // Availbale Route Types
        let RouteModules = [];
        let RouteTypes = Object.keys(ROUTING.Routes);
        RouteTypes.forEach((RT) =>{

            let RouteType = ROUTING.Routes[RT];
            RouteModules.push({Type:RouteType.Type,Name:RouteType.Name})

        });

        // Configured Routes
        let ConfiguredRoutesArray = [];
        let ConfiguredRoutesKeys = Object.keys(CONFIG.routes); 
        ConfiguredRoutesKeys.forEach((CR) =>{
            
            let ConfiguredRoute = CONFIG.routes[CR];


        })
        


      

        let Interfaces = OS.networkInterfaces();
        let Keys = Object.keys(Interfaces);
        let IPs = [];

        for (let i = 0; i < Keys.length; i++) {

            let Net = Interfaces[Keys[i]];

            Net.forEach((AI) => {
                if (AI.family == 'IPv4' && !AI.internal) {
                    IPs.push(AI.address)
                }
            })

        }

        let HTML = CompiledTemplates['Main']({
            "RootPath": UTIL.RootPath,
            "Config": CONFIG,
            "RouteModules": RouteModules,
            "AccessoryTypes": ACCESSORY.Types,
            "AccessoryTypesJSON": JSON.stringify(ACCESSORY.Types, null, 2),
            "interfaces": IPs
        });
        res.contentType('text/html')
        res.send(HTML)

    }

    /* Setup Page */
    function _Setup(req, res) {

        if (!_CheckAuth(req, res)) {
            return;
        }
        if (_Paired) {
            res.redirect("../../../ui/main");
            return;
        }

        let HTML = CompiledTemplates['Setup']({
            "Config": CONFIG
        });
        res.contentType('text/html')
        res.send(HTML)

    }

    /* Login Page */
    function _Login(req, res) {

        let HTML = CompiledTemplates['Login']({});

        res.contentType('text/html')
        res.send(HTML)

    }

    /* Create Page */
    function _CreateAccessory(req, res) {

        if (!_CheckAuth(req, res)) {
            return;
        }

        let Type = req.params.type;

        let HTML = CompiledTemplates['Create']({
            "Config": CONFIG,
            "Type": JSON.stringify(ACCESSORY.Types.filter(C => C.Name == Type)[0], null, 2)
        });

        res.contentType('text/html')
        res.send(HTML)

    }

    // Edit Pgae */
    function _EditAccessory(req, res) {

        if (!_CheckAuth(req, res)) {
            return;
        }

        let Type = req.params.type;
        let ID = req.params.id;

        const TargetAc = CONFIG.accessories.filter(a => a.accessoryID == ID)[0]

        let HTML = CompiledTemplates['Edit']({
            "Config": CONFIG,
            "Object": JSON.stringify(TargetAc, null, 2),
            "Type": JSON.stringify(ACCESSORY.Types.filter(C => C.Name == Type)[0], null, 2)
        })

        res.contentType('text/html')
        res.send(HTML)
    }

    // Pair Status */
    function _PairStatus(req, res) {

        if (!_CheckAuth(req, res)) {
            return;
        }

        let ID = req.params.id;

        let Response = {}

        if (ID != null) {
            const AccessoryFileName = PATH.join(UTIL.HomeKitPath, "AccessoryInfo." + ID + ".json");
            if (FS.existsSync(AccessoryFileName)) {
                delete require.cache[require.resolve(AccessoryFileName)];
                const IsPaired = Object.keys(require(AccessoryFileName).pairedClients)
                Response.paired = IsPaired.length > 0;
            } else {
                Response.paired = false;
            }
        } else {
            Response.paired = _Paired
        }
        res.contentType('application/json');
        res.send(JSON.stringify(Response))
    }

    function _Backup(req, res) {

        if (!_CheckAuth(req, res)) {
            return;
        }
        res.contentType('application/octet-stream')
        res.header("Content-Disposition", "attachment; filename=\"HKDS-Backup.dat\"");
        res.send(UTIL.generateBackup())
    }

    // Add new accessory
    function _AddAccessory(Data, Props) {

        UTIL.appendAccessoryToConfig(Data)
        Data.accessoryID = Data.username.replace(/:/g, "");
        CONFIG.accessories.push(Data)

        let Type = ACCESSORY.Types.filter(C => C.Name == Data.type)[0]
        let Acc = new Type.Class(Data);

        if (Props != null) {
            Acc.setCharacteristics(Props)
        }

        Acc.on('STATE_CHANGE', (PL, O) => _ChangeEvent(PL, Data, O))
        Acc.on('IDENTIFY', (P) => _IdentifyEvent(P, Data))
        _Accessories[Data.accessoryID] = Acc;
        if (Data.bridged) {
            _Bridge.addAccessory(Acc.getAccessory())
        } else {
            Acc.on('PAIR_CHANGE', (P) => _PairEvent(P, Data))
            Acc.publish();
        }
        return Acc.getAccessory().setupURI();
    }

    // Delete Route
    function _DeleteRoute(Name) {
        let Routes = CONFIG.routes;
        delete Routes[Name]
        _RouteSetup();
        UTIL.updateRouteConfig(Routes);
    }

    // Add Route
    function _AddRoute(Route) {
        let Routes = CONFIG.routes;
        let Name = Route.name;
        delete Route.name;
        Routes[Name] = Route;
        _RouteSetup();
        UTIL.updateRouteConfig(Routes);
    }

    // Update Device Route
    function _ReRoute(AccessoryID, Route) {
        CONFIG.accessories.filter((A) => A.accessoryID == AccessoryID)[0].route = Route.split('_')[1];
        UTIL.routeAccessory(AccessoryID, Route.split('_')[1]);
    }

    // Clear Device Route
    function _Unroute(AccessoryID) {
        CONFIG.accessories.filter((A) => A.accessoryID == AccessoryID)[0].route = "";
        UTIL.routeAccessory(AccessoryID, "");
    }

    // Delete Accessory
    function _DeleteAccessory(AccessoryID, Username, Bridged, Permanent) {

        if (Bridged) {
            const Acs = _Bridge.getAccessories();
            const TargetAcc = Acs.filter(a => a.username == Username)[0];
            _Bridge.removeAccessory(TargetAcc);
            delete _Accessories[AccessoryID]
            UTIL.deleteAccessory(AccessoryID)
            const NA = CONFIG.accessories.filter(a => a.accessoryID != AccessoryID)
            CONFIG.accessories = NA;
        } else {
            _Accessories[AccessoryID].unpublish(Permanent)
            delete _Accessories[AccessoryID]
            UTIL.deleteAccessory(AccessoryID)
            const NA = CONFIG.accessories.filter(a => a.accessoryID != AccessoryID)
            CONFIG.accessories = NA;
        }
    }

    // Check Auth
    function _CheckAuth(req, res) {
        if (req.signedCookies.Authentication == null || req.signedCookies.Authentication != 'Success') {
            res.redirect("../../../ui/login");
            return false;
        }
        return true;
    }

    // get Accessories
    function _processAccessoriesGet(req, res) {
        const PW = CRYPTO.createHash('md5').update(req.params.pwd).digest("hex");
        if (PW != CONFIG.loginPassword) {
            res.sendStatus(401);
            return;
        }
        const TPL = [];
        const Names = Object.keys(_Accessories);
        for (let i = 0; i < Names.length; i++) {
            const PL = {
                "id": Names[i],
                "type": _Accessories[Names[i]].getAccessoryType(),
                "name": _Accessories[Names[i]].getAccessory().displayName,
                "characteristics": _Accessories[Names[i]].getProperties()
            }
            TPL.push(PL)
        }
        res.contentType("application/json");
        res.send(JSON.stringify(TPL));
    }

    // get  Accessory
    function _processAccessoryGet(req, res) {
        const PW = CRYPTO.createHash('md5').update(req.params.pwd).digest("hex");
        if (PW != CONFIG.loginPassword) {
            res.sendStatus(401);
            return;
        }

        const Ac = _Accessories[req.params.id]

        if (Ac == null) {
            res.contentType("application/json");
            res.send(JSON.stringify({
                "Error": "Device not found"
            }));
            return;
        }

        const PL = {
            "id": req.params.id,
            "type": Ac.getAccessoryType(),
            "name": Ac.getAccessory().displayName,
            "characteristics": Ac.getProperties()
        }
        res.contentType("application/json");
        res.send(JSON.stringify(PL));
    }

    // Set Accessory data
    function _processAccessorySet(req, res) {
        const PW = CRYPTO.createHash('md5').update(req.params.pwd).digest("hex");
        if (PW != CONFIG.loginPassword) {
            res.sendStatus(401);
            return;
        }

        const Ac = _Accessories[req.params.id]

        if (Ac == null) {
            res.contentType("application/json");
            res.send(JSON.stringify({
                "ok": false,
                "reason": "Device not found"
            }));
            return;
        }

        Ac.setCharacteristics(req.body)
        res.contentType("application/json");
        res.send(JSON.stringify({
            ok: true
        }));
    }

    // Set Pair Status
    this.setBridgePaired = function(IsPaired) {
        _Paired = IsPaired;
    }
}

module.exports = {
    Server: Server
}