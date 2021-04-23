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
      <div class="ContentTitle"> <img class="AccessoryIcon" style="margin-bottom: 5px;width: unset;" src="../../../ui/resources/routeicon/?type={{type}}" invert> Create a new Route
         <span style="float: right;">
         <input type="button" value="Back" class="StyledButton" onclick="window.history.back();">
         </span>
      </div>

         <fieldset>
            <legend>Basic Settings</legend>
            <table>
               <tr>
                  <td style="width: 200px;">Name</td>
                  <td><input type="text" id="RT_Name"></td>
               </tr>
              </table>
         </fieldset>

         {{#if Settings.length}}

            <fieldset>
               <legend>Route Specific Settings</legend>

               <table>
                  {{#Settings}}

                        <tr>
                           <td style="width: 200px">{{label}}</td>
                           <td><input type="text" data-param="{{id}}" class="RouteParam"></td>
                        </tr>
                    
                  {{/Settings}}
               </table>

            </fieldset>

         {{/if}}

         <fieldset style="text-align: right; margin-top: 20px;">
            <span style="color: rgb(255,255,255);" id="Message"></span> <input type="button" class="StyledButton" value="Save" onclick="SaveNewRoute('{{type}}')">
          </fieldset>

      </blockquote>

      

</body>

</html>