<?php
include('./lib/redirect-to-https.php');

include('./stopinfo_common.php');

$greetingBanner = 'stopinfo_banner.html';

if (isset($_REQUEST["sid"])) {
    $mode = "SINGLE_STOP";
    $nextDeparturesBase = "https://barracks.martaarmy.org/ajax/get-next-departures.php"; // ?stopid=901230

    $shortStopId = getShortStopId();
    $title = $shortStopId;
    $nextDeparturesUrl = appendDebugParams("$nextDeparturesBase?stopid=$shortStopId");
}
else {
    $mode = "AREA";
    $nextDeparturesBase = "https://barracks.martaarmy.org/ajax/get-next-departures-nearby.php"; // ?lat=1&lon=2&radius=0.005

    $lat = trim($_REQUEST['lat']);
    $lon = trim($_REQUEST['lon']);
    $radius = trim($_REQUEST['radius']);
    $title = trim($_REQUEST['title']);
    $nextDeparturesUrl = appendDebugParams("$nextDeparturesBase?lat=$lat&lon=$lon&radius=$radius");
}


?>
<!DOCTYPE html>
<html>
<head>
    <title><?=$title?> - MARTA Army TimelyTrip</title>
    <link rel="stylesheet" href="css/stopinfo.css" />
	<meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
<div class="wrap">
    <header>
        <a href="http://www.martaarmy.org/" target="_blank" ></a>
        <div id="stopname" class="stopname"><?=$title?></div>
    </header>
    <?php include($greetingBanner); ?>

    <table>
        <thead>
            <tr>
                <th class="route">Bus</th>
                <th class="time">Sched.</th>
                <th>To</th>
                <?php if ($mode == "AREA") {?><th>Stop</th><?php }?>
                <th>Status</th>
            </tr>
        </thead>
        <tbody id="departuresBody">
        </tbody>

        <tfoot id="tfoot" class="hidden">
            <tr id="trip-details" class="hidden">
                <td></td>
                <td colspan="<?= ($mode == 'SINGLE_STOP' ? 3 : 4) ?>">
                    <div><span id="tripid"></span>, <span id="vehid"></span></div>
                    <div id="tripMsg"></div>
                    <div>
                        <a id="tripreminder" class="button" href="" download="bus.ics">&#x1F514; Reminder</a>
                        <a id="busdataqalink" class="button" href="" target="_blank">&#x1F4AC; Feedback</a>
                    </div>
                </td>
            </tr>
        </tfoot>
    </table>
    <footer>All times are approximate and may change without notice.<br/>
        &copy; 2020 <a href="https://martaarmy.org/">MARTA Army Inc.</a> Data provided by <a href="http://www.itsmarta.com/">MARTA</a>.<br/>
        By using this site, you consent on the tracking of your activity to enhance your browsing experience.
    </footer>
</div>
</body>

<script src="js/stopinfo_common.js"></script>
<script>
var minutesThres = 20;
var nowLowThres = -1;
var nowHighThres = 1;
var interval = setInterval(getDeparturesAsync, 60000);
var departures = [];

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
    departures = data.departures;
    var activeTripId = tripId;
    tripId = undefined;
    document.getElementById("tfoot").appendChild(document.getElementById("trip-details"));

    var result = '';
    if (data.departures) {
        var stopLetters = {};

    <?php if ($mode == "SINGLE_STOP") { ?>
        var shortStopId = '<?=$shortStopId?>';
        var stopName = data.stop_name || 'Undefined Stop';
        addRecentStop(shortStopId + ": " + stopName);
        document.getElementById('stopname').innerHTML = stopName + ' (' + shortStopId + ')';
    <?php } else { ?>
        // Assign letters by stop number order for display (on map)
        data.departures.forEach(function(dp) {
            stopLetters[dp.stop_id] = "A";
        });
        var letter = "A".charCodeAt(0);
        Object.keys(stopLetters).forEach(function(k) {
            stopLetters[k] = String.fromCharCode(letter);
            letter++;
        });
    <?php } ?>

        data.departures.forEach(function(dp, i) {
            var route = dp.route;
            var rawtime = dp.time;
            var mins = dp.wait;
            var stopStr = stopLetters[dp.stop_id];
            var adh = dp.adherence;
            var adjMins = (adh == "NA" ? mins : mins - 0 + adh);
            var tripid = dp.trip_id;
            var vehid = dp.vehicle;
            var hhmm = formatTime(rawtime);
            var dest = formatDestination(dp.destination);
            /*
            // Holiday bus emoji icon!
            if (vehid == 1715 || vehid == '1715') {
                dest += '🎁';
                vehid += '🎁';
            }
            */
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
            else if (mins >= -1 || adh != "NA" && adh > 1 && adjMins >= -1) {
                shouldPrint = true;

                if (mins <= nowHighThres && mins >= nowLowThres) mins = 'Now'; // Imminent.
                else if (mins > minutesThres && status != '' && svMessage == undefined && adjMins > minutesThres) { // Too soon to tell.
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
                    else if (adjMins <= minutesThres) {
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

                //result += '<tr id="trip-' + tripid + '" onclick="setTrip(event, \'' + tripid + '\', \'' + vehid + '\', \'' + route + '\', \'' + hhmm + '\', \'' + rawtime + '\', \'' + dest + '\', \'' + svMessage + '\', \'' + svSource + '\', \'' + svUrl + '\')">';
                result += '<tr id="trip-' + tripid + '" onclick="setTrip2(event, departures[' + i + '])">';
                result += '<td class="route">' + route + '</td>';
                result += '<td class="time">' + hhmm + '</td>';
                result += '<td class="dest">' + dest + '</td>';
            <?php if ($mode == "AREA") {?>result += '<td class="stop">' + stopStr + '</td>';<?php }?>
                result += '<td class="' + cssStatus + '"><span class="mins">' + mins + ' </span><div class="remarks">' + status + '</div></td>';
                result += '</tr>';
            } // if ($shouldPrint...)
        }); // foreach
    } // if isset
    //else {
    //    result += '<tr><td colspan="4">No data received.</td></tr>';
    //}

    if (result != '') {
        document.getElementById('departuresBody').innerHTML = result;

        // Click on active trip row from previous view
        if (activeTripId) {
            var e = document.getElementById('trip-' + activeTripId);
            if (e) e.click();
        }
    }
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
