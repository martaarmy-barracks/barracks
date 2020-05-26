<?php
header('Content-Type: application/json');
date_default_timezone_set('America/New_York');
include('get-json.php');
include('stop-funcs.php');
include('../lib/db.php');

$realTimeAllBusUrl = 'http://developer.itsmarta.com/BRDRestService/RestBusRealTimeService/GetAllBus';
$statusPullInterval = 120; // seconds
$exclusionFileName = "trip_status_pending.log";
$tagFileName = "trip_start.log";
$logFileName = "get-trip-statuses.log";
$logOutcome = true;
$useLockFile = false;


function finishWith($status) {
    global $_DB;
    global $logFileName;
    global $exclusionFileName;
    global $logOutcome;
    global $useLockFile;

	mysqli_close($_DB);
    if ($useLockFile) unlink($exclusionFileName);

    if ($logOutcome) file_put_contents($logFileName, date(DATE_ATOM) . " get-trip-status:" . $status . "\n", FILE_APPEND);
    exit(json_encode(array('status'=>$status)));
}

// https://stackoverflow.com/questions/20955405/limit-amount-of-instances-a-php-script-can-run-from-cron
function ifFirstInstance(){
    $basename = basename($_SERVER['SCRIPT_NAME']);
    ob_start();
    system("ps u", $return);
    $result = ob_get_contents();
    ob_end_clean();
    $pieces = count(explode($basename, $result));
    $pieces--;
    if($pieces < 2)
        return true;
    else
        return false;
}


// If there is another process like this one pending, don't start.
//if (file_exists($exclusionFileName)) {
if (ifFirstInstance( )== false) {
    if ($logOutcome) file_put_contents($logFileName, date(DATE_ATOM) . " get-trip-status:" . "skipping - lock present (already running).\n", FILE_APPEND);
}
else {
    if ($useLockFile) file_put_contents($exclusionFileName, print_r($_SERVER, true));

    $dateDiff = 10000; // seconds
    $lastPullTime = 0;
    if (file_exists($tagFileName)) $lastPullTime = filemtime($tagFileName);
    if ($lastPullTime) {
        $dateDiff = time() - $lastPullTime;
    }

    if ($dateDiff >= $statusPullInterval) {
        file_put_contents($tagFileName, print_r($_SERVER, true));
        init_db();

        include('load-tweets.php');

        // TODO: BEGIN >>> Place this in a separate script
        $errorMsg = "";

        // clear table (can't use truncate)
        if (!$_DB->query("delete from bus_realtime where 1")) {
            $errorMsg = "Failed to delete old bus real time data.";
            // finishWith($errorMsg);
        }

        // Pull real-time (long timeout just in case)
        $realTimeAllBus = getJson($realTimeAllBusUrl, 90);

        // TODO:
        // Backup if the all real-time is not available
        // use the API by route
        if (is_null($realTimeAllBus)) {

        }

        if (!is_null($realTimeAllBus)) {
            // insert into table
            $rtsql = array();
            $blockids = array();
            foreach( $realTimeAllBus as $row ) {
                $blockid = $row['BLOCKID'];
                if (array_search($blockid, $blockids) == false) {
                    $blockids[] = $blockid;

                    $dirid = 0;
                    if ($row['DIRECTION'] == 'Southbound' || $row['DIRECTION'] == 'Westbound') $dirid = 1;
                    $rowData = [
                        $row['ADHERENCE'],
                        $blockid,
                        '"' . $row['BLOCK_ABBR'] . '"',
                        '"' . $row['DIRECTION'] . '"',
                        $dirid,
                        $row['LATITUDE'],
                        $row['LONGITUDE'],
                        '"' . date('H:i:s', strtotime($row['MSGTIME'])) . '"',
                        '"' . $row['ROUTE'] . '"',
                        $row['STOPID'],
                        '"' . $row['TIMEPOINT'] . '"',
                        $row['TRIPID'],
                        $row['VEHICLE']
                    ];

                    $rtsql[] = '(' . implode(', ', $rowData) . ')';
                }
            }

            $rtBusOutcome = "NODATA";
            if (count($rtsql) != 0) {
                if (!$_DB->query('INSERT INTO bus_realtime (ADHERENCE, BLOCKID, BLOCK_ABBR, DIRECTION, DIRECTION_ID, LATITUDE, LONGITUDE, MSGTIME, ROUTE, STOPID, TIMEPOINT, TRIPID, VEHICLE) VALUES ' . implode(',', $rtsql))) {
                    $errorMsg = "Failed to insert bus real time data";
                    $rtBusOutcome = "INSERTERROR";
                    // finishWith($errorMsg);
                }
                else {
                    $rtBusOutcome = "OK";
                }
            }
        }
        // TODO: END <<< Place this in a separate script

        // Try to match trip ids
        $matchTrips = 1;
        $overrideExistingBlockIds = 1;
        if ($matchTrips == 1) {
            $service_id = getIntTimeAndServiceId()["service_id"];

            // THIS IS GOLD!
            $query = <<<EOT
                update gtfs_trips t0,
                (
                select t2.trip_id, t2.blockid, t2.dt, min(t2.dt) dtmin FROM
                (

                select t.trip_id, st.stop_id, rt.timepoint, st.departure_time, t.direction_id t_dirid, rt.DIRECTION_ID r_dirid, rt.DIRECTION, t.block_id, rt.blockid, rt.msgtime, rt.ADHERENCE,
                replace(subtime(st.departure_time, rt.msgtime), '-', '') dt

                from gtfs_stop_times st, gtfs_trips t, bus_realtime rt
                where st.trip_id = t.trip_id
                and t.service_id = ($service_id)
                and st.stop_id = rt.stopid
                and t.route_id = (select route_id from gtfs_routes where route_short_name = rt.route)
                and t.direction_id =  rt.DIRECTION_ID
                and replace(
                    timediff((addtime(st.departure_time, 0) + INTERVAL 0 MINUTE), ((addtime(rt.msgtime, 0)) + INTERVAL rt.adherence MINUTE)),
                '-', '') <= concat('00:03:00')

                order by t.trip_id, dt
                ) t2

                group by trip_id
                ) t3

                set t0.block_id = case
                    when t0.block_id = t3.blockid then null
                    when t0.trip_id = t3.trip_id then t3.blockid
                end

                where t0.block_id = t3.blockid
                or t0.trip_id = t3.trip_id
EOT;
// Left out pieces:
//  -- format(abs(adherence) + 5) discard deltas of more than 5 minutes after adherence is factored in.
// where t0.trip_id = t3.trip_id and t0.block_id is null
// Set statement: unset block id if that block id is used on another trip/route.

            if (!$_DB->query($query)) {
                $errorMsg = "Failed to update block ids";
                finishWith($errorMsg);
            }
        }

        finishWith("success3");
    }
    else {
        if ($logOutcome) file_put_contents($logFileName, date(DATE_ATOM) . " get-trip-status:" . "skipping - must wait for period (" . $dateDiff . " seconds passed) .\n", FILE_APPEND);
        finishWith("success2");
    }
}
?>