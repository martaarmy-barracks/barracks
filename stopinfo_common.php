<?php
include('ajax/get-json.php');
date_default_timezone_set('America/New_York');

function appendDebugParams($url) {
    $newUrl = $url;

	if (isset($_REQUEST['testhour'])) {
		$date_as_int = $_REQUEST['testhour'];
        $newUrl = "$newUrl&testhour=$date_as_int";
	}
	if (isset($_REQUEST['testday'])) {
        $day_name = $_REQUEST['testday'];
        $newUrl = "$newUrl&testday=$day_name";
    }

    return $newUrl;
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

function replaceText($s, $find, $repl) {
    $destSplit = explode(" $find", $s);
    $dest = $destSplit[0];
    if (count($destSplit) > 1) $dest .= " $repl";
    return $dest;
}

function formatDestination($destStr) {
    $dest = replaceText($destStr, "STATION", "STA");
    $dest = replaceText($dest, "PARK & RIDE", "P/R");
    $dest = replaceText($dest, "PARK AND RIDE", "P/R");
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

function getShortId($longId) {
    return explode("_", $longId)[1];
}

function getShortStopId() {
    $sid = $_REQUEST['sid'];
    return getShortId($sid);
}

?>
