var defaultCenter = [-84.38117980957031, 33.7615242074253];
var layout = {};
layout.attachMap = function(map) {
	layout.hideInfoPane = function() {
		$("#root").removeClass("info-visible");
		map.onInfoPaneClosed();
	};
	layout.showInfoPane = function(content) {
		$("#info-pane-content").html(content);

		$("#root").addClass("info-visible");
		map.onInfoPaneShown();
	};
	$("#collapse-button").click(layout.hideInfoPane);
};

var converters = {
	standard: function(stop) {
		var result = {
			type: "Feature",
			geometry: {
				type: "Point",
				coordinates: [stop.lon, stop.lat]
			}
		};
		result.properties = stop;
		result.properties.label = stop.name ? stop.name
				.replace(" PARK & RIDE", "")
				.replace(" STATION", "")
				: "";
		return result;
	},
	shapeToGeoJson: function(shape) {
		return {
			type: "geojson",
			data: {
				type: "Feature",
				geometry: {
					type: "LineString",
					coordinates: shape.points_arr
				}
			}
		};
	}
};
var filters = {
	inactiveStop: function(stop) { return stop.active == 0 || stop.active == "0"; }
}
function not(filter) { return function(item) { return !filter(item); }; }
function isFunc(f) { return typeof f === "function"; }
function callIfFunc(f) { return isFunc(f) ? f : function() { }; }

var coremap = {};
/**
 * After setting mapboxgl.accessToken,
 * call this function to initialize the map.
 * @param {*} opts The options to set up the map (all params optional unless noted below):
 * - center: [lat: number, lon: number]
 * - containerId: string (required)
 * - dynamicFetch : truthy/falsy
 * - excludeInitiatives: false by default
 * - geoJsonMarkerFactory(stop)
 * - initial zoom: (default = 11)
 * - logoContainerId: string
 * - onGetContent(marker) : callback returning {links : String, description : String}
 * - onMarkerClicked(marker) : callback
 * - useDeviceLocation : truthy/falsy
 */
