<?php
header('Content-Type: application/json');

include('../lib/db.php');
init_db();

$stopid = (double)$_REQUEST['stopid']; // 901789

$stmt = $_DB->prepare(
	"SELECT stop_name, orientation FROM gtfs_stops where stop_id = (?)"
);
$stmt->bind_param('s', $stopid);
$stmt->execute();
$results = $stmt->get_result();

$result = array();

while ($row = $results->fetch_array(MYSQLI_NUM)) {
	$result['stop_name'] = $row[0];
	$result['orientation'] = $row[1];
}	

echo json_encode($result);
?>
