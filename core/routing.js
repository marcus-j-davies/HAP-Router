'use strict'

const PATH = require('path');
const FS = require('fs');
const MATCHER = require("matcher")
const { spawnSync } = require('child_process');
const { dependencies } = require("../package-lock.json")

var RootPath;

const Routes = {
}

const setPath = function (Path) {

    RootPath = Path;
    FS.mkdirSync(PATH.join(RootPath, "node_modules"), { recursive: true })
    module.paths.push(PATH.join(RootPath, "node_modules"))
}


const loadModules = function () {

    loadStockModules();

    let LockPath = PATH.join(RootPath, "package-lock.json");

    if (!FS.existsSync(LockPath)) {
        return
    }

    let CustomDeps = require(LockPath).dependencies
    let Match1 = Object.keys(CustomDeps).filter((RP) => MATCHER.isMatch(RP, '@*/haprouter-route-*', { caseSensitive: false })).map((RP) => RP);
    let Match2 = Object.keys(CustomDeps).filter((RP) => MATCHER.isMatch(RP, 'haprouter-route-*', { caseSensitive: false })).map((RP) => RP);

    Match1 = Match1.concat(Match2)

    Match1.forEach((RP) => {

        let Mod = require(RP);
        let RouteOBJ = {}

        let DIR = PATH.dirname(require.resolve(RP))

        RouteOBJ.Type = RP
        RouteOBJ.Icon = PATH.join(DIR, Mod.Icon);
        RouteOBJ.Name = Mod.Name;
        RouteOBJ.Class = Mod.Route;
        RouteOBJ.Inputs = Mod.Inputs;

        Routes[RP] = RouteOBJ;

    })

}

const loadStockModules = function () {

    let RPKGS = Object.keys(dependencies).filter((D) => MATCHER.isMatch(D, '@*/haprouter-route-*', { caseSensitive: false })).map((D) => D);

    RPKGS.forEach((RP) => {

        let Mod = require(RP);
        let RouteOBJ = {}

        let DIR = PATH.dirname(require.resolve(RP))

        RouteOBJ.Type = RP
        RouteOBJ.Icon = PATH.join(DIR, Mod.Icon);
        RouteOBJ.Name = Mod.Name;
        RouteOBJ.Class = Mod.Route;
        RouteOBJ.Inputs = Mod.Inputs;

        Routes[RP] = RouteOBJ;

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
