<?php
include('./stopinfo_common.php');
date_default_timezone_set('America/New_York');

$greetingBanner = 'stopinfo_banner.html';
$minutesThres = 20;
$nowLowThres = -1;
$nowHighThres = 1;

$data = getDepartureData();
$shortStopId = getShortStopId();
$stopName = isset($data['stop_name']) ? $data['stop_name'] : "Undefined Stop";

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
                $svStatus = isset($dp['status']) ? $dp['status'] : null;
                $svMessage = isset($dp['message']) ? $dp['message'] : null;
                $svSource = isset($dp['source']) ? $dp['source'] : null;
                $svUrl = isset($dp['url']) ? $dp['url'] : null;
				$shouldPrint = false;
                
                if (strcmp($status, "On its way") == 0) {
					$shouldPrint = true;
                    $mins = '';
                    $hhmm = formatTime($rawtime);
                    $dest = formatDestination($dp['destination']);
					$statusCell = "<td class='status $status '><span class='mins'>$mins </span><div class='remarks'>$status</div></td>";
                }
                else if ($mins >= -1 || $adh > 1 && ($mins + $adh) >= -1) {
                    $shouldPrint = true;
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
                        if ($svMessage != null) {
                            $status = $svStatus;
                            $statusCell = "<td class='status $status '><span class='mins'>DLY</span><div class='remarks'>$status</div></td>";
                        }
                    }
                    else {
                        $statusCell = "<td></td>";
                        if ($svMessage != null) {
                            $status = $svStatus;
                            $statusCell = "<td class='status $status '><span class='mins'>DLY</span><div class='remarks'>$status</div></td>";
                        }
                    }
                }

                if ($shouldPrint) {    
echo <<<END
            <tr id="trip-$tripid" onclick="setTrip(event, '$tripid', '$vehid', '$route', '$hhmm', '$rawtime', '$dest', '$svMessage', '$svSource', '$svUrl')">
            <td class="route">$route</td>
            <td class="time">$hhmm</td>
            <td class="dest">$dest</td>
            $statusCell
        </tr>

END;
                } // if ($shouldPrint...)
            } // foreach
        } // if isset
    ?>
                        

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
var shortStopId = "<?=$shortStopId?>";
var stopName = "<?=$stopName?>";
addRecentStop(shortStopId + ": " + stopName);
</script>
</html>
