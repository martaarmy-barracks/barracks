<?php
header('Content-Type: application/json');
date_default_timezone_set('America/New_York');
include('get-json.php');
include('../lib/db.php');
init_db();

$realTimeBusUrl = 'http://developer.itsmarta.com/BRDRestService/RestBusRealTimeService/GetBusByRoute/'; // 110
$realTimeAllBusUrl = 'http://developer.itsmarta.com/BRDRestService/RestBusRealTimeService/GetAllBus';
$realTimePullInterval = 120; // seconds

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
if ($date_Ymd == "2019-01-01") {
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


function getNextDepartures($stopId, $hhmm, $service_id) {
	global $_DB;
	global $realTimeBusUrl;
	global $realTimeAllBusUrl;
	global $realTimePullInterval;
	
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




select t1.*, rt.ADHERENCE, rt.VEHICLE from 
(
select r.route_short_name r, t.terminus_name, st.departure_time, t.trip_id, t.block_id from gtfs_stop_times st, gtfs_trips t, gtfs_routes r

where st.trip_id = t.trip_id
and r.route_id = t.route_id
and st.stop_id = 901229 -- from request.
and t.service_id = 5 -- determine based on request time.
and st.departure_time > "18:30:00" -- -15 mins prior - determine based on request time.
and st.departure_time < "20:30:00" -- 1:45mins after - determine based on request time.

order by st.departure_time
limit 15
) t1 left join bus_realtime rt
on (rt.blockid = t1.block_id or rt.TRIPID = t1.trip_id) order by departure_time


-- Alternative with fewer intermediate views and that skips past trips in the 15min before
-- (in progress)
select r.route_short_name r, t.terminus_name, st.departure_time, subtime(st.departure_time, concat(coalesce(rt.ADHERENCE, 0), ':00')) adjtime, t.trip_id, t.block_id, rt.ADHERENCE, rt.VEHICLE from gtfs_stop_times st, gtfs_routes r, gtfs_trips t
    left join bus_realtime rt
on (rt.blockid = t.block_id or rt.TRIPID = t.trip_id)
    
where st.trip_id = t.trip_id
and r.route_id = t.route_id
and st.stop_id = 901789 -- from request.
and t.service_id = 5 -- determine based on request time.
and subtime(st.departure_time, coalesce(rt.ADHERENCE, 0)*60) >= "10:20:00" -- -15 mins prior - determine based on request time.
and st.departure_time < "11:20:00" -- 1:45mins after - determine based on request time.

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
	  "wait": 47
	},
	...
  ]
}
	*/
	$hour = floor($hhmm / 100);
	$minutes = $hhmm % 100;

	$hours15minsago = $hour;
	$minutes15minsago = $minutes - 15;
	if ($minutes15minsago < 0) {
		$minutes15minsago = $minutes + 45;
		$hours15minsago--;
	}
	$minutes15minsagoStr = sprintf("%02d", $minutes15minsago);

	$departure_min = sprintf("%02d", $hours15minsago) . ":" . $minutes15minsagoStr . ":00"; // "18:30:00";
	$departure_max = sprintf("%02d", ($hours15minsago+2)) . ":" . $minutes15minsagoStr . ":00"; // "20:30:00"; // Ok to go beyond 24hrs.

	// Determine if it is necessary to pull real-time bus.
	$query = "select TIMESTAMPDIFF(SECOND, LAST_RTBUS_PULL, NOW()) from appstate where id = 1";
	$stmt = $_DB->prepare($query);

	if (!($stmt->execute())) {
		$errorMsg = "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
		finishWith($errorMsg);
	}

	$results0 = $stmt->get_result()->fetch_all(MYSQLI_NUM);
	$timeSinceLastPull = null;
	foreach ($results0 as $r) {
		$timeSinceLastPull = $r[0];
		break;
	}

	if ($timeSinceLastPull >= $realTimePullInterval) {
		// TODO: BEGIN >>> Place this in a separate script
		$errorMsg = "";

		// clear table (can't use truncate)
		$query = "delete from bus_realtime where 1";
		$stmt = $_DB->prepare($query);
	
		if (!($stmt->execute())) {
			$errorMsg = "Failed to delete old bus real time data (" . $stmt->errno . ") " . $stmt->error;
			finishWith($errorMsg);
		}

		// Update pull timestamp
		$query = 'update appstate set LAST_RTBUS_PULL = NOW() where id = 1';
		$stmt = $_DB->prepare($query);
		if (!($stmt->execute())) {
		$errorMsg = "Failed to update pull time (" . $stmt->errno . ") " . $stmt->error;
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
			$query = 'INSERT INTO bus_realtime (ADHERENCE, BLOCKID, BLOCK_ABBR, DIRECTION, DIRECTION_ID, LATITUDE, LONGITUDE, MSGTIME, ROUTE, STOPID, TIMEPOINT, TRIPID, VEHICLE) VALUES ' . implode(',', $rtsql);
			$stmt = $_DB->prepare($query);

			if (!($stmt->execute())) {
				$errorMsg = "Failed to insert bus real time data (" . $stmt->errno . ") " . $stmt->error;
				finishWith($errorMsg);
			}
		}
    }
    
    // TODO: <<< END Place this in a separate script
      
		// Try to match trip ids
    $query =
    "update gtfs_trips t0, " .
    "( " .
    "select t2.trip_id, t2.blockid, t2.dt, min(t2.dt) dtmin FROM " .
    "( " .

    "select t.trip_id, st.stop_id, rt.timepoint, st.departure_time, t.direction_id t_dirid, rt.DIRECTION_ID r_dirid, rt.DIRECTION, t.block_id, rt.blockid, rt.msgtime, rt.ADHERENCE, " .
      "replace(subtime(st.departure_time, rt.msgtime), '-', '') dt " .

    "from gtfs_stop_times st, gtfs_trips t, bus_realtime rt " .
    "where st.trip_id = t.trip_id " . 
    "and t.service_id = " . $service_id . " " .
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
    
    $stmt = $_DB->prepare($query);
    if (!($stmt->execute())) {
      $errorMsg = "Failed to update block ids (" . $stmt->errno . ") " . $stmt->error;
      finishWith($errorMsg);
    }    
	}
	

	$query = 
  "select t1.*, rt.ADHERENCE, rt.VEHICLE from ( " .
    
	"select r.route_short_name r, t.terminus_name, st.departure_time, t.trip_id, t.block_id from gtfs_stop_times st, gtfs_trips t, gtfs_routes r " .

	"where st.trip_id = t.trip_id " .
	"and r.route_id = t.route_id " .
	"and st.stop_id = (?) " . //-- from request.
	"and t.service_id = (?) " . //-- determine based on request time.
	"and st.departure_time > (?) " . // -- -15 mins prior - determine based on request time.
	"and st.departure_time < (?) " . // -- 1:45mins after - determine based on request time.
	
	"order by st.departure_time " .
	"limit 15 " .
    
  ") t1 left join bus_realtime rt " .
  "on (rt.blockid = t1.block_id or rt.TRIPID = t1.trip_id) order by departure_time " 
    
	;

	$stmt = $_DB->prepare($query);
	$stmt->bind_param('sdss', $stopId, $service_id, $departure_min, $departure_max);

	if (!($stmt->execute())) {
		$errorMsg = "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
		finishWith($errorMsg);
	}

	$results = $stmt->get_result();
	$result = array();
	$realTimeBus = array();
	
	while ($row = $results->fetch_array(MYSQLI_NUM)) {
		$depInfo = array();
		$routeNum = $row[0];
		$time = $row[2];
		$tripId = $row[3];
		$blockId = $row[4];
    $adherence = $row[5];

		$stopInfo['route'] = $routeNum;
		$stopInfo['destination'] = $row[1];
		$stopInfo['time'] = $time;
		$stopInfo['trip_id'] = $tripId;
		$stopInfo['block_id'] = $blockId;
		$stopInfo['vehicle'] = $row[6];

		// Compute wait time based on time given (and adherence)
		$timeSplit = explode(":", $time);
		$dpHours = $timeSplit[0];
		$dpMinutes = $timeSplit[1];		
		$wait = ($dpMinutes - $minutes) + 60*($dpHours - $hour);
    if (is_null($adherence)) $adherence = "NA";
    else $wait -= $adherence;
		$stopInfo['adherence'] = $adherence;
		
/*		// Get and store real-time delays
		// by route
		$realTimeInfo = null;
		$url = $realTimeBusUrl . $routeNum;
		if (isset($realTimeBus[$routeNum])) {
			$realTimeInfo = $realTimeBus[$routeNum];
		}
		else {
			$realTimeBus[$routeNum] = $realTimeInfo; // = getJson($url);
		}

		if ($realTimeInfo != null) {
			foreach ($realTimeInfo as $rti) {
				if (strcmp($rti['TRIPID'], $tripId) == 0) { // || strcmp($rti['BLOCKID'], $blockId) == 0) {
					$stopInfo['adherence'] = $rti['ADHERENCE'];
					$wait -= $rti['ADHERENCE'];
					break;
				}
			}
		}
*/
		$stopInfo['wait'] = $wait;
	
		array_push($result, $stopInfo);
	}	

	$query2 = "select stop_name from gtfs_stops where stop_id = (?)";

	$stmt = $_DB->prepare($query2);
	$stmt->bind_param('s', $stopId);

	if (!($stmt->execute())) {
		$errorMsg = "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
	}

	$results2 = $stmt->get_result()->fetch_all(MYSQLI_NUM);
	$stopname = null;
	foreach ($results2 as $r) {
		$stopname = $r[0];
		break;
	}
	

	$output = "{\"stop_id\": \"" . $stopId . "\", \"stop_name\": \"" . $stopname . "\", \"reqtime\": \"" . $hhmm . "\", \"service_id\": \"" . $service_id
		 . "\", \"departures\": " . json_encode($result) . "}";
	return $output;
}
?>