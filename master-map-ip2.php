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
    function makeRouteDiagramContents(shapeInfo) {
	initIcons();
	var shape = shapeInfo.shapeId;
	var stopsObj = shapeInfo.shapeData;

	var stops = stopsObj.stops;
	var currentStreet;
	var previousStreet;
	var nextStopParts;
	var nextStopStreet;
	var stopListContents = stops.map(function(st, index) {
		// Specific if stop name is formatted as "Main Street NW @ Other Street",
		// in which case stopStreet will be "Main Street".
		var stopParts = index == 0
			? st.name.split("@")
			: nextStopParts;
		var stopStreet = index == 0
			? normalizeStreet(stopParts[0])
			: nextStopStreet
		if (index + 1 < stops.length) {
			nextStopParts = stops[index + 1].name.split("@");
			nextStopStreet = normalizeStreet(nextStopParts[0]);
		}

		var stopStreetContents = "";
		var stopName;
		if (stopParts.length >= 2) {
			//var stopStreet = normalizeStreet(stopParts[0]);
			stopName = normalizeStreet(stopParts[1]);

			if (stopStreet != currentStreet && stopStreet != previousStreet) {
				currentStreet = stopStreet;
				if (index + 1 < stops.length && nextStopStreet == stopStreet) {
					stopStreetContents =
					`<tr class="new-route-street">
						<td ${COLSPAN}></td>
						<td></td>
						<td>${stopStreet.toLowerCase()}</td>
					<tr>`;
				}
				else {
					stopName = st.name;
				}
			}
		}
		else {
			stopName = st.name;
			currentStreet = previousStreet;
			previousStreet = undefined;
		}
		var c = st.census;
		var amenityCols;
		if (c) {
			var seating = c.seating.startsWith("Yes") ? icons.seating : "";
			var shelter = c.shelter.startsWith("Yes") ? icons.shelter : "";
			var trashCan = c.trash_can.startsWith("Yes") ? icons.trash : "";
			//var cleanlinessIndex = c.cleanliness.split(",").length;

			amenityCols =
				`<td>${seating}</td>
				<td>${shelter}</td>
				<td>${trashCan}</td>
				<td>${index}</td>`; //cleanlinessIndex
		}
		else {
			amenityCols = `<td class="gray-cell" ${COLSPAN}></td><td>${index}</td>`;
		}
		return `${stopStreetContents}
			<tr onclick="onRouteProfileStopClick(event, ${shape}, ${index})">
				${amenityCols}
				<td><span>${stopName.toLowerCase()}</span><small>${st.id}</small></td>
			</tr>`;
	}).join("");

	return `<p>${shape}</p>
	<table class="trip-diagram">
		<tbody>${stopListContents}</tbody>
	</table>`
}

function makeDirectionDiagram(directionObj) {
	var direction = DIRECTIONS[directionObj.direction];
	return `<p>${direction}</p>`
	+ Object.keys(directionObj.shapes)
	.map(id => ({ shapeId: id, shapeData: directionObj.shapes[id] }))
	.map(makeRouteDiagramContents)
	.join("");
}


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

		// Route ids:
		// 02 => 14901
		// 06 => 14904
		// 19 => 14907
		// 26 => 14909
		// 73 => 14919

        $.ajax({
		url: "test/route-73.json",
		dataType: "json",
        success: function(stopsByDirection) {    
				// Stop index for these routes.
				populateStopsById(stopsByDirection);

				// Summary items
				var summaryStats = makeRouteStatsContents();
    
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
