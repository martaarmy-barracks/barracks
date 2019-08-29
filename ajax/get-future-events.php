<?php
header('Content-Type: application/json');

include('../lib/db.php');
init_db();

if (!$queryResult = $_DB->query("SELECT id, date, name, url, cutoffhours from events where DATE_ADD(date, INTERVAL -cutoffhours HOUR) >= CONVERT_TZ(NOW(), '+00:00', '-05:00') order by date asc")) {
	exit(json_encode(array('status'=>'failure')));
}

$results = array();
while ($row = $queryResult->fetch_array(MYSQLI_NUM)) {
	$results[] = [
		'id' => $row[0],
		'date' => $row[1],
		'name' => $row[2],
		'url' => $row[3],
		'cutoffhours' => $row[4]
	];
}
echo json_encode($results);

mysqli_close($_DB);
?>
