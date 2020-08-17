<?php
//include("./lib/redirect-to-https.php");
include("config.php");
?>
<!DOCTYPE html>
<html>
<head>
    <title>MARTA Army Master Map</title>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body>
    <div id="master-map" class="full-screen"></div>
    <?php
        $show_qr = isset($_REQUEST["showqr"]);
        $qrId = ($show_qr ? "qrcode" : "xxxxxx");
    ?>
    <div id="logo">
        <a href="https://www.martaarmy.org/" title="To the MARTA Army website"><img id="<?=$qrId?>" class="ma-logo-gl" src="images/marta-army-square.png" alt="MARTA Army logo" /></a>
    </div>

    <script src="jslib/jquery-2.1.4.min.js"></script>
    <script src='https://api.mapbox.com/mapbox-gl-js/v1.11.0/mapbox-gl.js'></script>
    <script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.5.1/mapbox-gl-geocoder.min.js"></script>
    <script src="js/map-presets.js"></script>
    <script src="js/coremap-gl.js"></script>
    <link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/v1.11.0/mapbox-gl.css" />
    <link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.5.1/mapbox-gl-geocoder.css" type="text/css" />
    <link rel="stylesheet" href="css/coremap.css" />

    <script>
    mapboxgl.accessToken = "<?=$MAPBOX_ACCESSTOKEN?>";

    $(function() {
        var initiativesOnly = location.search.indexOf("mode=initiatives") > -1;
        
        coremap.init({
            containerId: "master-map",
            dynamicFetch: !initiativesOnly,
            logoContainerId: "logo",
            useDeviceLocation: !initiativesOnly,
            onMarkerClicked: function(m) {
                var jqQr = $("#qrcode");
                if (jqQr.length > 0) {
                    jqQr[0].title = jqQr[0].src = "admin/bus-sign/qr.php?p=https://barracks.martaarmy.org/qr.php%3Fs=" + m.stopid;
                }			
            },
            onGetContent: function(feature) {
                var amenities = feature.properties.amenities;
                return {
                    description: amenities && ("<br/>At this stop: " + amenities
                        + "<br/><a target='_blank' href='https://docs.google.com/forms/d/e/1FAIpQLScpNuf9aMtBiLA2KUbgvD0D5565RmWt5Li2HfiuLlb-2i3kUA/viewform?usp=pp_url&entry.460249385=" + m.stopid + "&entry.666706278=" + m.stopname.replace(" ", "+") + "'>Report incorrect data</a>")
                }
            }
        });
    });
    </script>
</body>
</html> 
