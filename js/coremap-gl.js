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


var coremap = {
	/**
	 * After setting mapboxgl.accessToken,
	 * Call this function to initialize the map.
	 * @param {*} opts The options to set up the map (all params optional unless noted below):
	 * - center: [lat: number, lon: number]
	 * - containerId: string (required)
	 * - dynamicFetch : truthy/falsy
	 * - excludeInitiatives: false by default
	 * - geoJsonMarkerFactory(stop)
	 * - initial zoom: (default = 11)
	 * - onGetContent(marker) : callback returning {links : String, description : String}
	 * - onMarkerClicked(marker) : callback
	 * - useDeviceLocation : truthy/falsy
	 */
	init: function (opts) {
		// $(".mapboxgl-ctrl-geocoder--input").attr("placeholder", "Enter address, or zoom, to find your bus stop');
		var adoptedStops = [];
		var loadedStops = [];
		var geoJsonEntries = [];
		var defaultCenter = [-84.38117980957031, 33.7615242074253];

		var map = new mapboxgl.Map({
			center: opts.center || defaultCenter,
			container: opts.containerId,
			style: "mapbox://styles/mapbox/outdoors-v11",
			zoom: opts.initialZoom || 10
		});

		// Add geocoder first if parent page has imported it.
		if (MapboxGeocoder) {
			map.addControl(new MapboxGeocoder({
				accessToken: mapboxgl.accessToken,
				mapboxgl: mapboxgl
			}), "top-left");
		}

		map.addControl(new mapboxgl.NavigationControl({
			showCompass: false
		}));


		var refreshMap = debounce(function () {
			var zoom = map.getZoom();
			console.log(zoom)

			// if (zoom < 15) stationLayer.addTo(map);
			// else map.removeLayer(stationLayer);

			//if (zoom < 15) map.removeLayer(mainLayer);
			//else if (zoom >= 15) { // Show stops at zoom levels deeper than this.
			//		mainLayer.addTo(map);

			startSpinner();
			var c = map.getCenter();
			$.ajax({
				url: 'ajax/get-adoptable-stops.php?lat=' + c.lat + '&lon=' + c.lng,
				dataType: 'json',
				success: draw
			});
			//}
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

		function makeGeoJsonMarker(stop) {
			// For mapbox v3 symbols: https://gis.stackexchange.com/questions/219241/list-of-available-marker-symbols
			var ast = adoptedStops.find(s => s.id == stop.id);
			var symb = ast ? {
				SIGN: { symbol: "library", color: "#FF4040", amenities: "TimelyTrip Full Sign" },
				MINI: { symbol: "mobilephone", color: "#3bb2d0", amenities: "TimelyTrip Sticker" },
				GCAN: { symbol: "waste-basket", color: "#3bd0a0", amenities: "Operation CleanStop Trash Can" }
			}[ast.type] : { symbol: "", color: "#3bb2d0" };

			var stopActive = stop.active != 0 && stop.active != "0";
			if (!stopActive) {
				symb.color = "#AAAAAA";
				if (!symb.symbol) symb.symbol = "cross";
			}

			var marker = {
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: [stop.lon, stop.lat]
				},
				properties: {
					lonlat: [stop.lon, stop.lat],
					'marker-color': symb.color,
					'marker-size': 'small',
					'marker-symbol': symb.symbol,
					isActive: stopActive,
					stopname: stop.name,
					stopid: stop.id,
					amenities: symb.amenities,
					reason: stop.reason
				}
			};
			return marker;
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
					/*
					icon: {
						className: "my-icon " + (isParkAndRide ? "icon-parkride" : (isTram ? "icon-tramstation" : "icon-station")),
						html: "<div title=\"" + stop.name + "\">" + (isParkAndRide ? "P" : "") + "</div>",
						iconSize: isTram ? [10, 10] : [20, 20] // "20px" // size of icon, use null to set the size in CSS
					},
					*/
					id: stop.id,
					isParkAndRide: isParkAndRide,
					isTram: isTram,
					markerRadius: isTram ? 5 : 10,
					name: stop.name,
					nameDisplayed: isTram ? "" : (stop.name
						.replace(" PARK & RIDE", "")
						.replace(" STATION", ""))
				}
			};
		}

		/*
		var mainLayer = L.mapbox.featureLayer()
		.on('click', function(e) {
			var m = e.layer;
			callIfFunc(opts.onMarkerClicked)(m.feature.properties);
		
			L.popup({offset: L.point(0, -12)})
			.setLatLng(m.getLatLng())
			.setContent(getStopDescription(m))
			.openOn(map);
		})
		.on('layeradd', function(e) {
			var m = e.layer;
			var icon = m.feature.properties.icon;
			if (icon) m.setIcon(L.divIcon(icon));
		})
		.addTo(map);
		*/

		function draw(stops) {
			/*
			geoJsonEntries = geoJsonEntries.concat(
				stops
				.filter(s => loadedStops.indexOf(s.id) == -1)
				.filter(s => loadedStops.push(s.id) != -1)
				.map(makeGeoJsonMarker)
				.map(isFunc(opts.geoJsonMarkerFactory) ? opts.geoJsonMarkerFactory : identity)
			);
			mainLayer.setGeoJSON(geoJsonEntries);
			stopSpinner();
			*/
		}

		map.on("load", function () {
			console.log("map on load");

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

			// Symbols: https://labs.mapbox.com/maki-icons/
		});

		function drawStations(stops) {
			var geoJsonStations = stops.map(makeGeoJsonStationMarker);

			map.addSource("stations", {
				type: "geojson",
				data: {
					type: "FeatureCollection",
					features: geoJsonStations
				}
			});

			map.addLayer({
				id: "stations-layer",
				type: "circle",
				source: "stations",
				paint: {
					"circle-radius": ["get", "markerRadius"],
					"circle-color": "#FFFFFF",
					"circle-stroke-color": "#606060",
					"circle-stroke-width": 2
				}
			});

			map.addLayer({
				id: "stations-layer-text",
				type: "symbol",
				source: "stations",
				layout: {
					"icon-image": "circle-stroked-15",

					// get the title name from the source's "nameDisplayed" property
					"text-field": ["get", "nameDisplayed"],
					"text-font": ["DIN Offc Pro Bold", "Open Sans Semibold", "Arial Unicode MS Bold"],
					"text-justify": "auto",
					"text-line-height": 0.8,
					"text-radial-offset": 1, //em
					"text-size": 14,
					"text-transform": "uppercase",
					"text-variable-anchor": ["bottom-left", "top-right"]
				},
				"paint": {
					"text-color": "#FFFFFF",
					"text-halo-color": "#000066",
					"text-halo-width": 5
				}
			});
		}

		function drawRailLines(points) {
			routeShapesAndColors.forEach(function (sc) {
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
			}, "stations-layer"); // draw lines underneath stations.
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
							if (!opts.dynamicFetch) draw(adoptedStops);
							break;
						default:
							showErrorMessage('Failed to fetch stops');
					}
				},
				error: function (jqXHR, textStatus, errorThrown) {
					showErrorMessage('Failed to fetch stops');
				}
			}
			);
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

		function getStopDescription(marker) {
			var m = marker.feature.properties;
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
					success: function (routes) {
						// Sort routes, letters firt, then numbers.

						m.routes = routes;
						$("#routes").html(getRouteLabels(routes));
					}
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

			var s = "<div class='stop-name'>" + m.stopname + " (" + shortStopId + ")</div><div class='stop-info'>"
				+ (m.isActive
					? ("<a id='arrivalsLink' target='_blank' href='stopinfo.php?sid=" + m.stopid + "'><span id='routes'>" + routeLabels + "</span> Arrivals</a>")
					: "<span style='background-color: #ff0000; color: #fff'>No service</span>");

			var content = callIfFunc(opts.onGetContent)(m) || {};
			if (content.links) s += "<br/>" + content.links;
			if (content.description) s += "<br/>" + content.description;
			s += "</div>";
			return s;
		}

		map.update = function () { };

		return map;
	}
};

function getShortStopId(longId) {
	return longId.split("_")[1]; // can be undefined.
}
