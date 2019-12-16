<?php
include('./stopinfo_common.php');
date_default_timezone_set('America/New_York');

$greetingBanner = 'stopinfo_banner.html';
$nextDeparturesBase = "https://barracks.martaarmy.org/ajax/get-next-departures.php"; // ?stopid=901230

$shortStopId = getShortStopId();
$debugging = isset($_REQUEST['testhour']);
if ($debugging) {
    $date_as_int = $_REQUEST['testhour'];
    $nextDeparturesUrl = "$nextDeparturesBase?stopid=$shortStopId&testhour=$date_as_int";
} 
$nextDeparturesUrl = "$nextDeparturesBase?stopid=$shortStopId";


?>
<!DOCTYPE html>
<html>
<head>
    <title><?=$shortStopId?> - MARTA Army TimelyTrip</title>
    <link rel="stylesheet" href="css/stopinfo.css" />
	<meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
<div class="wrap">
    <header>
        <a href="http://www.martaarmy.org/" target="_blank" ></a>
        <div id="stopname" class="stopname">(<?=$shortStopId?>)</div>
    </header>
    <?php include($greetingBanner); ?>

    <table>
        <thead>
                <tr>
                    <th class="route">Bus</th><th class="time">Sched.</th><th>To</th><th>Status</th>
                </tr>
        </thead>
        <tbody id="departuresBody">
        </tbody>

        <tr id="trip-details" class="hidden">
			<td></td>
			<td colspan="3">
                <div><span id="tripid"></span>, <span id="vehid"></span></div>
                <div id="tripMsg"></div>
                <div>
                    <a id="tripreminder" class="button" href="" download="bus.ics">&#x1F514; Reminder</a>
                    <a id="busdataqalink" class="button" href="" target="_blank">&#x1F4AC; Feedback</a>
                </div>
        	<td>
		</tr>
    </table>
    <footer>All times are approximate and may change without notice.<br/>
        &copy; 2019 <a href="https://martaarmy.org/">MARTA Army Inc.</a> Data provided by <a href="http://www.itsmarta.com/">MARTA</a>.<br/>
        By using this site, you consent on the tracking of your activity to enhance your browsing experience.
    </footer>
</div>
</body>

<script src="js/stopinfo_common.js"></script>
<script>
var shortStopId = '<?=$shortStopId?>';
var stopName = '';
var minutesThres = 20;
var nowLowThres = -1;
var nowHighThres = 1;
var interval = setInterval(getDeparturesAsync, 60000);

function getDeparturesAsync() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            updateDisplay(JSON.parse(xhttp.responseText));
        }
    };
    xhttp.open('GET', '<?=$nextDeparturesUrl?>', true);
    xhttp.send();
}

function updateDisplay(data) {
    tripId = undefined;
    var result = '';
    if (data.departures) {
        stopName = data.stop_name || 'Undefined Stop';
        addRecentStop(shortStopId + '': ' + stopName);
        document.getElementById('stopname').innerHTML = stopName + ' (' + shortStopId + ')';

        data.departures.forEach(function(dp) {
            var route = dp.route;
            var rawtime = dp.time;
            var mins = dp.wait;
            var adh = dp.adherence;
            var tripid = dp.trip_id;
            var vehid = dp.vehicle;
            var hhmm = formatTime(rawtime);
            var dest = formatDestination(dp.destination);
            // Holiday bus emoji icon!
            if (vehid == 1715 || vehid == '1715') {
                dest += '🎁';
                vehid += '🎁';
            }
            var status = formatStatus(adh);
            var cssStatus = 'status ' + status;
            var svStatus = dp.status; // can be undef
            var svMessage = dp.message; // can be undef
            var svSource = dp.source; // can be undef
            var svUrl = dp.url; // can be undef
            var shouldPrint = false;
            
            if (status == 'On its way') {
                shouldPrint = true;
                mins = '';
            }
            else if (mins >= -1 || adh > 1 && (mins + adh) >= -1) {
                shouldPrint = true;

                if (mins <= nowHighThres && mins >= nowLowThres) mins = 'Now'; // Imminent.
                else if (mins > minutesThres && status == '' && svMessage == undefined && mins + adh > minutesThres) { // Too soon to tell.
                    mins = '';
                    status = 'On its way';
                    cssStatus = 'status on its way';
                }
                else mins += '<span class="small">m</span>';

                if (status == '') {
                    if (svMessage != undefined) {
                        status = svStatus;
                        cssStatus = 'status ' + status;
                        if (status.indexOf('delay') == 0) {
                            mins = 'DLY';
                            status = 'delayed';
                            cssStatus = 'status delayed';
                        }
                        else if (status.indexOf('cancel') == 0) {
                            mins = 'CXL';
                            status = 'canceled';
                            cssStatus = 'status canceled';
                        } 
                    }
                    else if (mins <= minutesThres) {
                        mins = '';
                        status = 'No GPS';
                        cssStatus = 'no status';
                    }
                    else {
                        mins = '';
                        status = '';
                        cssStatus = '';
                    }
                }
            }

            if (shouldPrint) {
                if (!svMessage) svMessage = '';
                if (!svSource) svSource = '';
                if (!vehid) vehid = '';

                result += '<tr id="trip-' + tripid + '" onclick="setTrip(event, \'' + tripid + '\', \'' + vehid + '\', \'' + route + '\', \'' + hhmm + '\', \'' + rawtime + '\', \'' + dest + '\', \'' + svMessage + '\', \'' + svSource + '\', \'' + svUrl + '\')">';
                result += '<td class="route">' + route + '</td>';
                result += '<td class="time">' + hhmm + '</td>';
                result += '<td class="dest">' + dest + '</td>';
                result += '<td class="' + cssStatus + '"><span class="mins">' + mins + ' </span><div class="remarks">' + status + '</div></td> </tr>';
            } // if ($shouldPrint...)
        }); // foreach
    } // if isset
    //else {
    //    result += '<tr><td colspan="4">No data received.</td></tr>';
    //}

    if (result != '') document.getElementById('departuresBody').innerHTML = result;
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
    return hour + ':' + timeSplit[1] + ampm;
}

function formatDestination(destStr) {
    return destStr
        .replace(/ STATION.*/, ' STA')
        .replace(/ PARK [\&|\s] RIDE.*/, ' P/R')
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

getDeparturesAsync();

</script>
</html>
