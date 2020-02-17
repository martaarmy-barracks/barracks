<?php
header('Content-Type: application/json');
date_default_timezone_set('America/New_York');
include('get-json.php');
include('stop-funcs.php');
include('../lib/db.php');

$realTimeAllBusUrl = 'http://developer.itsmarta.com/BRDRestService/RestBusRealTimeService/GetAllBus';
$statusPullInterval = 120; // seconds
$exclusionFileName = "trip_status_pending.log";
$logFileName = "get-trip-statuses.log";
$logOutcome = false;


function finishWith($status) {
    global $_DB;
    global $logFileName;
    global $exclusionFileName;
    global $logOutcome;
	mysqli_close($_DB);
    unlink($exclusionFileName);
    
    if ($logOutcome) file_put_contents($logFileName, date(DATE_ATOM) . " get-trip-status:" . $status . "\n", FILE_APPEND);
    exit(json_encode(array('status'=>$status)));
}


// If there is another process like this one pending, don't start.
if (file_exists($exclusionFileName)) {
    if ($logOutcome) file_put_contents($logFileName, date(DATE_ATOM) . " get-trip-status:" . "skipping - lock present.\n", FILE_APPEND);
}
else {
    file_put_contents($exclusionFileName, print_r($_SERVER, true));

    init_db();

    $lastStatusPullData = getOneFromQuery($_DB, "select TIMESTAMPDIFF(SECOND, VALUE, NOW()), outcome from appstate where id = 'LAST_TRIPSTATUS_PULL'", array("t", "outcome"));
    $timeSinceLastStatusPull = $lastStatusPullData["t"];
    if ($timeSinceLastStatusPull == null) $timeSinceLastStatusPull = -1;

    if ($timeSinceLastStatusPull >= $statusPullInterval) {
        // Update pull timestamp
        if (!$_DB->query("update appstate set VALUE = NOW(), outcome = 'INCOMPLETE' where id = 'LAST_TRIPSTATUS_PULL'")) {
            finishWith("Failed to update trip status pull time.");
        }


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
        /*
        -- THIS IS GOLD
        update gtfs_trips t0,
        (
        select t2.trip_id, t2.blockid, t2.dt, min(t2.dt) dtmin FROM
        (
        
        select t.trip_id, st.stop_id, rt.timepoint, st.departure_time, t.direction_id t_dirid, rt.DIRECTION_ID r_dirid, rt.DIRECTION, t.block_id, rt.blockid, rt.msgtime, rt.ADHERENCE,
        replace(subtime(st.departure_time, rt.msgtime), '-', '') dt
        
            from gtfs_stop_times st, gtfs_trips t, bus_realtime rt
        where st.trip_id = t.trip_id
        
        and t.service_id = 5
        and st.stop_id = rt.stopid
        and t.route_id = (select route_id from gtfs_routes where route_short_name = rt.route)
        and t.direction_id =  rt.DIRECTION_ID
        -- and replace(subtime(st.departure_time, rt.msgtime), '-', '') <= concat('00:', LPAD((abs(rt.ADHERENCE) + 3), 2, '0'), ':00') -- format(abs(adherence) + 5) discard deltas of more than 5 minutes after adherence is factored in.
        and replace(subtime(st.departure_time, addtime(rt.msgtime, rt.ADHERENCE*60)), '-', '') <= concat('00:03:00')  -- discard deltas of more than 5 minutes after adherence is factored in.
        
        
        order by t.trip_id, dt
        ) t2
        
        -- where t2.trip_id = 6464959 -- 6480149 -- troubleshooting only
        group by trip_id
        ) t3
        
        set t0.block_id = t3.blockid
        where t0.trip_id = t3.trip_id and t0.block_id is null
        */

        $matchTrips = 1;
        if ($matchTrips == 1) {
            $service_id = getIntTimeAndServiceId()["service_id"];

            $query =
            "update gtfs_trips t0, " .
            "( " .
            "select t2.trip_id, t2.blockid, t2.dt, min(t2.dt) dtmin FROM " .
            "( " .

            "select t.trip_id, st.stop_id, rt.timepoint, st.departure_time, t.direction_id t_dirid, rt.DIRECTION_ID r_dirid, rt.DIRECTION, t.block_id, rt.blockid, rt.msgtime, rt.ADHERENCE, " .
            "replace(subtime(st.departure_time, rt.msgtime), '-', '') dt " .

            "from gtfs_stop_times st, gtfs_trips t, bus_realtime rt " .
            "where st.trip_id = t.trip_id " .
            "and t.service_id = ($service_id) " .
            "and st.stop_id = rt.stopid " .
            "and t.route_id = (select route_id from gtfs_routes where route_short_name = rt.route) " .
            "and t.direction_id =  rt.DIRECTION_ID " .
            "and replace(subtime(st.departure_time, addtime(rt.msgtime, rt.ADHERENCE*60)), '-', '') <= concat('00:03:00') " . // -- format(abs(adherence) + 5) discard deltas of more than 5 minutes after adherence is factored in.

            "order by t.trip_id, dt " .
            ") t2 " .

            "group by trip_id " .
            ") t3 " .

            "set t0.block_id = t3.blockid " .
            "where t0.trip_id = t3.trip_id and t0.block_id is null ";

            if (!$_DB->query($query)) {
                $errorMsg = "Failed to update block ids";
                finishWith($errorMsg);
            }
        }

        // Update pull timestamp
        if (!$_DB->query("update appstate set outcome = 'OK' where id = 'LAST_TRIPSTATUS_PULL'")) {
            finishWith("Failed to update trip status pull outcome.");
        }
        finishWith("success");
    }
    else {
        finishWith("skipping - must wait for period.", FILE_APPEND);
    }
}
?>