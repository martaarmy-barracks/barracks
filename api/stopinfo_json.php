<?php
header('Content-Type: application/json');
include('../ajax/get-json.php');
date_default_timezone_set('America/New_York');

// file_put_contents("origin.log", print_r($_SERVER, true), FILE_APPEND);

$nextDeparturesUrl = "https://barracks.martaarmy.org/ajax/get-next-departures.php"; // ?stopid=901230
$minutesThres = 20;
$nowLowThres = -1;
$nowHighThres = 1;

$sid = $_REQUEST['sid'];
//$key = $_REQUEST['key'];
$shortStopId = explode("_", $sid)[1];
$timestamp = time();


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
else $stopName = "Undefined Stop";

$comma = "";

echo <<<END
{
	"disclaimer" : "All times approximate, may change without notice. Data provided by MARTA.",
	"request_timestamp" : $timestamp,
	"stop_id" : "$sid",
	"stop_name" : "$stopName",
	"departures" : [
END;
?>

<?php
if (isset($data['departures'])) {
    foreach ($data['departures'] as $dp) {
        $mins = $dp['wait'];
        $adh = $dp['adherence'];
        if ($mins >= -1 || $adh > 1 && ($mins + $adh) >= -1) {
            $hhmm = formatTime($dp['time']);
            $dest = formatDestination($dp['destination']);
            $status = formatStatus($adh);

            if ($mins <= $nowHighThres && $mins >= $nowLowThres) $mins = 'Now'; // Imminent.
            else if ($mins > $minutesThres && strcmp($status, "") != 0 && $mins + $adh > $minutesThres) { // Too soon to tell.
                $mins = '';
                $status = 'On its way';
            }
            else $mins .= 'm';

            if (strcmp($status, "") != 0) {
            }
            else if ($mins <= $minutesThres) {
                $mins = "";
                $status = "No GPS";
            }                
            else {
                $mins = "";
                $status = "";
            }

echo <<<END
$comma
		{
			"operator" : "MARTA",
			"route_name" : "$dp[route]",
			"scheduled_at" : "$hhmm",
			"destination" : "$dest",
			"status" : "$mins",
			"status_details" : "$status"
		}
END;
            $comma = ",";
        } // foreach
	} // if isset
}?>

<?
echo <<<END
	]
}
	
END;
?>
