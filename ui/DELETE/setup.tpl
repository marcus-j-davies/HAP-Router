<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
   <head>
      <meta charset="utf-8" />
      <title>Homekit Device Stack</title>
      <link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css" />
      <link rel="stylesheet" href="../../../ui/static/Style/style.css" />
      <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
      <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script>
      <script src="../../../ui/static/JS/functions.js"></script>
      <script src="../../../ui/static/JS/qrcode.min.js"></script>
   </head>
   <body>
      <div id="Content">
         <div class="Middle Dialog"
            style="width:600px;height: 350px;margin-top:80px;background-color: #F36B08;padding: 10px;">
            <table style="color: rgb(255, 255, 255);">
               <tbody>
                  <tr>
                     <td valign="top" style="text-align:left;width:95%; padding:10px">
                        <div style="font-weight:bold;font-size:24px">HomeKit Device Stack<br />Accessory Bridge
                        </div>
                        <br />
                        <div style="font-size:14px">
                           HomeKit Device Stack can act as a HomeKit Bridge. That is, its a kind of hub that has smart
                           accessories attached. you can publish your devices either attached to, or separate from the bridge.
                           <br>
                           <ol>
                              <li>On your iOS device open the 'Home' app</li>
                              <li>Click the '+' button (top right) and choose 'Add Accessory'</li>
                              <li>Scan this QR Code</li>
                              <li>The Home app will guide you through in setting up a Test Device (Switch
                                 Accessory Demo) which is attached to the bridge.
                              </li>
                           </ol>
                           Once paired, your devices will be listed here. If you have problems in using the QR
                           Code, click 'I Don't have a Code or Cannot Scan' you will see 'HomeKit Device Stack',
                           click it, and you will be asked for a pin, enter the pin code displayed here.
                        </div>
                     </td>
                     <td valign="top" style="text-align: center;padding:10px">
                        <div
                           style="-webkit-border-radius: 8px; -moz-border-radius: 8px;border-radius: 8px;margin:auto;padding: 5px;width: 125px;text-align: center;font-weight:bold;border-width: 5px;border-color: black;border-style: solid;background-color:white;padding-bottom:15px;color:black">
                           <div id="qrcode"></div>
                           <br /> {{Config.bridgeConfig.pincode}}
                        </div>
                        <input class="StyledButton" style="width: 100%; margin-top: 10px;" onclick="StartRestore()" type="button" value="Restore" withborder>
                     </td>
                  </tr>
               </tbody>
            </table>
         </div>
         <script type="text/javascript">
            new QRCode(document.getElementById("qrcode"),
            {
                "text": "{{{Config.bridgeConfig.QRData}}}",
                width: 125,
                height: 125
            });
         </script>
      </div>
      <script>StartIntervalCheck();</script>
   </body>
</html>