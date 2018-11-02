<?php

header('Content-Type: application/json');

function finishWith($status) {
	exit(json_encode(array('status'=>$status)));
}

include('../../lib/db.php');
init_db();

include('../../lib/admindb.php');

$routes = trim($_REQUEST['routes']);
$expdate = trim($_REQUEST['expdate']);

echo json_encode(expireStopsWithChangedRoutes($routes, $expdate));

function expireStopsWithChangedRoutes($routes, $expdate) {
	global $_DB;
	$routesArray = explode(',', $routes);
	$routeCount = count($routesArray);


	$inQuery = "'," . implode(",|,", $routesArray) . ",'";

	// adoptedstops which routes have changed are marked expired. 
	$query = "update adoptedstops a set a.dateexpire = '$expdate' WHERE a.abandoned = 0 and a.routes regexp $inQuery";

	$stmt = $_DB->prepare($query);
	
	if (!($stmt->execute())) {
		$results = $errorMsg = "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
	}
	else {
		$results = "Success";
	}

	
//	return $output;
return $results;
}

?>