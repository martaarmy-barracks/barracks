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
						? getRouteLabels(stop.routes)
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
		if (presets.shapes && presets.shapes.length) {
			$.ajax({
				url: "ajax/get-shapes-gl.php?ids=" + presets.shapes.map(function(r) {
					return r.shapeId;
				}).join(","),
				dataType: "json",
				success: drawPresetShapes
			});
		}

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

	function drawPresetShapes(points) {
		presets.shapes.forEach(function(sc) {
			var sourceName = "shape-" + sc.shapeId;
			drawShape(points[sc.shapeId], sourceName, sc.color, sc.weight, 0, 0);
		});
	}
	function drawPreloadedShapes() {
		presets.preloadedShapes.forEach(function(sc) {
			var sourceName = "preloaded-shape-" + sc.id;
			drawShape(sc.points, sourceName, sc.color, sc.weight, 0, 0);
		});
	}
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
function getAmenityIcons(amenities) {
	return amenities.map(function(a) {
		return "<li><span aria-label='" + a.shortText + "' title='" + a.longText + "'>" + a.contents + "</li>";
	})
	.join("");
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
 * Obtains the street name without quadrants (NW, NE...)
 * and without extra spaces.
 */
function normalizeStreet(streetName) {
	var quadrants = [" NW", " NE", " SE", " SW"];
	var result = streetName.trim().replace("  ", " ");
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
function onStopDetailRouteClick(routeIndex) {
	var stop = coremap.selectedStop;
	var route = stop.routes[routeIndex];

	$.ajax({
		url: "ajax/get-route-stops.php?routeid=" + route.route_id,
		dataType: 'json',
		success: function(stopsByShape) {
			var routeStopsByShape = Object.keys(stopsByShape).map(function (shape) {
				var stopsObj = stopsByShape[shape];
				var direction = DIRECTIONS[stopsObj.direction];

				var stops = stopsObj.stops;
				var currentStreet;
				var nextStopParts;
				var nextStopStreet;
				var stopListContents = stops.map(function(st, index) {
					// Specific if stop name in "Main Street NW @ Other Street",
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
					var liClass = "";
					var stopName;
					if (stopParts.length >= 2) {
						//var stopStreet = normalizeStreet(stopParts[0]);
						stopName = normalizeStreet(stopParts[1]);

						if (stopStreet != currentStreet) {
							currentStreet = stopStreet;
							if (index + 1 < stops.length && nextStopStreet == stopStreet) {
								stopStreetContents = `<span class="route-street">${stopStreet.toLowerCase()}</span>`;
								liClass = `class="new-route-street"`;
							}
							else {
								stopName = st.name;
							}
						}
					}
					else {
						stopName = st.name;
						currentStreet = undefined;
						liClass = `class="new-route-street"`;
					}
					return `<li ${liClass}"><span>${stopStreetContents}${stopName.toLowerCase()}<span></li>`
				}).join("");
				return `<div>${direction}</div><ul class="trip-diagram">${stopListContents}</ul>`
			}).join("");

			layout.showInfoPane(
				`<div class="stop-name info-pane-route">
					<h2>${getRouteLabel(route)}</h2>
					<div>${route.route_long_name || ""}</div>
				</div>
				<div class="route-info">
					${routeStopsByShape}
				</div>`
			);
		}
	});

}
