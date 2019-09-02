<?php
include('ajax/get-json.php');
date_default_timezone_set('America/New_York');
$greetingBanner = 'stopinfo_banner.html';

$nextDeparturesUrl = "https://barracks.martaarmy.org/ajax/get-next-departures.php"; // ?stopid=901230
$minutesThres = 20;
$nowLowThres = -1;
$nowHighThres = 1;

$sid = $_REQUEST['sid'];
$shortStopId = explode("_", $sid)[1];

$debugging = isset($_REQUEST['testhour']);
if ($debugging) {
	$date_as_int = $_REQUEST['testhour'];

	if (isset($_REQUEST['testday'])) {
		$day_name = $_REQUEST['testday'];
		if ($day_name == "WEEKDAY") $service_id = 5;
		if ($day_name == "SATURDAY") $service_id = 3;
		if ($day_name == "SUNDAY") $service_id = 4;
	}
}

function formatTime($timeStr) {
    $timeSplit = explode(":", $timeStr);
    $hour = $timeSplit[0];
    $ampm = "a";
    if ($hour > 24) $hour -= 24;
    else if ($hour == 12) {
        $ampm = "p";
    }
    else if ($hour > 12) {
        $hour -= 12;
        $ampm = ($hour < 12) ? "p" : "a";
    }
    else if ($hour < 10) {
        $hour = $hour + 0;
    }
    return $hour . ":" . $timeSplit[1] . $ampm;
}

function formatDestination($destStr) {
    $destSplit = explode(" STATION", $destStr);
    $dest = $destSplit[0];
    if (count($destSplit) > 1) $dest .= ' STA';

    $destSplit = explode(" PARK & RIDE", $dest);
    $dest = $destSplit[0];
    if (count($destSplit) > 1) $dest .= ' P/R';

    return $dest;
}

function formatStatus($adhStr) {
    $mins = $adhStr;
    // negative = late
    // positive = early
    if (strcmp($mins, "On its way") == 0) {

    }
    else if (strcmp($mins, "NA") != 0) {
        if ($mins >= -2 && $mins <= 1) $mins = "on time";
        else $mins = ($mins < 0 ? "late " : "early ") . abs($mins) . "m";
    }
    else {
        $mins = "";
    }
    return $mins;
}

if ($debugging) {
    $data = getJson("$nextDeparturesUrl?stopid=$shortStopId&testhour=$date_as_int");
}
else {
    $data = getJson("$nextDeparturesUrl?stopid=$shortStopId");
}
if (isset($data['stop_name'])) $stopName = $data['stop_name'];
else $stopName = "Undefined Stop";

?>
<!DOCTYPE html>
<html>
<head>
    <title><?=$shortStopId?> - MARTA Army TimelyTrip</title>
    <link rel="stylesheet" href="css/stopinfo.css" />
	<meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="refresh" content="60">
</head>
<body>
<div class="wrap">
    <header>
        <a href="http://www.martaarmy.org/" target="_blank" ></a>
        <div class="stopname"><?=$stopName?> (<?=$shortStopId?>)</div>
    </header>
    <?php include($greetingBanner); ?>

    <table>
        <tr>
            <th class="route">Bus</th><th class="time">Sched.</th><th>To</th><th>Status</th>
        </tr>

        <?php
        if (isset($data['departures'])) {
            foreach ($data['departures'] as $dp) {
                $route = $dp['route'];
                $rawtime = $dp['time'];
                $mins = $dp['wait'];
                $adh = $dp['adherence'];
                $tripid = $dp['trip_id'];
                $vehid = $dp['vehicle'];
                $status = formatStatus($adh);
                if (strcmp($status, "On its way") == 0) {
                    $mins = '';
                    $statusCell = "<td class='status $status '><span class='mins'>$mins </span><div class='remarks'>$status</div></td>";
                }
                else if ($mins >= -1 || $adh > 1 && ($mins + $adh) >= -1) {
                    $hhmm = formatTime($rawtime);
                    $dest = formatDestination($dp['destination']);

                    if ($mins <= $nowHighThres && $mins >= $nowLowThres) $mins = 'Now'; // Imminent.
                    else if ($mins > $minutesThres && strcmp($status, "") != 0 && $mins + $adh > $minutesThres) { // Too soon to tell.
                        $mins = '';
                        $status = 'On its way';
                    }
                    else $mins .= '<span class="small">m</span>';
                    //$mins = abs($mins) . 'm' . ($mins < 0 ? ' ago' : '');

                    if (strcmp($status, "") != 0) {
                        $statusCell = "<td class='status $status '><span class='mins'>$mins </span><div class='remarks'>$status</div></td>";
                    }
                    else if ($mins <= $minutesThres) {
                        $statusCell = "<td class='status no'><div class='remarks'>No GPS</div></td>";
                    }                
                    else {
                        $statusCell = "<td></td>";
                    }
    
echo <<<END
        <tr id="trip-$tripid" onclick="setTrip(event, '$tripid', '$vehid', '$route', '$hhmm', '$rawtime', '$dest')">
            <td class="route">$route</td>
            <td class="time">$hhmm</td>
            <td class="dest">$dest</td>
            $statusCell
        </tr>

END;
                } // foreach
            } // if isset
        }?>


        <tr id="trip-details" class="hidden">
			<td></td>
			<td colspan="3">
        <div><span id="tripid"></span>, <span id="vehid"></span></div>
                <div>
                    <a id="tripreminder" class="button" href="" download="bus.ics">&#x1F514; Reminder</a>
                    <a id="busdataqalink" class="button" href="" target="_blank">&#x1F4AC; Feedback</a>
                </div>
        	<td>
		</tr>
    </table>
    <footer>All times are approximate and may change without notice.<br/>
        &copy; 2019 <a href="http://martaarmy.org/">MARTA Army Inc.</a> Data provided by <a href="http://www.itsmarta.com/">MARTA</a>.<br/>
        By using this site, you consent on the tracking of your activity to enhance your browsing experience.
    </footer>
