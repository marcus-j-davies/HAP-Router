'use strict'
const PATH = require('path');
const FS = require('fs');
const PACKAGE = require('../package.json')
const { spawnSync } = require('child_process');

var RootPath;

const Routes = {
}

const setPath = function (Path) {

    RootPath = Path;
    FS.mkdirSync(PATH.join(RootPath, "node_modules"),{recursive:true})
    module.paths.push(PATH.join(RootPath, "node_modules"))
}


const loadModules = function () {

    loadStockModules();

    let Files = FS.readdirSync(PATH.join(RootPath, "node_modules"));

    Files.forEach((D) => {

        if (!D.startsWith("haprouter-route-")) {
            return;
        }

        let FI = FS.lstatSync(PATH.join(RootPath, "node_modules", D))
        if (FI.isDirectory()) {

            let Mod = require(D);
            let RouteOBJ = {}

            let DIR = PATH.dirname(require.resolve(D))

            RouteOBJ.Type = D
            RouteOBJ.Icon = PATH.join(DIR, Mod.Icon);
            RouteOBJ.Name = Mod.Name;
            RouteOBJ.Class = Mod.Route;
            RouteOBJ.Inputs = Mod.Inputs;

            Routes[D] = RouteOBJ;
        }
    })

}

const loadStockModules = function () {

    let Deps = Object.keys(PACKAGE.dependencies).filter((D) => D.startsWith('haprouter-route-')).map((D) => D);

    Deps.forEach((R) => {

        let Mod = require(R);
        let RouteOBJ = {}

        let DIR = PATH.dirname(require.resolve(R))

        RouteOBJ.Type = R
        RouteOBJ.Icon = PATH.join(DIR, Mod.Icon);
        RouteOBJ.Name = Mod.Name;
        RouteOBJ.Class = Mod.Route;
        RouteOBJ.Inputs = Mod.Inputs;

        Routes[R] = RouteOBJ;

    })
}

const install = function (Module) {
    console.log(" Installing route module: " + Module);
    spawnSync("npm", ["install", "" + Module + "", "--prefix", '"' + RootPath + '"'], { shell: true });
}

module.exports = {
    "Routes": Routes,
    "loadModules": loadModules,
    "install": install,
    "setPath": setPath
}
