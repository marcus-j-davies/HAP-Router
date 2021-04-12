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
         <div class="ContentTitle">Choose Accessory type
            <span style="float: right;">
            <input type="button" value="Back" class="StyledButton" onclick="location.href='../../../ui/accessories'">
            </span>
         </div>

      
            <fieldset>
             {{#Types}}
             <div class="OptionBox" onclick="location.href='../../../ui/createaccessory/{{type}}'">
               <img class="AccessoryIcon" style="margin-bottom: 5px;" src="../../../ui/resources/accessoryicon/?type={{type}}"><br />
               {{label}}
            </div>
             {{/Types}}

              

            </fieldset>
     
  
        
        




      </blockquote>

</body>

</html>