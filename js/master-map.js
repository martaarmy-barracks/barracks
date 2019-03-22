$(function( ) {
	initMap();
	
	$('.leaflet-control-mapbox-geocoder .leaflet-control-mapbox-geocoder-form input').attr('placeholder', 'Enter address, or zoom, to find your bus stop');
	
	function initMap() {
		L.mapbox.accessToken = 'pk.eyJ1IjoianJoYXJzaGF0aCIsImEiOiJLQ19oQ0lnIn0.WOJhLVoEGELi8cW93XIS1Q';
		var adoptedStops = [];
		var iconTmpl = {
			iconSize: [30, 30],
			iconAnchor: [15, 30],
			popupAnchor: [0,-30]
		};
	
		var stopIcon = L.icon(Object.assign({iconUrl: 'images/map-marker-blue.png'}, iconTmpl));
		var signIcon = L.icon(Object.assign({iconUrl: 'images/map-marker-sign.png'}, iconTmpl));
		var miniIcon = L.icon(Object.assign({iconUrl: 'images/map-marker-mini.png'}, iconTmpl));
		var trashIcon = L.icon(Object.assign({iconUrl: 'images/map-marker-trash.png'}, iconTmpl));
		
		var defaultIcon = L.mapbox.marker.icon({
			'marker-color': '#f86767', 'marker-size': 'small'
		});

		signIcon.text = "TimelyTrip Sign (full-size)";
		miniIcon.text = "TimelyTrip Sticker (mini-size)";
		trashIcon.text = "Operation CleanStop Trash Can";
	
		var geocoder = L.mapbox.geocoderControl('mapbox.places', {autocomplete: true, keepOpen: true});
		var map = L.mapbox.map('master-map', 'mapbox.streets', {zoomControl: false})
			.addControl(geocoder)
			.setView([33.7615242074253, -84.38117980957031], 11); // TODO: browser location if available.
		new L.Control.Zoom({ position: 'topright' }).addTo(map);
	
		geocoder.on('select', function(res) {
			var lonlat = res.feature.center;
			map.setView([lonlat[1], lonlat[0]], 17);
		});
	
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
		function getInitiativeStop(fullStopId) {
			for (var i = 0; i < adoptedStops.length; i++) {
				var fsId = "MARTA_" + adoptedStops[i].id;
				if (fsId == fullStopId) return adoptedStops[i];
			}
			return undefined;
		}
	
		var loadedStops = [];
	
		var refreshMap = debounce(function() {
			if (map.getZoom() < 15) return; // Show all stops at zoom levels deeper than this.
	
			startSpinner();
			var latlng = map.getCenter(); 
	
			var url = '../ajax/get-adoptable-stops.php' +
			'?lat='+latlng.lat+'&lon=' + latlng.lng;
	
			$.ajax({
				url: url,
				dataType: 'json',
				success: function(json) {
					var stops = json;
					for (var i = 0; i < stops.length; i++) {
						var stop = stops[i];
						var fullStopId = stop.id;
						if(-1 == $.inArray(fullStopId, loadedStops)) {
							var initiativeStop = getInitiativeStop(fullStopId);
							if (initiativeStop) {
								addInitiativeMarker(initiativeStop);
							}
							else if (stop['reason'] == undefined || stop['reason'] != "WRONGAGENCY") {
								addMarker(stop);
							}
							loadedStops.push(fullStopId); // MARTA_901230
						}
					};
					stopSpinner();
				}
			});
		}, 1000);
	
		map.on('moveend', refreshMap);
		geocoder.on('select', refreshMap);
	
		function markerClicked(e) {
			var jqQr = $("#qrcode");
			if (jqQr.length > 0) {
				jqQr[0].title = jqQr[0].src = "admin/bus-sign/qr.php?p=https://barracks.martaarmy.org/qr.php%3Fs=" + e.target.stopid;
			}

			// TODO: generate marker dynamically.
			var popup = L.popup()
			.setLatLng(e.target.getLatLng()) // L.latLng(50.5, 30.5);
			.setContent(getStopDescription(e.target))
			.openOn(map);
		}
	
		function addMarker(stop) {
			var marker = L.marker([stop.lat, stop.lon])
				.setIcon(stopIcon)
				.on('click', markerClicked)
				.addTo(map);
	
			marker.stopname = stop['name'];
			marker.stopid = stop['id'];
			// marker.bindPopup(getStopDescription(marker))
		}
		function addInitiativeMarker(stop) {
			var iconType = defaultIcon;
			if (stop.type == "SIGN") iconType = signIcon;
			else if (stop.type == "MINI") iconType = miniIcon;
			else if (stop.type == "GCAN") iconType = trashIcon;
	
			var marker = L.marker([stop.lat, stop.lng], {icon: iconType});
	
			marker.stopname = stop.name;
			marker.stopid = "MARTA_" + stop.id;
			marker.amenities = iconType.text;
	
			//marker.bindPopup(getStopDescription(marker));
			marker.on('click', markerClicked)
			marker.addTo(map);
		}
	
		$.ajax({
			url: "ajax/get-adopted-stops.php",
			type: "POST",
			dataType: 'json',
			
			success: function(d) {
				switch(d.status) {
				case 'success':
					adoptedStops = d.stopdetails;
					if (location.search.indexOf("mode=initiatives") > -1) drawMap(adoptedStops);
					break;
				default:
					showErrorMessage('Failed to fetch stops');
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				showErrorMessage('Failed to fetch stops');
			}}
		);
		
		function showErrorMessage(msg) {
			// todo
		}
		function drawMap(stopdetails) {				
			for(var i=0; i<stopdetails.length; i++) {
				var stop = stopdetails[i];
				
				addInitiativeMarker(stop);
				var fullStopId = "MARTA_" + stop.id;
				loadedStops.push(fullStopId); // MARTA_901230
			}
		}
	}
		
	function getStopDescription(marker) {
		var result = marker.stopname + "<br/>" + marker.stopid
		+ " | <a target='_blank' href='stopinfo.php?sid=" + marker.stopid + "'>Arrivals</a>"
		//+ " | <a target='_blank' href='http://barracks.martaarmy.org/admin/bus-sign/signdirect.php?sid=" + marker.stopid + "&adopter='>Schedule</a>"
		;
	
		if (marker.amenities) {
			result += "<br/>At this stop: " + marker.amenities;
			result += "<br/><br/><a target='_blank' href='https://docs.google.com/forms/d/e/1FAIpQLScpNuf9aMtBiLA2KUbgvD0D5565RmWt5Li2HfiuLlb-2i3kUA/viewform?usp=pp_url&entry.460249385=" + marker.stopid + "&entry.666706278=" + marker.stopname.replace(" ", "+") + "'>Report incorrect data</a>";
		}
	
		result += "</div></div>";
		return result;
	}
	});
	