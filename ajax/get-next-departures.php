<?php
header('Content-Type: application/json');
date_default_timezone_set('America/New_York');
include('get-json.php');
include('../lib/db.php');
init_db();

$realTimeBusUrl = 'http://developer.itsmarta.com/BRDRestService/RestBusRealTimeService/GetBusByRoute/'; // 110

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
if ($date_Ymd == "2018-09-03") {
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



select r.route_short_name r, t.terminus_name, st.departure_time, t.trip_id, t.block_id from gtfs_stop_times st, gtfs_trips t, gtfs_routes r

where st.trip_id = t.trip_id
and r.route_id = t.route_id
and st.stop_id = 901229 -- from request.
and t.service_id = 5 -- determine based on request time.
and st.departure_time > "18:30:00" -- -15 mins prior - determine based on request time.
and st.departure_time < "20:30:00" -- 1:45mins after - determine based on request time.

order by st.departure_time
limit 15




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

	$query = 
	"select r.route_short_name r, t.terminus_name, st.departure_time, t.trip_id, t.block_id from gtfs_stop_times st, gtfs_trips t, gtfs_routes r " .

	"where st.trip_id = t.trip_id " .
	"and r.route_id = t.route_id " .
	"and st.stop_id = (?) " . //-- from request.
	"and t.service_id = (?) " . //-- determine based on request time.
	"and st.departure_time > (?) " . // -- -15 mins prior - determine based on request time.
	"and st.departure_time < (?) " . // -- 1:45mins after - determine based on request time.
	
	"order by st.departure_time " .
	"limit 15 "
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

		$stopInfo['route'] = $routeNum;
		$stopInfo['destination'] = $row[1];
		$stopInfo['time'] = $time;
		$stopInfo['trip_id'] = $tripId;
		$stopInfo['block_id'] = $blockId;
		$stopInfo['adherence'] = "NA";

		// Compute wait time based on time given (and adherence)
		$timeSplit = explode(":", $time);
		$dpHours = $timeSplit[0];
		$dpMinutes = $timeSplit[1];		
		$wait = ($dpMinutes - $minutes) + 60*($dpHours - $hour);
		
		// Get and store real-time delays
		// by route
		$realTimeInfo = null;
		$url = $realTimeBusUrl . $routeNum;
		if (isset($realTimeBus[$routeNum])) {
			$realTimeInfo = $realTimeBus[$routeNum];
		}
		else {
			$realTimeBus[$routeNum] = $realTimeInfo = getJson($url);
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