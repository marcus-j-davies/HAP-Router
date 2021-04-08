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
      </script>
   </head>
   <body>
      <div class="TopBanner">Homekit Device Stack</div>
      <div id="Content">
         <div class="Popup" id="Devices">
            <div class="Middle Dialog" style="width:800px; min-height:500px;margin-top:20px;position: relative;">
               <div class="Title">
                  Create New Accessory
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
                        Once created, the accessory should appear in
                        HomeApp within a few moments. Closing HomeApp and opening it again maybe required in some cases.
                     </td>
                  </tr>
               </table>
               <hr style="width: 80%;"/>
               <table id="Form" cellpadding="1" style="width: 80%; margin-left: auto;margin-right: auto;margin-top: 10px;margin-bottom: 70px;">
               </table>
               <div style="margin-left: auto;margin-right: auto;box-sizing: border-box;width: 90%;position: absolute;bottom: 5px;text-align:right;margin-bottom: 10px;">
                  <input class="StyledButton" style="width: 130px;" onclick="SaveAccessory(false)" type="button" value="Publish"> <input class="StyledButton" style="width: 130px;"  onclick="SaveAccessory(true)" type="button" value="Bridge">
               </div>
            </div>
         </div>
      </div>
      <script type="text/Javascript">
         PopulatePrototype();
         $('#Devices').css('display','block')
      </script>
      <div class="Popup" id="QR">
         <div class="Middle Dialog" style="width:600px;height: 360px;margin-top:80px;background-color: #F36B08;padding: 10px;">
            <table style="color: rgb(255, 255, 255);">
               <tbody>
                  <tr>
                     <td valign="top" style="text-align:left;width:95%; padding:10px">
                        <div style="font-weight:bold;font-size:24px">Enroll the new device</div>
                        <br />
                        <div style="font-size:14px">
                          You do this in the same way you enrolled HomeKit Device Stack.<br />
                           <ol>
                              <li>On your iOS device open the 'Home' app</li>
                              <li>Click the '+' button (top right) and choose 'Add Accessory'</li>
                              <li>Scan this QR Code</li>
                              <li>The Home app will guide you through in setting up this device.</li>
                           </ol>
                           Once enrolled, you will be taken back to your devices.<br /><br />
                           If you have problems in using the QR Code, click 'I Don't have a Code or Cannot Scan' you will see the device you just created, click it, and you will be asked for a pin, enter the pin code displayed here.
                        </div>
                     </td>
                     <td valign="top" style="text-align: center;padding:10px">
                        <div style="-webkit-border-radius: 8px; -moz-border-radius: 8px;border-radius: 8px;margin:auto;padding: 5px;width: 125px;text-align: center;font-weight:bold;border-width: 5px;border-color: black;border-style: solid;background-color:white;padding-bottom:15px;color:black">
                           <div id="qrcode"></div>
                           <br /> <span id="NBCode"></span>
                        </div>
                        <input class="StyledButton" style="width: 100%; margin-top: 10px;" onclick="javascript:document.location = '../../../ui/main';" type="button" value="Pair Later" withborder>
                     </td>
                  </tr>
               </tbody>
            </table>
         </div>
      </div>
   </body>
</html>