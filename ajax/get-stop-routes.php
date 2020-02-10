<?php
// used by the map to get the routes (+agency) at a stop.
header('Content-Type: application/json');

include('../lib/db.php');
include('stop-funcs.php');
init_db();

$stopIdReq = trim($_REQUEST['stopid']);
echo getStopRoutes($stopIdReq);
mysqli_close($_DB);

function getStopRoutes($stopId) {
	global $_DB;

    $query = <<<EOT
select r.agency_id, r.route_short_name
from gtfs_routes r, 
(
select distinct st.stop_id, t.route_id from gtfs_stop_times st, gtfs_trips t
where st.trip_id = t.trip_id
and st.stop_id = ($stopId)
) t1

where t1.route_id = r.route_id
EOT;

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

    return json_encode(getFromQuery($_DB, $query, array('agency_id', 'route_short_name')));
}
?>
