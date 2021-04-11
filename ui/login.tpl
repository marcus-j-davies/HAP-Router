<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">

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

   <img class="LoginLogo" src="/ui/static/Images/Logo.png">

   <div class="LoginBanner">

      <span class="LoginDisclaimer">
         HAP Router: {{RouterPackage.version}}
      </span>

      <table class="LoginTable">
         <tr>
            <td style="text-align: left;">Username</td>
            <td style="text-align: right;"><input style="font-size: 18px;" type="text" id="TXT_Username"></td>
         </tr>
         <tr>
            <td style="text-align: left;">Password</td>
            <td style="text-align: right;"><input style="font-size: 18px;" type="password" id="TXT_Password"></td>
         </tr>
         <tr>
            <td colspan="2" style="text-align: right;"><span id="Message"></span> &nbsp; <input class="StyledButton" onclick="Login()" type="button" value="Login"></td>
         </tr>
      </table>

   </div>


</body>

</html>