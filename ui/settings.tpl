<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" style="background-image: none;">

<head>
   <meta charset="utf-8" />
   <title>HAP Router</title>
   <link rel="stylesheet" href="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css" />
   <link rel="stylesheet" href="../../../ui/static/Style/style.css" />
   <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
   <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script>
   <script src="../../../ui/static/JS/functions.js"></script>
   <script src="../../../ui/static/JS/qrcode.min.js"></script>
</head>

<body>
      <blockquote class="ContentSection">
         <div class="ContentTitle">HAP Router Settings</div>

         <!-- MQTT-->
         <fieldset>
            <legend>MQTT Client</legend>
            <table>
               <tr>
                  <td style="width: 200px;">Enabled</td>
                  <td><input type="checkbox" id="CFG_MQTTEnabled" {{#if Config.enableIncomingMQTT}}checked{{/if}}></td>
               </tr>
               <tr>
                  <td>MQTT Broker</td>
                  <td><input type="text" id="CFG_MQTTBroker" value="{{Config.MQTTBroker}}"></td>
               </tr>
               <tr>
                  <td>MQTT Topic</td>
                  <td><input type="text" id="CFG_MQTTTopic" value="{{Config.MQTTTopic}}"></td>
               </tr>
               <tr>
                  <td>MQTT Username</td>
                  <td><input type="text" id="CFG_MQTTUsername" value="{{Config.MQTTOptions.username}}"></td>
               </tr>
               <tr>
                  <td>MQTT Password</td>
                  <td><input type="text" id="CFG_MQTTPassword" value="{{Config.MQTTOptions.password}}"></td>
               </tr>
            </table>
         </fieldset>

         <!-- Network Ports-->
         <fieldset>
            <legend>Network / mDNS</legend>
            <table>
               <tr>
                  <td style="width: 200px;">mDNS Advertiser</td>
                  <td>
                     <select id="CFG_Advertiser">
                        <option value="bonjour-hap">BONJOUR-HAP (Legacy)</option>
                        <option value="ciao">CIAO</option>
                     </select>
                     <script> $("#CFG_Advertiser").val("{{Config.advertiser}}")</script>
                  </td>
               </tr>
               <tr>
                  <td>mDNS Interface</td>
                  <td>
                     <select id="CFG_MDNSInterface">
                        <option value="ALL">First Available</option>
                        {{#Interfaces}}
                        <option value="{{.}}">{{.}}</option>
                        {{/Interfaces}}
                     </select>
                     <script> $("#CFG_MDNSInterface").val("{{Config.interface}}")</script>
                  </td>
               </tr>
               <tr>
                  <td>Web/API Interface</td>
                  <td>
                     <select id="CFG_APIInterface">
                        <option value="ALL">All Interfaces</option>
                        {{#Interfaces}}
                        <option value="{{.}}">{{.}}</option>
                        {{/Interfaces}}
                     </select>
                     <script> $("#CFG_APIInterface").val("{{Config.webInterfaceAddress}}")</script>
                  </td>
               </tr>
               <tr>
                  <td>Web/API Port</td>
                  <td><input type="number" id="CFG_APIPort" value="{{Config.webInterfacePort}}"></td>
               </tr>
            </table>
         </fieldset>

         <!-- Backup / Restore-->
         <fieldset>
            <legend>Backup And Restore</legend>
            <div style="text-align: right;">
               <input type="button" class="StyledButton" value="Backup Configuration"> &nbsp; &nbsp; <input type="button" class="StyledButton" value="Restore Configuration">
            </div>
         </fieldset>

         <!-- Save-->
         <fieldset style="text-align: right; margin-top: 20px;">
           <span style="color: rgb(255,255,255);" id="Message"></span> <input type="button" class="StyledButton" value="Save Changes" onclick="SaveSettings()">
         </fieldset>



      </blockquote>

      {{#if RestartRequired}}
      <script>$("#Message").text("A restart is required to apply some recent changes.")</script>
      {{/if}}

</body>

</html>