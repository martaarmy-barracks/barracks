<?php
include("./lib/redirect-to-https.php");
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Bus Stop Census - MARTA Army</title>
    <link rel="stylesheet" href="https://api.mapbox.com/mapbox.js/v3.1.1/mapbox.css" />
    <link rel="stylesheet" href="css/coremap.css" />
</head>

<body>
    <div id="master-map" class="full-screen"></div>
    <img class="ma-logo" src="images/marta-army-square.png" />

    <script src="jslib/jquery-2.1.4.min.js"></script>
    <script src="https://api.mapbox.com/mapbox.js/v3.1.1/mapbox.js"></script>
    <script src="js/coremap.js"></script>
    <script src="js/survey-map.js"></script>
</body>
</html> 
