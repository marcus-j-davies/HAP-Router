
# HAP Router
A Middleware HAP Router for bringing HomeKit functionality to your Home Automation.  

HAP Router is a middleware server that allows you to take advantage of Apples HomeKit technology, and bring it in to your automation ecosystem.  
This is achieved by creating simple, software based accessories, that can be enrolled into HomeKit.  

The difference however, is that the events that occur on them are directected (or routed) to a transport of your choice.  
These transports can be a UDP broadcast, a message sent to an MQTT broker, sent to Node Red or anything other automation platform.  

Transports are the medium, in which the event is travelled. By default the following transports (or routes) are as follows:  
  - HTTP
  - UDP Broadcast
  - File
  - MQTT
  - Websocket
  - Custom Route Module

## Nice! - but how?
The server is managed by a gorgeous looking Web User Interface (if the above images haven't already suggested so), It is a brease to use, and  at the basic level you:
 - Create a Route
 - Create an Accessory (Choosing one of the Routes that are configured)
 - Enroll the device in HomeKit.
 - Have Fun.

Devices can be 'published' in 2 ways:  
 - Attached to a bridge (HAP Router also acts as a Bridge)  
 - Exposed as a seperate device.

 If you have Enrolled HAP Router in your HomeKit environment as a bridge, then any devices attached to this Bridge, will be seen when published.
 else, you enroll the accessory as a separate entity.






Homekit Device Stack is like no other. it's a NodeJS server with a fully web based front end, that allows you to create fully functional, virtual Homekit Smart accessories, then with those accessories,  
visually wire the events that occur on them into various other automation platforms using common transport mechanisms.  

  - HTTP
  - UDP Broadcast
  - File
  - MQTT
  - Websocket
  - Custom Route Modules (v4)
  
  You can for instance, send a command to node-red, openhab & home assistant whenever one of your accessories have been manipulated from your iOS device.  
  infact, as long as the automation platform supports one of the transports above, it will work with Homekit Device Stack, if not, you can write your own Route module.  

  ## Custom Route modules
  As of Version 4, routes are now provided in the form of nodejs modules.  
  Routes are 'plugins', that extend the transport abilities of Homekit Device Stack.  

  Whilst Homekit Device Stack has not been written to work with physical devices directly, given enough effort, you could write a route module that does just that.

  Click [here](./RouteModule.md), to learn how to write a module, and install it. 


  The system is extremely intuitive.  

  - Create an accessory
  - Create a route (the transport method, and endpoint)
  - Connect the 2 (drag-connect)
  - Done!

  routes can be used by more than 1 accessory, and you can create any number of routes.

![Nodes](./Screenshot4.png)

The accessories are pre-confgiured, and you only need to supply the metadata for them, i.e the accessory name, the inputs available (Smart TV), the camera stream source (Smart Camera), and so on.  
  
currently, 16 different accessory types are supported. - the aim of course is to keep increasing this.

  - CCTV Camera
  - Door/Window Contact Sensor
  - Electrical Outlet
  - Fan
  - Garage Door Opener
  - Leak Sensor
  - Light Sensor
  - Lock
  - Motion Sensor
  - Security System
  - Smart Light Bulb
  - Smart TV
  - Smoke Sensor
  - Switch
  - Temperature Sensor
  - Thermostat


The message that is sent using your transport route is below.  
```json
{
    "accessory": {
        "type": "SWITCH",
        "name": "Switch Accessory Demo",
        "accessoryID": "CD2947583B71"
    },
    "type": "change",
    "change": {
        "characteristic": "On",
        "value": true
    },
    "source": "iOS_DEVICE",
    "route_type": "FILE",
    "route_name": "File Output"
}
```

There are 3 possible event types:  

| Event           | Description                                               | 
| --------------- | --------------------------------------------------------- |
| change          | One of the characteristics has changed.                   |
| identify        | The device has been identified (clicking identify in iOS) |
| pair            | The pairing state of the non bridged device has changed.  |

The **source** object in the change payload above, identifies where the change occurred **iOS_DEVICE** or **API**  
Note : if the event type is **identify** or **pair** then **source** is omitted.

Events **identify** and **pair** will include  **isPaired** - which states whether or not the accessory has currently been enrolled.

## Is this homebridge?
No, homebridge is targeted towards providing Homekit support for non compatible devices.  
The purpose of HomeKit Device Stack, is to provide a homekit virtualisation platform, that allows hot swopping its outgoing communication.  
 
## So, can I change the status of the accessories, without an iOS device
Yes!  
HomeKit Device Stack has 2 network based inputs.  

  - A REST based HTTP API
  - MQTT Topic Subscription  

Both these inputs allow manipulation of the accessory states. These altered states are then reflected in HomeApp, or any other Homekit based application.
  
Changes originating from these inputs may cause routes to trigger, making use of the **source** object can be used to filter these out.

The URL for the REST API is **http://IP-ADDRESS:7989/{password}/**

| Method | Address                       | Description                                             |
| ------ | ----------------------------- | ------------------------------------------------------- |       
| GET    | /accessories                  | Lists all accessories and there current characteristics |       
| GET    | /accessories/accessoryID      | Same as above but for the identified accessory          |      
| PUT    | /accessories/accessoryID      | Sets characteristics for the identified accessory       |    

The body in your HTTP PUT command, should be nothing more than a JSON object representing the characteristics to set

```json
{
  "On": false,
  "OutletInUse": true
}
```
The same format should be used for MQTT messages.  
The topic should end with the accessory ID Ex: **HKDS/IN/HDSH389HJS**.  
You can change the leading topic name in the UI. by default its **HKDS/IN/**. 

## Installing   
Ensure you have **NodeJS** and **NPM** installed.
Then install Homekit Device Stack

    npm install homekit-device-stack

## Running
Within the directory that HomeKit Device Stack is installed.

    node App.js

If creating an auto start script - ensure the script is set to run under the installed directory

## Command line arguments
**reset** - Completely Resets HomeKit Device Stack (inits a default configuration)  
**passwd** {desired password} - set the admin password  
**installmodule** {name of module} - install a  [custom Route Module](./RouteModule.md)

## Credits
HomeKit Device Stack is based on the awesome [HAP-NodeJS](https://github.com/homebridge/HAP-NodeJS)
library, without it, projects like this one are not possible.

## Version History  

  - **4.0.0**  
    **BREAKING CHANGE : V4 is not backwards compatible with V3 configurations - Sorry :(**  

    - Added 4 new sensor devices (Smoke, Light, Leak & Temperature)  
    - Added A Websocket Route  
    - Optimised Route logic
    - Bump HAP-NodeJS to 0.9.1  
    - Cleaned hap code to fall in line with hap-nodejs spec.  
    - Restore option added to setup page, removing the need to re-enroll, if re-installing HKDS.  
    - Accessory Characteristics are now written to disc and restored, when terminating/starting HKDS.  
    - Improvements to Read Me.  
    - Small improvements to UI (new background being one).
    - Migrated UI template engine to handlebars
    - Added the ability to use either **CIAO** or **BONJOUR-HAP** for the advertiser.
    - Added the ability to attach to a specific interface.  
    - Routes are now provided as modules - allowing enhanced route development

  - **3.0.3**  
    - Fixed 'Accessory Not Responding' after editing a non bridged device.  
    - Fixed potential crash where a no longer existing route is to trigger.  
    - Added pairing events to out going routes for non-bridged devices  
    - Added pairing pin code to UI for non-bridged devices.

  - **3.0.2**  
    - House keeping  
    - Further Camera improvements

  - **3.0.1**  
    - Added delete option when editing routes  
    - Fixed crash on attempting to update an unknown Device ID  

  - **3.0.0**  
    - New User Interface (+ Added route configuration to UI)  
    - Optimisations/Improvements/Bug Fixes to the core code  
    - Optimisations/Improvements/Bug Fixes to the camera implementation  
    - **description** property of accessories no longer in use.  
    - Added Fan Accessory  
    - Enhanced MQTT Route to allow Accessory ID in the topic name  
    - Enhanced FILE Route to allow Accessory ID in the folder path  
    - Enhanced HTTP Route to allow Accessory ID in the URI  
    - Added ability to publish your accessories attached or detached from a HomeKit 'Bridge'  
    - Added the ability to backup/restore your configuration.  
    - Added the (optional) motion sensor and door bell services to camera accessories  
      (to support rich notifications in iOS 13+)


  - **2.1.0**  
    - Bump all dependencies to latest stable releases  
    - Migrated Camera object to latest **CameraController** API  
    - Added light bulb device.


  - **2.0.1**  
    - Fixed inability to hide TV inputs from view.  
    - Fixed security issue allowing access without logging in.  
    - Fixed potential ffmpeg process freeze.  
    - Fixed disconnected web client exception.  
    - Added Route type icon to accessory panel  

  - **2.0.0**  
    **BREAKING CHANGES!**  

    - Bump all dependencies to latest stable releases
    - Relocated HKDS and HomeKit configuration (config now survives updates)  
      Make a copy of your **config.json** file and any files inside the **HomeKit** dir, then...  
      **config.json** should be moved to  **%Home%/HomeKitDeviceStack**  
      **HomeKit/*.json** should be moved to **%Home%/HomeKitDeviceStack/HomeKitPersist**  
    - The **directory** value for File routes should now only contain a name of a folder  
      that is relative  to **%Home%/HomeKitDeviceStack/**
    

  - **1.1.3**  
    - Update Read Me 
  - **1.1.2**  
    - Improved layout for acessories UI.  
    - Outgoing route performance improvements  
    - Fixed null reference for accessories without a defined route (i.e. camera)
  - **1.1.1**  
    - Removed unused parameter from Server constructor.
  - **1.1.0**  
    - Added ability to manipulate devices via MQTT  
    - Improved error handling  
    - Fixed showing loopback address in console.  
    - Switched to using axios for the HTTP route type  
    - Switched to internal NodeJS crypto library
  - **1.0.1**  
    - Fixed typo in read me
  - **1.0.0**  
    - Initial Release  


## To Do
  - Continue to add more accessory types