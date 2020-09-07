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
		result.properties.nameDisplayed = stop.name ? stop.name
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
	inactiveStop: function(stop) { return stop.active == 0 || stop.active == "0"; },
}

var coremap = {
	/**
	 * After setting mapboxgl.accessToken,
	 * Call this function to initialize the map.
	 * @param {*} opts The options to set up the map (all params optional unless noted below):
	 * - center: [lat: number, lon: number]
	 * - containerId: string (required)
	 * - dynamicFetch : truthy/falsy
	 * - excludeInitiatives: false by default
	 * - symbolLists: array of list of symbols (required)
	 * - initialZoom: (default = 11)
	 * - logoContainerId: string
	 * - onGetContent(stop) : callback returning {links : String, description : String}
	 * - onMarkerClicked(stop) : callback
	 * - useDeviceLocation : truthy/falsy
	 */
	init: function(opts) {
		var adoptedStops = [];
		var loadedStops = [];
		var loadedStopIds = [];
		
		// For testing
		loadedStops.push({
			id: "MARTA_123456",
			lon: -84.40123, 
			lat: 33.79322,
			name: "Stop Name"
		});
		loadedStops.push({
			id: "MARTA_1234567",
			lon: -84.40477,
			lat: 33.79028,
			name: "Stop 2",
			active: 0
		});
		loadedStopIds.push("MARTA_123456");
		loadedStopIds.push("MARTA_1234567");

		var defaultCenter = [-84.38117980957031, 33.7615242074253];

		var map = new mapboxgl.Map({
			center: opts.center || defaultCenter,
			container: opts.containerId,
			// hash: true, // TODO figure out creating link or navigation.
			style: "mapbox://styles/mapbox/streets-v11",
			zoom: opts.initialZoom || 10
		});
		var popup;

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
			var zoom = map.getZoom();
			console.log(zoom)

			startSpinner();
			var c = map.getCenter();

			// For testing
			if (loadedStopIds.length < 3) {
				var newStops = [
					{
						id: "MARTA_1234568",
						lon: -84.406720, 
						lat: 33.791626,
						name: "Stop Name"
					},
					{
						id: "MARTA_1234569",
						lon: -84.402731,
						lat: 33.788452,
						name: "Stop 2",
						active: 0
					}
				];
				draw(newStops);
			}


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

		function isFunc(f) { return typeof f === "function"; }
		function callIfFunc(f) { return isFunc(f) ? f : () => { }; }

		function onLayerMouseEnter() {
			map.getCanvas().style.cursor = "pointer";
		}
		function onLayerMouseLeave() {
			map.getCanvas().style.cursor = "";
		}
		function onLayerClickZoomIn(e) {
			if (map.getZoom() < 14) {
				var coordinates = e.features[0].geometry.coordinates.slice();
				map.flyTo({center: coordinates, zoom: 15});
			}
		}
		function getStopDescription(stop) {
			var shortStopId = getShortStopId(stop.id);
			var routeLabels = "[Routes]";
			if (stop.routes) {
				routeLabels = getRouteLabels(stop.routes);
			}
			else {
				// Get routes.
				$.ajax({
					url: "ajax/get-stop-routes.php?stopid=" + shortStopId,
					dataType: 'json',
					success: function (routes) {
						// TODO: sort routes, letters firt, then numbers.

						stop.routes = routes;

						// Update popup content (including any links).
						if (popup) popup.setHTML(getStopDescription(stop));
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

			var s = "<div class='stop-name'>" + stop.name + " (" + shortStopId + ")</div><div class='stop-info'>"
				+ (!filters.inactiveStop(stop)
					? ("<span id='routes'>" + routeLabels + "</span> <a id='arrivalsLink' target='_blank' href='stopinfo.php?sid=" + stop.id + "'>Arrivals</a>")
					: "<span style='background-color: #ff0000; color: #fff'>No service</span>");

			var content = callIfFunc(opts.onGetContent)(stop) || {};
			if (content.links) s += "<br/>" + content.links;
			if (content.description) s += "<br/>" + content.description;
			s += "</div>";

			return s;
		}
		function onLayerClickPopupInfo(e) {
			if (map.getZoom() >= 14) {
				var feat = e.features[0];
				var stop = feat.properties;
				var coordinates = feat.geometry.coordinates;
				popup = new mapboxgl.Popup()
					.setLngLat(coordinates)
					.setHTML(getStopDescription(stop))
					.addTo(map);

				callIfFunc(opts.onMarkerClicked)(stop);
			}
		}

		function draw(stops) {
			if (stops) {
				var stopsToLoad = stops
					.filter(s => loadedStopIds.indexOf(s.id) == -1)
					.filter(s => loadedStopIds.push(s.id) != -1);
				loadedStops = loadedStops.concat(stopsToLoad);

				// Update the sources for the stop sublayers
				updateSymbolSources();
			}
			stopSpinner();
		}

		map.on("load", function () {
			updateSymbolSources();
			opts.symbolLists.forEach(function(symbolList) {
				symbolList.forEach(createSymbolLayers);
			});


			$.ajax({
				url: "ajax/get-shapes-gl.php?ids=" + presets.shapes.map(function(r) {
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
		
		function createSymbolLayers(symbolDefn) {
			var sourceName = "source-symbol-" + symbolDefn.id;

			symbolDefn.layers.forEach(function(layer, index) {
				var newLayer = Object.assign(layer);
				newLayer.id = "layer-symbol-" + symbolDefn.id + "-" + index;
				newLayer.source = sourceName;
				map.addLayer(newLayer);
	
				// Add events only to the base layer (usually a filled shape).
				if (index == 0) {
					map.on("click", newLayer.id, onLayerClickZoomIn);
					map.on("click", newLayer.id, onLayerClickPopupInfo);
					map.on("mouseenter", newLayer.id, onLayerMouseEnter);
					map.on("mouseleave", newLayer.id, onLayerMouseLeave);			
				}
			});
		}

		function updateSymbolSources() {
			opts.symbolLists.forEach(updateSymbolListSources);
		}

		// Initialize or update source for all layers within a symbol list.
		function updateSymbolListSources(symbolList) {
			// Keep track of stops that have not been assigned a previous background.
			var remainingStops = [].concat(loadedStops);

			symbolList.forEach(function(symbolDefn) {
				var sourceName = "source-symbol-" + symbolDefn.id;
				var appliesToType = typeof symbolDefn.appliesTo;
				var source = map.getSource(sourceName);
	
				var sourceFeatures;
				var sourceFinalData;
				if (appliesToType == "function") {
					sourceFeatures = remainingStops.filter(symbolDefn.appliesTo);
				}
				else if (appliesToType == "object") {
					// Assume array that will not change.
					sourceFeatures = symbolDefn.appliesTo;
				}
				else if (appliesToType == "undefined") {
					sourceFeatures = remainingStops;
					remainingStops = [];
				}

				if (sourceFeatures) {
					sourceFinalData = {
						type: "geojson",
						data: {
							type: "FeatureCollection",
							features: sourceFeatures.map(converters.standard)
						}
					}
					remainingStops = remainingStops.filter(function(s) { return sourceFeatures.indexOf(s) == -1; });

					if (!source) map.addSource(sourceName, sourceFinalData);
					else source.setData(sourceFinalData.data);

					console.log(sourceFeatures.length + " features in " + sourceName + " - remaining: " + remainingStops.length);
				}
			});
		}

		function drawRailLines(points) {
			presets.shapes.forEach(function(sc) {
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
			}, "layer-symbol-rail"); // draw lines underneath stations.
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
			}).join("");
		}

		map.update = function () { };

		return map;
	}
};

function getShortStopId(longId) {
	return longId.split("_")[1]; // can be undefined.
}
