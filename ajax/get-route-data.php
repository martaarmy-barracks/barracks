<?php
// used by signdirect.php and others.
header('Content-Type: application/json');

include('../lib/db.php');
init_db();

$stopIdReq = trim($_REQUEST['stopid']);
echo getRouteData($stopIdReq);
mysqli_close($_DB);

function getRouteData($stopCode) {
	global $_DB;

	$query2 = "select stop_id from gtfs_stops where stop_code = ($stopCode)";
	if (!$queryResult2 = $_DB->query($query2)) {
		exit(json_encode(array('status'=>'failure')));
	}
	
	$stopId = null;
	while ($row = $queryResult2->fetch_array(MYSQLI_NUM)) {
		$stopId = $row[0];
		break;	
	}


	$query = <<<EOT
select CONCAT('{\"route\": \"', route_short_name, '\", \"route_id\": \"', route_id, '\", \"terminii\": [',
              GROUP_CONCAT(distinct concat(
              '{\"stop_id\": \"', stop_id,  
              '\", \"stop_name\": \"', stop_name,  
              '\", \"direction_id\": \"', direction_id,  
              '\", \"is_station\": ', is_station,
                 '}'
                  
              ) separator ',')

              
              ,']}') routedata from 

(SELECT bt.route_short_name, bt.route_id, bt.stop_id, bt.stop_name, bt.direction_id, bt.is_station
FROM gtfs_stop_times st, gtfs_trips t, bus_terminus bt
WHERE st.trip_id = t.trip_id
and bt.route_id = t.route_id
and st.stop_id = ($stopId)
) x

group by x.route_id
EOT;

/*
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

	if (!$queryResult = $_DB->query($query)) {
		exit(json_encode(array('status'=>'failure')));
	}
	
	$output = "{\"stop_id\": \"" . $stopCode . "\", \"routes\": [";
	$first = true;
	while ($row = $queryResult->fetch_array(MYSQLI_NUM)) {
		if (!$first) $output .= ",";
		$output .= $row[0];
		$first = false;
	}
		
	$output .= "]}";
	return $output;
}
?>