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
         <div class="ContentTitle">Configured Accessories</div>

  
         <fieldset>
            <legend>Bridged Accessories</legend>

            <table style="width: 100%;">

               {{#Acessories}}
                  {{#if AccessoryCFG.bridged}}
                     <tr>
                        <td rowspan="4" style="width: 70px; vertical-align: top; text-align: center;">
                           <img class="AccessoryIcon" src="../../../ui/resources/accessoryicon/{{AccessoryCFG.icon}}"> 
                        </td>
                        <td><strong>{{AccessoryCFG.name}}</strong></td>
                        <td rowspan="4">{{AccessoryCFG.route}}</td>
                     </tr>
                     <tr><td>Motion Sensor</td></tr>
                     <tr><td>AID: {{AccessoryCFG.accessoryID}}, SN: {{AccessoryCFG.serialNumber}}</td></tr>
                     <tr><td>&nbsp</td></tr>
                  {{/if}}
               {{/Acessories}}

            </table>
         </fieldset>


         <fieldset>
            <legend>Non-Bridged (Standalone) Accessories</legend>

          
          </fieldset>




      </blockquote>

</body>

</html>