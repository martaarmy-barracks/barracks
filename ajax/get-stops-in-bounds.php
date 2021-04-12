<?php
header('Content-Type: application/json');

include('stop-funcs.php');
include("../lib/cors.php");
include('../lib/db.php');
init_db();

if(  isset($_REQUEST['ne_lat']) && isset($_REQUEST['ne_lon'])
	&& isset($_REQUEST['sw_lat']) && isset($_REQUEST['sw_lon'])) {
	$ne_lat = $_REQUEST['ne_lat'];
	$ne_lon = $_REQUEST['ne_lon'];
	$sw_lat = $_REQUEST['sw_lat'];
	$sw_lon = $_REQUEST['sw_lon'];
	$agency = 'MARTA'; // for bus stops only, not for routes.
	$stopQuery = "SELECT stop_id, stop_name, stop_lat, stop_lon, active FROM gtfs_stops where (stop_lat between ($sw_lat) and ($ne_lat)) and (stop_lon between ($sw_lon) and ($ne_lon))";


	$query = <<<EOT
SELECT concat('$agency', '_', a.stop_id) stop_id, a.stop_name, a.stop_lat, a.stop_lon, a.active, b.reason, c.record_id
from ($stopQuery) a
left join 
(
	SELECT stopid, 'ADOPTED' reason FROM adoptedstops s WHERE s.agency='$agency' and s.abandoned <> 1
		union SELECT stopid, 'WRONGPOLE' reason FROM stopdb WHERE type <> 'SGN'
) b
on a.stop_id = b.stopid
left join stopcensus c
on a.stop_id = c.stop_id
EOT;

	echo json_encode(getFromQuery($_DB, $query, array('id', 'name', 'lat', 'lon', 'active', 'reason', 'record_id')));
}
else {
	echo "lat/lon parameters were not specified.";
}

mysqli_close($_DB);

?>