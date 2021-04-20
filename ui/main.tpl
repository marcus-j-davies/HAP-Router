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
         <iframe name="Content" src="../ui/accessories" style="width: 100%;height: 100%; border: none;">
      </div>
   </div>



</body>

</html>