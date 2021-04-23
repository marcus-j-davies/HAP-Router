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
         <div class="ContentTitle">Configured Routes
            <span style="float: right;">
            <input type="button" value="Add New Route" class="StyledButton" onclick="location.href='../../../ui/routetypes'">
            </span>
         </div>


         <fieldset>
      

            <table style="width: 100%;">
               {{#Routes}}


               <tr>
                  <td rowspan="3" style="width: 70px; vertical-align: top; text-align: center;">
                     <img class="AccessoryIcon" src="../../../ui/resources/routeicon/?type={{type}}"> 
                  </td>
                  <td style="font-size: 16px;"><strong>{{name}}</strong> <span style="cursor: pointer;" onclick="location = '../../../ui/editaccessory/{{AccessoryCFG.accessoryID}}'">&#9998;</span></td>
                  <td rowspan="3" style="text-align: right; vertical-align: top;">{{useCount}}</td>
               </tr>
               <tr><td>{{typeName}}</td></tr>
               <tr><td>&nbsp;</td></tr>



                    

               {{/Routes}}
            </table>


         </fieldset>

         
 

      </blockquote>

</body>

</html>