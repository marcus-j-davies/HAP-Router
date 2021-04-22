<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">

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

   <div class="Container">
      <div class="Menu">
         <blockquote>
            <ul>
               <li style="background: url('../../../ui/static/Images/baseline_sensors_white_24dp.png') left center no-repeat;"><a href="../../../ui/accessories" target="Content">Accessories</a></li>
               <li style="background: url('../../../ui/static/Images/baseline_router_white_24dp.png') left center no-repeat;"><a href="../../../ui/routing" target="Content">Routing</a></li>
               <li style="background: url('../../../UI/static/Images/baseline_settings_white_24dp.png') left center no-repeat;"><a href="../../../ui/settings" target="Content">Settings</a></li>
               <li style="background: url('../../../UI/static/Images/baseline_dns_white_24dp.png') left center no-repeat;"><a href="../../../ui/bridge" target="Content">Bridge</a></li>
            </ul>
         </blockquote>
         <div class="VersionDiv">
           HAP Router: {{RouterPackage.version}}<br />
           HAP-NodeJS: {{HAPPackage.version}}<br />
         </div>

      </div>
      <div class="Content">
         <iframe name="Content" src="../../../ui/accessories" style="width: 100%;height: 100%; border: none;"></iframe>
      </div>
   </div>

   <div id="EnrollDiv" class="PopupCurtain">
      <div class="PopupContent" style="width: 500px; height: 300px;">
         <table style="width: 100%;padding: 10px;font-size: 14px;">
            <tr>
               <td colspan="2" style="text-align: left;vertical-align: top;">
               <img class="AccessoryIcon" id="PairIcon" style="width:unset;" src="" Invert> 
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
               <td colspan="2"><a target="Content" onclick="CloseEnroll()" id="ReturnLink" href="">Enroll Later</a></td>
            </tr>
         </table>
      </div>
   </div>
</body>
</html>