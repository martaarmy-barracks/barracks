<?php
header('Content-Type: application/json');
date_default_timezone_set('America/New_York');
include('get-json.php');
include('stop-funcs.php');
include('../lib/db.php');
init_db();

$realTimeBusUrl = 'http://developer.itsmarta.com/BRDRestService/RestBusRealTimeService/GetBusByRoute/'; // 110
$realTimeAllBusUrl = 'http://developer.itsmarta.com/BRDRestService/RestBusRealTimeService/GetAllBus';
$realTimePullInterval = 120; // seconds
$twitterPullInterval = 120; // seconds

function finishWith($status) {
	exit(json_encode(array('status'=>$status)));
}

$stopIdReq = trim($_REQUEST['stopid']);

//$datestr = date("g:i A");
$datestrU = date("Gi");
$date_as_int = intval($datestrU);
$day_code = date("N");

// Assume service day changes at 3 AM.
// Midnight to 3AM goes to previous day.
if ($date_as_int >= 0 && $date_as_int < 300) {
	$date_as_int += 2400;
	$day_code_n = intval($day_code) - 1;
	if ($day_code_n == 0) $day_code_n = 7;
	$day_code = strval($day_code_n);
}

// Determine service_id for today.
// TODO: night time.
$day_name = "WEEKDAY";
$service_id = 5;
if ($day_code == "6") {
	$service_id = 3;
	$day_name = "SATURDAY";
}
else if ($day_code == "7") {
	$service_id = 4;
	$day_name = "SUNDAY";
}


// TODO: Hack for holidays...
$date_Ymd = date("Y-m-d");
if ($date_Ymd == "2018-12-31") {
	$service_id = 3;
	$day_name = "SATURDAY";
}
if ($date_Ymd == "2019-09-02") {
	$service_id = 4;
	$day_name = "SUNDAY";
}


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


echo getNextDepartures($stopIdReq, $date_as_int, $service_id);

mysqli_close($_DB);