coremap.init = function(opts) {
	var adoptedStops = [];
	var loadedStops = [];
	var loadedStopIds = [];
	var map = new mapboxgl.Map({
		center: opts.center || defaultCenter,
		container: opts.containerId,
		// hash: true, // TODO figure out creating link or navigation.
		style: "mapbox://styles/mapbox/streets-v11",
		zoom: opts.initialZoom || 10
	});
	// Vars for current selection.
	var popup;
	var selectedStopMarker;

	// Add geocoder first if parent page has imported it.
	if (typeof MapboxGeocoder != "undefined") {
		map.addControl(new MapboxGeocoder({
			accessToken: mapboxgl.accessToken,
			mapboxgl: mapboxgl
		}), "top-left");
	}

	// Add logo control if specified.
	if (opts.logoContainerId) {
		var LogoControl = {
			onAdd: function() {
				var element = document.getElementById(opts.logoContainerId);
				element.className = "mapboxgl-ctrl";
				return element;
			},
			onRemove: function () {}
		}
		map.addControl(LogoControl, "top-left");
	}

	map.addControl(new mapboxgl.NavigationControl({
		showCompass: false
	}));


	var refreshMap = debounce(function () {
		startSpinner();
		var c = map.getCenter();

		$.ajax({
			url: 'ajax/get-adoptable-stops.php?lat=' + c.lat + '&lon=' + c.lng,
			dataType: 'json',
			success: load
		});
	}, 1000);

	if (opts.dynamicFetch) {
		map.on('moveend', refreshMap);
	}

	if (opts.useDeviceLocation && navigator.geolocation) {
		// Add geolocator control if there is position response from the navigator.
		navigator.geolocation.getCurrentPosition(function () {
			var geoLocateControl = new mapboxgl.GeolocateControl();
			map.addControl(geoLocateControl);
			map.on('load', function () {
				geoLocateControl.trigger();
			});

			// TODO: Button to reset to initial overall view if location is not enabled.
		});
	}

	// todo control spinners in these functions
	function startSpinner() { }
	function stopSpinner() { }

	function debounce(fn, delay) {
		var timer = null;
		return function () {
			var context = this, args = arguments;
			clearTimeout(timer);
			timer = setTimeout(function () {
				fn.apply(context, args);
			}, delay);
		};
	}

	function onLayerMouseEnter() {
		map.getCanvas().style.cursor = "pointer";
	}
	function onLayerMouseLeave() {
		map.getCanvas().style.cursor = "";
	}
	function getStopDescription(stop, popup) {
		var stopIds = getStopIds(stop);
		var shortStopIds = stopIds.shortIds;
		var stopTitle = getStopTitle2(stop);

		getStopRoutes(stop, function() {
			var hasRoutes = stop.routes && stop.routes.length;
			var routeLabelContent = "";
			if (!filters.inactiveStop(stop)) {
				if (isFinite(shortStopIds[0]) || hasRoutes) {
					var routeLabels = hasRoutes
						? getRouteLabels(stop.routes, "onStopDetailRouteClick")
						: "[routes]";
					routeLabelContent =
					`<span id="routes">${routeLabels}</span>
					 <a id="arrivalsLink" target="_blank" href="stopinfo.php?sids=${stopIds.fullIds.join(",")}&title=${encodeURIComponent(stopTitle)}">Arrivals</a>
					`;
				}
			}
			else {
				routeLabelContent = '<span style="background-color: #ff0000; color: #fff">No service</span>';
			}

			var amenitiesContent = "";
			// Stop amenities (streetcar only).
			if (isStreetcarStop(stop)) {
				amenitiesContent =
				`<ul class="popup-amenities inline-list">${getAmenityIcons(stopAmenities.tram)}</ul>`;
			}
			// Custom content
			var content = callIfFunc(opts.onGetContent)(stop) || {};

			popup.setHTML(
				`<div class="stop-name">${stopTitle}</div>
				 <div class="stop-info">
					<div>${routeLabelContent}</div>
					<div>Amenities (<button onclick="javascript:showStopDetails()">Details</button>)</div>
					<div>${amenitiesContent}</div>

					${content.links ? `<div>${content.links}</div>` : ""}
					${content.description ? `<div>${content.description}</div>` : ""}
				</div>`
			);
		});
		// Get departures.
		/*
		$.ajax({
			url: "https://barracks.martaarmy.org/ajax/get-next-departures.php?stopid=" + shortStopId,
			dataType: 'json',
			success: function(departures) {
				// Sort routes, letters firt, then numbers.

				m.routes = routes;
				$("#routes").html(getRouteLabels(routes));
			}
		});
		*/
	}
	function onLayerClickPopupInfo(e) {
		var feat = e.features[0];
		var stop = feat.properties;
		coremap.selectedStop = stop;
		var coordinates = feat.geometry.coordinates;

		if (popup) popup.remove();
		popup = new mapboxgl.Popup()
		.setLngLat(coordinates);
		getStopDescription(stop, popup);
		popup.addTo(map);


		if (selectedStopMarker) selectedStopMarker.remove();
		selectedStopMarker = new mapboxgl.Marker({
			color: "#fe5f20"
		})
		.setLngLat(coordinates)
		.addTo(map);

		//layout.showInfoPane(popupContent);

		callIfFunc(opts.onMarkerClicked)(stop);
	}
	function load(stops) {
		if (stops) {
			// If a stop id wasn't in the loaded list, add it.
			stops.forEach(function(s) {
				if (loadedStopIds.indexOf(s.id) == -1) {
					loadedStopIds.push(s.id);
					loadedStops.push(s);
				}
			});

			// Update the sources for the stop sublayers
			opts.symbolLists.forEach(updateSymbolListSources);
		}
		stopSpinner();
	}

	map.on("load", function () {
		// Where appliesTo is an array in the presets, load those stops.
		var initialStops = []
		opts.symbolLists.forEach(function(symbolList) {
			symbolList.forEach(function(s) {
				if (typeof s.appliesTo == "object") { // i.e. array
					s.appliesTo.forEach(function(stop) {
						if (stop.ids) initialStops = initialStops.concat(stop.ids.map(function(id) { return {id: id}; }));
						else if (stop.id) initialStops.push(stop);
					});
				}
			});
		});
		load(initialStops);

		// For testing
		load(presets.testStops);

		opts.symbolLists.forEach(function(symbolList, index) {
			symbolList.forEach(function(s) {
				// Create the symbol layers.
				// Add events only to the first, base symbol (usually a filled shape).
				createSymbolLayers(s, index == 0);
			});
		});

		drawPreloadedShapes();
/*
		if (presets.shapes && presets.shapes.length) {
			$.ajax({
				url: "ajax/get-shapes-gl.php?ids=" + presets.shapes.map(function(r) {
					return r.shapeId;
				}).join(","),
				dataType: "json",
				success: points => drawShapes(points, presets.shapes)
			});
		}
*/
		if (!opts.excludeInitiatives) {
			$.ajax({
				url: "ajax/get-adopted-stops.php",
				type: "POST",
				dataType: 'json',
				success: function (d) {
					switch (d.status) {
						case 'success':
							adoptedStops = d.stopdetails;
							if (!opts.dynamicFetch) load(adoptedStops);
							break;
						default:
							showErrorMessage('Failed to fetch stops');
					}
				},
				error: function () {
					showErrorMessage('Failed to fetch stops');
				}
			});
		}
	});
	/*
	map.on("click", function(e) {
		var arr1 = e.lngLat.toArray();
		console.log("[" + arr1[0].toFixed(6) + ", " + arr1[1].toFixed(6) + "], //");
	});
	*/
	function createSymbolLayers(symbolDefn, addEvents) {
		var sourceName = "source-symbol-" + symbolDefn.id;

		symbolDefn.layers.forEach(function(layer, index) {
			var newLayer = Object.assign(layer);
			var id = newLayer.id = "layer-symbol-" + symbolDefn.id + "-" + index;
			newLayer.source = sourceName;
			map.addLayer(newLayer);

			if (addEvents) {
				// Hook layer's click handler, if provided, or use default.
				if (isFunc(symbolDefn.handleClick)) {
					map.on("click", id, symbolDefn.handleClick(map, onLayerClickPopupInfo))
				}
				else map.on("click", id, onLayerClickPopupInfo);

				map.on("mouseenter", id, onLayerMouseEnter);
				map.on("mouseleave", id, onLayerMouseLeave);
			}
		});
	}

	// Initialize or update sources used in the layers within a symbol list.
	function updateSymbolListSources(symbolList) {
		// Keep track of stops that have not been assigned a previous background.
		var remainingStops = [].concat(loadedStops);

		symbolList.forEach(function(s) {
			var appliesToType = typeof s.appliesTo;
			var sourceFeatures;
			if (appliesToType == "function") {
				sourceFeatures = remainingStops.filter(s.appliesTo);
				remainingStops = remainingStops.filter(not(s.appliesTo));
			}
			else if (appliesToType == "object") {
				sourceFeatures = [];
				s.appliesTo.forEach(function(stop) {
					var ids = stop.ids;
					if (ids && ids.length) {
						// Build a combined feature and remove individual child stops.
						ids.forEach(function(child) {
							var chIndex = remainingStops.indexOf(child);
							if (chIndex != -1) {
								remainingStops.splice(chIndex, 1);
							}
						});
						var combinedStop = Object.assign(stop);
						combinedStop.csvIds = ids.join(",");
						sourceFeatures.push(combinedStop);
					}
					else if (stop.id) {
						var sIndex = remainingStops.indexOf(stop);
						if (sIndex != -1) {
							sourceFeatures.push(stop);
							remainingStops.splice(sIndex, 1);
						}
					}
				});
			}
			else if (appliesToType == "undefined") {
				sourceFeatures = remainingStops;
				remainingStops = [];
			}

			if (sourceFeatures) {
				var sourceName = "source-symbol-" + s.id;
				var source = map.getSource(sourceName);
				var sourceFinalData = {
					type: "geojson",
					data: {
						type: "FeatureCollection",
						features: sourceFeatures.map(converters.standard)
					}
				}

				if (!source) map.addSource(sourceName, sourceFinalData);
				else source.setData(sourceFinalData.data);
			}
		});
	}

	function drawPreloadedShapes() {
		presets.preloadedShapes.forEach(function(sc) {
			var sourceName = `preloaded-shape-${sc.id}`;
			drawShape(sc.points, sourceName, sc.color, sc.weight, 0, 0);
		});
	}
	function drawShapes(points, shapes) {
		shapes.forEach(function(sc) {
			var sourceName = `shape-${sc.shapeId}`;
			drawShape(points[sc.shapeId], sourceName, sc.color || "#000", sc.weight || 2, 0, 0);
		});
	}
	coremap.drawShapes = drawShapes;

	function deleteShapes(ids) {
		ids.forEach(id => {
			var layerId = `shape-${id}`;
			map.removeLayer(layerId);
			map.removeSource(layerId);
		});
	}
	coremap.deleteShapes = deleteShapes;

	function drawShape(points_arr, sourceName, color, weight, dx, dy) {
		map.addSource(sourceName, {
			type: "geojson",
			data: {
				type: "Feature",
				geometry: {
					type: "LineString",
					coordinates: points_arr
				}
			}
		});

		map.addLayer({
			id: sourceName,
			type: "line",
			source: sourceName,
			layout: {
				"line-join": "round",
				"line-cap": "round"
			},
			paint: {
				"line-color": color,
				"line-opacity": 0.5,
				"line-translate": [dx, dy],
				"line-width": weight
			}
		}, "layer-symbol-rail-circle-0"); // draw lines underneath stations.
	}

	function showErrorMessage(msg) {
		// todo
	}

	map.update = function() { };
	map.onInfoPaneClosed = function() {
		// Resize map when container is resized
		map.resize();
		if (selectedStopMarker) selectedStopMarker.remove();
	}
	map.onInfoPaneShown = function() {
		// Resize map when container is resized
		map.resize();
		// Center map on selected marker.
		if (selectedStopMarker) map.panTo(selectedStopMarker.getLngLat());
	}

	layout.attachMap(map);

	return map;
};