</div>
</body>
<script>
var recentStops = localStorage.getItem("recentStops");
if (recentStops == undefined) recentStops = "";
var stopStr = "<?=$shortStopId?>: <?=$stopName?>";
if (recentStops.indexOf(stopStr) == -1) {
    localStorage.setItem("recentStops", stopStr + "|" + recentStops);
}
var tripId;
function setTrip(event, tripid, vehid, route, formattedTime, rawTime, destination) {
    var detailsrow = document.getElementById("trip-details");
    if (tripId != tripid) {
        var row = event.currentTarget;
        var innerText = row.innerText;

        row.insertAdjacentElement("afterend", detailsrow);
        detailsrow.className = "";

		// Setup iCal reminder
		var titlePieces = ["Bus", route, formattedTime, "to", destination, tripid];
		var now = new Date().toISOString();
		var startendtime = now.split("T")[0].replace(/\-/g, "") + "T" + rawTime.replace(/\:/g, "");
		var calData = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//MARTA Army Inc//TimelyTrip NONSGML//EN\nBEGIN:VEVENT\nDTSTART:{{rawtime}}\nDTEND:{{rawtime}}\nSUMMARY:{{title}}\nLOCATION:<?=$stopName?> (<?=$shortStopId?>)\nX-MICROSOFT-CDO-BUSYSTATUS:FREE\nDESCRIPTION:You will get a reminder 20 minutes prior to the scheduled departure time.\\nWatch bus status at: http://barracks.martaarmy.org/stopinfo.php?sid=MARTA_<?=$shortStopId?>\\nThanks for using MARTA Army TimelyTrip!\nGEO:34.048458;-84.288027\nBEGIN:VALARM\nTRIGGER:-PT20M\nACTION:DISPLAY\nDESCRIPTION:Reminder for {{title}}\nEND:VALARM\nEND:VEVENT\nEND:VCALENDAR"
			.replace(/\{\{title\}\}/g, titlePieces.join(" "))
			.replace(/\{\{rawtime\}\}/g, startendtime);
		var reminderLink = document.getElementById("tripreminder");
		reminderLink.href = "data:text/calendar;charset=UTF-8," + encodeURI(calData);
		reminderLink.download = titlePieces.join("-") + ".ics";

        // Setup survey link
        var tripdataPieces = [innerText, "From", "<?=$shortStopId?>", "<?=$stopName?>", "Trip", tripid, "VN", vehid];
        var busdataqaUrl = "https://docs.google.com/forms/d/e/1FAIpQLSe62W2m6Amg_LnJjc9F02RJ4Hen5OyJqZTwtxbR_lk-BCmMBw/viewform?usp=pp_url&entry.1319766420=<?=$shortStopId?>&entry.639694793=<?=$stopName?>&entry.919456121={{tripid}}&entry.1757634538={{tripdata}}"
            .replace(/\{\{tripdata\}\}/g, tripdataPieces.join(" "));
        document.getElementById("busdataqalink").href = encodeURI(busdataqaUrl);

		document.getElementById("tripid").innerHTML = "Trip #" + tripid;
		document.getElementById("vehid").innerHTML = "Vehicle #" + vehid;

		tripId = tripid;
    }
    else {
        detailsrow.className = (detailsrow.className == "") ? "hidden" : "";
    }
}
</script>
</html>