function getNextDepartures($stopId, $hhmm, $service_id) {
	global $_DB;
	global $realTimeBusUrl;
	global $realTimeAllBusUrl;
	global $realTimePullInterval;
	global $twitterPullInterval;

	/*
gtfs_trips: add columns: terminus_id INT(6), terminus_name VARCHAR(60)
then execute:

update
gtfs_trips t, gtfs_stop_times st,
(select trip_id, max(stop_sequence) sq from gtfs_stop_times group by trip_id) t1,
gtfs_stops s

set
t.terminus_id = st.stop_id,
t.terminus_name = s.stop_name

where t.trip_id = t1.trip_id
and st.stop_id = s.stop_id
and t1.trip_id = st.trip_id
and st.stop_sequence = t1.sq


update gtfs_trips t, terminus_names tn
set t.terminus_name = tn.stop_name
where t.terminus_id = tn.stop_id


-- ROUTE MATCHING
select st.trip_id, st.departure_time, t.direction_id, replace(subtime(st.departure_time, '21:58:38'), '-', '') dt from gtfs_stop_times st, gtfs_trips t
where st.trip_id = t.trip_id
and service_id = 5
and st.stop_id = 901789
and t.route_id = (select route_id from gtfs_routes where route_short_name = '110')
and direction_id = 0
order by dt asc limit 1


select st.trip_id, st.stop_id, rt.timepoint, st.departure_time, t.direction_id, t.block_id, rt.blockid, rt.msgtime, replace(subtime(st.departure_time, rt.msgtime), '-', '') dt from gtfs_stop_times st, gtfs_trips t, bus_realtime rt
where st.trip_id = t.trip_id
and t.trip_id =  6477153
and t.service_id = 5
and st.stop_id = rt.stopid
and t.route_id = (select route_id from gtfs_routes where route_short_name = rt.route)
and t.direction_id =  rt.DIRECTION_ID
order by dt asc limit 1


-- Getting next departures (better way)
select r.route_short_name r, t.terminus_name, st.departure_time, (("15:30:00") > t.trip_start_time) trip_started, t.trip_id, t.block_id, rt.ADHERENCE, rt.VEHICLE,
round(time_to_sec(timediff(timediff(st.departure_time, sec_to_time(coalesce(rt.ADHERENCE*60, 0))), "12:20:00"))/60) wait_time, st.stop_sequence, lcase(tw.status) status, tw.text message, tw.source source, tw.url url, tw.id tweet_id
from gtfs_stop_times st, gtfs_routes r, gtfs_trips t
    left join bus_realtime rt
on (rt.blockid = t.block_id or rt.TRIPID = t.trip_id)
    left join service_tweets tw
on (tw.trip_id = t.trip_id or tw.block_id = t.block_id)

where st.trip_id = t.trip_id
and r.route_id = t.route_id
and st.stop_id = 904800 -- from request.
and t.service_id = 3 -- determine based on request time.
and timediff(st.departure_time, sec_to_time(coalesce(rt.ADHERENCE*60, 0))) >= "12:20:00" -- 1 mins prior - determine based on request time.
and st.departure_time < "13:20:00" -- 1:45mins after - determine based on request time.

order by st.departure_time
limit 15





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




Output:
{

  "stop_id": "901229",
  "stop_name": "10TH ST NE @ PIEDMONT AVE NE",
  "reqtime": "715",
  "service_id": "5",
  "departures": [
    {
      "route": "36",
      "destination": "MIDTOWN STATION",
      "time": "18:20:42",
      "trip_id": 5845996,
      "block_id": 319342,
	  "adherence": "NA",
	  "wait": -4
    },
    {
      "route": "109",
      "destination": "MIDTOWN STATION",
      "time": "18:50:58",
      "trip_id": 5809462,
      "block_id": 318585,
      "adherence": "NA",
	  "wait": 34
    },
    {
      "route": "36",
      "destination": "MIDTOWN STATION",
      "time": "18:57:42",
      "trip_id": 5797796,
      "block_id": 318022,
      "adherence": "-3",
	  "wait": 47,
      "status": "Delayed",
      "message": "Trip xxx is delayed",
      "source": "MARTASERVICE",
      "tweet_id": 12345678

	},
	...
  ]
}
	*/
	$hour = floor($hhmm / 100);
	$minutes = $hhmm % 100;

	$hours1minago = $hour;
	$minutes1minago = $minutes - 2;
	if ($minutes1minago < 0) {
		$minutes1minago = $minutes + 58;
		$hours1minago--;
	}
	$minutes1minagoStr = sprintf("%02d", $minutes1minago);

	$departure_now = sprintf("%02d", $hour) . ":" . $minutes . ":00"; // "18:30:00";
	$departure_min = sprintf("%02d", $hours1minago) . ":" . $minutes1minagoStr . ":00"; // "18:30:00";
	$departure_max = sprintf("%02d", ($hours1minago+2)) . ":" . $minutes1minagoStr . ":00"; // "20:30:00"; // Ok to go beyond 24hrs.


	// Determine whether to pull Twitter.
	$timeSinceLastTwtPull = getOneFromQuery($_DB, "select TIMESTAMPDIFF(SECOND, VALUE, NOW()) from appstate where id = 'LAST_TWITTER_PULL'", array("t"))["t"];
	if ($timeSinceLastTwtPull == null) $timeSinceLastTwtPull = -1;
	if ($timeSinceLastTwtPull >= $twitterPullInterval) {

		// Update pull timestamp
		if (!$_DB->query("update appstate set VALUE = NOW() where id = 'LAST_TWITTER_PULL'")) {
			finishWith("Failed to update twitter pull time");
		}

		include('load-tweets.php');
	}

	// Determine whether to pull MARTA's real-time bus feed.
	$timeSinceLastPull = getOneFromQuery($_DB, "select TIMESTAMPDIFF(SECOND, VALUE, NOW()) from appstate where id = 'LAST_RTBUS_PULL'", array("t"))["t"];
	if ($timeSinceLastPull == null) $timeSinceLastPull = -1;
	if ($timeSinceLastPull >= $realTimePullInterval) {
		// TODO: BEGIN >>> Place this in a separate script
		$errorMsg = "";

		// clear table (can't use truncate)
		if (!$_DB->query("delete from bus_realtime where 1")) {
			$errorMsg = "Failed to delete old bus real time data.";
			finishWith($errorMsg);
		}

		// Update pull timestamp
		if (!$_DB->query("update appstate set VALUE = NOW() where id = 'LAST_RTBUS_PULL'")) {
			$errorMsg = "Failed to update pull time";
			finishWith($errorMsg);
		}


		// Pull real-time
		$realTimeAllBus = getJson($realTimeAllBusUrl);

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

		if (count($rtsql) != 0) {
			if (!$_DB->query('INSERT INTO bus_realtime (ADHERENCE, BLOCKID, BLOCK_ABBR, DIRECTION, DIRECTION_ID, LATITUDE, LONGITUDE, MSGTIME, ROUTE, STOPID, TIMEPOINT, TRIPID, VEHICLE) VALUES ' . implode(',', $rtsql))) {
				$errorMsg = "Failed to insert bus real time data";
				finishWith($errorMsg);
			}
		}
    }

    // TODO: <<< END Place this in a separate script

		// Try to match trip ids
	$matchTrips = 1;
if ($matchTrips == 1) {
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

	} // if ($timeSinceLastPull >= $realTimePullInterval)

	$query =
	"select r.route_short_name r, t.terminus_name, st.departure_time, ((?) > t.trip_start_time) trip_started, t.trip_id, t.block_id, rt.ADHERENCE, rt.VEHICLE, " .
	"round(time_to_sec(timediff(timediff(st.departure_time, sec_to_time(coalesce(rt.ADHERENCE*60, 0))), (?)))/60) wait_time, st.stop_sequence, lcase(tw.status) status, tw.text message, tw.source source, tw.id tweet_id " .
	"from gtfs_stop_times st, gtfs_routes r, gtfs_trips t " .
	"		left join bus_realtime rt " .
	"on (rt.blockid = t.block_id or rt.TRIPID = t.trip_id) " .
    "       left join service_tweets tw " .
    "on (tw.trip_id = t.trip_id or tw.block_id = t.block_id) " .

	"where st.trip_id = t.trip_id " .
	"and r.route_id = t.route_id " .
	"and st.stop_id = (?) " . //-- from request.
	"and t.service_id = (?) " . //-- determine based on request time.
	"and timediff(st.departure_time, sec_to_time(coalesce(rt.ADHERENCE*60, 0))) >= (?) " . // -- -1 mins prior - determine based on request time.
	"and st.departure_time < (?) " . // -- 1:45mins after - determine based on request time.

	"order by st.departure_time " .
	"limit 15 "
	;

	$stmt = $_DB->prepare($query);
	$stmt->bind_param('sssdss', $departure_now, $departure_now, $stopId, $service_id, $departure_min, $departure_max);

	if (!($stmt->execute())) {
		$errorMsg = "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
		finishWith($errorMsg);
	}

	// Output vars
	$out_route = null;
	$out_dest = null;
	$out_time = null;
	$out_trip_started = null;
	$out_trip = null;
	$out_block = null;
	$out_adh = null;
	$out_veh = null;
	$out_wait = null;
	$out_seq = null;
	$out_status = null;
	$out_msg = null;
	$out_src = null;
	$out_tweetid = null;
	
	if (!$stmt->bind_result(
		$out_route,
		$out_dest,
		$out_time,
		$out_trip_started,
		$out_trip,
		$out_block,
		$out_adh,
		$out_veh,
		$out_wait,
		$out_seq,
		$out_status,
		$out_msg,
		$out_src,
		$out_tweetid
	)) {
		echo "Binding output parameters failed: (" . $stmt->errno . ") " . $stmt->error;
	}
	
	$result = array();
	while ($stmt->fetch()) {
	    $stopInfo = array();
		$stopInfo['route'] = $out_route;
		$stopInfo['destination'] = $out_dest;
		$stopInfo['time'] = $out_time;
		$stopInfo['trip_id'] = $out_trip;
		$stopInfo['block_id'] = $out_block;
		$stopInfo['vehicle'] = $out_veh;
		
		if (!is_null($out_status)) $stopInfo['status'] = $out_status;
		if (!is_null($out_msg)) $stopInfo['message'] = $out_msg;
		if (!is_null($out_src)) $stopInfo['source'] = $out_src;
		if (!is_null($out_tweetid)) $stopInfo['url'] = "https://twitter.com/statuses/$out_tweetid";


		if (is_null($out_adh)) $out_adh = "NA";
		else {
			if (!$out_trip_started) {
				if ($out_adh >= -3) { //0) {// && $out_seq == 1) {
					// If bus is early or up to 3 mins late and it is before trip_start_time,
					// then say that the bus is on-time.
					// (Previously was: If bus is early at terminus, then it is assumed on-time.)
					$out_wait += $out_adh;
					$out_adh = 0;
				}
				else {
					// If bus is late and it is before trip_start_time,
					// then say that the bus is on its way.
					$out_wait = "NA";
					$out_adh = "On its way";
				}
			}
		}
		$stopInfo['adherence'] = $out_adh;
		$stopInfo['wait'] = $out_wait;
		$stopInfo['trip_started'] = $out_trip_started;

		array_push($result, $stopInfo);
	}

	// Get stop name.
	$stopname = getStopName($_DB, $stopId)["stopName"];
	$output = "{\"stop_id\": \"" . $stopId . "\", \"stop_name\": \"" . $stopname . "\", \"reqtime\": \"" . $hhmm . "\", \"service_id\": \"" . $service_id
		 . "\", \"departures\": " . json_encode($result) . "}";
	return $output;
}
?>