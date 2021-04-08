# Developing a Route Module
In its basic form, a route module is nothing more than a nodejs module, with an index.js and package.json file.  
like any other module in nodejs - your route can require other modules, just add them as a dependency in your package file

## Lets have a look at the HTTP Post Route
The **package.json** file is needed by all nodejs modules.  

**NOTE:**
Your module name **MUST** begin with **hkds-route-**, if it is not, it will not get loaded. 

```json
{
  "name": "hkds-route-http",
  "description": "The stock Homekit Device Stack HTTP route",
  "version": "1.0.0",
  "main": "index.js",
  "author": {
    "name": "Marcus Davies",
  },
  "license": "MIT",
  "dependencies": {
    "axios": "0.21.1"
  }
}
```

And the all important **index.js** file  

```javascript
'use strict'
const axios = require('axios')

/* UI Params */
const Params = [
    {
        id: "destinationURI",
        label: "HTTP URI"
    }
]

/* Metadata */
const Name = "HTTP Post Output";
const Icon = "icon.png";

/* Route Class */
class HTTPRoute {

    /* Constructor */
    constructor(route) {
        this.Route = route
    }
}

HTTPRoute.prototype.process = async function (payload) {

    let CFG = {
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Homekit Device Stack'
        },
        method: 'post',
        url: this.Route.destinationURI.replace('{{accessoryID}}', payload.accessory.accessoryID),
        data: payload
    }

    try{
        let Res = await axios.request(CFG);
    }
    catch(err){
        console.log(" HTTP Route Error: "+err)
    }
}

HTTPRoute.prototype.close = function (reason) {
}

module.exports = {
    "Route": HTTPRoute,
    "Inputs": Params,
    "Name": Name,
    "Icon": Icon
}
```

Your module file (it doesn't have to be called **index.js**), must export 4 objects.

| Property | What it's for                                                                 |
|----------|-------------------------------------------------------------------------------|
|Route     | A pointer to your modules main class.                                         |
|Inputs    | An array of input objects                                                     |
|Name      | The name as displayed in the UI                                               |
|Icon      | An icon file, relative to the root of your module.                            |

Your class (Exported as **Route**) must have a constructor that accepts an object representing the route settings, as confgiured in the UI.
The class must expose 2 prototype  methods: **process** and **close**

| Method                  | What it's for                                                                                  |
|-------------------------|------------------------------------------------------------------------------------------------|
|async process(payload)   | This is called when an accessory is sending an event, **payload** will contain the event data  |
|close(reason)            | This is called when the route is being destroyed (iether **reconfgiure** or **appclose**)      |

The **Inputs** object must be an array of input objects, it allows settings to be passed to the route during its constructor.  

```json
[
    {
        "id": "some_internal_identifyer",
        "label": "A Nice Title For The UI"
    }
]
```

## Installing your route module.

**Manual Install**
  - Bundle everything up in a folder with a name that matches your module name, and copy this folder to **/%Home%/HKDS/node_modules**
  - Go into your folder, now in **/%Home%/HKDS/node_modules**, and run ```npm install``` to install any dependencies your route module may need. 
  - Restart HomeKit Device Stack.

**Using NPM**  
If your route module has been published to NPM, you can install it with the ```installmodule``` command  
this will also allow you to install 3rd party route modules. A Restart of HomeKit Device Stack will be required in any case.

```node app.js installmodule {name_of_module}```

Or use NPM directly (you will need to specify a --prefix that points to the root config directory of HKDS)

```npm install {name_of_module} --prefix "/%Home%/HKDS"```




