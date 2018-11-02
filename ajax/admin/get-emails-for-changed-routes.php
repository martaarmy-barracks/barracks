<?php

header('Content-Type: application/json');

function finishWith($status) {
	exit(json_encode(array('status'=>$status)));
}

include('../../lib/db.php');
init_db();

include('../../lib/admindb.php');

$routes = trim($_REQUEST['routes']);

echo json_encode(getEmailsForRoutes($routes));

function getEmailsForRoutes($routes) {
	global $_DB;
	$routesArray = explode(',', $routes);
	$routeCount = count($routesArray);


	$inQuery = "'," . implode(",|,", $routesArray) . ",'";
	$errorMsg = "";

	// User info for stops which routes have changed. 
	$query = "SELECT distinct u.email from adoptedstops a, users u WHERE a.userid = u.id and a.abandoned = 0 and a.routes regexp $inQuery";

	$stmt = $_DB->prepare($query);
	
	if (!($stmt->execute())) {
		$errorMsg = "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
	}

	$results = $stmt->get_result()->fetch_all(MYSQLI_NUM);
	
//	return $output;
return $results;
}

?>