'use strict'
const PATH = require('path');
const FS = require('fs');
const { spawnSync } = require('child_process');

const StockRoutes = ["haprouter-route-console", "haprouter-route-file", "haprouter-route-http", "haprouter-route-mqtt", "haprouter-route-udp", "haprouter-route-websocket"]
var RootPath;

const Routes = {

}

const setPath = function(Path){
    RootPath = Path;
}

const installStockModules = function () {

    module.paths.push(PATH.join(RootPath, "node_modules"))

    let FoundModules = []

    if (FS.existsSync(PATH.join(RootPath, "node_modules"))) {

        let Files = FS.readdirSync(PATH.join(RootPath, "node_modules"));

        Files.forEach((D) => {
            let FI = FS.lstatSync(PATH.join(RootPath, "node_modules", D))
            if (FI.isDirectory()) {
                FoundModules.push(D)
            }
        })
    }

    StockRoutes.forEach((SR) => {
        if (FoundModules.indexOf(SR) < 0) {
            install(SR)
        }
    })
}

const loadModules = function (){


    let Files = FS.readdirSync(PATH.join(RootPath, "node_modules"));

    Files.forEach((D) => {

        if(!D.startsWith("haprouter-route-")){
          return;
        }

        let FI = FS.lstatSync(PATH.join(RootPath, "node_modules", D))
        if (FI.isDirectory()) {
          
            let Mod = require(D);
            let RouteOBJ = {}
    
            RouteOBJ.Type = D
            RouteOBJ.Icon = PATH.join(RootPath,"node_modules",D,Mod.Icon);
            RouteOBJ.Name = Mod.Name;
            RouteOBJ.Class = Mod.Route;
            RouteOBJ.Inputs = Mod.Inputs;

            Routes[D] = RouteOBJ;
        }
    })

}

const install = function(Module) {
    console.log(" Installing route module: " + Module);
    spawnSync("npm", ["install", "" + Module + "", "--prefix", '"' + RootPath + '"'], { shell: true });
}

module.exports = {
    "installStockModules": installStockModules,
    "Routes": Routes,
    "loadModules":loadModules,
    "install": install,
    "setPath":setPath
}
