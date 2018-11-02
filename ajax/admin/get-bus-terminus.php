<?php

header('Content-Type: application/json');

function finishWith($status) {
	exit(json_encode(array('status'=>$status)));
}

include('../../lib/db.php');
init_db();

include('../../lib/admindb.php');

echo json_encode(getBusTerminus());

function getBusTerminus() {
	global $_DB;

/*
SELECT stop_id, stop_name, GROUP_CONCAT(distinct route_short_name order by route_short_name separator ',') routes
FROM bus_terminus WHERE 1 group by stop_id
*/

	$query = "SELECT stop_id, stop_name, GROUP_CONCAT(distinct route_short_name order by route_short_name separator ',') routes FROM bus_terminus WHERE 1 group by stop_id";

	$stmt = $_DB->prepare($query);
	if (!($stmt->execute())) {
		$errorMsg = "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
	}

	$results = $stmt->get_result()->fetch_all(MYSQLI_NUM);
	return $results;
}

?>