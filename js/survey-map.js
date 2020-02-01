$(function() {
	coremap.init({
		useDeviceLocation: true,
		dynamicFetch: true,
		excludeInitiatives: true,
		onGetContent: function(m) {
			var shortStopId = m.stopid.split("_")[1];
			return {
				links: "<a target='_blank' href='/wp/5-2/?stopid=" + shortStopId + "'>Take the Bus Stop Census</a>" //,
				// description: !m.amenities ? "" : ("<br/>At this stop: " + m.amenities
				//	+ "<br/><a target='_blank' href='https://docs.google.com/forms/d/e/1FAIpQLScpNuf9aMtBiLA2KUbgvD0D5565RmWt5Li2HfiuLlb-2i3kUA/viewform?usp=pp_url&entry.460249385=" + m.stopid + "&entry.666706278=" + m.stopname.replace(" ", "+") + "'>Report incorrect data</a>")
			}
		}
	});
});
