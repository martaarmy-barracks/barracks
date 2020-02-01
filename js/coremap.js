var coremap = {
			// Options opts (all optional):
			// - useDeviceLocation : truthy/falsy
			// - dynamicFetch : truthy/falsy
			// - initial zoom: (default = 11)
			// - excludeInitiatives: false by default
			// - geoJsonMarkerFactory(stop)
			// - onMarkerClicked(marker) : callback
			// - onGetContent(marker) : callback returning {links : String, description : String}
			init: function(opts) {
$('.leaflet-control-mapbox-geocoder .leaflet-control-mapbox-geocoder-form input').attr('placeholder', 'Enter address, or zoom, to find your bus stop');
var adoptedStops = [];
var loadedStops = [];
var geoJsonEntries = [];
var geoJsonStations = [];
				
L.mapbox.accessToken = 'pk.eyJ1IjoianJoYXJzaGF0aCIsImEiOiJLQ19oQ0lnIn0.WOJhLVoEGELi8cW93XIS1Q';
var geocoder = L.mapbox.geocoderControl('mapbox.places', {autocomplete: true, keepOpen: true});
var map = L.mapbox.map('master-map', 'mapbox.streets', {zoomControl: false})
	.addControl(geocoder)
	.addControl(new L.Control.Zoom({position: 'topright'}))
	.setView([33.7615242074253, -84.38117980957031], opts.initialZoom ? opts.initialZoom : 11);

geocoder.on('select', function(res) {
	var lonlat = res.feature.center;
	map.setView([lonlat[1], lonlat[0]], 17);
});

var refreshMap = debounce(function() {
	if (map.getZoom() < 15) return; // Show all stops at zoom levels deeper than this.

	startSpinner();
	var c = map.getCenter(); 	
	$.ajax({
		url: '../ajax/get-adoptable-stops.php?lat=' + c.lat + '&lon=' + c.lng,
		dataType: 'json',
		success: draw});
}, 1000);

if (opts.dynamicFetch) {
	map.on('moveend', refreshMap);
	geocoder.on('select', refreshMap);			
}

if (opts.useDeviceLocation && navigator.geolocation) {
	navigator.geolocation.getCurrentPosition(function(pos) {
		var lat = pos.coords.latitude;
		var lon = pos.coords.longitude;
		L.mapbox.featureLayer()
		.setGeoJSON([{
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [lon, lat]
			},
			properties: {
				'marker-color': '#0000FF',
				'marker-size': 'medium',
				'marker-symbol': 'embassy'
			}
		}])
		.addTo(map);
		map.setView([lat, lon], 15);

		// Button to return to my current location.
		var homeCtl = document.createElement("A");
		homeCtl.innerHTML = "◉";
		homeCtl.title = "Return to my current location";
		homeCtl.className = "user-loc-button";
		homeCtl.addEventListener("click", function() {
			map.setView([lat, lon], 15);
		});

		document.body.appendChild(homeCtl);
	});
}
else {
	refreshMap();
}

// todo control spinners in these functions
function startSpinner() {  }
function stopSpinner() {  }

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

function identity(o) {return o;}

function makeGeoJsonMarker(stop) {
	// For mapbox v3 symbols: https://gis.stackexchange.com/questions/219241/list-of-available-marker-symbols
	var ast = adoptedStops.find(s => s.id == stop.id);
	var symb = ast ? {
		SIGN: {symbol: "library", color: "#FF4040", amenities: "TimelyTrip Full Sign"},
		MINI: {symbol: "mobilephone", color: "#3bb2d0", amenities: "TimelyTrip Sticker"},
		GCAN: {symbol: "waste-basket", color: "#3bd0a0", amenities: "Operation CleanStop Trash Can"}
	}[ast.type] : {symbol: "", color: "#3bb2d0"};
	
	return {
		type: 'Feature',
		geometry: {
			type: 'Point',
			coordinates: [stop.lon, stop.lat]
		},
		properties: {
			'marker-color': symb.color,
			'marker-size': 'small',
			'marker-symbol': symb.symbol,
			stopname: stop.name,
			stopid: stop.id,
			amenities: symb.amenities,
			reason: stop.reason
		}
	};			
}

function makeGeoJsonStationMarker(stop) {
	// For mapbox v3 symbols: https://gis.stackexchange.com/questions/219241/list-of-available-marker-symbols
	return {
		type: 'Feature',
		geometry: {
			type: 'Point',
			coordinates: [stop.lon, stop.lat]
		},
		properties: {
			icon: {
				className: 'my-icon icon-station', // class name to style
				html: '<span title="' + stop.name + '">★</span>', // add content inside the marker, in this case a star
				iconSize: '20px' // size of icon, use null to set the size in CSS
			},
			//'marker-color': '#FFFFFF',
			//'marker-size': 'small',
			//'marker-symbol': 'rail-metro',
			stopname: stop.name,
			stopid: stop.id
		}
	};			
}

var mainLayer = L.mapbox.featureLayer()
.on('click', function(e) {
	var m = e.layer;
	if (typeof opts.onMarkerClicked === "function") opts.onMarkerClicked(m.feature.properties);

	L.popup({offset: L.point(0, -12)})
	.setLatLng(m.getLatLng())
	.setContent(getStopDescription(m))
	.openOn(map);				
})
.addTo(map);

function draw(stops) {
	geoJsonEntries = geoJsonEntries.concat(
		stops
		.filter(s => loadedStops.indexOf(s.id) == -1)
		.filter(s => loadedStops.push(s.id) != -1)
		.map(makeGeoJsonMarker)
		.map(opts.geoJsonMarkerFactory ? opts.geoJsonMarkerFactory : identity)
	);
	mainLayer.setGeoJSON(geoJsonEntries);
	stopSpinner();
}
function drawStations(stops) {
	if (geoJsonStations.length == 0) {
		geoJsonStations = stops
		.map(makeGeoJsonStationMarker);

		var stationLayer = L.mapbox.featureLayer()
		.on('click', function(e) {
			var m = e.layer;
			map.setView(m.getLatLng(), 16);
		})
		.on('layeradd', function(e) {
			var m = e.layer;
			m.setIcon(L.divIcon(m.feature.properties.icon));
		  })
		.addTo(map);
		stationLayer.setGeoJSON(geoJsonStations);
	}
}

if (!opts.excludeInitiatives) {
	$.ajax({
		url: "ajax/get-adopted-stops.php",
		type: "POST",
		dataType: 'json',
		
		success: function(d) {
			switch(d.status) {
			case 'success':
				adoptedStops = d.stopdetails;
				if (!opts.dynamicFetch) draw(adoptedStops);
				break;
			default:
				showErrorMessage('Failed to fetch stops');
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			showErrorMessage('Failed to fetch stops');
		}}
	);	
}

$.ajax({
	url: 'js/stations.json',
	dataType: 'json',
	success: drawStations}
);


function showErrorMessage(msg) {
	// todo
}
function getStopDescription(marker) {
	var m = marker.feature.properties;
	var s = m.stopname + "<br/>" + m.stopid;
	
	var content = opts.onGetContent ? opts.onGetContent(m) : {};
	
	if (content.links) s += " | " + content.links;
	s += "<br/>";
	
	if (content.description) s += content.description;		
	return s;
}

map.update = function() {};

return map;
			}	
		};