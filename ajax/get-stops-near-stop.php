<?php
header('Content-Type: application/json');

include('../lib/db.php');
init_db();

$disable = false;

$sid = $_REQUEST['sid']; // 133387 no prefix
$dist = 0.004; // roughly 400m, 1/4 mile each side. // (double)$_REQUEST['radius'];
$script_result = array();

/*
select distinct st.stop_id, t.trip_headsign, POWER(s.stop_lat - 33.722031, 2) + POWER(s.stop_lon + 84.464254, 2) d2
from gtfs_stop_times st, gtfs_trips t, gtfs_stops s

where st.trip_id = t.trip_id
and s.stop_id = st.stop_id
and st.stop_id in (122006, 122316, 122320, 122002, 122255, 213092, 900111, 210772)

and t.route_id not in (8766, 8746, 8748, 8747)
and t.route_id not in (
    select t.route_id from gtfs_stop_times st, gtfs_trips t
    where st.stop_id = 122387
    and st.trip_id = t.trip_id
)
    order by d2 
) t1 group by trip_headsign
) t2

*/


// Step 1 -  Get lat long for specified stop.
$stmt = $_DB->prepare(
	"SELECT stop_lat, stop_lon FROM gtfs_stops where (stop_id = ?)"
);
$stmt->bind_param('s', $sid);
$stmt->execute();
$results = $stmt->get_result();

$lat = 0;
$lon = 0;

while ($row = $results->fetch_array(MYSQLI_NUM)) {
	$lat = $row[0];
	$lon = $row[1];	
}	
$script_result['lat'] = $lat;
$script_result['lon'] = $lon;


// Step 2 - Get stops within boundaries, except specified stop.
$lat1 = $lat - $dist;
$lat2 = $lat + $dist;
$lon1 = $lon - $dist;
$lon2 = $lon + $dist; 
$stmt = $_DB->prepare(

	"SELECT 1, GROUP_CONCAT(stop_id SEPARATOR ', ') FROM gtfs_stops where (stop_lat between (?) and (?)) and (stop_lon between (?) and (?)) and (stop_id <> (?)) group by 1"

);

$stmt->bind_param('dddds', $lat1, $lat2, $lon1, $lon2, $sid);
$stmt->execute();
$results = $stmt->get_result();

$stoplist = "";
while ($row = $results->fetch_array(MYSQLI_NUM)) {
	$stoplist = $stoplist . $row[1];
}	
$script_result['stop_list'] = $stoplist;



// Step 3 - Find unique trip IDs at nearby stops that are not stopping at the initial stop (122387)
$stmt = $_DB->prepare(
	"SELECT distinct stop_id from ( " .
	"SELECT stop_id, trip_headsign, count(trip_headsign) from ( " .

		"SELECT distinct st.stop_id, t.trip_headsign, POWER(s.stop_lat - (?), 2) + POWER(s.stop_lon - (?), 2) d2 " .
		"from gtfs_stop_times st, gtfs_trips t, gtfs_stops s " .
		
		"where st.trip_id = t.trip_id " .
		"and s.stop_id = st.stop_id " .
		"and st.stop_id in (" . $stoplist . ") " .
		
		"and t.route_id not in (8766, 8746, 8748, 8747) " . // rail lines
		"and t.route_id not in ( " .
			"select t.route_id from gtfs_stop_times st, gtfs_trips t where (stop_id = (?)) " .
			"and st.trip_id = t.trip_id " .
		") " .
		
		"order by d2 " . 
	") t1 group by trip_headsign " .
	") t2 "
);
$stmt->bind_param('dds', $lat, $lon, $sid);
$stmt->execute();
$results = $stmt->get_result();


while ($row = $results->fetch_array(MYSQLI_NUM)) {
	$stopInfo = array();

	$stopInfo['stop_id'] = $row[0];

	array_push($script_result, $stopInfo);
}	


echo json_encode($script_result);
?>
