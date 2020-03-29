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

$stopIdReq = trim($_REQUEST['stopid']);
extract(getIntTimeAndServiceId());

echo getNextDepartures($stopIdReq, $date_as_int, $service_id);

function getQuery($stopId, $hhmm, $service_id) {
	extract(getDepartureFrame($hhmm));

	return <<<EOT
	select
		r.agency_id,
		r.route_short_name,
		t.terminus_name,
		st.departure_time,
		(("$departure_now") > t.trip_start_time) trip_started,
		t.trip_id,
		t.block_id,
		rt.ADHERENCE,
		rt.VEHICLE,
		st.stop_id,
		round(time_to_sec(timediff(timediff(st.departure_time, sec_to_time(coalesce(rt.ADHERENCE*60, 0))), ("$departure_now")))/60) wait_time,
		lcase(tw.status) status,
		tw.text message,
		tw.source source,
		tw.id tweet_id
	from gtfs_stop_times st, gtfs_routes r, gtfs_trips t
	left join bus_realtime rt
		on (rt.blockid = t.block_id or rt.TRIPID = t.trip_id)
    left join service_tweets tw
    	on (tw.trip_id = t.trip_id or tw.block_id = t.block_id)

	where st.trip_id = t.trip_id
	and r.route_id = t.route_id
	and st.stop_id = ("$stopId")
	and t.service_id = ("$service_id")
	and timediff(st.departure_time, sec_to_time(coalesce(rt.ADHERENCE*60, 0))) >= ("$departure_min")
	and st.departure_time < ("$departure_max")

	order by st.departure_time asc, r.route_id asc
	limit 15
EOT;
}

function getQueryVars() {
	return array(
		"agency",
		"route",
		"destination",
		"time",
		"trip_started",
		"trip_id",
		"block_id",
		"adherence",
		"vehicle",
		"stop_id",
		"wait",
		"status",
		"message",
		"source",
		"tweet_id"
	);
}

function getNextDepartures($stopId, $hhmm, $service_id) {
	global $_DB;
	init_db();

	$tripStatusesUrl = 'https://barracks.martaarmy.org/ajax/get-trip-statuses.php';

	/*
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
	
	// Attempt to get trip statuses on the spot, timeout after a few seconds.
	// TODO: use result value to refine output.
	getJson($tripStatusesUrl, 4);
	
	extract(getDepartureFrame($hhmm));
	$query = getQuery($stopId, $hhmm, $service_id);
	$queryVars = getQueryVars();
	$queryResults = getFromQuery($_DB, $query, $queryVars);

	$result = array();
	$prevEntry = null;
	$stopNames = array();

	foreach ($queryResults as $entry) {
		extract($entry);

		$usePrevEntry = $prevEntry != null && $prevEntry["trip_id"] == $trip_id;
		$stopInfo = $usePrevEntry ? $prevEntry : $entry;

		if (!$usePrevEntry) {
			if (is_null($adherence)) $adherence = "NA";
			else {
				if (!$trip_started) {
					if ($adherence >= -3) {
						// If bus is early or up to 3 mins late and it is before trip_start_time,
						// then say that the bus is on-time.
						$wait += $adherence;
						$adherence = 0;
					}
					else {
						// If bus is late and it is before trip_start_time,
						// then say that the bus is on its way.
						$wait = "NA";
						$adherence = "On its way";
					}
				}
			}
			$stopInfo["adherence"] = $adherence;
			$stopInfo["wait"] = $wait;	
		}


		if (!is_null($status)
		&& !is_null($message)
		&& !is_null($source)
		&& !is_null($tweet_id)) {
			if (!isset($stopInfo["messages"])) $stopInfo["messages"] = array();
			$stopInfo["messages"][] = array(
				"status" => $status,
				"message" => $message,
				"source" => $source,
				"url" => "https://twitter.com/$out_src/status/$tweet_id"
			);
		}

		unset($stopInfo["message"]);
		unset($stopInfo["status"]);
		unset($stopInfo["source"]);
		unset($stopInfo["tweet_id"]);

		$prevEntry = $stopInfo;
		if ($usePrevEntry) $result[count($result) - 1] = $stopInfo;
		else array_push($result, $stopInfo);
	}

	// Get stop name.
	$stopName = getStopName($_DB, $stopId)["stopName"];
	$stopNames[$stopId] = $stopName;

	$output = "{\"stop_id\": \"$stopId\", \"stop_name\": \"$stopName\", \"reqtime\": \"$hhmm\", \"service_id\": \"$service_id\", "
		. "\"departures\": " . json_encode($result) . ", "
		. "\"stops\":" . json_encode($stopNames)
		. "}";

	mysqli_close($_DB);
	return $output;
}
?>
