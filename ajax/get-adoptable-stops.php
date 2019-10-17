<?php
header('Content-Type: application/json');

include('stop-funcs.php');
include('../lib/db.php');
init_db();

if(isset($_REQUEST['lat']) && isset($_REQUEST['lon'])) {
	$lat = $_REQUEST['lat'];
	$lon = $_REQUEST['lon'];
	$agency = 'MARTA';
	$query = "SELECT concat('$agency', '_', a.stop_id) stop_id, a.stop_name, a.stop_lat, a.stop_lon, b.reason from (" . getStopsAtLocationQuery($lat, $lon, 0.008) . ") a left join " .
			"(SELECT stopid, 'ADOPTED' reason FROM adoptedstops s WHERE s.agency='$agency' and s.abandoned <> 1 " .
			"union SELECT stopid, 'WRONGPOLE' reason FROM stopdb WHERE type <> 'SGN') b on a.stop_id = b.stopid";

	echo json_encode(getFromQuery($_DB, $query, array('id', 'name', 'lat', 'lon', 'reason')));
}
else {
	echo "lat/lon parameters were not specified.";
}

mysqli_close($_DB);
?>