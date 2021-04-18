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
      <div class="ContentTitle"> <img class="AccessoryIcon" style="margin-bottom: 5px;width: unset;" src="../../../ui/resources/accessoryicon/?type={{Specification.type}}" invert> Edit {{AccessoryCFG.name}}
         <span style="float: right;">
         <input type="button" value="Back" class="StyledButton" onclick="location.href='../../../ui/accessories'">
         </span>
      </div>

         <fieldset>
            <legend>Basic Settings</legend>
            <table>
               <tr>
                  <td style="width: 200px;">Name</td>
                  <td><input type="text" id="ACC_Name" value="{{AccessoryCFG.name}}"></td>
               </tr>
               <tr>
                  <td>Manufacturer</td>
                  <td><input type="text" id="ACC_MAN" placeholder="Use Default" value="{{AccessoryCFG.manufacturer}}"></td>
               </tr>
               <tr>
                  <td>Model</td>
                  <td><input type="text" id="ACC_MODEL" placeholder="Use Default" value="{{AccessoryCFG.model}}"></td>
               </tr>
               <tr>
                  <td>Serial Number</td>
                  <td><input type="text" id="ACC_SN" placeholder="Auto Generate" value="{{AccessoryCFG.serialNumber}}"></td>
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
                     <script>$("#ACC_Route").val('{{AccessoryCFG.route}}')</script>
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
                           <td><input type="text" data-type="{{type}}" data-param="{{id}}" class="ConfigParam" value="{{lookup ../AccessoryCFG [id]}}"></td>
                        </tr>
                     {{/eq}}

                       <!-- Number -->
                     {{#eq type "numeric"}}
                       <tr>
                          <td style="width: 200px">{{label}}</td>
                          <td><input type="number" data-type="{{type}}" data-param="{{id}}" class="ConfigParam" value="{{lookup ../AccessoryCFG [id]}}"></td>
                       </tr>
                    {{/eq}}

                     <!-- CHeckbox-->
                     {{#eq type "checkbox"}}
                        <tr>
                           <td style="width: 200px">{{label}}</td>
                           <td><input type="checkbox" data-type="{{type}}" data-param="{{id}}" class="ConfigParam" {{#if (lookup ../AccessoryCFG [id])}}checked{{/if}}></td>
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
                           <script>$("select[data-param='{{id}}']").val('{{lookup ../AccessoryCFG [id]}}')</script>
                           </td>
                     </tr>
                     {{/eq}}

                      <!-- Array-->
                      {{#eq type "array"}}
                      <tr>
                         <td style="width: 200px">{{label}}</td>
                         <td>
                            <textarea data-type="{{type}}" data-param="{{id}}" class="ConfigParam">{{#each (lookup ../AccessoryCFG [id])}}{{.}}&#013;&#010;{{/each}}</textarea>
                         
                            </td>
                      </tr>
                      {{/eq}}

                  {{/Specification.ConfigProperties}}
               </table>

            </fieldset>

         {{/if}}

         <fieldset style="text-align: right; margin-top: 20px;">
            <span style="color: rgb(255,255,255);" id="Message"></span> <input type="button" class="StyledButton" value="Publish" onclick="SaveAccessoryChanges('{{Specification.type}}')">
          </fieldset>

      </blockquote>

</body>

</html>