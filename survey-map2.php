<?php
//include("./lib/redirect-to-https.php");
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
    <div id="logo">
        <a href="http://www.martaarmy.org/stop-census" title="More info on the Bus Stop Census">
            <img src="images/census.png" style="width: 129px; height: 51px; margin-right: 5px;" />
            <img src="images/marta-army-square.png" style="width: 50px; height: 50px;" />
        </a>
    </div>

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
    <script src="js/coremap-gl2.js"></script>
    <script src="js/map-presets.js"></script>
    <link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/v1.11.0/mapbox-gl.css" />
    <link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.5.1/mapbox-gl-geocoder.css" type="text/css" />
    <link rel="stylesheet" href="css/coremap.css" />
    
    <script>
    $(function() {
        mapboxgl.accessToken = "<?=$MAPBOX_ACCESSTOKEN?>";
        // Initialize Cloud Firestore through Firebase
        firebase.initializeApp({
            apiKey: "<?=$FIREBASE_APIKEY?>",
            authDomain: "stopcensus.firebaseapp.com",
            projectId: "stopcensus"
        });
        var surveyedStops = [];
        var inactiveCheckedCircle = {
            id: "inactive-checked-circle",
            appliesTo: function(stop) {
                var shortStopId = getShortStopId(stop.id);
                return this.filters.inactiveStop(stop)
                    && surveyedStops.indexOf(shortStopId) > -1;
            },
            layers: [{
                type: "circle",
                minzoom: stopsMinZoom,
                paint: {
                    "circle-radius": 6,
                    "circle-color": "#bbbb00",
                    "circle-stroke-color": "#888888",
                    "circle-stroke-width": 1,
                }
            }]
        };
        var activeCheckedCircle = {
            id: "active-checked-circle",
            appliesTo: function(stop) {
                var shortStopId = getShortStopId(stop.id);
                return !this.filters.inactiveStop(stop)
                    && surveyedStops.indexOf(shortStopId) > -1;
            },
            layers: [{
                type: "circle",
                minzoom: stopsMinZoom,
                paint: {
                    "circle-radius": 8,
                    "circle-color": "#33cc33",
                    "circle-stroke-color": "#228822",
                    "circle-stroke-width": 1,
                }
            }]
        };
        var checkedSymbol = {
            id: "checked-symbol",
            appliesTo: function(stop) {
                var shortStopId = getShortStopId(stop.id);
                return surveyedStops.indexOf(shortStopId) > -1;
            },
            layers: [{
                type: "symbol",
                minzoom: stopsMinZoom,
                layout: {
                    "text-allow-overlap": true,
                    "text-field": "✔", // "✓",
                    "text-size": 11
                },
                paint: {
                    "text-color": "#ffffff"
                }
            }]
        };

        function init() {
            // Initialize map.
            coremap.init({
                containerId: "master-map",
                dynamicFetch: true,
                excludeInitiatives: true,
                logoContainerId: "logo",
                symbolLists: [
                    [activeCheckedCircle, inactiveCheckedCircle, layers.inactiveStopCircle, layers.parkRideCircle, layers.railCircle, layers.tramCircle, layers.activeStopCircle],
                    [checkedSymbol, layers.parkRideSymbol, layers.inactiveStopSymbol],
                    [layers.stationLabel]
                ],
                useDeviceLocation: true,
                onGetContent: function(stop) {
                    var isStationFacility = stop.name.indexOf(" STATION") >= 0 
                        && stop.name.indexOf(" STATION)") == -1;
                    
                    if (isStationFacility) return {}
                    else {
                        var shortStopId = getShortStopId(stop.id);
                        var stopNameParts = stop.name.split("@");
                        var street = stopNameParts[0].trim();
                        var landmark = (stopNameParts[1] || "").trim();
                        var routeNumbers = stop.routes && stop.routes.map(r => r.route_short_name).join(", ");
                        var lonlatArray = [stop.lon, stop.lat];
                        var isSurveyed = surveyedStops.indexOf(shortStopId) > -1;
                        
                        return {
                            links:
                            // Google Street View link (docs: https://developers.google.com/maps/documentation/urls/guide#street-view-action)
                            "<a target='_blank' href='https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=" + lonlatArray[1] + "," + lonlatArray[0] + "'>Street View from this stop</a><br/>"

                            + (isSurveyed ? "ℹ️ This stop has already been surveyed.<br/>" : "")
                            + "<b><a target='_blank' href='/wp/5-2/?stopid=" + shortStopId
                            + "&street=" + street
                            + "&routes=" + routeNumbers
                            + "&landmark=" + landmark + "'>Take the Bus Stop Census" + (isSurveyed ? " again" : "") + "</a></b>"
                        }
                    }
                }
            });            
        }

        var db = firebase.firestore();
        db.collection("entries").get()
        .then(function(querySnapshot) {
            querySnapshot.forEach(doc => {
                surveyedStops.push(doc.get("stopid"));
            });
            init();
        })
        .catch(function() {
            init();
        });

        surveyedStops.push("1234568");
        surveyedStops.push("1234569");

        $(".welcome button").click(function () {
            $(".welcome").hide();
            document.cookie = "<?=$cookieName?>=true; expires=" + new Date(new Date().valueOf() + 3600000*24*30).toUTCString() + "; path=/";
        });
    });
    </script>
</body>
</html> 
