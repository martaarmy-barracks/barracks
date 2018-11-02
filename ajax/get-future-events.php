<?php
header('Content-Type: application/json');

include('../lib/db.php');
init_db();

$stmt = $_DB->prepare(
	"SELECT * from events where DATE_ADD(date, INTERVAL -cutoffhours HOUR) >= CONVERT_TZ(NOW(), '+00:00', '-05:00') order by date asc"
);

$stmt->execute();
$results = $stmt->get_result();

$userid = 503;
$events = array();

while ($row = $results->fetch_array(MYSQLI_NUM)) {
	$eventInfo = array();

	$eventInfo['id'] = $row[0];
	$eventInfo['date'] = $row[1];
	$eventInfo['name'] = $row[2];
	$eventInfo['url'] = $row[3];
	$eventInfo['cutoffhours'] = $row[4];

	array_push($events, $eventInfo);
}	

echo json_encode($events);
?>
