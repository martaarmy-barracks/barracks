function addRecentStop(stopStr) {
    var recentStops = localStorage.getItem("recentStops");
    if (recentStops == undefined) recentStops = "";
    if (recentStops.indexOf(stopStr) == -1) {
        localStorage.setItem("recentStops", stopStr + "|" + recentStops);
    }
}

function setICalLink(eId, shortStopId, stopName, rawTime, titlePieces) {
    var now = new Date().toISOString();
    var startendtime = now.split("T")[0].replace(/\-/g, "") + "T" + rawTime.replace(/\:/g, "");
    var calData = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//MARTA Army Inc//TimelyTrip NONSGML//EN\nBEGIN:VEVENT\nDTSTART:{{rawtime}}\nDTEND:{{rawtime}}\nSUMMARY:{{title}}\nLOCATION:{{stopName}} ({{shortStopId}})\nX-MICROSOFT-CDO-BUSYSTATUS:FREE\nDESCRIPTION:You will get a reminder 20 minutes prior to the scheduled departure time.\\nWatch bus status at: https://barracks.martaarmy.org/stopinfo.php?sid=MARTA_{{shortStopId}}\\nThanks for using MARTA Army TimelyTrip!\nGEO:34.048458;-84.288027\nBEGIN:VALARM\nTRIGGER:-PT20M\nACTION:DISPLAY\nDESCRIPTION:Reminder for {{title}}\nEND:VALARM\nEND:VEVENT\nEND:VCALENDAR"
        .replace(/\{\{title\}\}/g, titlePieces.join(" "))
        .replace(/\{\{shortStopId\}\}/g, shortStopId)
        .replace(/\{\{stopName\}\}/g, stopName)
        .replace(/\{\{rawtime\}\}/g, startendtime);

    var link = document.getElementById(eId);
    link.href = "data:text/calendar;charset=UTF-8," + encodeURI(calData);
    link.download = titlePieces.join("-") + ".ics";
}

function setDataSurveyLink(eId, shortStopId, stopName, tripdataPieces) {
    var busdataqaUrl = "https://docs.google.com/forms/d/e/1FAIpQLSe62W2m6Amg_LnJjc9F02RJ4Hen5OyJqZTwtxbR_lk-BCmMBw/viewform?usp=pp_url&entry.1319766420={{shortStopId}}&entry.639694793={{stopName}}&entry.919456121={{tripid}}&entry.1757634538={{tripdata}}"
        .replace(/\{\{shortStopId\}\}/g, shortStopId)
        .replace(/\{\{stopName\}\}/g, stopName)
        .replace(/\{\{tripdata\}\}/g, tripdataPieces.join(" "));
    document.getElementById(eId).href = encodeURI(busdataqaUrl);
}

function setTripMsg(eId, msg, src, url) {
    var tripMsg = "";
    if (msg != undefined && msg.length != 0) {
        tripMsg = src + "<br/>" + "<a href='" + url + "' target='_blank'>" + msg + "</a>";
    }
    var el = document.getElementById(eId);
    if (el != null) el.innerHTML = tripMsg;
}

var tripId;

function formatDestination(destStr) {
    return destStr
        .replace(/ STATION.*/, ' STA')
        .replace(/ PARK [\&|\s] RIDE.*/, ' P/R')
}

function formatTime(timeStr) {
    var timeSplit = timeStr.split(':');
    var hour = timeSplit[0];
    var ampm = 'a';
    if (hour > 24){
        hour -= 24;
    }
    else if (hour == 12) {
        ampm = 'p';
    }
    else if (hour > 12) {
        hour -= 12;
        ampm = (hour < 12) ? 'p' : 'a';
    }
    else {
        hour = hour - 0;
    }
    return hour + ':' + timeSplit[1] + ampm;
}

function formatStatus($adhStr) {
    var $mins = $adhStr;
    // negative = late
    // positive = early
    if ($mins == 'On its way') {

    }
    else if ($mins != 'NA') {
        if ($mins >= -2 && $mins <= 1) $mins = 'on time';
        else $mins = ($mins < 0 ? 'late ' : 'early ') + Math.abs($mins) + "m";
    }
    else {
        $mins = '';
    }
    return $mins;
}

function setTrip2(event, depInfo) {
    var shortStopId = depInfo.stop_id;
    var stopName = "[[stopName]]";
    var tripid = depInfo.trip_id;
    var vehid = depInfo.vehicle;
    var route = depInfo.route;
    var formattedTime = formatTime(depInfo.time);
    var rawTime = depInfo.time;
    var destination = formatDestination(depInfo.destination);
    var msg = depInfo.message;
    var src = depInfo.source;
    var url = depInfo.url;

    var detailsrow = document.getElementById("trip-details");
    if (tripId != tripid) {
        var row = event.currentTarget;

        row.insertAdjacentElement("afterend", detailsrow);
        detailsrow.className = "";

        setICalLink("tripreminder", shortStopId, stopName, rawTime, 
            ["Bus", route, formattedTime, "to", destination, tripid]);
        setDataSurveyLink("busdataqalink", shortStopId, stopName,
            [row.innerText, "From", shortStopId, stopName, "Trip", tripid, "VN", vehid]);
        setTripMsg("tripMsg", msg, src, url);

        document.getElementById("tripid").innerHTML = "Trip #" + tripid;
        document.getElementById("vehid").innerHTML = vehid ? ("Vehicle #" + vehid) : '';

        tripId = tripid;
    }
    else {
        detailsrow.className = (detailsrow.className == "") ? "hidden" : "";
    }
}
