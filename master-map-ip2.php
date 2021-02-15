<?php
include("config.php");
include("./lib/redirect-to-https.php");
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
    <div id="root">
        <div id="map-pane">
            <div id="master-map" class="fill"></div>
        </div>
        <div id="info-pane">
            <!-- TODO: refactor (php include??) -->
            <button id="collapse-button" title="Click to collapse pane.">
                <span></span>
            </button>
            <div id="info-pane-content">
            </div>
        </div>
    </div>

    <script src="jslib/jquery-2.1.4.min.js"></script>
    <script src="js/coremap-ip.js"></script>
    <script src="js/map-presets.js"></script>
    <link rel="stylesheet" href="css/coremap.css" />

    <script>
    var currentStopsByShape;
    $(function() {
        var route = {
			agency_id: "MARTA",
            route_short_name: "73",
            route_long_name: "Fulton Industrial"
            //route_long_name: "Peachtree Road / Buckhead / The Peach"
		};



//
        var DIRECTIONS = {
            N: "Northbound",
            S: "Southbound",
            E: "Eastbound",
            W: "Westbound"
        }
        var icons = {};
        Object.keys(presetAmenities).forEach(
            k => icons[k] = getAmenityIcon(presetAmenities[k])
        );


        $.ajax({
		url: "test/route-6.json",
		dataType: "json",
        success: function(stopsByDirection) {    
                currentStopsByDirection = stopsByDirection;
    
                // Generate route diagrams
                var routeStopsContent1 = Object.values(stopsByDirection).map(makeDirectionDiagram).join("");
                var routeStopsContent2 = Object.values(stopsByDirection).map(makeRouteDiagramContents2).join("");
    
                // Summary items
                var summaryStats = makeRouteStatsContents();
    
    // End unchanged code
    
            $("#root").addClass("info-visible");
            $("#info-pane-content").html(
                `<div class="stop-name info-pane-route">
                    <h2>${getRouteLabel(route)}</h2>
                    <div>${route.route_long_name || ""}</div>
                </div>
                <div class="route-info">
                    ${summaryStats}
                    ${routeStopsContent2}
                    ${routeStopsContent1}
                   
                </div>`
            );
        }})
    });
    </script>
</body>
</html>
