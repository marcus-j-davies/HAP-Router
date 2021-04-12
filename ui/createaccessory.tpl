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
      <div class="ContentTitle">Create a new {{Specification.Label}}
         <span style="float: right;">
         <input type="button" value="Back" class="StyledButton" onclick="location.href='../../../ui/availableactypes'">
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
                           <td><input type="text" data-param="{{id}}" class="ConfigParam" value="{{default}}"></td>
                        </tr>
                     {{/eq}}

                       <!-- Number -->
                     {{#eq type "numeric"}}
                       <tr>
                          <td style="width: 200px">{{label}}</td>
                          <td><input type="number" data-param="{{id}}" class="ConfigParam" value="{{default}}"></td>
                       </tr>
                    {{/eq}}

                     <!-- CHeckbox-->
                     {{#eq type "checkbox"}}
                        <tr>
                           <td style="width: 200px">{{label}}</td>
                           <td><input type="checkbox" data-param="{{id}}" class="ConfigParam" {{#if default}}checked{{/if}}></td>
                        </tr>
                     {{/eq}}

                     <!-- Select-->
                     {{#eq type "select"}}
                     <tr>
                        <td style="width: 200px">{{label}}</td>
                        <td>
                           <select data-param="{{id}}" class="ConfigParam">
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
                            <textarea data-param="{{id}}" class="ConfigParam">{{#default}}{{.}}&#013;&#010;{{/default}}</textarea>
                         
                            </td>
                      </tr>
                      {{/eq}}

                  {{/Specification.ConfigProperties}}
               </table>

            </fieldset>

         {{/if}}

         <fieldset style="text-align: right; margin-top: 20px;">
            <span style="color: rgb(255,255,255);" id="Message"></span> <input type="button" class="StyledButton" value="Publish" onclick="">
          </fieldset>

      </blockquote>

</body>

</html>