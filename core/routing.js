const PATH = require('path');
const FS = require('fs');
const MATCHER = require('matcher');
const { spawnSync } = require('child_process');
const { dependencies } = require('../package.json');

let RootPath;

const Routes = {};

const setPath = function (Path) {
	RootPath = Path;

	if (!FS.existsSync(PATH.join(RootPath, 'node_modules'))) {
		FS.mkdirSync(PATH.join(RootPath, 'node_modules'), { recursive: true });
	}
	module.paths.push(PATH.join(RootPath, 'node_modules'));
};

const loadModules = function () {
	loadStockModules();

	const Regex = new  RegExp("@*/haprouter-route-*")

	const LockPath = PATH.join(RootPath, 'package-lock.json');

	if (!FS.existsSync(LockPath)) {
		return;
	}

	const CustomDeps = require(LockPath).dependencies;
	let Match1 = Object.keys(CustomDeps)
		.filter((RP) =>
			MATCHER.isMatch(RP, '*@*/haprouter-route-*', { caseSensitive: false })
		)
		.map((RP) => RP);
	const Match2 = Object.keys(CustomDeps)
		.filter((RP) =>
			MATCHER.isMatch(RP, 'haprouter-route-*', { caseSensitive: false })
		)
		.map((RP) => RP);

	Match1 = Match1.concat(Match2);

	Match1.forEach((RP) => {
		const Mod = require(RP);
		const PKG = require(RP + '/package.json');
		const RouteOBJ = {};

		const DIR = PATH.dirname(require.resolve(RP));

		RouteOBJ.Type = RP;
		RouteOBJ.Icon = PATH.join(DIR, Mod.Icon);
		RouteOBJ.Name = Mod.Name;
		RouteOBJ.Class = Mod.Route;
		RouteOBJ.Inputs = Mod.Inputs;
		RouteOBJ.Description = PKG.description;

		Routes[RP] = RouteOBJ;
	});
};

const loadStockModules = function () {
	const RPKGS = Object.keys(dependencies)
		.filter((D) =>
			MATCHER.isMatch(D, '@*/haprouter-route-*', { caseSensitive: false })
		)
		.map((D) => D);

	RPKGS.forEach((RP) => {
		const Mod = require(RP);
		const PKG = require(RP + '/package.json');
		const RouteOBJ = {};

		const DIR = PATH.dirname(require.resolve(RP));

		RouteOBJ.Type = RP;
		RouteOBJ.Icon = PATH.join(DIR, Mod.Icon);
		RouteOBJ.Name = Mod.Name;
		RouteOBJ.Class = Mod.Route;
		RouteOBJ.Inputs = Mod.Inputs;
		RouteOBJ.Description = PKG.description;

		Routes[RP] = RouteOBJ;
	});
};

const install = function (Module) {
	console.log(` Installing route module: ${Module}`);
	spawnSync(
		'npm',
		['install', '--production', `${Module}`, '--prefix', `"${RootPath}"`],
		{ shell: true }
	);
};

module.exports = {
	Routes: Routes,
	loadModules: loadModules,
	install: install,
	setPath: setPath
};
