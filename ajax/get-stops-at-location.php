<?php
header('Content-Type: application/json');

include('stop-funcs.php');
include('../lib/db.php');
init_db();

$disable = false;

$lat = (double)$_REQUEST['lat'];
$lon = (double)$_REQUEST['lon'];
$dist = (double)$_REQUEST['radius']; // 0.005; // roughly 500m

if ($disable) {
	$dist = 0;
	$lat = 0;
	$lon = 0;
}

echo json_encode(getStopsAtLocation($_DB, $lat, $lon, $dist));

mysqli_close($_DB);
?>