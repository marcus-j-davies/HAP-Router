<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" style="background-image: none;">

<head>
   <meta charset="utf-8" />
   <title>HAP Router</title>
   <link rel="stylesheet" href="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css" />
   <link rel="stylesheet" href="../../../ui/static/Style/style.css" />
   <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
   <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script>
   <script src="../../../ui/static/JS/qrcode.min.js"></script>
   <script src="../../../ui/static/JS/lc_switch.min.js"></script>
   <script src="../../../ui/static/JS/functions.js"></script>
</head>

<body>
   <blockquote class="ContentSection">
         <div class="ContentTitle">Configured Accessories
            <span style="float: right;">
            <input type="button" value="Add New Accessory" class="StyledButton" onclick="location.href='../../../ui/availableactypes'">
            </span>
         </div>

         {{#if BridgedAccessories.length}}
            <fieldset>
               <legend>Bridged Accessories</legend>

               <table style="width: 100%;">
                  {{#BridgedAccessories}}
                        <tr>
                           <td rowspan="4" style="width: 70px; vertical-align: top; text-align: center;">
                              <img class="AccessoryIcon" src="../../../ui/resources/accessoryicon/?type={{AccessoryCFG.type}}"> 
                           </td>
                           <td style="font-size: 16px;"><strong>{{AccessoryCFG.name}}</strong> <span style="cursor: pointer;" onclick="location = '../../../ui/editaccessory/{{AccessoryCFG.accessoryID}}'">&#9998;</span></td>
                           <td rowspan="4" style="text-align: right; vertical-align: top;"><img class="RouteIcon" src="../../../ui/resources/routeicon/?type={{RouteCFG.type}}"> </td>
                        </tr>
                        <tr><td>{{AccessoryCFG.typeDisplay}}</td></tr>
                        <tr><td>AID: {{AccessoryCFG.accessoryID}}, SN: {{AccessoryCFG.serialNumber}}</td></tr>
                        <tr><td>&nbsp</td></tr>

                  {{/BridgedAccessories}}
               </table>

               <script>
                  

                  
               </script>

            </fieldset>
         {{/if}}
  
        
         {{#if UNBridgedAccessories.length}}
            <fieldset>
               <legend>None-Bridged Accessories (Stand Alone)</legend>

               <table style="width: 100%;">
                  {{#UNBridgedAccessories}}
                        <tr>
                           <td rowspan="4" style="width: 70px; vertical-align: top; text-align: center;">
                              <img class="AccessoryIcon" src="../../../ui/resources/accessoryicon/?type={{AccessoryCFG.type}}"> 
                           </td>
                           <td style="font-size: 16px;"><strong>{{AccessoryCFG.name}}</strong> <span style="cursor: pointer;" onclick="location = '../../../ui/editaccessory/{{AccessoryCFG.accessoryID}}'">&#9998;</span></td>
                           <td rowspan="4" style="text-align: right; vertical-align: top;"><span class="PincodeHint" {{#if AccessoryCFG.isPaired}}enrolled{{/if}}>{{AccessoryCFG.pincode}}</span> <img class="RouteIcon" src="../../../ui/resources/routeicon/?type={{RouteCFG.type}}"> </td>
                        </tr>
                        <tr><td>{{AccessoryCFG.typeDisplay}}</td></tr>
                        <tr><td>AID: {{AccessoryCFG.accessoryID}}, SN: {{AccessoryCFG.serialNumber}}</td></tr>
                        <tr><td>&nbsp</td></tr>
                  {{/UNBridgedAccessories}}
               </table>

            </fieldset>
         {{/if}}




      </blockquote>

</body>

</html>