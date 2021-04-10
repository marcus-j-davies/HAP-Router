<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
   <head>
      <meta charset="utf-8" />
      <title>Homekit Device Stack</title>
      <link rel="stylesheet" href="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css" />
      <link rel="stylesheet" href="../../../ui/static/Style/style.css" />
      <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
      <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script>
      <script src="../../../ui/static/JS/functions.js"></script>
      <script src="../../../ui/static/JS/qrcode.min.js"></script>
      <script src="../../../ui/static/JS/jsplumb.min.js"></script>
      <script type="text/Javascript">
         let Types = {{{AccessoryTypesJSON}}}
      </script>
   </head>
   <body>
      <div class="TopBanner">Homekit Device Stack

         <span style="float: right; cursor: pointer;" onclick="Show('Settings')">Settings&nbsp;</span>

      </div>
      <div id="Content">
         <div class="Middle Dialog" id="DevicePanel" style="width:740px;min-height:170px;margin-top:40px;">
            <div class="Title">
               Devices (Double click to edit)
               <div style="float: right;">
                  <span style="cursor: pointer;padding-right: 5px;" onclick="Show('Devices')">Create New
                  Accessory</span>
               </div>
            </div>
            {{#Config.accessories}}
            <div class="Accessory" id="{{accessoryID}}" style="cursor: pointer;" ondblclick="Javascript:document.location='../../../ui/editaccessory/{{type}}/{{accessoryID}}';">
               <table>
                  <tr>
                     <td style="vertical-align: top;"><img id="ICON_{{accessoryID}}" style="width:38px" class="invert" src="" /></td>
                     <td id="DNI_{{accessoryID}}" style="font-size: 12px;color: rgb(255,255,255);">
                        <strong>{{name}}</strong><br />
                        Device ID : {{accessoryID}}<br />
                        Serial ID : {{serialNumber}}
                     </td>
                  </tr>
               </table>
            </div>
            <script>

            let Prototype_{{accessoryID}} = Types.filter((T) => T.Name == "{{type}}")[0];
            $('#ICON_{{accessoryID}}').attr("src","../../../ui/static/Images/device_icons/"+Prototype_{{accessoryID}}.Icon);

               if(Prototype_{{accessoryID}}.SupportsRouting)
               {
                   EndPoints.push({ID:'{{accessoryID}}',TID:'{{route}}',element:document.getElementById('{{accessoryID}}'),type:"Source"})
               }

               if({{bridged}} == false)
               {
                  $("#DNI_{{accessoryID}}").append("<br /><span class=\"MDNSType\">{{pincode}}</span>")
               }
               

            </script>
            {{/Config.accessories}}
         </div>
         <div id="routes" class="Middle Dialog" style="width:740px; min-height:170px;margin-top:40px;">
            <div class="Title">
               Outgoing Routes (Double click to edit)
               <div style="float: right;">
                  <span style="cursor: pointer;padding-right: 5px;" onclick="Show('Routes',ClearRoute)">Create New
                  Route</span>
               </div>
            </div>
            {{#Routes}}
            <div class="Route" id="routes_{{name}}" style="cursor: pointer;pointer-events: all;" ondblclick="Show('Routes',ProcessRouteData)" properties="{{{JSONLayout}}}">
               <table style="pointer-events: none;">
                  <tr>
                     <td style="vertical-align: top;"><img style="width:38px" class="invert" src="../../../ui/static/Images/route_icons/{{value.type}}.png" />
                     </td>
                     <td style="font-size: 12px;color: rgb(255,255,255)">

                        <strong>{{name}}</strong><br />
                        {{#ifvalue value.type equals="HTTP"}}
                           {{value.destinationURI}}
                        {{/ifvalue}}

                        {{#ifvalue value.type equals="MQTT"}}
                           {{value.broker}}<br />
                           {{value.topic}}
                        {{/ifvalue}}

                        {{#ifvalue value.type equals="FILE"}}
                           {{value.directory}}
                        {{/ifvalue}}

                        {{#ifvalue value.type equals="UDP"}}
                           {{value.address}}:{{value.port}}
                        {{/ifvalue}}

                        {{#ifvalue value.type equals="WEBSOCKET"}}
                           {{value.uri}}
                     {{/ifvalue}}
                     </td>
                  </tr>
               </table>
            </div>
            <script>
               EndPoints.push({ID:'{{name}}',TID:'',element:document.getElementById('routes_{{name}}'),type:"Target"})
            </script>
            {{/Routes}}
         </div>
      </div>
      <script>
         jsPlumb.ready(function ()
         {
             jsPlumb.importDefaults({Connector:["Bezier",{curviness:75}],Endpoint:"Rectangle"})
             for(let i = 0;i<EndPoints.length;i++)
             {
                 let Prop =
                 {
                     isSource:(EndPoints[i].type == "Source"),
                     isTarget:(EndPoints[i].type != "Source"),
                     anchor:(EndPoints[i].type == "Source" ? "Bottom" : "Top"),
                     maxConnections :(EndPoints[i].type == "Source" ? 1: 100)
                 }
                 let C = jsPlumb.addEndpoint(EndPoints[i].element, Prop)
                 Connectors.push({ID:EndPoints[i].ID,isTarget:EndPoints[i].type != "Source",Connector:C,Target:EndPoints[i].TID})
            }
         
             for(let i = 0;i<Connectors.length;i++)
             {
                 if(!Connectors[i].isTarget)
                 {
                     try
                     {
                         let Target = Connectors.filter((E) => E.ID == Connectors[i].Target)[0]
                         jsPlumb.connect({source:Connectors[i].Connector, target:Target.Connector});
                     }
                     catch(e)
                     {
                         
                     }
                }
             }
         
             jsPlumb.bind("connection", function(info, originalEvent)
             {
                 if(originalEvent)
                 {
                     RouteCMD(info, "connect")
                 }
             });
         
             jsPlumb.bind("connectionDetached", function(info, originalEvent)
             {
                 if(originalEvent)
                 {
                     RouteCMD(info,"disconnect")
                 }
             });
         });
      </script>
      <div class="Popup" id="Routes">
         <div class="Middle Dialog" style="width:800px; height:600px;margin-top: 20px;">
            <div class="Title">
               Create A Route
               <div style="float: right;">
                  <span style="cursor: pointer;padding-right: 5px;" onclick="Hide('Routes')">Cancel</span>
               </div>
            </div>
            <table cellpadding="2" style="width: 80%; margin-left: auto;margin-right: auto;margin-top: 20px;">
               <tr>
                  <td colspan="2" style="vertical-align: top;">
                     When your accessories change state, HomeKit Devices Stack needs to know where to send the change event.
                     This is called a 'Route'. Once a Route has been created, you will be able to 'plumb' your devices into this Route.<br />
                     <br />
                     <br />
                  </td>
               </tr>
               <tr>
                  <td valign="top">Route Module</td>
                  <td style="text-align: right;">
                     <select id="R_Type" style="width: 300px" onchange="RouteTypeChanged()">
                       {{#RouteModules}}
                       <option value="{{Type}}">{{Name}}</option>
                       {{/RouteModules}}
                     </select>
                  </td>
               </tr>
               <tr>
                  <td valign="top">Route Name</td>
                  <td style="text-align: right;">
                     <input id="R_Name" type="text" style="width: 300px">
                  </td>
               </tr>

               <tr id="Anchor">
                  <td colspan="2"><hr /></td>
               </tr>
               
               <tr>
                  <td colspan="2" style="text-align: right;">
                     <input id="RDelete" route_name="" style="visibility:hidden;" class="StyledButton" onclick="DeleteRoute()" type="button" value="Delete"> <input class="StyledButton" onclick="SaveRoute()" type="button" value="Save">
                  </td>
               </tr>
            </table>
         </div>
      </div>

      <div class="Popup" id="Devices">
         <div class="Middle Dialog" style="width:800px; height:600px;margin-top: 20px;">
            <div class="Title">
               Select Accessory Type
               <div style="float: right;">
                  <span style="cursor: pointer;padding-right: 5px;" onclick="Hide('Devices')">Cancel</span>
               </div>
            </div>
            {{#AccessoryTypes}}
            <div style="display: inline-block;width: 60px;height: 50px;margin: 30px;text-align: center;font-size: 12px;vertical-align: top;">
               <img src="../../../ui/static/Images/device_icons/{{Icon}}" width="40" style="cursor: pointer;" onclick="javascript:document.location = '../../../ui/createaccessory/{{Name}}';"><br />
               {{Label}}
            </div>
            {{/AccessoryTypes}}
         </div>
      </div>

      <div class="Popup" id="Settings">
         <div class="Middle Dialog" style="width:800px; height:630px;margin-top: 20px;">
            <div class="Title">
               Homekit Device Stack Settings
               <div style="float: right;">
                  <span style="cursor: pointer;padding-right: 5px;" onclick="Hide('Settings')">Close</span>
               </div>
            </div>
            <blockquote>
               <blockquote>
                  <table style="width: 100%; font-size: 16px;">
                     <tr>
                        <td colspan="2">HomeKit Device Stack<br /><br />Please note : The options below will require a restart of HomeKit Device Stack.<br /><br /></td>
                        
                     </tr>
                     <tr>
                        <td>Enable MQTT Client</td>
                        <td style="text-align: right;"><input id="CFG_MQTT" type="checkbox"></td>
                     </tr>
                     <tr>
                        <td>Broker</td>
                        <td style="text-align: right;"><input style="width: 100%;" id="CFG_Broker" type="text" value="{{Config.MQTTBroker}}"></td>
                     </tr>
                     <tr>
                        <td>Topic</td>
                        <td style="text-align: right;"><input  style="width: 100%;" id="CFG_Topic" type="text" value="{{Config.MQTTTopic}}"></td>
                     </tr>
                     <tr>
                        <td>Username</td>
                        <td style="text-align: right;"><input style="width: 100%;"  id="CFG_username" type="text" value="{{Config.MQTTOptions.username}}"></td>
                     </tr>
                     <tr>
                        <td>Password</td>
                        <td style="text-align: right;"><input style="width: 100%;"  id="CFG_password" type="text"value="{{Config.MQTTOptions.password}}"></td>
                     </tr>
                     <tr>
                        <td>&nbsp</td>
                        <td>&nbsp</td>
                     </tr>
                     <tr>
                        <td>Web Interface/REST API Interface</td>
                        <td style="text-align: right;">
                           <select id="CFG_Address"  style="width: 100%;" >
                              <option value="ALL">All</option>
                              {{#each interfaces}}
                                 <option value="{{this}}">{{this}}</option>
                              {{/each}}
                           </select>
                        </td>
                     </tr>
                     <tr>
                        <td>Web Interface/REST API Port</td>
                        <td style="text-align: right;"> <input  style="width: 100%;"  id="CFG_Port" type="text" value="{{Config.webInterfacePort}}"></td>
                     </tr>
                     <tr>
                        <td>&nbsp</td>
                        <td>&nbsp</td>
                     </tr>
                     <tr>
                        <td>mDNS Advertiser</td>
                        <td style="text-align: right;">
                           <select id="CFG_Advertiser"  style="width: 100%;" >
                              <option value="bonjour-hap">BONJOUR-HAP (Legacy)</option>
                              <option value="ciao">CIAO</option>
                           </select>
                        </td>
                     </tr>
                     <tr>
                        <td>Bind To Interface</td>
                        <td style="text-align: right;">
                           <select id="CFG_Interface"  style="width: 100%;" >
                              <option value="ALL">First Available</option>
                              {{#each interfaces}}
                                 <option value="{{this}}">{{this}}</option>
                              {{/each}}
                           </select>
                        </td>
                     </tr>
                     <tr>
                        <td>&nbsp</td>
                        <td>&nbsp</td>
                     </tr>
                     <tr>
                        <td>Save Changes (Requires Restart)</td>
                        <td style="text-align: right;"> <input style="width: 100px;" class="StyledButton" onclick="SaveConfig()" type="button" value="Apply"></td>
                     </tr>
                     <tr>
                        <td>&nbsp</td>
                        <td>&nbsp</td>
                     </tr>
                     <tr>
                        <td>Backup Configuration and Homekit Data</td>
                        <td style="text-align: right;"> <input style="width: 100px;" class="StyledButton" onclick="javascript:document.location = '../../../ui/backup'" type="button" value="Download"></td>
                     </tr>
                     <tr>
                        <td>Restore Configuration and Homekit Data</td>
                        <td style="text-align: right;"> <input style="width: 100px;" class="StyledButton" onclick="StartRestore()" type="button" value="Restore"></td>
                     </tr>
                    
                  </table>
                 
               </blockquote>
            </blockquote>
         </div>
      </div>

      <script>
         TypeChanged();
         if("{{Config.enableIncomingMQTT}}" == "true") {
            $("#CFG_MQTT").prop("checked",true);
         }
         $("#CFG_Address").val('{{Config.webInterfaceAddress}}')
         $("#CFG_Interface").val('{{Config.interface}}')
          $("#CFG_Advertiser").val('{{Config.advertiser}}')
      </script>
   </body>
</html>