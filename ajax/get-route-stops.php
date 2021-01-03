<?php
header("Content-Type: application/json");

include("stop-funcs.php");
include("../lib/db.php");

if(isset($_REQUEST["routeid"])) {
	init_db();
	$routeId = $_REQUEST["routeid"];

	$query = <<<EOT
select a.shape_id, st.stop_id, st.stop_sequence, s.stop_name from gtfs_stop_times st, gtfs_stops s,
(
select t.shape_id, count(t.trip_id) trip_count, min(t.trip_id) first_trip_id from gtfs_trips t
where t.route_id = ($routeId)
group by shape_id
order by count(t.trip_id) desc
) a

where st.trip_id = a.first_trip_id
and s.stop_id = st.stop_id
order by a.first_trip_id asc, st.stop_sequence asc
EOT;

	echo json_encode(getFromQuery($_DB, $query, array("shape_id", "stop_id", "stop_sequence", "stop_name")));
	mysqli_close($_DB);
}
else {
	exit(json_encode(array("status"=>"failure")));
}

/*
Output for:
http://barracks.martaarmy.org/ajax/get-route-stops.php?routeid=14901
[
    {
        "shape_id": "1",
        "stop_id": "907473",
        "stop_sequence": "1",
        "stop_name": "NORTH AVE STATION"
	},
	[...]
    {
        "shape_id": "2",
        "stop_id": "212029",
        "stop_sequence": "1",
        "stop_name": "PONCE DE LEON AVE NE @ JUNIPER ST NE"
	},
	[...]
*/
?>
