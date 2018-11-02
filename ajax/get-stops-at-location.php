<?php
header('Content-Type: application/json');

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


$lat1 = $lat - $dist;
$lat2 = $lat + $dist;
$lon1 = $lon - $dist;
$lon2 = $lon + $dist; 
$stmt = $_DB->prepare(

"SELECT * FROM gtfs_stops where (stop_lat between (?) and (?)) and (stop_lon between (?) and (?))"

);

$stmt->bind_param('dddd', $lat1, $lat2, $lon1, $lon2);
$stmt->execute();
$results = $stmt->get_result();

$stopResult = array();

while ($row = $results->fetch_array(MYSQLI_NUM)) {
	$stopInfo = array();

	$stopInfo['id'] = 'MARTA_' . $row[0];
	$stopInfo['code'] = $row[1];
	$stopInfo['name'] = $row[2];
	$stopInfo['lat'] = $row[3];
	$stopInfo['lon'] = $row[4];

	array_push($stopResult, $stopInfo);
}	

echo json_encode($stopResult);
?>
