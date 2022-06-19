# Developing a Route Module
In its basic form, a route module is nothing more than a nodejs module, with an index.js and package.json file.  
like any other module in nodejs - your route can require other modules, just add them as a dependency in your package file.

There is one requirement that you MUST follow for the module to work:  
the name must match **haprouter-route-\***. Its also fine to scope the package, so **@*/haprouter-route-\*** will work.

## Lets have a look at the HTTP Post Route
The **package.json** file is needed by all nodejs modules.  

```javascript
{
  "name": "@marcus-j-davies/haprouter-route-http",
  "description": "The stock HAP Router HTTP route",
  "version": "4.0.0",
  "main": "index.js",
  "license": "MIT",
  "dependencies": {
    "axios": "^0.27.2"
  }
}
```

And the all important **index.js** file  

```javascript
const axios = require('axios');

/* UI Params */
const Params = [
	{
		id: 'destinationURI',
		label: 'HTTP URI'
	},
	{
		id: 'username',
		label: 'HTTP Username (optional)'
	},
	{
		id: 'password',
		label: 'HTTP Password (optional)',
		type: 'password'
	}
];

/*  Metadata */
const Name = 'HTTP POST Output';
const Icon = 'icon.png';

/* Route Class */
class HTTPRoute {
	/* Constructor */
	constructor(route, statusnotify) {
		this.StatusNotify = statusnotify;
		this.Route = route;
		statusnotify({ success: true });
	}
}

HTTPRoute.prototype.process = async function (payload) {
	const CFG = {
		headers: {
			'Content-Type': 'application/json',
			'User-Agent': 'HAP Router'
		},
		method: 'post',
		url: this.Route.destinationURI.replace(
			'{{AccessoryID}}',
			payload.accessory.AccessoryID
		),
		data: payload
	};

	if (
		this.Route.username !== undefined &&
		this.Route.username.length > 0 &&
		this.Route.password !== undefined &&
		this.Route.password.length > 0
	) {
		CFG.auth = {};
		CFG.auth.username = this.Route.username;
		CFG.auth.password = this.Route.password;
	}

	try {
		await axios.request(CFG);
		this.StatusNotify({ success: true });
	} catch (err) {
		if (err) {
			this.StatusNotify({ success: false, message: err.message });
		}
	}
};

HTTPRoute.prototype.close = function () {};

module.exports = {
	Route: HTTPRoute,
	Inputs: Params,
	Name: Name,
	Icon: Icon
};
```

Your module file (it doesn't have to be called **index.js**), must export 4 objects.

| Property  | What it's for                                                                 |
|-----------|-------------------------------------------------------------------------------|
| Route     | A pointer to your modules main class.                                         |
| Inputs    | An array of input objects                                                     |
| Name      | The name as displayed in the UI                                               |
| Icon      | An icon file, relative to the root of your module.                            |

The Icon file MUST meet the following spec.  
**Type:** PNG  
**Size:** 50x50  
**Color:** White (Transparency is ok - in fact, encouraged, as to not look ugly)  

Your class (Exported as **Route**) must have a constructor that accepts an object representing the route settings, as configured in the UI,  
and also to store a callback used to update the user, with the current status of the module.  

The callback method signature(s) are as follows:

| Signature          | Meaning                                                                 |
|--------------------|-------------------------------------------------------------------------|
| (undefined)        | Default - Module is initialising                                        |
| ({"success":true})             | The module (and all of its internals) is ready for use                  |
| ({"success":false,message:"some error message"}) | The module is in a faulted state, pass a brief message to explain       |


The class must expose 2 prototype  methods: **process** and **close**

| Method                   | What it's for                                                                                  |
|--------------------------|------------------------------------------------------------------------------------------------|
| async process(payload)   | This is called when an accessory is sending an event, **payload** will contain the event data  |
| close(reason)            | This is called when the route is being destroyed (iether **reconfigure** or **appclose**)      |

The **Inputs** object must be an array of input objects, it allows settings to be passed to the route during its constructor.  

```javascript
[
    {
        "id": "some_internal_identifyer",
        "label": "A Nice Title For The UI",
        "type": "text" | "password" | "number" | "checkbox"
    }
]
```
the **type** property is optional, and will default to text if not specifed.

## Installing your route module.

Publish your module to NPM

Then you can install it with the ```installmodule``` command  
This will also allow you to install 3rd party route modules. A Restart of HAP Router will be required in any case.

```node HAPRouter.js installmodule {{Name}}```
