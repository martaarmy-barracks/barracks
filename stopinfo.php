<?php
include('ajax/get-json.php');
date_default_timezone_set('America/New_York');
$greetingBanner = 'stopinfo_banner.html';

$nextDeparturesUrl = "http://barracks.martaarmy.org/ajax/get-next-departures.php"; // ?stopid=901230
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
    if (count($destSplit) > 1) $dest .= ' <span class="station-suffix">STA</span>';

    $destSplit = explode(" PARK & RIDE", $dest);
    $dest = $destSplit[0];
    if (count($destSplit) > 1) $dest .= ' <span class="parkride-suffix">P/R</span>';

    return $dest;
}

function formatStatus($adhStr) {
    $mins = $adhStr;
    // negative = late
    // positive = early
    if (strcmp($mins, "NA") != 0) {
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
else $stopName = "Undefined stop";


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
                $mins = $dp['wait'];
                $adh = $dp['adherence'];
                $tripid = $dp['trip_id'];
                if ($mins >= -1 || $adh > 1 && ($mins + $adh) >= -1) {
                    $hhmm = formatTime($dp['time']);
                    $dest = formatDestination($dp['destination']);
                    $status = formatStatus($adh);

                    if ($mins <= $nowHighThres && $mins >= $nowLowThres) $mins = 'Now'; // Imminent.
                    else if ($mins > $minutesThres && strcmp($status, "") != 0 && $mins + $adh > $minutesThres) { // Too soon to tell.
                        $mins = '';
                        $status = 'On its way';
                    }
                    else $mins .= '<span class="small">m</span>';
                    //$mins = abs($mins) . 'm' . ($mins < 0 ? ' ago' : '');    

                    if (strcmp($status, "") != 0) {
                        $statusCell = "<td class='status $status '><span class='mins'>$mins</span><div class='remarks'>$status</div></td>";
                    }
                    else if ($mins <= $minutesThres) {
                        $statusCell = "<td class='status no'><div class='remarks'>No GPS</div></td>";
                    }                
                    else {
                        $statusCell = "<td></td>";
                    }                
    
echo <<<END
        <tr><!-- $tripid -->
            <td class="route">$dp[route]</td>
            <td class="time">$hhmm</td>
            <td class="dest">$dest</td>
            $statusCell
        </tr>

END;
                } // foreach
            } // if isset
        }?>
    </table>
    <footer>All times are approximate and may change without notice.<br/>
        &copy; 2018 <a href="http://martaarmy.org/">MARTA Army Inc.</a> Data provided by <a href="http://www.itsmarta.com/">MARTA</a>.<br/>
        By using this site, you consent on the tracking of your activity to enhance your browsing experience.
    </footer>
    <script>
        var recentStops = localStorage.getItem("recentStops");
        if (recentStops == undefined) recentStops = "";
        var stopStr = "<?=$shortStopId?>: <?=$stopName?>";
        if (recentStops.indexOf(stopStr) == -1) {
            localStorage.setItem("recentStops", stopStr + "|" + recentStops);
        }
    </script>
</div>
</body>
</html>
