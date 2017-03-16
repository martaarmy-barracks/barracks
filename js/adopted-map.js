function drawMap(stopdetails) {

	L.mapbox.accessToken = 'pk.eyJ1IjoianJoYXJzaGF0aCIsImEiOiJLQ19oQ0lnIn0.WOJhLVoEGELi8cW93XIS1Q';

	var geocoder = L.mapbox.geocoderControl('mapbox.places', {autocomplete: true, keepOpen: true});
	var map = L.mapbox.map('adopted-map', 'mapbox.streets')
		.setView([33.7615242074253, -84.38117980957031], 11);

	var icon = L.mapbox.marker.icon({
      'marker-color': '#f86767', 'marker-size': 'small'
    });
	var icon2 = L.mapbox.marker.icon({
      'marker-color': '#ffbf80', 'marker-size': 'small'
    });

	for(var i=0; i<stopdetails.length; i++) {
		var stop = stopdetails[i];

		var marker = L.marker([stop.lat, stop.lng], {icon: (stop.abandonned != 0 ? icon2 : icon)})
		var description = stop.name;
		marker.bindPopup(description);
		marker.addTo(map);
	}
}

$(function() {
	// var stopdetails = [ { name: 'Test', lat: 33.7615242074253, lon: -84.38117980957031 }];
	// drawMap(stopdetails);

	$.ajax({
	  url: "ajax/get-adopted-stops.php",
	  type: "POST",
	  dataType: 'json',
	  
	  success: function(d) {
		switch(d.status) {
		case 'success':
			var stopdetails = d.stopdetails;
			drawMap(stopdetails);
			break;
		default:
			showErrorMessage('Failed to fetch stops');
		}
	},
	error: function(jqXHR, textStatus, errorThrown) {
		showErrorMessage('Failed to fetch stops');
	}});

	function showErrorMessage(msg) {
		// todo
	}
})