  - **4.0.0** 

    - **Breaking Changes**
      - Min NodeJS version is now 14.14.0
      - Route status callback has been updated, and now requires an object to be passed.
        ```javascript
        {
          "success": boolean,
          "message": string
        }
        ```
    - **Fixes**
      - Fix missing folder at start up.


  - **3.0.2** 

    - **Changes**
      - Bump cookie-parser
      - Bump express
      - Bump express-basic-auth
      - Bump hap-nodejs
      - Bump mqtt
      - Bump qrcode
      - Bump ws
      - Bump axios
      - Bump ESLint

  - **3.0.1** 

    - **Fixes**
      - Fix incorrect accessory function call in the UI

    - **Changes**
      - Bump dependencies.
      - Change default Max Packet Size for Camera Accessory

  - **3.0.0** 

    - **Breaking Changes**
      - Password storage now uses **bcrypt**.
        Use the **passwd** command to recreate the hashed password, until then, the UI and API won't be available.

    - **Changes**
      - Bump dependencies.
      - Massive Code Refactoring
      - Various bug fixes and performance improvements.
      - The web UI and API now has rate limiting (100/2.5s)
      - The cookie signature key is now generated at start up (previously hard coded)
      - Various security enhancements 
      - Performance improvements to built in route modules

    - **New Features**
      - The built-in **Websocket** and **MQTT** routes now include recovery if connections are lost
      - Custom route modules can now specify input types of: **text**, **password**, **number** and **checkbox**
        if not specified they are rendered as **text**
      - Route status is now updated in real time on the Web UI

  - **2.1.0**

    - Removed CHALK formatted banner.
    - Small improvements to core
    - bug fixes

  - **2.0.0 BREAKING CHANGES**

    - The Accessories Motion, Temp, Light Sensor and Humidity Sensor have all been removed,
      and replaced with 1 single accessory, where you select the services to enable.
    - Added Air Quality Sensor
    - Removed the **DELAY_ROUTE_SETUP** environment variable, and made it a setting.
    - Config resets now use node recursive options (previously using the **del** package)
    - Minimum NodeJS is now v12.22.2

  - **1.7.0**

    - Bump WS dependancy for **haprouter-route-websocket**
    - Added a combined Temp and Humidty Sensor

  - **1.6.0**

    - Added a Humidity Sensor Accessory.

  - **1.5.0**

    - Route Module status is now displayed in the UI.
    - Route Module description added to UI (taken from **package.json**).
    - Custom Route Modules now contain a callback in the constructor, which can be used to  
      update the user with the status of the Module.

  - **1.4.1**

    - Adding an environment variable of **DELAY_ROUTE_SETUP** delays the setup of routes, for the specified milliseconds.

  - **1.4.0**

    - Added a new combined/Multsensor accessory (Motion, Light, Temp)
    - Added a new NULL output, Which can be used for switchs that are used as a state, in homekit automations.

  - **1.3.0**

    - AccessoryType in the API response now matches the AccessoryType in events.  
    - Exposed accessory specific actions in the accessory info UI  
    - Improvements to Camera code.  
    - Added Backup/Restore features

  - **1.2.2**

    - Added **.github** and **.gitattributes** to package exclusion  

  - **1.2.1**

    - Moved purging/clearing configuration to the **del** package  
      for better cross platform support.  
    - Fixed potential exception when creating **node_modules** directory on start up  
    - Bump Chalk package

  - **1.2.0**

    - Initial Release