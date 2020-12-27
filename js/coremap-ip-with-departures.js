var defaultCenter = [-84.38117980957031, 33.7615242074253];
// NEW
var nextDeparturesUrl = "https://barracks.martaarmy.org/ajax/get-next-departures.php"; // ?stopid=901230
var mockDepartures = {"stop_id": "904554", "stop_name": "NORTH AVE @ CHERRY ST", "reqtime": "2344", "service_id": "5", "departures": [{"agency":"MARTA","route":"50","destination":"UPS DISTRIBUTION CENTER","time":"23:42:21","trip_started":"1","trip_id":"7480592","block_id":null,"terminus_id":"213523","adherence":"NA","vehicle":null,"stop_id":"904554","wait":-2},{"agency":"MARTA","route":"51","destination":"HAMILTON E HOLMES STATION - BUS LOOP","time":"23:57:08","trip_started":"0","trip_id":"7506616","block_id":null,"terminus_id":"903320","adherence":"NA","vehicle":null,"stop_id":"904554","wait":13},{"agency":"MARTA","route":"50","destination":"UPS DISTRIBUTION CENTER","time":"24:12:44","trip_started":"0","trip_id":"7479798","block_id":null,"terminus_id":"213523","adherence":"NA","vehicle":null,"stop_id":"904554","wait":29},{"agency":"MARTA","route":"51","destination":"HAMILTON E HOLMES STATION - BUS LOOP","time":"24:57:08","trip_started":"0","trip_id":"7508989","block_id":null,"terminus_id":"903320","adherence":"NA","vehicle":null,"stop_id":"904554","wait":73}], "stops": {"904554":"NORTH AVE @ CHERRY ST"}, "tripStatusResult": {"status":"success3"}};
var minutesThres = 20;
var nowLowThres = -1;
var nowHighThres = 1;
// END NEW
var routeShapesAndColors = [
	{
		shapeId: 86149, // Blue
		color: "#468fb9",
		weight: 10
	},
	{
		shapeId: 86177, // Green
		color: "#468fb9",
		weight: 10
	},
	{
		shapeId: 86167, // Gold
		color: "#ff8c1a",
		weight: 10
	},
	{
		shapeId: 86198, // Red
		color: "#ff8c1a",
		weight: 10
	},
	{
		shapeId: 86130, // Streetcar out
		color: "#8c8bdf",
		weight: 6
	},
	{
		shapeId: 115584, // Streetcar in
		color: "#8c8bdf",
		weight: 6
	}
];

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
	var geoJsonEntries = [];
	geoJsonEntries.push({
		type: "Feature",
		geometry: {
			type: "Point",
			coordinates: [-84.40123, 33.79322]
		},
		properties: {
			// 'marker-size': 'small',
			// 'marker-symbol': symb.symbol,
			isActive: true,
			markerFill: "#3bd0a0",
			markerSymbol: "shop-11",
			stopname: "Stop Name",
			stopid: "MARTA_904554",
			amenities: "Operation CleanStop Trash Can",
			reason: ""
		}
	});
	geoJsonEntries.push({
		type: "Feature",
		geometry: {
			type: "Point",
			coordinates: [-84.40477, 33.79028]
		},
		properties: {
			// 'marker-size': 'small',
			// 'marker-symbol': symb.symbol,
			isActive: false,
			markerFill: "#AAAAAA",
			markerText: String.fromCharCode(215),
			stopname: "Stop Name",
			stopid: "123456",
			amenities: "Amenities",
			reason: ""
		}
	});
	var map = new mapboxgl.Map({
		center: opts.center || defaultCenter,
		container: opts.containerId,
		// hash: true, // TODO figure out creating link or navigation.
		style: "mapbox://styles/mapbox/streets-v11",
		zoom: opts.initialZoom || 10
	});
	// var popup;
	var selectedStopMarker;

	// Add geocoder first if parent page has imported it.
	if (MapboxGeocoder) {
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

		draw();

		$.ajax({
			url: 'ajax/get-adoptable-stops.php?lat=' + c.lat + '&lon=' + c.lng,
			dataType: 'json',
			success: draw
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
	else {
		refreshMap();
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

	function identity(o) { return o; }
	function isFunc(f) { return typeof f === "function"; }
	function callIfFunc(f) { return isFunc(f) ? f : () => { }; }

	function onLayerMouseEnter() {
		map.getCanvas().style.cursor = "pointer";
	}
	function onLayerMouseLeave() {
		map.getCanvas().style.cursor = "";
	}

	function makeGeoJsonMarker(stop) {
		// For mapbox v3 symbols: https://gis.stackexchange.com/questions/219241/list-of-available-marker-symbols
		var ast = adoptedStops.find(s => s.id == stop.id);
		var symb = ast ? {
			SIGN: { symbol: "library", color: "#FF4040", amenities: "TimelyTrip Full Sign" },
			MINI: { symbol: "mobilephone", color: "#3bb2d0", amenities: "TimelyTrip Sticker" },
			GCAN: { symbol: "shop-15", color: "#3bd0a0", amenities: "Operation CleanStop Trash Can" }
		}[ast.type] : { symbol: "", color: "#3bb2d0" };

		var stopActive = stop.active != 0 && stop.active != "0";
		if (!stopActive) {
			symb.color = "#AAAAAA";
			if (!symb.symbol) symb.text = String.fromCharCode(215);
		}

		return {
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [stop.lon, stop.lat]
			},
			properties: {
				// 'marker-size': 'small',
				isActive: stopActive,
				markerFill: symb.color,
				markerSymbol: symb.symbol,
				markerText: symb.text,
				stopname: stop.name,
				stopid: stop.id,
				amenities: symb.amenities,
				reason: stop.reason
			}
		};
	}

	function makeGeoJsonStationMarker(stop) {
		var isParkAndRide = stop.name.endsWith(" PARK & RIDE");
		var isTram = stop.name.endsWith(" SC");

		return {
			type: "Feature",
			geometry: {
				type: "Point",
				coordinates: [stop.lon, stop.lat]
			},
			properties: {
				id: stop.id,
				isParkAndRide: isParkAndRide,
				isTram: isTram,
				markerRadius: isTram ? 4 : 8,
				markerBorder: isParkAndRide ? "#ffffff" : "#606060",
				markerFill: isParkAndRide ? "#2d01a5" : "#ffffff",
				markerText: isParkAndRide ? "P" : "",
				name: stop.name,
				nameDisplayed: isTram ? "" : (stop.name
					.replace(" PARK & RIDE", "")
					.replace(" STATION", ""))
			}
		};
	}

	function draw(stops) {
		if (stops) {
			geoJsonEntries = geoJsonEntries.concat(
				stops
				.filter(s => loadedStops.indexOf(s.id) == -1)
				.filter(s => loadedStops.push(s.id) != -1)
				.map(makeGeoJsonMarker)
				.map(isFunc(opts.geoJsonMarkerFactory) ? opts.geoJsonMarkerFactory : identity)
			);
		}

		var stopData = {
			type: "FeatureCollection",
			features: geoJsonEntries
		};

		var source = map.getSource("stops");
		if (!source) {
			map.addSource("stops", {
				type: "geojson",
				data: stopData
			});

			map.addLayer({
				id: "stops-layer-circle",
				type: "circle",
				source: "stops",
				minzoom: 14,
				paint: {
					"circle-radius": 8,
					"circle-color": ["get", "markerFill"], // "#0099ff",
					"circle-stroke-color": "#99ccff",
					"circle-stroke-width": 1
				}
			}, "stations-layer-text"); // draw underneath station text.

			map.addLayer({
				id: "stops-layer-symbol",
				type: "symbol",
				source: "stops",
				minzoom: 14,
				layout: {
					"icon-image": ["get", "markerSymbol"],
					"text-allow-overlap": true,
					"text-field": ["get", "markerText"]
				},
				paint: {
					"text-color": "#fcfcfc"
				}
			}, "stations-layer-text"); // draw underneath station text.

			map.on("click", "stops-layer-circle", function(e) {
				var feat = e.features[0];
				var coordinates = feat.geometry.coordinates.slice();
				var popupContent = getStopDescription(feat);
				/*
				popup = new mapboxgl.Popup()
					.setLngLat(coordinates)
					.setHTML(popupContent)
					.addTo(map);
				*/
				if (selectedStopMarker) selectedStopMarker.remove();

				selectedStopMarker = new mapboxgl.Marker({
					color: "#fe5f20"
				})
					.setLngLat(coordinates)
					.addTo(map);

				layout.showInfoPane(popupContent);

				callIfFunc(opts.onMarkerClicked)(feat.properties);
			});

			map.on("mouseenter", "stops-layer-circle", onLayerMouseEnter);
			map.on("mouseleave", "stops-layer-circle", onLayerMouseLeave);
		}
		else source.setData(stopData);

		stopSpinner();
	}

	map.on("load", function () {
		$.ajax({
			url: "js/stations.json",
			dataType: "json",
			success: drawStations
		});

		$.ajax({
			url: "ajax/get-shapes-gl.php?ids=" + routeShapesAndColors.map(function (r) {
				return r.shapeId;
			}).join(","),
			dataType: "json",
			success: drawRailLines
		});

		if (!opts.excludeInitiatives) {
			$.ajax({
				url: "ajax/get-adopted-stops.php",
				type: "POST",
				dataType: 'json',
				success: function (d) {
					switch (d.status) {
						case 'success':
							adoptedStops = d.stopdetails;
							if (!opts.dynamicFetch) draw(adoptedStops);
							break;
						default:
							showErrorMessage('Failed to fetch stops');
					}
				},
				error: function (jqXHR, textStatus, errorThrown) {
					showErrorMessage('Failed to fetch stops');
				}
			});
		}	
	});

	function drawStations(stops) {
		map.addSource("stations", {
			type: "geojson",
			data: {
				type: "FeatureCollection",
				features: stops.map(makeGeoJsonStationMarker)
			}
		});

		map.addLayer({
			id: "stations-layer-circle",
			type: "circle",
			source: "stations",
			paint: {
				"circle-radius": ["get", "markerRadius"],
				"circle-color": ["get", "markerFill"],
				"circle-stroke-color": ["get", "markerBorder"],
				"circle-stroke-width": 1.5,
			}
		});

		map.addLayer({
			id: "stations-layer-circleinside",
			type: "symbol",
			source: "stations",
			layout: {
				"text-field": ["get", "markerText"],
				"text-font": ["DIN Offc Pro Bold", "Open Sans Semibold", "Arial Unicode MS Bold"],
				"text-line-height": 0.8,
				"text-size": 12
			},
			paint: {
				"text-color": "#ffffff"
			}
		});

		map.addLayer({
			id: "stations-layer-text",
			type: "symbol",
			source: "stations",
			minzoom: 11,
			layout: {
				// get the title name from the source's "nameDisplayed" property
				"text-field": ["get", "nameDisplayed"],
				"text-font": ["DIN Offc Pro Bold", "Open Sans Semibold", "Arial Unicode MS Bold"],
				"text-justify": "auto",
				"text-line-height": 0.8,
				"text-radial-offset": 0.8, //em
				"text-size": 14,
				"text-transform": "uppercase",
				"text-variable-anchor": ["bottom-left", "top-right"]
			},
			paint: {
				"text-color": "#FFFFFF",
				"text-halo-color": "#000066",
				"text-halo-width": 5
			}
		});

		map.on("click", "stations-layer-circle", function(e) {
			if (map.getZoom() < 14) {
				var coordinates = e.features[0].geometry.coordinates.slice();
				map.flyTo({center: coordinates, zoom: 15});
			}
			else {

			}
		});

		map.on("mouseenter", "stations-layer-circle", onLayerMouseEnter);
		map.on("mouseleave", "stations-layer-circle", onLayerMouseLeave);
	}

	function drawRailLines(points) {
		routeShapesAndColors.forEach(function(sc) {
			drawShape(points, sc.shapeId, sc.color, sc.weight, 0, 0);
		});
	}

	function drawShape(points, shapeid, color, weight, dx, dy) {
		var points_arr = points[shapeid];
		var sourcename = "shape-" + shapeid;

		map.addSource(sourcename, {
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
			id: sourcename,
			type: "line",
			source: sourcename,
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
		}, "stations-layer-circle"); // draw lines underneath stations.
	}

	function showErrorMessage(msg) {
		// todo
	}
	function getRouteLabels(routes) {
		return routes.map(function (r) {
			var agencyRoute = r.agency_id + " " + r.route_short_name;
			// Hack for MARTA rail lines...
			var railClass = "";
			if (r.agency_id == "MARTA") {
				switch (r.route_short_name) {
					case "BLUE":
					case "GOLD":
					case "GREEN":
					case "RED":
						railClass = " rail-line";
						break;
					case "ATLSC":
						railClass = " tram-line";
						r.route_short_name = "Streetcar";
						break;
					default:
				};
			}
			return "<span class='" + agencyRoute + railClass + " route-label' title='" + agencyRoute + "'><span>" + r.route_short_name + "</span></span>";
		})
		.join("");
	}

	// NEW
	function getDepartureContent(data) {
		var result = '';
		if (data.departures) {
			data.departures
			// .filter(function(dp, i) { return data.stops[dp.terminus_id] == undefined; })  // TODO: Bring back terminus arrivals.
			.forEach(function(dp, i) {
				if (data.stops[dp.terminus_id]) {
					return;
				}
				var agency = dp.agency;
				var route = dp.route;
				var displayedRoute = dp.route;
				var rawtime = dp.time;
				var mins = dp.wait;
				var adh = dp.adherence;
				var adhAvailable = adh != "NA" && adh != "On its way";
				if (adhAvailable) {
					adh = (+adh);
					mins = (+mins);
				}
				var adjMins = (!adhAvailable ? mins : mins + adh);
				var tripid = dp.trip_id;
				var vehid = dp.vehicle;
				var hhmm = formatTime(rawtime);
				var dest = formatDestination(dp.destination);
				var status = formatStatus(adh);
				var cssStatus = 'status ' + status;
				var svStatus = dp.status; // can be undef
				var svMessage = dp.message; // can be undef
				var svSource = dp.source; // can be undef
				var svUrl = dp.url; // can be undef
				// Hack for MARTA rail lines...
				var railClass = "";
				if (agency == "MARTA") {
					switch (route) {
						case "BLUE":
						case "GOLD":
						case "GREEN":
						case "RED":
							railClass = " rail-line";
							break;
						case "ATLSC":
							railClass = " tram-line";
							displayedRoute = "Streetcar";
							break;
						default:
					};
				}
	
				var shouldPrint = false;
				if (status == 'On its way') {
					shouldPrint = true;
					mins = '';
				}
				else if (mins >= -1 || adhAvailable && adh > 1 && adjMins >= -1) {
					shouldPrint = true;
	
					if (mins <= nowHighThres && mins >= nowLowThres) mins = 'Now'; // Imminent.
					else if (mins > minutesThres && status != '' && svMessage == undefined && adjMins > minutesThres) { // Too soon to tell.
						mins = '';
						status = 'On its way';
						cssStatus = 'status on its way';
					}
					else mins += '<span class="small">m</span>';
	
					if (status == '') {
						if (svMessage != undefined) {
							status = svStatus;
							cssStatus = 'status ' + status;
							if (status.indexOf('delay') == 0) {
								mins = 'DLY';
								status = 'delayed';
								cssStatus = 'status delayed';
							}
							else if (status.indexOf('cancel') == 0) {
								mins = 'CXL';
								status = 'canceled';
								cssStatus = 'status canceled';
							}
						}
						else if (adjMins <= minutesThres) {
							mins = '';
							status = 'No GPS';
							cssStatus = 'no status';
						}
						else {
							mins = '';
							status = '';
							cssStatus = '';
						}
					}
				}
	
				if (shouldPrint) {
					if (!svMessage) svMessage = '';
					if (!svSource) svSource = '';
					if (!vehid) vehid = '';
	
					result += '<div id="trip-' + tripid + '" onclick="setTrip2(event, departures[' + i + '])">';
					result += '<span class="route-label ' + agency + ' ' + route + railClass + '"><span>' + displayedRoute + '</span></span>';
					result += '<span class="time">' + hhmm + '</span>';
					result += '<span class="dest">' + dest + '</span>';
					result += '<span class="' + cssStatus + '"><span class="mins">' + mins + ' </span><div class="remarks">' + status + '</div></span>';
					result += '</div>';
				} // if ($shouldPrint...)
			}); // foreach
		} // if isset
					
		// Update popup content (including any links).
		//var popupContent = getStopDescription(feature);
		//if (popup) popup.setHTML(popupContent);
		return result;

	}
	// END NEW

	function getStopDescription(feature) {
		var m = feature.properties;
		var shortStopId = getShortStopId(m.stopid);
		var routeLabels = "[Routes]";
		if (m.routes) {
			routeLabels = getRouteLabels(m.routes);
		}
		else {
			// Get routes.
			$.ajax({
				url: "ajax/get-stop-routes.php?stopid=" + shortStopId,
				dataType: 'json',
				success: function(routes) {
					// TODO: sort routes, letters firt, then numbers.

					m.routes = routes;

					// Update popup content (including any links).
					var popupContent = getStopDescription(feature);
					//if (popup) popup.setHTML(popupContent);
					$("#info-pane-content").html(popupContent);
				}
			});
			/*
			$.ajax({
				url: "https://barracks.martaarmy.org/ajax/get-next-departures.php?stopid=" + shortStopId,
				dataType: 'json',
				success: function(data) {
					// TODO: Sort routes, letters firt, then numbers.
					updateDepartures(data);
				}
			});
			*/
		}

		var s = "<div class='stop-name'>" + m.stopname + " (" + shortStopId + ")</div><div class='stop-info'>"
			+ (m.isActive
				? ("<span id='routes'>" + routeLabels + "</span> <a id='arrivalsLink' target='_blank' href='stopinfo.php?sid=" + m.stopid + "'>Arrivals</a>")
				: "<span style='background-color: #ff0000; color: #fff'>No service</span>");

		var content = callIfFunc(opts.onGetContent)(feature) || {};
		if (content.links) s += "<br/>" + content.links;
		if (content.description) s += "<br/>" + content.description;
		s += "</div>";
		// NEW
		s += "<div>" + getDepartureContent(mockDepartures) + "</div>";
		// END NEW
		return s;
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

function getShortStopId(longId) {
	return longId.split("_")[1]; // can be undefined.
}