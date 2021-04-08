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

   <blockquote>
      <blockquote>
         <div class="ContentTitle">HAP Router Settings</div>

         <!-- MQTT-->
         <fieldset>
            <legend>MQTT Client</legend>
            <table>
               <tr>
                  <td>Enabled</td>
                  <td><input type="checkbox" value="true"></td>
               </tr>
               <tr>
                  <td>MQTT Broker</td>
                  <td><input type="text"></td>
               </tr>
               <tr>
                  <td>MQTT Topic</td>
                  <td><input type="text"></td>
               </tr>
               <tr>
                  <td>MQTT Username</td>
                  <td><input type="text"></td>
               </tr>
               <tr>
                  <td>MQTT Password</td>
                  <td><input type="text"></td>
               </tr>
            </table>
         </fieldset>

         <!-- Network Ports-->
         <fieldset>
            <legend>Network / mDNS</legend>
            <table>
               <tr>
                  <td>mDNS Advertiser</td>
                  <td><input type="text"><</td>
               </tr>
               <tr>
                  <td>mDNS Interface</td>
                  <td><input type="text"><</td>
               </tr>
               <tr>
                  <td>Web/API Interface</td>
                  <td><input type="text"></td>
               </tr>
               <tr>
                  <td>Web/API Port</td>
                  <td><input type="text"></td>
               </tr>
            </table>
         </fieldset>

         

      </blockquote>
      <blockquote>


</body>

</html>