// Helper functions
function getShortStopId(longId) {
	return longId.split("_")[1]; // can be undefined.
}
function isStreetcarStop(stop) {
	return stop.name.lastIndexOf(" SC") == stop.name.length - 3;
}
function isAtStation(stop) {
	return stop.name.indexOf(" STATION") >= 0
	&& stop.name.indexOf(" STATION)") == -1;
}
function getStopIds(stop) {
	var fullIds = stop.csvIds ? stop.csvIds.split(",") : [stop.id];
	var shortIds = fullIds.map(function(idStr) { return getShortStopId(idStr); });
	return {
		fullIds: fullIds,
		shortIds: shortIds
	};
}
function getStopTitle(stop, ids) {
	return stopTitle = stop.name + " (" + ids.join(", ") + ")";
}
function getStopTitle2(stop) {
	var ids = getStopIds(stop).shortIds;
	return stopTitle = stop.name + " (" + ids.join(", ") + ")";
}
function getLetterGrade (score) {
	if (score >= 90) return 'A'
	else if (score >= 70) return 'B'
	else if (score >= 50) return 'C'
	else if (score >= 30) return 'D'
	else return 'F'
}
function getAmenityIcon(a) {
	return `<span aria-label="${a.shortText}" title="${a.longText}">${a.contents}</span>`;
}
function getAmenityIcons(amenities) {
	return amenities.map(a => `<li>${getAmenityIcon(a)}</li>`).join("");
}
var icons;
function initIcons() {
	if (!icons) {
		icons = {};
		Object.keys(presetAmenities).forEach(
			k => icons[k] = getAmenityIcon(presetAmenities[k])
		);
	}
}
/**
 * Fetches the routes serving a stop, and runs additional code once that is done.
 * @param stop the stop to get routes for.
 * @param callback a function called during and after routes have been fetched and assigned to stop.
 */
