<?php
include("./lib/redirect-to-https.php");
include("config.php");

$cookieName = "census-welcomed";
$showLargeWelcome = isset($_REQUEST["from"]) && !isset($_COOKIE[$cookieName]);
?>
<!DOCTYPE html>
<html>
<head>
    <title>Bus Stop Census - MARTA Army</title>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        h1 {
            font-size: 24px;
        }
        .message {
            position: absolute;
            bottom: 20px;
            left: 5px;
            right: 5px;
            text-align: center;
            background-color: #fff;
            font-family: sans-serif;
            padding-bottom: 10px;
        }
        .welcome {
            top: 5px;
            padding-top: 40px;
        }
    </style>
</head>

<body>
    <div id="master-map" class="full-screen"></div>
    <img class="ma-logo" src="images/census.png" style="width: 129px; height: 51px;" />
    <img class="ma-logo" src="images/marta-army-square.png" style="width: 50px; height: 50px; top: 85px;" />

    <div class="message hint">
        <p><b>Welcome!</b></p>
        <div>Zoom and pan the map to find your bus stop, then click its marker.</div>
        <div>Can't find your stop? <a href="/wp/5-2/">Start a blank survey.</a></div>
        <div><button onclick="javascript:$('.hint').hide();">OK</button></div>
    </div>

    <?php
    if ($showLargeWelcome) {
    ?>
        <div class="message welcome">
            <div><img src="images/censusbg600x200.jpg" style="width: 100%; max-width: 600px;" /></div>
            <div>
                <h1>Operation Bus Stop Census</h1>
                <p>Hi! Thank you for fighting for Transit Equity and for helping MARTA Army and our partners
                    catalog the state of bus stops around Atlanta.
                </p>
                <p>
                    Your participation to <b>Operation Bus Stop Census</b> will
                    help inform jurisdictions on bus stop access and the work needed to raise the quality of bus stop amenities.
                </p>
                <div><button>Start</button></div>
            </div>
        </div>
    <?php
    }
    ?>

    <script src="jslib/jquery-2.1.4.min.js"></script>
    <script src='https://api.mapbox.com/mapbox-gl-js/v1.11.0/mapbox-gl.js'></script>
    <script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.5.1/mapbox-gl-geocoder.min.js"></script>
    <script src="https://www.gstatic.com/firebasejs/7.8.0/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/7.8.0/firebase-firestore.js"></script>
    <script src="js/coremap-gl.js"></script>
    <link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/v1.11.0/mapbox-gl.css" />
    <link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.5.1/mapbox-gl-geocoder.css" type="text/css" />
    <link rel="stylesheet" href="css/coremap.css" />
    <script>
    mapboxgl.accessToken = "<?=$MAPBOX_ACCESSTOKEN?>";

    $(function() {
        // Initialize Cloud Firestore through Firebase
        firebase.initializeApp({
            apiKey: "<?=$FIREBASE_APIKEY?>",
            authDomain: "stopcensus.firebaseapp.com",
            projectId: "stopcensus"
        });
        var surveyedStops = undefined;
        var markersToUpdate = [];
        var markerFactory = m => {
            if (!surveyedStops) markersToUpdate.push(m);
            else {
                var p = m.properties;
                var shortStopId = getShortStopId(p.stopid);
                if (surveyedStops.indexOf(shortStopId) > -1) {
                    p.isSurveyed = true;
                    p.markerFill = p.isActive ? "#33cc33" : "#bbbb00";
                    p.markerText = "/";
                }
            }
            return m;
        };

        // Initialize map.
        coremap.init({
            containerId: "master-map",
            dynamicFetch: true,
            excludeInitiatives: true,
            useDeviceLocation: true,
            geoJsonMarkerFactory: markerFactory,
            onGetContent: feature => {
                var m = feature.properties;
                var isStationFacility = m.stopname.indexOf(" STATION") >= 0 
                    && m.stopname.indexOf(" STATION)") == -1;
                
                if (isStationFacility) return {}
                else {
                    var shortStopId = getShortStopId(m.stopid);
                    var stopNameParts = m.stopname.split("@");
                    var street = stopNameParts[0].trim();
                    var landmark = (stopNameParts[1] || "").trim();
                    var routeNumbers = m.routes && m.routes.map(r => r.route_short_name).join(", ");
                    var lonlatArray = feature.geometry.coordinates;
                    
                    return {
                        links:
                        // Google Street View link (docs: https://developers.google.com/maps/documentation/urls/guide#street-view-action)
                        "<a target='_blank' href='https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=" + lonlatArray[1] + "," + lonlatArray[0] + "'>Street View from this stop</a><br/>"

                        + (m.isSurveyed ? "This stop has already been surveyed.<br/>" : "")
                        + "<b><a target='_blank' href='/wp/5-2/?stopid=" + shortStopId
                        + "&street=" + street
                        + "&routes=" + routeNumbers
                        + "&landmark=" + landmark + "'>Take the Bus Stop Census" + (m.isSurveyed ? " again" : "") + "</a></b>"
                        // description: !m.amenities ? "" : ("<br/>At this stop: " + m.amenities
                        //	+ "<br/><a target='_blank' href='https://docs.google.com/forms/d/e/1FAIpQLScpNuf9aMtBiLA2KUbgvD0D5565RmWt5Li2HfiuLlb-2i3kUA/viewform?usp=pp_url&entry.460249385=" + m.stopid + "&entry.666706278=" + m.stopname.replace(" ", "+") + "'>Report incorrect data</a>")
                    }
                }
            }
        });
        var db = firebase.firestore();
        db.collection("entries").get().then(function(querySnapshot) {
            surveyedStops = [];
            querySnapshot.forEach(doc => {
                surveyedStops.push(doc.get("stopid"));
            });
            markersToUpdate.forEach(markerFactory);
            delete markersToUpdate;
        });
        $(".welcome button").click(function () {
            $(".welcome").hide();
            document.cookie = "<?=$cookieName?>=true; expires=" + new Date(new Date().valueOf() + 3600000*24*30).toUTCString() + "; path=/";
        });
    });
    </script>
</body>
</html> 
