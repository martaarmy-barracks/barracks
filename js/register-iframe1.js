$(function() {
	var maxAdoptionCount = 4;
	var eventData = {};
	var selectedMarker = null;
	var selectedMarkers = [];

	initEvents();

	function getDisplayedReason(reason) {
		switch (reason) {
			case "ADOPTED": return "Has already been adopted.";
			case "WRONGPOLE": return "Can't mount sign at this stop.";
			case "WRONGAGENCY": return "Not a MARTA stop.";
			default: return "";
		}
	}
	function getAdoptLabel(marker) {
		return (marker.selected == true ? "Unselect this stop" : "Adopt this stop");
	}
	function selectMarker(m) {
		m.prevSymbol = m["marker-symbol"];
		m.prevColor = m["marker-color"];
		m["marker-symbol"] = "embassy";
		m["marker-color"] = "#009933";
		m.selected = true;

		selectedMarkers.push(m);
		$(".adopt-stop").text(getAdoptLabel(m));
	}
	function unselectMarker(m) {
		m["marker-symbol"] = m.prevSymbol;
		m["marker-color"] = m.prevColor;
		m.selected = false;

		var i0 = selectedMarkers.indexOf(m);
		if (i0 >= 0) selectedMarkers.splice(i0, 1);
		$(".adopt-stop").text(getAdoptLabel(m));
	}
	function updateSelectionList() {
		var $nonemsg = $('#nostopselectedmsg');
		var $list = $('#stoplist_ol');

		if (selectedMarkers.length == 0) {
			$nonemsg.show();
			$list.html("");
			$list.hide();
		}
		else {
			$nonemsg.hide();
			var listContent = "";
			for (var i = 0; i < selectedMarkers.length; i++) {
				var m = selectedMarkers[i];
				listContent += 
				"<li>" + m.stopname + 
				(m.reason == undefined ? "" : " (" + getDisplayedReason(m.reason) + ")") + " <span class='stopid'>" + m.stopid + "</span><a href='#'>remove</a></li>";
			}
			$list.html(listContent);
			$list.show();
		}
	}
	
	var map = coremap.init({
		useDeviceLocation: false,
		dynamicFetch: true,
		initialZoom: 15,
		geoJsonMarkerFactory: function(m) {
			var p = m.properties;
			if (p.reason) {
				p["marker-color"] = "#AAAAAA";
				if (p["marker-symbol"] != "library") p["marker-symbol"] = "cross";
			}
			return m;
		},
		onMarkerClicked: function(m) {selectedMarker = m;},
		onGetContent: function(m) {
			return {
				links: m.reason == undefined ?
					"<br/><a class='adopt-stop'>" + getAdoptLabel(m) + "</a>" :
					"<br/>" + getDisplayedReason(m.reason),
				description: !m.amenities ? "" : ("<br/>At this stop: " + m.amenities
					+ "<br/><a target='_blank' href='https://docs.google.com/forms/d/e/1FAIpQLScpNuf9aMtBiLA2KUbgvD0D5565RmWt5Li2HfiuLlb-2i3kUA/viewform?usp=pp_url&entry.460249385=" + m.stopid + "&entry.666706278=" + m.stopname.replace(" ", "+") + "'>Report incorrect data</a>")
			}
		}
	});

	$(document).on('click', 'a.adopt-stop', function(e) {
		e.preventDefault();
		var m = selectedMarker;
		
		if (m.selected == true) {
			unselectMarker(m);
		} else { //if (adoptionCount < maxAdoptionCount) {
			selectMarker(m);
			//} else if (adoptionCount == maxAdoptionCount) {
		//	alert("You have reached the maximum number of stops you can adopt.");
		}
		map.update();
		updateSelectionList();
	});
	$(document).on('click', '#stoplist_ol li a', function(e) {
		e.preventDefault();
		var $li = $(this).closest('li');
		var stopid = $li.find('span.stopid').text();

		for (var i = 0; i < selectedMarkers.length; i++) {
			var m = selectedMarkers[i];
			if (m.stopid == stopid) unselectMarker(m);
		}
		map.update();
		updateSelectionList();
	});
	
	$('#stopmap-div a.togglelink').click(function() {
		$('#stopmap-div').slideUp();
		$('#stopaddress-div').slideDown();
	});

	$('#stopaddress-div a.togglelink').click(function() {
		$('#stopaddress-div').slideUp();
		$('#stopmap-div').slideDown();
	})
	$('.btn-nav.next').click(function() {
		$('#stops-tab').hide();
		$('#info-tab').show();
	})
	$('.btn-nav.back').click(function() {
		$('#info-tab').hide();
		$('#stops-tab').show();
	})

	$('#event').change(function(e) {
		var url = eventData[$('#event')[0].selectedIndex].url;
		$('#event-url')[0].href = url;
		
		if (url != undefined && url != "") $("#event-details").show();
		else $("#event-details").hide();
	});
	
	$('.btn.btn-success').click(function(e) {
		e.preventDefault();

		var name = $('#name').val();
		var email = $('#email').val();
		var phone = $('#phone').val();
		var comment = $('#comment').val();
		var eventid = $('#event').val();

		var data = {name: name, email: email, phone: phone, comment: comment, eventid: eventid, stopmode: 'stopids'}


		if($('#stopaddress-div').is(':visible')) {
			var stopaddress = $('#stopaddress-div input').val();
			data.stopmode = 'stopaddress';
			data.stopaddress = stopaddress;
		}
		else {
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
		}

		$(this).prop('disabled', true);

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
