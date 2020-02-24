<?php
header('Content-Type: application/json');
date_default_timezone_set('America/New_York');
include('get-json.php');
include('stop-funcs.php');
include('../lib/db.php');

function finishWith($status) {
	global $_DB;
	mysqli_close($_DB);
	exit(json_encode(array('status'=>$status)));
}

$argsValid = false;
// If you define by center and radius...
if (isset($_REQUEST['lat']) && isset($_REQUEST['lon']) && isset($_REQUEST['radius'])) {
	$lat = (float)(trim($_REQUEST['lat']));
	$lon = (float)(trim($_REQUEST['lon']));
	$radius = (float)(trim($_REQUEST['radius']));
	
	$minLat = $lat - $radius;
	$maxLat = $lat + $radius;
	$minLon = $lon - $radius;
	$maxLon = $lon + $radius;

	$argsValid = true;
}
// If you define by box...
else if (isset($_REQUEST['minlat']) && isset($_REQUEST['minlon']) && isset($_REQUEST['maxlat']) && isset($_REQUEST['maxlon'])) {
	$minLat = (float)(trim($_REQUEST['minlat']));
	$minLon = (float)(trim($_REQUEST['minlon']));
	$maxLat = (float)(trim($_REQUEST['maxlat']));
	$maxLon = (float)(trim($_REQUEST['maxlon']));

	$argsValid = true;
}

if ($argsValid) {
	extract(getIntTimeAndServiceId());
	echo getNextDepartures($minLat, $minLon, $maxLat, $maxLon, $date_as_int, $service_id);
}
else {
	header("HTTP/1.0 400 Bad Request");
	exit;
}


