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
      <div class="ContentTitle"> <img class="AccessoryIcon" style="margin-bottom: 5px;width: unset;" src="../../../ui/resources/accessoryicon/?type={{Specification.type}}" invert> Create a new {{Specification.Label}}
         <span style="float: right;">
         <input type="button" value="Back" class="StyledButton" onclick="window.history.back();">
         </span>
      </div>

         <fieldset>
            <legend>Basic Settings</legend>
            <table>
               <tr>
                  <td style="width: 200px;">Name</td>
                  <td><input type="text" id="ACC_Name" value="{{Specification.Label}}"></td>
               </tr>
               <tr>
                  <td>Manufacturer</td>
                  <td><input type="text" id="ACC_MAN" placeholder="Use Default"></td>
               </tr>
               <tr>
                  <td>Model</td>
                  <td><input type="text" id="ACC_MODEL" placeholder="Use Default"></td>
               </tr>
               <tr>
                  <td>Serial Number</td>
                  <td><input type="text" id="ACC_SN" placeholder="Auto Generate"></td>
               </tr>
               <tr>
                  <td>Route</td>
                  <td>
                     <select id="ACC_Route">
                        <option>Select Route</option>
                        {{#Routes}}
                        <option value="{{.}}">{{.}}</option>
                        {{/Routes}}
                     </select>
                  </td>
               </tr>
               <tr>
                  <td>Publish Type</td>
                  <td>
                     <select id="ACC_PublishMode">
                         <option value="Attached">Attach To Bridge</option>
                         <option value="StandAlone">Stand Alone</option>
                     </select>
                  </td>
               </tr>
            </table>
         </fieldset>

         {{#if Specification.ConfigProperties.length}}

            <fieldset>
               <legend>Accessory Settings</legend>

               <table>
                  {{#Specification.ConfigProperties}}

                     <!-- Text -->
                     {{#eq type "text"}}
                        <tr>
                           <td style="width: 200px">{{label}}</td>
                           <td><input type="text" data-type="{{type}}" data-param="{{id}}" class="ConfigParam" value="{{default}}"></td>
                        </tr>
                     {{/eq}}

                       <!-- Number -->
                     {{#eq type "numeric"}}
                       <tr>
                          <td style="width: 200px">{{label}}</td>
                          <td><input type="number" data-type="{{type}}" data-param="{{id}}" class="ConfigParam" value="{{default}}"></td>
                       </tr>
                    {{/eq}}

                     <!-- CHeckbox-->
                     {{#eq type "checkbox"}}
                        <tr>
                           <td style="width: 200px">{{label}}</td>
                           <td><input type="checkbox" data-type="{{type}}" data-param="{{id}}" class="ConfigParam" {{#if default}}checked{{/if}}></td>
                        </tr>
                     {{/eq}}

                     <!-- Select-->
                     {{#eq type "select"}}
                     <tr>
                        <td style="width: 200px">{{label}}</td>
                        <td>
                           <select data-type="{{type}}" data-param="{{id}}" class="ConfigParam">
                           {{#options}}
                           <option value="{{.}}">{{.}}</option>
                           {{/options}}
                           </select>
                           </td>
                     </tr>
                     {{/eq}}

                      <!-- Array-->
                      {{#eq type "array"}}
                      <tr>
                         <td style="width: 200px">{{label}}</td>
                         <td>
                            <textarea data-type="{{type}}" data-param="{{id}}" class="ConfigParam">{{#default}}{{.}}&#013;&#010;{{/default}}</textarea>
                         
                            </td>
                      </tr>
                      {{/eq}}

                  {{/Specification.ConfigProperties}}
               </table>

            </fieldset>

         {{/if}}

         <fieldset style="text-align: right; margin-top: 20px;">
            <span style="color: rgb(255,255,255);" id="Message"></span> <input type="button" class="StyledButton" value="Publish" onclick="SaveNewAccessory('{{Specification.type}}')">
          </fieldset>

      </blockquote>

      <div id="EnrollDiv" class="PopupCurtain">
         <div class="Content" style="width: 500px; height: 300px;">
         <table style="width: 100%;padding: 10px;font-size: 14px;">
            <tr>
               <td colspan="2" style="text-align: left;vertical-align: top;">
                 <img class="AccessoryIcon" style="width:unset;" src="../../../ui/resources/accessoryicon/?type={{Specification.type}}" Invert> 
               </td>
               <td rowspan="10" style="text-align: right;vertical-align: top;">
                  <img id="AC_QRImage" src=""><br />
                  <span class="PincodeHint" id="AC_Code" style="font-size: 26px;margin-right: 13px;"></span>
               </td>
            </tr>
            <tr>
               <td colspan="2" style="font-weight: bold;text-align: left;vertical-align: top;font-size: 18px;" id="AC_Name"></td>
            </tr>
            
            <tr>
               <td style="text-align: left;vertical-align: top;">Accessory ID</td>
               <td style="text-align: left;vertical-align: top;" id="AC_AID"></td>
            </tr>
            <tr>
               <td style="text-align: left;vertical-align: top;">Serial Number</td>
               <td style="text-align: left;vertical-align: top;" id="AC_SN"></td>
            </tr>
            <tr>
               <td colspan="2">&nbsp</td>
            </tr>
            <tr>
               <td colspan="2" style="text-align: left;vertical-align: top;">
                  Proceed to adding an Accessory in HomeKit, and when prompted, scan this QR Code.<br />
                  If you're having trouble scanning the code, You can use the Pin Code displayed.
               </td>
            </tr>
            <tr>
               <td colspan="2">&nbsp</td>
            </tr>
            <tr>
               <td colspan="2"><a href="../../../ui/accessories">Enroll Later</a></td>
            </tr>
         </table>
         </div>
            
      </div>

</body>

</html>