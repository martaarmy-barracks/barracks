<?php
// Get route info from route id.
header('Content-Type: application/json');

include("../lib/cors.php");
include('../lib/db.php');
include('stop-funcs.php');

$routeQuery = null;
if(isset($_REQUEST["routeid"])) {
	$routeId = $_REQUEST["routeid"];
  $routeQuery = "r.route_id = ($routeId)";
}
if(isset($_REQUEST["routenum"])) {
	//$routeParts = explode("_", $_REQUEST["routenum"]);
  //$agencyId = $routeParts[0]; 
  //$routeNum = $routeParts[1]; 
  //$routeQuery = "r.agency_id = ($agencyId) and r.route_short_name = ($routeNum)";
	$routeNum = $_REQUEST["routenum"];
  $routeQuery = "r.route_short_name = ($routeNum)";
}

if ($routeQuery != null) {
  init_db();

  $query = <<<EOT
select r.agency_id, r.route_id, r.route_short_name, r.route_long_name
from gtfs_routes r
where ($routeQuery)
EOT;
  
  $result = getFromQuery($_DB, $query, array('agency_id', 'route_id', 'route_short_name', 'route_long_name'));
  mysqli_close($_DB);
    
  echo json_encode($result);
}
?>
