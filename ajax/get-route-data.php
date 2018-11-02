<?php
header('Content-Type: application/json');

function finishWith($status) {
	exit(json_encode(array('status'=>$status)));
}

include('../lib/db.php');
init_db();

$stopIdReq = trim($_REQUEST['stopid']);

echo getRouteData($stopIdReq);

function getRouteData($stopId) {
	global $_DB;

	/*
select CONCAT('{\"route\": \"', route_short_name, '\", \"route_id\": \"', route_id, '\", \"terminii\": [',
              GROUP_CONCAT(distinct concat(
              '{\"stop_id\": \"', stop_id,  
              '\", \"stop_name\": \"', stop_name,  
              '\", \"direction_id\": \"', direction_id,  
              '\", \"is_station\": ', is_station,
                 '}'
                  
              ) separator ',')

              
              ,']}') routedata from 

(SELECT bt.route_short_name, bt.route_id, bt.stop_id, bt.stop_name, bt.direction_id, bt.is_station FROM gtfs_stop_times st, gtfs_trips t, bus_terminus bt
WHERE st.trip_id = t.trip_id
and bt.route_id = t.route_id
and st.stop_id = 901229
) x

group by x.route_id
	


Output for:
http://barracks.martaarmy.org/ajax/get-route-data.php?stopid=901229
(Gets route data for routes at a particular stop)

{"stop_id": "901230", "routes": [
	{"route": "36", "route_id": "7656", terminii: [
		{stop_id:'900349', stop_name:'MOORES MILL SHOP CTR', direction_id: 0, is_station: 0},
		{stop_id:'907473', stop_name:'NORTH AVE STATION', direction_id: 1, is_station: 1}
		]
	},
	...
]}
	*/

	$query = 
	"select CONCAT('{\"route\": \"', route_short_name, '\", \"route_id\": \"', route_id, '\", \"terminii\": [', " .
		"GROUP_CONCAT(distinct concat( " .
		"'{\"stop_id\": \"', stop_id, " .
		"'\", \"stop_name\": \"', stop_name, " .
		"'\", \"direction_id\": \"', direction_id, " .
		"'\", \"is_station\": ', is_station, " .
		"'}' " .
			
		") separator ',') " .
		",']}') routedata from " .

		"(SELECT bt.route_short_name, bt.route_id, bt.stop_id, bt.stop_name, bt.direction_id, bt.is_station FROM gtfs_stop_times st, gtfs_trips t, bus_terminus bt " .
		"WHERE st.trip_id = t.trip_id " .
		"and bt.route_id = t.route_id " .
		"and st.stop_id = (?) " .
		") x " .

		"group by x.route_id";





	$stmt = $_DB->prepare($query);
	$stmt->bind_param('s', $stopId);

	if (!($stmt->execute())) {
		$errorMsg = "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
	}

	$results = $stmt->get_result()->fetch_all(MYSQLI_NUM);	

	$output = "{\"stop_id\": \"" . $stopId . "\", \"routes\": [";
	$first = true;
	foreach ($results as $r) {
		if (!$first) $output .= ",";
		$output .= $r[0];
		$first = false;
	}
	$output .= "]}";
	return $output;
}

?>