function getStopRoutes(stop, callback) {
	var stopRoutesFetched = [];
	var stopsFetched = 0;
	var stopIds = getStopIds(stop);
	var shortStopIds = stopIds.shortIds;
	//if (stop.routes) {
		// Callback code directly if routes were fetched.
		callIfFunc(callback)();
	//}
	//else {
	if (!stop.routes) {
		shortStopIds.forEach(function(shortStopId) {
			$.ajax({
				url: "ajax/get-stop-routes.php?stopid=" + shortStopId,
				dataType: 'json',
				success: function (routes) {
					routes.forEach(function(route) {
						// Add route if not already fetched.
						var routesWithSameName = stopRoutesFetched.filter(function(fetched) {
							return fetched.agency_id == route.agency_id
								&& fetched.route_short_name == route.route_short_name;
						});
						if (routesWithSameName.length == 0) stopRoutesFetched.push(route);
					});
					stopsFetched++;
					if (stopsFetched == shortStopIds.length) {
						// TODO: sort routes, letters first, then numbers.
						stop.routes = stopRoutesFetched;

						// Callback code
						callIfFunc(callback)();
					}
				},
				// Dev only
				error:function() {
					// TODO: sort routes, letters first, then numbers.
					stop.routes = [
						{
							agency_id: "MARTA",
							route_short_name: "ATLSC"
						}
					];

					// Callback code
					callIfFunc(callback)();
				}
			});
		});
	}
}
/**
 * Gets clickable HTML content for the given route.
 * @param {*} routes The routes to render.
 * @param {*} onRouteClickFnName Optional - The name of a global function that takes one 'index' arg.
 * @param {*} index The index for refering to the route on click. Required only if onRouteClickFnName is specified.
 */
