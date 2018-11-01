$(function( ) {

	initMap();

	initEvents();

	$('.leaflet-control-mapbox-geocoder .leaflet-control-mapbox-geocoder-form input').attr('placeholder', 'Search for address...');

	var maxAdoptionCount = 4;
	var eventData = {};

	function initMap() {
		var stopIconUrl = 'images/map-marker-icon.png';
		var grayedStopIconUrl = 'images/map-marker-icon-grayed.png';
		var selectedStopIconUrl = 'images/map-marker-selected-icon.png';
		var adoptionCount = 0;

		var stopIcon = L.icon({
			iconUrl: stopIconUrl,
			iconSize: [30, 30],
			iconAnchor: [15, 30],
			popupAnchor: [0,-30]
		});

		var grayedStopIcon = L.icon({
			iconUrl: grayedStopIconUrl,
			iconSize: [30, 30],
			iconAnchor: [15, 30],
			popupAnchor: [0,-30]
		});

		var selectedStopIcon = L.icon({
			iconUrl: selectedStopIconUrl,
			iconSize: [30, 30],
			iconAnchor: [15, 30],
			popupAnchor: [0,-30]
		});

		L.mapbox.accessToken = 'pk.eyJ1IjoianJoYXJzaGF0aCIsImEiOiJLQ19oQ0lnIn0.WOJhLVoEGELi8cW93XIS1Q';

		var geocoder = L.mapbox.geocoderControl('mapbox.places', {autocomplete: true, keepOpen: true});
		var map = L.mapbox.map('map', 'mapbox.streets', {zoomControl: false})
			.addControl(geocoder)
			.setView([33.7615242074253, -84.38117980957031], 17);
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

		var loadedStops = [];

		var refreshMap = debounce(function() {
			startSpinner();
			var latlng = map.getCenter();  
			//var url = 'http://atlanta.onebusaway.org/api/api/where/stops-for-location.json' +
			//          '?key=TEST&lat='+latlng.lat+'&lon=' + latlng.lng + '&radius=400';
			var url = 'http://barracks.martaarmy.org/ajax/get-adoptable-stops.php' +
			          '?lat='+latlng.lat+'&lon=' + latlng.lng;

			$.ajax({
				url: url,
				dataType: 'json',
				success: function(json) {
					var stops = json; //.data.list;
					for (var i = 0; i < stops.length; i++) {
						var stop = stops[i];
						if(-1 == $.inArray(stop['id'], loadedStops)) {
							if (stop['reason'] == undefined || stop['reason'] != "WRONGAGENCY") {
								addMarker(stop);
								loadedStops.push(stop['id']);
							}
						}
					};
					stopSpinner();
				}
			})
		}, 1000);

		refreshMap();

		map.on('moveend', refreshMap);
		geocoder.on('select', refreshMap);

		var markers = [];
		function addMarker(stop) {
			var marker = L.marker([stop.lat, stop.lon])
				.setIcon(stop.reason == undefined ? stopIcon : grayedStopIcon)
				.on('click', markerClicked)
				.addTo(map);

			marker.stopname = stop['name'];
			marker.stopid = stop['id'];
			marker.reason = stop['reason'];
			marker.selected = false;

			marker.bindPopup(getStopDescription(marker))
			markers.push(marker);
		}

		var selectedMarker = null;
		function markerClicked(e) {
			selectedMarker = e.target;		
		}

		$(document).on('click', 'a.adopt-stop', function(e) {
			e.preventDefault();

			var stopid = selectedMarker.stopid; 
			var stopname = selectedMarker.stopname;

			var $nonemsg = $('#nostopselectedmsg');
			var $list = $('#stoplist_ol');
			
			if(selectedMarker.selected) {
				selectedMarker.setIcon(selectedMarker.reason == undefined ? stopIcon : grayedStopIcon);
				selectedMarker.selected = false;
				if (adoptionCount > 0) adoptionCount--;

				if($list.find('li').length==1) {
					$nonemsg.slideDown();
					$list.slideUp();
				}

				$list.find('span.stopid').each(function(i,sp) {
					var $sp = $(sp);
					if($sp.text() == stopid) {
						var $li = $sp.closest('li');
						$li.slideUp(function() { $li.remove() });
					}
				});

				selectedMarker.bindPopup(getStopDescription(selectedMarker));
				$(this).text('Adopt this stop');
				
			} else { //if (adoptionCount < maxAdoptionCount) {
				selectedMarker.setIcon(selectedStopIcon);
				selectedMarker.selected = true;
				adoptionCount++;

				$nonemsg.slideUp();
				
				$list.append("<li>"+stopname+ 
				(selectedMarker.reason == undefined ? "" : " (" + getDisplayedReason(selectedMarker.reason) + ")") + " <span class='stopid'>"+stopid+"</span> <a href='#'>remove</a></li>");
				$list.slideDown();

				//var description = stopname+"<br/><a href='#' class='adopt-stop'>Unselect this stop</a></div></div>";
				selectedMarker.bindPopup(getStopDescription(selectedMarker));
				$(this).text('Unselect this stop');
			//} else if (adoptionCount == maxAdoptionCount) {
			//	alert("You have reached the maximum number of stops you can adopt.");
			}
		});

		$(document).on('click', '#stoplist_ol li a', function(e) {
			e.preventDefault();

			var $li = $(this).closest('li');
			var stopid = $li.find('span.stopid').text();
			$.each(markers, function(i,m) {
				if(m.stopid==stopid) {
					m.selected = false;
					if (adoptionCount > 0) adoptionCount--;
					m.setIcon(m.reason == undefined ? stopIcon : grayedStopIcon);
				}
			});
			$li.slideUp(function() { $li.remove() });
		});
	}
	
	$('#stopmap-div a.togglelink').click(function() {
		$('#stopmap-div').slideUp();
		$('#stopaddress-div').slideDown();
	});

	$('#stopaddress-div a.togglelink').click(function() {
		$('#stopaddress-div').slideUp();
		$('#stopmap-div').slideDown();
	})

	$('#event').change(function(e) {
		var url = eventData[$('#event')[0].selectedIndex].url;
		$('#event-url')[0].href = url;
		
		if (url != undefined && url != "") $("#event-details").show();
		else $("#event-details").hide();
	});
	
	$('#signup-form button').click(function(e) {
		e.preventDefault();

		var name = $('#name').val();
		var email = $('#email').val();
		var phone = $('#phone').val();
		var comment = $('#comment').val();
		var eventid = $('#event').val();

		var data = {name: name, email: email, phone: phone, comment: comment, eventid: eventid}


		if($('#stopmap-div').is(':visible')) {
			var stopids = [];
			var stopnames = [];
			$('#stoplist_ol li').each(function(i,li) {
				var $li = $(li);
				stopids.push($li.find('span.stopid').text());

				$li = $li.clone();
				$li.find('span.stopid').remove();
				$li.find('a').remove();
				stopnames.push($li.text());
			});
			data.stopmode = 'stopids';
			data.stopids = stopids;
			data.stopnames = stopnames;
		} else {
			var stopaddress = $('#stopaddress-div input').val();
			data.stopmode = 'stopaddress';
			data.stopaddress = stopaddress;
		}

		$('#signup-form button').prop('disabled', true);

		$.ajax({
		  url:  "ajax/register-iframe.php",
		  type: "POST",
		  data:    data,
		  dataType: 'json',
		  
		  success: function(d) {
			switch(d.status) {
			case 'success':
				$('#signup-form').slideUp();
				$('#success-message').slideDown();
				break;

			case 'noname':
				showError('Oops! A name is required...');
				break;
			case 'bademail':
				showError('Email seems invalid. Check it again?');
				break;
			case 'nocomment':
				showError('Please leave a comment for us!');
				break;
			case 'noevent':
				showError('Please pick an event where you would like to pick up your signs.');
				break;
			case 'nostoptoadopt':
				showError("You haven't selected any stop yet!");
				break;
			default:
				if (d.status.startsWith('quotaexceeded,')) {
					var existingCount = d.status.split(',')[1];
					alert("You can adopt " + maxAdoptionCount + " stops total, and have already adopted " + existingCount + " stop before. Please remove excess stops before continuing.");
				}
				else {
					showError("Oops, something broke on our side. Please try again later, and if it doesn't work, please let us know at themartaarmy@gmail.com!", 0);
				}
				break;
			}
			$('#signup-form button').prop('disabled', false);
		},
		error: function(jqXHR, textStatus, errorThrown) {
			showError("Oops, something broke on our side. Please try again later, and if it doesn't work, please let us know at themartaarmy@gmail.com!", 0);
			$('#signup-form button').prop('disabled', false);
 		}});
	});

	function showError(msg, delay) {
		if(delay === undefined) { delay = 3000; }

		var $msg = $('#error-message');
		$msg.html(msg).slideDown();
		if(delay !== 0) {
			setTimeout(function() { $msg.slideUp(); }, delay);
		}
	}

	function showMessage(msg) {
		var $msg = $('#success-message');
		$msg.html(msg).slideDown();
	}

	function getDisplayedReason(reason) {
		switch (reason) {
			case "ADOPTED":
				return "Already adopted by another soldier.";
			case "WRONGPOLE":
				return "Can't mount sign at this stop.";
			case "WRONGAGENCY":
				return "Not a MARTA stop.";
			default:
				return "";
		}
	}

	function getStopDescription(marker) {
		var displayedReason = getDisplayedReason(marker.reason);
		var result = marker.stopname + "<br/>" + marker.stopid + "<br/>"
			+ ((marker.reason == undefined) ? ("Available<br/>") : ("WARNING: " + displayedReason + "<br/>"));	

		if (marker.selected == false) {
			result += ((marker.reason == undefined) ? ("<a href='#' class='adopt-stop'>Adopt this stop</a>") : ("<a href='mailto:contact@martaarmy.org'>Contact us to adopt this stop.</a>"));	
		}
		else {
			result += "<a href='#' class='adopt-stop'>Unselect this stop</a>";
		}

		result += "<br/><br/><a target='_blank' href='https://docs.google.com/forms/d/e/1FAIpQLScpNuf9aMtBiLA2KUbgvD0D5565RmWt5Li2HfiuLlb-2i3kUA/viewform?usp=pp_url&entry.460249385=" + marker.stopid + "&entry.666706278=" + marker.stopname.replace(" ", "+") + "'>Report incorrect data</a>";
		result += "</div></div>";
		return result;
	}

	function initEvents() {
		$.ajax({
			url: "../ajax/get-future-events.php",
			type: "POST",
			data: {},
			dataType: 'json',

			success: function(data, textStatus, jqXHR) {
				if (data != null && data.length != 0) {
					eventData = data;
					var dropDown = $("#event")[0];
					dropDown.options.remove(0);

					for (var i = 0; i < data.length; i++) {
						var o = document.createElement("option");
						var date = new Date(data[i].date);

						var cutoffhours = data[i].cutoffhours;
						var isDateWithinCutoffHours = (date - new Date()) < cutoffhours * 3600000;

						var day = date.toString().split(" ")[0];
						var yearStr = "/" + date.getFullYear();
						o.text = day + ". " + date.toLocaleString().replace(yearStr, "").replace(":00 ", " ") + " - " + data[i].name;
						o.value = data[i].id;

						if (isDateWithinCutoffHours) {
							o.text += " ***Not enough time to make your sign***";
							o.disabled = "disabled";
						} 
						dropDown.options.add(o);
					}

					dropDown.selectedIndex = -1;
				}
			}
		});		
	}

});
