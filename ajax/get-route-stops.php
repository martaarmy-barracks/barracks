<?php
header("Content-Type: application/json");

include("stop-funcs.php");
include("../lib/db.php");

if(isset($_REQUEST["routeid"])) {
	init_db();
	$routeId = $_REQUEST["routeid"];

	$query = <<<EOT
select a.shape_id, st.stop_id, s.stop_name, s.stop_lat, s.stop_lon from gtfs_stop_times st, gtfs_stops s,
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

    $result = getFromQuery($_DB, $query, array("shape_id", "stop_id", "stop_name", "stop_lat", "stop_lon"));
    mysqli_close($_DB);

    $output = array();
    // Group results by shape id
    foreach ($result as $item) {
        extract($item);

        $outputShape = $output[$shape_id];
        // Create array for shape if it doesn't exist.
        if ($outputShape == null) {
            $outputShape = array(
                "stops" => array()
            );
        }

        $outputShape["stops"][] = array(
            "id" => $stop_id,
            "name" => $stop_name,
            "lat" => $stop_lat,
            "lon" => $stop_lon
        );
        $output[$shape_id] = $outputShape;
    }

    // Compute trip direction (N (northbound), S...)
    foreach ($output as $key => $item) {
        $stopsArr = $item["stops"];
        $stop1 = $stopsArr[0];
        $stopN = $stopsArr[count($stopsArr) - 1];
        $dlat = $stop1["lat"] - $stopN["lat"];
        $dlon = $stop1["lon"] - $stopN["lon"];

        $degrees = $dlon == 0 ? 0 : (180/M_PI * atan($dlat / $dlon));
        if ($dlon > 0) $degrees += 180;

        $direction = "";
        if ($degrees >= -45 && $degrees < 45) $direction = "E";
        else if ($degrees >= 45 && $degrees < 135) $direction = "N";
        else if ($degrees >= 135 && $degrees < 225) $direction = "W";
        else if ($degrees >= 225 && $degrees <= 270) $direction = "S";
        else if ($degrees >= -180 && $degrees < -135) $direction = "W";
        else if ($degrees >= -135 && $degrees < -45) $direction = "S";

        $output[$key]["direction"] = $direction;
    }
	echo json_encode($output);
}
else {
	exit(json_encode(array("status"=>"failure")));
}

/*
Output for:
http://barracks.martaarmy.org/ajax/get-route-stops.php?routeid=14901
{
    "117365": {
      "stops": [
        {
          "id": "907473",
          "name": "NORTH AVE STATION",
          "lat": "33.771910",
          "lon": "-84.387170"
        },
        {
          "id": "212029",
          "name": "PONCE DE LEON AVE NE @ JUNIPER ST NE",
          "lat": "33.772361",
          "lon": "-84.383497"
        },
        [...]
*/
?>
