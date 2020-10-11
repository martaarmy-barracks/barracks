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

var coremap = {
	/**
	 * After setting mapboxgl.accessToken,
	 * Call this function to initialize the map.
	 * @param {*} opts The options to set up the map (all params optional unless noted below):
	 * - center: [lat: number, lon: number]
	 * - containerId: string (required)
	 * - dynamicFetch : truthy/falsy
	 * - excludeInitiatives: false by default
	 * - initialZoom: (default = 11)
	 * - logoContainerId: string
	 * - onGetContent(stop) : callback returning {links : String, description : String}
	 * - onMarkerClicked(stop) : callback
	 * - symbolLists: array of list of symbols (required)
	 * - useDeviceLocation : truthy/falsy
	 */
	init: function(opts) {
		var adoptedStops = [];
		var loadedStops = [];
		var loadedStopIds = [];
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
		function getStopDescription(stop) {
			var stopRoutesFetched = [];
			var stopsFetched = 0;
			var fullStopIds = stop.csvIds ? stop.csvIds.split(",") : [stop.id];
			var shortStopIds = fullStopIds.map(function(idStr) { return getShortStopId(idStr); });
			var routeLabels = "[Routes]";
			if (stop.routes) {
				routeLabels = getRouteLabels(stop.routes);
			}
			else {
				// Get routes.
				shortStopIds.forEach(function(shortStopId) {
					$.ajax({
						url: "ajax/get-stop-routes.php?stopid=" + shortStopId,
						dataType: 'json',
						success: function (routes) {
							routes.forEach(function(route) {
								// Remove duplicates on fetched routes.
								var fetchedRoutes = stopRoutesFetched.filter(function(fetched) {
									return fetched.agency_id == route.agency_id
										&& fetched.route_short_name == route.route_short_name;
								});
								if (fetchedRoutes.length == 0) stopRoutesFetched.push(route);
							});
							stopsFetched++;
							if (stopsFetched == shortStopIds.length) {
								// TODO: sort routes, letters firt, then numbers.
								stop.routes = stopRoutesFetched;
		
								// Update popup content (including any links).
								if (popup) popup.setHTML(getStopDescription(stop));
							}
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
				});
			}

			var stopTitle = stop.name + " (" + shortStopIds.join(", ") + ")";
			var s = "<div class='stop-name'>" + stopTitle + "</div><div class='stop-info'>";
			if (!filters.inactiveStop(stop)) {
				if (isFinite(shortStopIds[0]) || stop.routes && stop.routes.length) {
					s += "<span id='routes'>" + routeLabels + "</span>";
					s += " <a id='arrivalsLink' target='_blank' href='stopinfo.php?sids=" + fullStopIds.join(",") + "&title=" + encodeURIComponent(stopTitle) + "'>Arrivals</a>";
				}
			}
			else {
				s += "<span style='background-color: #ff0000; color: #fff'>No service</span>";
			}

			var content = callIfFunc(opts.onGetContent)(stop) || {};
			if (content.links) s += "<div>" + content.links + "</div>";
			if (content.description) s += "<div>" + content.description + "</div>";
			s += "</div>";

			return s;
		}
		function onLayerClickPopupInfo(e) {
			var feat = e.features[0];
			var stop = feat.properties;
			var coordinates = feat.geometry.coordinates;
			
			if (popup) popup.remove();

			popup = new mapboxgl.Popup()
			.setLngLat(coordinates)
			.setHTML(getStopDescription(stop))
			.addTo(map);
			
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
								if (!opts.dynamicFetch) load(adoptedStops);
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
			}, "layer-symbol-rail-circle-0"); // draw lines underneath stations.
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