function getNextDepartures($minLat, $minLon, $maxLat, $maxLon, $hhmm, $service_id) {
	global $_DB;
	init_db();

	$tripStatusesUrl = 'https://barracks.martaarmy.org/ajax/get-trip-statuses.php';

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
----
	select r.route_short_name r, t.terminus_name, a.departure_time, (("21:00:00") > t.trip_start_time) trip_started, t.trip_id, t.block_id, rt.ADHERENCE, rt.VEHICLE, a.stop_id,
	round(
        time_to_sec(timediff(timediff(a.departure_time, sec_to_time(coalesce(rt.ADHERENCE*60, 0))), ("21:00:00")))/60
    ) wait_time, a.stop_sequence, lcase(tw.status) status, tw.text message, tw.source source, tw.id tweet_id
	from gtfs_routes r,

	(
	select st.departure_time, st.stop_sequence, st.trip_id, st.stop_id, min(sqrt(pow(s.stop_lat - (33.797231), 2) + pow(s.stop_lon - (-84.368911), 2))) stop_dist from gtfs_stops s, gtfs_stop_times st
	
	where s.stop_id = st.stop_id
	and s.stop_lat between (33.797231 - 0.005) and (33.797231 + 0.005)
	and s.stop_lon between (-84.368911 - 0.005) and (-84.368911 + 0.005)
	
	group by st.trip_id
	) a,

    gtfs_trips t
	left join bus_realtime rt
	on (rt.blockid = t.block_id or rt.TRIPID = t.trip_id)
    left join service_tweets tw
    on (tw.trip_id = t.trip_id or tw.block_id = t.block_id)
	
	where a.trip_id = t.trip_id
	and r.route_id = t.route_id
	and t.service_id = (5)
	and timediff(a.departure_time, sec_to_time(coalesce(rt.ADHERENCE*60, 0))) >= ("21:00:00")
	and a.departure_time < ("23:00:00")
	
	order by a.departure_time asc
	limit 16
----



Output:
{
  "lat": "33.797231",
  "lon": "-84.368911",
  "radius": "0.005",
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


	// Attempt to get trip statuses on the spot.
	// Give up after short timeout to not block the UIs.
	// TODO: use result value to refine output.
	getJson($tripStatusesUrl, 4);

	$query = <<<EOT
	select r.route_short_name r, t.terminus_name, a.departure_time, ((?) > t.trip_start_time) trip_started, t.trip_id, t.block_id, rt.ADHERENCE, rt.VEHICLE, a.stop_id,
	round(
        time_to_sec(timediff(timediff(a.departure_time, sec_to_time(coalesce(rt.ADHERENCE*60, 0))), (?)))/60
    ) wait_time, a.stop_sequence, lcase(tw.status) status, tw.text message, tw.source source, tw.id tweet_id
	from gtfs_routes r,

	(
	select st.departure_time, st.stop_sequence, st.trip_id, st.stop_id, min(sqrt(pow(s.stop_lat - (?), 2) + pow(s.stop_lon - (?), 2))) stop_dist from gtfs_stops s, gtfs_stop_times st
	
	where s.stop_id = st.stop_id
	and s.stop_lat between (?) and (?)
	and s.stop_lon between (?) and (?)
	
	group by st.trip_id
	) a,

    gtfs_trips t
	left join bus_realtime rt
	on (rt.blockid = t.block_id or rt.TRIPID = t.trip_id)
    left join service_tweets tw
    on (tw.trip_id = t.trip_id or tw.block_id = t.block_id)
	
	where a.trip_id = t.trip_id
	and r.route_id = t.route_id
	and t.service_id = (?)
	and timediff(a.departure_time, sec_to_time(coalesce(rt.ADHERENCE*60, 0))) >= (?)
	and a.departure_time < (?)
	
	order by a.departure_time asc, r.route_id asc
	limit 16
EOT;
	// departure_time from -1 mins prior to 1:45 mins after - determine based on request time.

	$lat = ($minLat + $maxLat) / 2;
	$lon = ($minLon + $maxLon) / 2;

	$stmt = $_DB->prepare($query);
	$stmt->bind_param('ssssssssdss',
		$departure_now,
		$departure_now,
		$lat,
		$lon,
		$minLat,
		$maxLat,
		$minLon,
		$maxLon,
		$service_id,
		$departure_min,
		$departure_max
	);

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
	$out_stop_id = null;
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
		$out_stop_id,
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
	$prevEntry = null;
	while ($stmt->fetch()) {
		$usePrevEntry = $prevEntry != null && $prevEntry['trip_id'] == $out_trip;
		$stopInfo = $usePrevEntry ? $prevEntry : array();

		$stopInfo['route'] = $out_route;
		$stopInfo['destination'] = $out_dest;
		$stopInfo['time'] = $out_time;
		$stopInfo['stop_id'] = $out_stop_id;
		$stopInfo['trip_id'] = $out_trip;
		$stopInfo['block_id'] = $out_block;
		$stopInfo['vehicle'] = $out_veh;
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

		if (!is_null($out_status)
		&& !is_null($out_msg)
		&& !is_null($out_src)
		&& !is_null($out_tweetid)) {
			if (!isset($stopInfo['messages'])) $stopInfo['messages'] = array();
			$stopInfo['messages'][] = array(
				"status" => $out_status,
				"message" => $out_msg,
				"source" => $out_src,
				"url" => "https://twitter.com/$out_src/status/$out_tweetid"
			);
		}


		if (!is_null($out_status)) $stopInfo['status'] = $out_status;
		if (!is_null($out_msg)) $stopInfo['message'] = $out_msg;
		if (!is_null($out_src)) $stopInfo['source'] = $out_src;
		if (!is_null($out_tweetid)) $stopInfo['url'] = "https://twitter.com/$out_src/status/$out_tweetid";

		$prevEntry = $stopInfo;
		if ($usePrevEntry) $result[count($result) - 1] = $stopInfo;
		else array_push($result, $stopInfo);
	}

	$output = "{\"minLat\": $minLat, \"minLon\": $minLon, \"maxLat\": $maxLat, \"maxLon\": $maxLon, \"reqtime\": $hhmm, \"service_id\": \"$service_id\", \"departures\": "
		. json_encode($result) . "}";

	mysqli_close($_DB);
	return $output;
}
?>