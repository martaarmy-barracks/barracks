<?php
header("Content-Type: application/json");

include("stop-funcs.php");
include("../lib/db.php");

if(isset($_REQUEST["lat"]) && isset($_REQUEST["lon"])) {
	init_db();
	$lat = $_REQUEST["lat"];
	$lon = $_REQUEST["lon"];
	$agency = "MARTA"; // for bus stops only, not for routes.
	$stopQuery = getStopsAtLocationQuery($lat, $lon, 0.008);

	$query = <<<EOT
SELECT concat("$agency", "_", a.stop_id) stop_id, a.stop_name, a.stop_lat, a.stop_lon, a.active, b.reason
from ($stopQuery) a
left join
(
	SELECT stopid, "ADOPTED" reason FROM adoptedstops s WHERE s.agency="$agency" and s.abandoned <> 1
		union SELECT stopid, "WRONGPOLE" reason FROM stopdb WHERE type <> "SGN"
) b
on a.stop_id = b.stopid
EOT;

	echo json_encode(getFromQuery($_DB, $query, array("id", "name", "lat", "lon", "active", "reason")));
	mysqli_close($_DB);
}
else {
	echo "lat/lon parameters were not specified.";
}

?>