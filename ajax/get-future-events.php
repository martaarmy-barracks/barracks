<?php
header('Content-Type: application/json');

include('stop-funcs.php');
include('../lib/db.php');
init_db();

$query = "SELECT id, date, name, url, cutoffhours from events where DATE_ADD(date, INTERVAL -cutoffhours HOUR) >= CONVERT_TZ(NOW(), '+00:00', '-05:00') order by date asc";

$results = getFromQuery($_DB, $query, array("id", "date", "name", "url", "cutoffhours"));
echo json_encode($results);
mysqli_close($_DB);
?>
