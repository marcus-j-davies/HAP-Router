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
  "version": "1.2.0",
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

/*  Metadata */
const Name = "HTTP POST Output";
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
            'User-Agent': 'HAP Router'
        },
        method: 'post',
        url: this.Route.destinationURI.replace('{{AccessoryID}}', payload.accessory.AccessoryID),
        data: payload
    }
    
    try{
        let Res = await axios.request(CFG)
    }
    catch(err){
        console.log(" HTTP Route error: "+err)
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

Your class (Exported as **Route**) must have a constructor that accepts an object representing the route settings, as confgiured in the UI.
The class must expose 2 prototype  methods: **process** and **close**

| Method                   | What it's for                                                                                  |
|--------------------------|------------------------------------------------------------------------------------------------|
| async process(payload)   | This is called when an accessory is sending an event, **payload** will contain the event data  |
| close(reason)            | This is called when the route is being destroyed (iether **reconfgiure** or **appclose**)      |

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

Publish your module to NPM

Then you can install it with the ```installmodule``` command  
This will also allow you to install 3rd party route modules. A Restart of HAP Router will be required in any case.

```node HAPRouter.js installmodule {{Name}}```
