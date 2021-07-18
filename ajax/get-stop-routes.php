<?php
// used by the map to get the routes (+agency) at a stop.
header('Content-Type: application/json');

include('../lib/db.php');
include("../lib/cors.php");
include('stop-funcs.php');
init_db();

$stopIdReq = trim($_REQUEST['stopid']);
echo json_encode(getStopRoutes($_DB, $stopIdReq));
mysqli_close($_DB);

/*
Output for:
http://barracks.martaarmy.org/ajax/get-stop-routes.php?stopid=904800
(Gets routes (with agency) at a particular stop)

  [
    {
      "agency_id": "MARTA",
      "route_short_name": "27"
    },
    {
      "agency_id": "CCT",
      "route_short_name": "10"
    },
    ...
  ]
}*/
?>
