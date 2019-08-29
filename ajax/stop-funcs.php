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

	return "SELECT stop_id, stop_name, stop_lat, stop_lon FROM gtfs_stops where (stop_lat between ($lat1) and ($lat2)) and (stop_lon between ($lon1) and ($lon2))";
}

function getStopsAtLocation($_DB, $lat, $lon, $dist) {
	$results = array();
	if ($queryResult = $_DB->query(getStopsAtLocationQuery($lat, $lon, $dist))) {
		while ($row = $queryResult->fetch_array(MYSQLI_NUM)) {
			$results[] = [
				'id' => 'MARTA_' . $row[0],
				'name' => $row[1],
				'lat' => $row[2],
				'lon' => $row[3]
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
?>
