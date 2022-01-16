<?php
// used by the map to get the routes (+agency) at a stop.
header('Content-Type: application/json');

include('../lib/db.php');
include("../lib/cors.php");
include('stop-funcs.php');

if (isset($_REQUEST['stops'])) {
  init_db();
	$stopCodes = trim($_REQUEST['stops']); // comma-separated list of stop ids // TODO:validate.

  $query = <<<EOT
select r.agency_id, r.route_short_name
from gtfs_routes r,
(
select distinct t.route_id from gtfs_stops s, gtfs_stop_times st, gtfs_trips t
where st.trip_id = t.trip_id
and st.stop_id = s.stop_id
and s.stop_code in ($stopCodes)
) t1

where t1.route_id = r.route_id
order by route_short_name asc
EOT;

  echo json_encode(getFromQuery($_DB, $query, array('agency_id', 'route_short_name')));
  mysqli_close($_DB);
}
else {
	header("HTTP/1.0 400 Bad Request");
	exit;
}

/*
Output for:
http://barracks.martaarmy.org/ajax/get-stop-routes-2.php?stops=904800[,...]
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