function getRouteLabel(route, onRouteClickFnName, index) {
	var agency = route.agency_id;
	var routeName = route.route_short_name;
	var agencyRoute = `${agency} ${routeName}`;
	// Hack for MARTA rail lines...
	var railClass = "";
	if (agency == "MARTA") {
		switch (routeName) {
			case "BLUE":
			case "GOLD":
			case "GREEN":
			case "RED":
				railClass = "rail-line";
				break;
			case "ATLSC":
				railClass = "tram-line";
				routeName = "Streetcar";
				break;
			default:
		};
	}
	// HACK: Set handler to identify route at given stop using index.
	var onclickContent = onRouteClickFnName ? `onclick="${onRouteClickFnName}(${index})"` : "";
	return `<span class="${agencyRoute} ${railClass} route-label" ${onclickContent} title="${agencyRoute}"><span>${routeName}</span></span>`;
}
function getRouteLabels(routes, onRouteClickFnName) {
	return routes.map(function (r, index) {
		// TODO: use <li> and <ul> for this list
		return getRouteLabel(r, onRouteClickFnName, index);
	}).join("");
}
function showStopDetails() {
	var stop = coremap.selectedStop;
	getStopRoutes(stop, function() {
		var routeLabels = stop.routes
			? getRouteLabels(stop.routes, "onStopDetailRouteClick")
			: "[routes]";
		layout.showInfoPane(
			`<h2 class="stop-name">${getStopTitle2(stop)}</h2>
			<div class="stop-info">
			${routeLabels}
			<h3>Amenities</h3>
			${(isStreetcarStop(stop))
				? `<ul class="popup-amenities inline-list">${getAmenityIcons(stopAmenities.tram)}</ul>
				<a href="atlsc-stop-amenities.php" target="_blank">Learn more</a>`
				: ""
			}
			</div>`
		);
	});
}
/**
 * Returns street name to a standardized nomenclature,
 * without quadrants (NE, NW...), extra spaces, and typos fixed.
 */
function normalizeStreet(streetName) {
	// Replace extra spaces, pky-> pkwy.
	var result = streetName.trim()
	.replace("  ", " ")
	.replace(" PKY", " PKWY");

	// Remove quadrants
	var quadrants = [" NW", " NE", " SE", " SW"];
	quadrants.forEach(function(q) {
		if (result.endsWith(q)) {
			result = result.substring(0, result.length - q.length);
		}
	});
	return result;
}
var DIRECTIONS = {
	N: "Northbound",
	S: "Southbound",
	E: "Eastbound",
	W: "Westbound"
}
var COLSPAN = "colspan='7'";
var currentShapes;
var lastDivergencePatterns;
var currentStreet;
var previousStreet;
var stopsById = {};
function populateStopsById(stopsByDirection) {
	var allRouteStops = [];
	Object.values(stopsByDirection).forEach(d => {
		Object.keys(d.shapes).forEach(function (shape) {
			allRouteStops = allRouteStops.concat(d.shapes[shape].stops);
		});
	});
	allRouteStops.forEach(st => { stopsById[st.id] = st; });
}

function pct(n, count) {
	return `${(n / count * 100).toFixed(1)}%`	
}
function makeRouteStatsContents() {
	// Number of stops and surveyed stops for the route.
	var stops = Object.values(stopsById);
	var uniqueStopsWithCensus = stops.filter(st =>st.census);

	return `<p>${uniqueStopsWithCensus.length}/${stops.length} stops
		(${pct(uniqueStopsWithCensus.length, stops.length)}) surveyed</p>`;
}
function stopsByDirectionToShapes(stopsByDirection) {
	var shapeIds = [];
	Object.values(stopsByDirection).forEach(d => {
		shapeIds = shapeIds.concat(Object.keys(d.shapes));
	});
	return shapeIds;
}

