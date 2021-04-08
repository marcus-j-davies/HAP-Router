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
         let Prototype = {{{ Type }}};
         let ConfiguredObject = {{{ Object }}};
      </script>
   </head>
   <body>
      <div class="TopBanner">Homekit Device Stack</div>
      <div id="Content">
         <div class="Popup" id="Devices">
            <div class="Middle Dialog" style="width:800px; min-height:500px;margin-top:20px;position: relative;">
               <div class="Title">
                  Editing Accessory <span id="AName"></span>
                  <div style="float: right;">
                     <span style="cursor: pointer;padding-right: 5px;" onclick="javascript:document.location = '../../../ui/main';">Cancel</span>
                  </div>
               </div>
               <table cellpadding="10" style="width: 80%; margin-left: auto;margin-right: auto;margin-top: 20px;">
                  <tr>
                     <td style="vertical-align: top;">
                        <img id="TypeIcon" width="50" />
                     </td>
                     <td style="vertical-align: top;">
                        <span id="Label" style="font-weight: bold;"></span><br /><br />
                        Changes to the accessory should take affect in a few moments.
                        The accessory may, for a short while, disappear from HomeApp. 
                     </td>
                  </tr>
               </table>
               <hr style="width: 80%;"/>
               <table id="Form" cellpadding="1" style="width: 80%; margin-left: auto;margin-right: auto;margin-top: 10px;margin-bottom: 70px;">
               </table>
               <div style="margin-left: auto;margin-right: auto;box-sizing: border-box;width: 90%;position: absolute;bottom: 5px;text-align:right;margin-bottom: 10px;">
                  <input class="StyledButton" onclick="DeleteAccesssory()" type="button" value="Delete">
                  <input class="StyledButton" onclick="UpdateAccessory()" type="button" value="Save">
               </div>
            </div>
         </div>
      </div>
      <script type="text/Javascript">
         PopulatePrototype();
         PopulateData();
         $('#Devices').css('display','block')
      </script>
   </body>
</html>