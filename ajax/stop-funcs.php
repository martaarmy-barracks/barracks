<?php
function getStopName($_DB, $stopId) {
	$result1 = getOneFromQuery($_DB, "select stop_name, orientation from gtfs_stops where stop_id = ($stopId)", array('stopName', 'orientation'));
	return $result1 != null ? $result1 : ["stopName" => null, "orientation" => null];
}

function getStopsAtLocationQuery($lat, $lon, $dist) {
	$lat1 = $lat - $dist;
	$lat2 = $lat + $dist;
	$lon1 = $lon - $dist;
	$lon2 = $lon + $dist; 

	return "SELECT stop_id, stop_code, stop_name, stop_lat, stop_lon, active FROM gtfs_stops where (stop_lat between ($lat1) and ($lat2)) and (stop_lon between ($lon1) and ($lon2))";
}

function getStopsAtLocation($_DB, $lat, $lon, $dist) {
	$results = array();
	if ($queryResult = $_DB->query(getStopsAtLocationQuery($lat, $lon, $dist))) {
		while ($row = $queryResult->fetch_array(MYSQLI_NUM)) {
			$results[] = [
				'id' => 'MARTA_' . $row[0], // FIXME: remove this old ARC OneBusAway nomenclature.
				'code' => 'MARTA_' . $row[1],
				'name' => $row[2],
				'lat' => $row[3],
				'lon' => $row[4]
			];
		}
		$queryResult->close();
	}
	return $results;
}

function getFromQuery($_DB, $query, $fields) {
	$results = array();
	if ($r = $_DB->query($query)) {
		while ($row = $r->fetch_array(MYSQLI_NUM)) {
			$results[] = makeEntry($row, $fields);
		}
		$r->close();
	}
	return $results;
}

function getOneFromQuery($_DB, $query, $fields) {
	$result = null;
	if ($r = $_DB->query($query)) {
		$result = makeEntry($r->fetch_row(), $fields);
		$r->close();
	}
	return $result;
}

function makeEntry($row, $fields) {
	$result = array();
	for ($i = 0; $i < count($fields); $i++) {
		$result[$fields[$i]] = $row[$i];
	}
	return $result;
}

function getIntTimeAndServiceId() {
	$date_as_int = intval(date("Gi"));
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
	$service_id = 5; // MARTA Weekday
	if ($day_code == "6") {
		$service_id = 3; // MARTA Saturday
	}
	else if ($day_code == "7") {
		$service_id = 4; // MARTA Sunday
	}


	// TODO: Hack for holidays...
	$date_Ymd = date("Y-m-d");
	$date_md = date("m-d");

	// Fixed days.
	// New Years Day - Sunday
	if ($date_md == "01-01") {
		$service_id = 4;
	}
	// 4th July - Sunday
	if ($date_md == "07-04") {
		$service_id = 4;
	}
	// Christmas - Sunday + (unpublished) exceptions for rail.
	if ($date_md == "12-25") {
		$service_id = 4;
	}
	// New Years Eve - Saturday + (unpublished) exceptions for rail.
	if ($date_md == "12-31") {
		$service_id = 3;
	}

	// Variable Days (to be completed)
	// MLK - Saturday (MARTA)
	if ($date_md == "01-20") {
		$service_id = 3;
	}

	// Memorial Day - Sunday (MARTA)
	if ($date_md == "05-25") {
		$service_id = 4;
	}
	

	// Debugging
	if (isset($_REQUEST['testhour'])) {
		$date_as_int = $_REQUEST['testhour'];
	}
	if (isset($_REQUEST['testday'])) {
		$day_name = $_REQUEST['testday'];
		if ($day_name == "WEEKDAY") $service_id = 5;
		if ($day_name == "SATURDAY") $service_id = 3;
		if ($day_name == "SUNDAY") $service_id = 4;
	}
	
	return compact("date_as_int", "service_id");
}

// Get departure times from -1 mins prior to 1:45 mins after - determined based on request time.
function getDepartureFrame($hhmm) {
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

	return compact("departure_now", "departure_min", "departure_max");
}

function getStopRoutes($_DB, $stopId) {
    $query = <<<EOT
select r.agency_id, r.route_short_name
from gtfs_routes r, 
(
select distinct st.stop_id, t.route_id from gtfs_stop_times st, gtfs_trips t
where st.trip_id = t.trip_id
and st.stop_id = ($stopId)
) t1

where t1.route_id = r.route_id
order by route_short_name asc
EOT;

	return getFromQuery($_DB, $query, array('agency_id', 'route_short_name'));
}

function getStopsRoutes($_DB, $stopIds) {
	$query = <<<EOT
select r.agency_id, r.route_short_name
from gtfs_routes r, 
(
select distinct st.stop_id, t.route_id from gtfs_stop_times st, gtfs_trips t
where st.trip_id = t.trip_id
and st.stop_id in ($stopIds)
) t1

where t1.route_id = r.route_id
order by route_short_name asc
EOT;

return getFromQuery($_DB, $query, array('agency_id', 'route_short_name'));
}

?>