function printStopContent(stops, index, level, higherLevels, isTerminus, stats) {
	var st = stops[index];
	var nextStopParts = stops[index].name.split("@");
	var nextStopStreet = normalizeStreet(nextStopParts[0]);
	// Specific if stop name is formatted as "Main Street NW @ Other Street",
	// in which case stopStreet will be "Main Street".
	var stopParts = st.name.split("@");

	var stopStreet = index == 0
		? normalizeStreet(stopParts[0])
		: nextStopStreet

	if (index + 1 < stops.length) {
		nextStopParts = stops[index + 1].name.split("@");
		nextStopStreet = normalizeStreet(nextStopParts[0]);
	}

	if (index > 0) {
		var previousStopParts = stops[index - 1].name.split("@");
		previousStreet = normalizeStreet(previousStopParts[0]);
	}

	var printNewStopStreet = false;
	var stopName;
	if (stopParts.length >= 2) {
		stopName = normalizeStreet(stopParts[1]);

		if (stopStreet != currentStreet && stopStreet != previousStreet) {
			currentStreet = stopStreet;
			if (index + 1 < stops.length && nextStopStreet == stopStreet) {
				printNewStopStreet = true;
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
	stats.stopCount++;
	if (c) {
		var seating = c.seating.startsWith("Yes") ? icons.seating : "";
		var shelter = c.shelter.startsWith("Yes") ? icons.shelter : "";
		var trashCan = c.trash_can.startsWith("Yes") ? icons.trash : "";
		var noCrosswalks = c.main_street_crosswalk == "No" && c.cross_street_crosswalk == "No";
		var isAccessible =
			c.sidewalk != "No" // at least one sidewalk
			&& (c.boarding_area == "Concrete sidewalk" || c.boarding_area == "Brick pavers") // solid boarding area
			&& (noCrosswalks || c.curb_cuts == "Yes") // either no crosswalk or, if crosswalk, they must have curb cuts
			&& c.obstacles == "No" // no obstacles
			; // TODO add uneven sidewalk from addl comments.
		var accessible = isAccessible ? icons.accessible : "";
		var mainCrosswalk = c.main_street_crosswalk == "Yes" ? icons.crosswalk : "";
		var trafficLight = (/*c.traffic_light == "Yes" &&*/ c.crosswalk_signals == "Yes") ? icons.trafficLight : "";

		stats.surveyedCount++;
		if (isAccessible) stats.accessible++;
		if (trafficLight) stats.trafficLight++;
		if (mainCrosswalk) stats.crosswalk++;
		if (seating) stats.seating++;
		if (shelter) stats.shelter++;
		if (trashCan) stats.trash++;
		stats.totalScore += c.score;
		
		amenityCols =
			`<td>${accessible}</td>
			<td>${trafficLight}</td>
			<td>${mainCrosswalk}</td>
			<td>${seating}</td>
			<td>${shelter}</td>
			<td>${trashCan}</td>
			<td>${getLetterGrade(c.score)}</td>`;
	}
	else {
		amenityCols = `<td class="gray-cell" ${COLSPAN}></td>`;
	}

	var diagram = "";
	var diagramNewStreet = "";
	if (level > 0) {
		// Draw line without stop for previous levels.
		diagramNewStreet = diagram = Array(level).fill("<span class='diagram-line'></span>").join("");
	}

	var stopClass = "";
	if (index == 0) stopClass = "terminus first";
	else if (index == stops.length - 1) stopClass = "terminus last";
	else if (isTerminus) stopClass = "terminus";
	diagram += `<span class='diagram-line ${stopClass}'></span><span class='diagram-stop-symbol'></span>`;
	diagramNewStreet += `<span class='diagram-line ${stopClass}'></span>`;

	if (higherLevels && higherLevels > 0) {
		// Draw line without stop for higher stop levels that are at 'before-convergence'
		var diagramHigherLevels = Array(higherLevels).fill("<span class='diagram-line'></span>").join("");
		diagram += diagramHigherLevels
		diagramNewStreet += diagramHigherLevels;
	}

	var stopStreetContents = "";
	if (printNewStopStreet) {
		stopStreetContents =
		`<tr><td class="gray-cell" ${COLSPAN}></td>
			<td><span class="diagram-container">${diagramNewStreet}
				<span class="new-route-street">${stopStreet.toLowerCase()}</span>
			</span></td><tr>`;
	}

	return `${stopStreetContents}
		<tr onclick="onRouteProfileStopClick(event, ${st.id})">
			${amenityCols}
			<td><span class="diagram-container">${diagram}<span>
				<span class="diagram-stop-name ${stopClass}">${stopName.toLowerCase()}</span>
				<small>${st.id}</small>
			</span></span></td>
		</tr>`;
}

function getPatternIndexesForStop(stopId, allSeqs) {
	var result = [];

	allSeqs.forEach((s, i) => {
		var stopIndex = s.findIndex(st => st.id == stopId);
		if (stopIndex > -1) {
			result.push({
				sequence: i,
				stopIndex: stopIndex
			});
		}
	});

	return result;
}

function drawRouteBranchContents(allSeqs, index, level, lastDrawnStatuses, stats) {
	if (["divergence-no-branch", "before-convergence", "before-convergence-parallel"
		].indexOf(lastDrawnStatuses[index].status) > -1) return "";

	console.log(`Drawing branch ${index} at level ${level}`)
	
	var seq_i = allSeqs[index];
	var result = "";
	
	// Previous pattern indexes that also have this stop.
	var prevPatternsForStop = [];
	var firstIndex = lastDrawnStatuses[index].index + 1;
	
	for (var j = firstIndex; j <= seq_i.length - 1; j++) {
		// Compute number of patterns for this stop
		var patternsForStop = getPatternIndexesForStop(seq_i[j].id, allSeqs);

		// On the first stop, if it is just a few stops skipped, don't draw.
		if (j == firstIndex) {
			var isStopSkip = lastDivergencePatterns && patternsForStop.length == lastDivergencePatterns.length; // Maybe check seq numbers too.
			if (isStopSkip) {
				lastDrawnStatuses[index].status = "before-convergence";

				// Also set this status to parallel patterns at higher indexes
				lastDivergencePatterns.forEach(p => {
					if (p.sequence > index) lastDrawnStatuses[p.sequence].status = "divergence-no-branch";
				});

				return "";
			}
		}

		// If pattern has not changed or if this is the first stop we print,
		// then just print the stop.
		// If number of patterns is less, then it is a divergence.
		// Continue with other patterns first.
		var isDivergence = patternsForStop.length < prevPatternsForStop.length && prevPatternsForStop.length != 0;

		if (j == 0 || patternsForStop.length == prevPatternsForStop.length || prevPatternsForStop.length == 0 || isDivergence) {
			if (isDivergence) {
				console.log('Processing divergence', prevPatternsForStop)
				lastDivergencePatterns = prevPatternsForStop;

				// Draw other patterns first on higher levels from the divergence index
				// that are not on the current pattern and that are not at a terminus.
				var patternsToDraw = [];
				prevPatternsForStop.forEach(p => {
					if (p.stopIndex == allSeqs[p.sequence].length - 1 ||
 						p.sequence <= index || patternsForStop.find(p0 => p0.sequence == p.sequence)) {
						lastDrawnStatuses[p.sequence].status = "divergence-no-branch";
					}
					else if (p.sequence > index) {
						patternsToDraw.push(p);
						lastDrawnStatuses[p.sequence].index = p.stopIndex;
					}
				});

				if (patternsToDraw.length) {
					result += `<tr><td ${COLSPAN}></td><td><span class="diagram-container">
					<span class="diagram-line">					
					<span class="divergence junction"></span>
					<span class="divergence curve"></span>
					</span>
					</span></td></tr>`;
	
					var levelOffset = 1;
					patternsToDraw.forEach(p => {
						//levelOffset++;
						result += drawRouteBranchContents(allSeqs, p.sequence, level + levelOffset, lastDrawnStatuses, stats);
					});
				}
			}

			var higherLevels = 0;
			if (lastDivergencePatterns) {
				higherLevels = lastDivergencePatterns.filter(
					p => p.sequence > level
						&& lastDrawnStatuses[p.sequence]
						&& lastDrawnStatuses[p.sequence].status == 'before-convergence'
				).length;
			}

			var isTerminus = false;
			patternsForStop.forEach(p => {
				if (p.stopIndex == allSeqs[p.sequence].length - 1) {
					// If at least one pattern does not continue past this stop,
					// render this stop as intermediate terminus,
					// and do not render pattern.
					isTerminus = true;
					lastDrawnStatuses[p.sequence].status = "divergence-no-branch";
				}
			});

			result += printStopContent(seq_i, j, level, higherLevels, isTerminus, stats);

			// Update drawing status for patterns coming after the one we are drawing.
			patternsForStop.forEach(p => {
				if (p.sequence >= index) {
					lastDrawnStatuses[p.sequence] = {
						index: p.stopIndex - 1,
						status: isDivergence ? "after-divergence" : "normal"
					};
					if (isDivergence) console.log(p.sequence, lastDrawnStatuses[p.sequence]);
				}
			});
		}
		// If number of patterns is more, then it is a convergence.
		// => don't draw this stop and start drawing the pattern(s) that is/are converging.
		// unless all converging patterns are first stop.
		else if (patternsForStop.length > prevPatternsForStop.length && prevPatternsForStop.length != 0) {
			lastDrawnStatuses[index].status = "before-convergence";
			// Also set the status to other common patterns so they don't get drawn as duplicate.
			prevPatternsForStop.forEach(p => {
				if (p.sequence > index) {
					lastDrawnStatuses[p.sequence].status = "before-convergence-parallel";
				}
			});
			

			console.log("before-convergence", index, lastDrawnStatuses[index]);

			// Draw patterns that are not previously common to this pattern.
			var levelOffset = 1;
			patternsForStop.forEach(p => {
				if (!prevPatternsForStop.find(p0 => p0.sequence == p.sequence) && lastDrawnStatuses[p.sequence].status != "before-convergence" && lastDrawnStatuses[p.sequence].status != "before-convergence-parallel") {
					//levelOffset++;
					if (p.stopIndex == 0) {
						lastDrawnStatuses[p.sequence] = {
							status: "before-convergence-parallel",
							index: -2
						};
					}
					else {
						result += drawRouteBranchContents(allSeqs, p.sequence, level + levelOffset, lastDrawnStatuses, stats);
					}
				}
			});

			// If all convergent patterns that needed to be drawn have been drawn,
			// resume with the current stop at the lowest level.
			if (patternsForStop[0].sequence == index) {
				if (lastDrawnStatuses.filter(lds => lds.status != "before-convergence-parallel").length > 1) {
					result += `<tr><td ${COLSPAN}></td><td><span class="diagram-container">
						<span class="diagram-line">					
							<span class="convergence junction"></span>
							<span class="convergence curve"></span>
						</span>
					</span></td></tr>`;
				}

				var isThisTerminus = lastDrawnStatuses.filter(lds => lds.index == -2).length > 0;

				result += printStopContent(seq_i, j, level, undefined, isThisTerminus, stats);
				lastDivergencePatterns = null;
				console.log("before-convergence complete", index, lastDrawnStatuses[index]);
			}
			else {
				// If this is not the lowest index, return so that the calling drawing process can proceed.
				console.log(`Returning to previous pattern from ${level}`);
				return result;
			}
		}

		prevPatternsForStop = patternsForStop;
	}

	return result;
}

function makeRouteDiagramContents2(directionObj) {
	initIcons();

	var direction = DIRECTIONS[directionObj.direction];

	var allSeqs = Object.values(directionObj.shapes)
	.map(sh => sh.stops)
	// sort length desc.
	.sort((a1, a2) => a2.length - a1.length);
	
	// Start from a stop sequence (pick the first one).

	// Holds the last own stops (so we can resume drawing)
	var lastDrawnStatuses = allSeqs.map(() => ({
		index: -1,
		status: "not-started"
	}));

	var stats = {
		accessible: 0,
		crosswalk: 0,
		trafficLight: 0,
		seating: 0,
		shelter: 0,
		trash: 0,
		stopCount: 0,
		surveyedCount: 0,
		totalScore: 0
	};
	
	var stopListContents = drawRouteBranchContents(allSeqs, 0, 0, lastDrawnStatuses, stats); //.replace(/\>(\s|\n)+\</g, "><");
	console.log("diagram length:", stopListContents.length);
	//console.log(stopListContents);

	currentStreet = undefined;
	previousStreet = undefined;

	var n = stats.surveyedCount;
	var stopListStats =
	`<tr class="stats-row"><td><p>${pct(stats.accessible, n)}</p></td>
	<td><p>${pct(stats.trafficLight, n)}</p></td>
	<td><p>${pct(stats.crosswalk, n)}</p></td>
	<td><p>${pct(stats.seating, n)}</p></td>
	<td><p>${pct(stats.shelter, n)}</p></td>
	<td><p>${pct(stats.trash, n)}</p></td>
	<td></td>
	<td>${stats.surveyedCount}/${stats.stopCount} stops (${pct(stats.surveyedCount, stats.stopCount)}) surveyed</td>
	</tr>`;

	return `<p>${direction}</p>
	<table class="trip-diagram">
		<tbody>${stopListStats}${stopListContents}</tbody>
	</table>`
}



function onStopDetailRouteClick(routeIndex) {
	var stop = coremap.selectedStop;
	var route = stop.routes[routeIndex];

	$.ajax({
		url: `ajax/get-route-stops.php?routeid=${route.route_id}`,
		dataType: "json",
		success: function(stopsByDirection) { // direction > shapes > stops
			// Delete shapes of the previously shown route
			if (currentShapes) coremap.deleteShapes(currentShapes);			
			currentShapes = stopsByDirectionToShapes(stopsByDirection)

			// Stop index for these routes.
			populateStopsById(stopsByDirection);

			// Summary items
			var summaryStats = makeRouteStatsContents();

			// Generate route diagrams
			var routeStopsContent = Object.values(stopsByDirection).map(makeRouteDiagramContents2).join("");

			layout.showInfoPane(
				`<div class="stop-name info-pane-route">
					<h2>${getRouteLabel(route)}</h2>
					<div>${route.route_long_name || ""}</div>
				</div>
				<div class="route-info">
					${summaryStats}
					${routeStopsContent}
				</div>`
			);

			// Draw shapes for the selected route.
			var newShapeIds = stopsByDirectionToShapes(stopsByDirection);
			$.ajax({
				url: `ajax/get-shapes-gl.php?ids=${newShapeIds.join(",")}`,
				dataType: "json",
				success: function(points) {
					coremap.drawShapes(points, newShapeIds.map(sh => ({
						shapeId: sh
					})));
				}
			});
		}
	});
}

var routeStopDetailElement = document.createElement("TR");
var routeStopDetailVisible = false;
function onRouteProfileStopClick(e, stopId) {
	if (!routeStopDetailVisible) {
		var stop = stopsById[stopId];
		var censusContents = "";
		if (stop.census) {
			censusContents = Object.keys(stop.census).map(
				k => `<li>${k}: ${stop.census[k]}</li>`
			).join("");
		}
		routeStopDetailElement.innerHTML =
			`<td colspan="7">
				<ul>${censusContents}</ul>
			</td>`;
		e.currentTarget.insertAdjacentElement("afterend", routeStopDetailElement);
		routeStopDetailElement.style.display = "";
	}
	else {
		routeStopDetailElement.style.display = "none";
		routeStopDetailElement.innerHTML = "";
	}
	routeStopDetailVisible = !routeStopDetailVisible;
}
