$(function() {
	var initiativesOnly = location.search.indexOf("mode=initiatives") > -1;
	
	coremap.init({
		useDeviceLocation: !initiativesOnly,
		dynamicFetch: !initiativesOnly,
		onMarkerClicked: function(m) {
			var jqQr = $("#qrcode");
			if (jqQr.length > 0) {
				jqQr[0].title = jqQr[0].src = "admin/bus-sign/qr.php?p=https://barracks.martaarmy.org/qr.php%3Fs=" + m.stopid;
			}			
		},
		onGetContent: function(m) {
			return {
				links: "<a target='_blank' href='stopinfo.php?sid=" + m.stopid + "'>Arrivals</a>",
				description: !m.amenities ? "" : ("<br/>At this stop: " + m.amenities
					+ "<br/><a target='_blank' href='https://docs.google.com/forms/d/e/1FAIpQLScpNuf9aMtBiLA2KUbgvD0D5565RmWt5Li2HfiuLlb-2i3kUA/viewform?usp=pp_url&entry.460249385=" + m.stopid + "&entry.666706278=" + m.stopname.replace(" ", "+") + "'>Report incorrect data</a>")
			}
		}
	});
});
