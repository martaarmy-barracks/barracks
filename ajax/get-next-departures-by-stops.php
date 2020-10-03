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
if (isset($_REQUEST['stopids'])) {
	$stopids = $_REQUEST['stopids']; // comma-separated list of stop ids // TODO:validate.

	extract(getIntTimeAndServiceId());
	echo getNextDepartures($stopids, $date_as_int, $service_id);
}
else {
	header("HTTP/1.0 400 Bad Request");
	exit;
}

function getQuery($stopids, $hhmm, $service_id) {
	extract(getDepartureFrame($hhmm));

	return <<<EOT
	select
		r.agency_id,
		r.route_short_name,
		t.terminus_name,
		a.departure_time,
		(("$departure_now") > t.trip_start_time) trip_started,
		t.trip_id,
		t.block_id,
		t.terminus_id,
		rt.ADHERENCE,
		rt.VEHICLE,
		a.stop_id,
		a.stop_name,
		round(time_to_sec(timediff(timediff(a.departure_time, sec_to_time(coalesce(rt.ADHERENCE*60, 0))), ("$departure_now")))/60) wait_time,
		a.stop_sequence,
		lcase(tw.status) status,
		tw.text message,
		tw.source source,
		tw.id tweet_id
	from gtfs_routes r,
		(
		select st.departure_time, st.stop_sequence, st.trip_id, st.stop_id, s.stop_name from gtfs_stops s, gtfs_stop_times st
		
		where s.stop_id = st.stop_id
		and s.stop_id in ($stopids)
		) a,

		gtfs_trips t
	left join bus_realtime rt
		on (rt.blockid = t.block_id or rt.TRIPID = t.trip_id)
    left join service_tweets tw
    	on (tw.trip_id = t.trip_id or tw.block_id = t.block_id)

	where a.trip_id = t.trip_id
	and r.route_id = t.route_id
	and t.service_id = ("$service_id")
	and timediff(a.departure_time, sec_to_time(coalesce(rt.ADHERENCE*60, 0))) >= ("$departure_min")
	and a.departure_time < ("$departure_max")

	order by a.departure_time asc, r.route_id asc
	limit 16
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
		"terminus_id",
		"adherence",
		"vehicle",
		"stop_id",
		"stop_name",
		"wait",
		"stop_sequence",
		"status",
		"message",
		"source",
		"tweet_id"
	);
}

function getNextDepartures($stopids, $hhmm, $service_id) {
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
	select r.route_short_name r, t.terminus_name, a.departure_time, (("21:00:00") > t.trip_start_time) trip_started, t.trip_id, t.block_id, t.terminus_id, rt.ADHERENCE, rt.VEHICLE, a.stop_id,
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

	// Attempt to get trip statuses on the spot.
	// Give up after short timeout to not block the UIs.
	// TODO: use result value to refine output.
	$tripStatusResult = getJson($tripStatusesUrl, 4);

	extract(getDepartureFrame($hhmm));
	$queryResults = getFromQuery(
		$_DB,
		getQuery($stopids, $hhmm, $service_id),
		getQueryVars()
	);

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
			$stopInfo["wait"] = (int)$wait;	
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
				"url" => "https://twitter.com/$source/status/$tweet_id"
			);
		}

		unset(
			$stopInfo["message"],
			$stopInfo["status"],
			$stopInfo["source"],
			$stopInfo["tweet_id"]
		);

		$stopNames[$stop_id] = $stop_name;

		$prevEntry = $stopInfo;
		if ($usePrevEntry) $result[count($result) - 1] = $stopInfo;
		else array_push($result, $stopInfo);
	}

	$output = "{\"reqtime\": $hhmm, \"service_id\": \"$service_id\", "
		. "\"departures\": " . json_encode($result) . ", "
		. "\"stops\":" . json_encode($stopNames)
		. "}";

	mysqli_close($_DB);
	return $output;
}
?>