<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>The MARTA Army</title>
    <link href='https://api.mapbox.com/mapbox.js/v3.1.1/mapbox.css' rel='stylesheet' />

    <style>
    .leaflet-control-mapbox-geocoder.active .leaflet-control-mapbox-geocoder-wrap { 
        width: 400px;
    }
    .leaflet-control-mapbox-geocoder .leaflet-control-mapbox-geocoder-form input {
        width: 100%;
    }
    </style>
</head>

<body style="margin: 0;">
    <div id='master-map' style='width:100%;height: 100%; position: absolute;'></div>
    <?php
        $show_qr = isset($_REQUEST['showqr']);
        $qrId = ($show_qr ? "qrcode" : "xxxxxx");
    ?>
    <img id='<?=$qrId?>' src='images/marta-army-square.png' style='position: absolute; width: 75px; height: 75px; top: 40px; left: 10px;'/>

    <script type="text/javascript" src="jslib/jquery-2.1.4.min.js"></script>
    <script src='https://api.mapbox.com/mapbox.js/v3.1.1/mapbox.js'></script>
    <script type="text/javascript" src="js/master-map.js"></script>
</body>
</html> 
