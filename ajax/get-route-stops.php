<?php
header("Content-Type: application/json");

include("stop-funcs.php");
include("../lib/cors.php");
include("../lib/db.php");

if(isset($_REQUEST["routeid"])) {
	init_db();
	$routeId = $_REQUEST["routeid"];
	$agency = 'MARTA'; // for bus stops only, not for routes.

    // TODO: remove duplicate stop ids in stopcensus table.
	$query = <<<EOT
select a2.shape_id, a2.direction_id, concat('$agency', '_', a2.stop_id) stop_id, a2.stop_name, a2.stop_lat, a2.stop_lon, 1 active,
max(c.record_id),
c.seating, c.shelter, c.trash_can,
c.sidewalk,
c.boarding_area,
c.main_street_crosswalk,
c.cross_street_crosswalk,
c.traffic_light,
c.crosswalk_signals,
c.curb_cuts,
c.crossing_audio,
c.tactile_guide,
c.obstacles,
c.wayfinding_accessibility

from
(
select a1.shape_id, a1.direction_id, a1.first_trip_id, st.stop_id, st.stop_sequence, s.stop_name, s.stop_lat, s.stop_lon
from gtfs_stop_times st, gtfs_stops s,
(
select t.shape_id, min(t.trip_id) first_trip_id, t.direction_id from gtfs_trips t
where t.route_id = ($routeId)
group by shape_id
) a1
where st.trip_id = a1.first_trip_id
and s.stop_id = st.stop_id

) a2 left join stopcensus c
on a2.stop_id = c.stop_id
group by a2.shape_id, a2.stop_id
order by a2.first_trip_id asc, a2.stop_sequence asc
EOT;

    $result = getFromQuery($_DB, $query, array(
        "shape_id", "direction_id", "stop_id", "stop_name", "stop_lat", "stop_lon", "active",
        "record_id", "seating", "shelter", "trash_can",
        "sidewalk",
        "boarding_area",
        "main_street_crosswalk",
        "cross_street_crosswalk",
        "traffic_light",
        "crosswalk_signals",
        "curb_cuts",
        "crossing_audio",
        "tactile_guide",
        "obstacles",
        "wayfinding_accessibility"
    ));
    mysqli_close($_DB);

    $output = array();
    // Group results by shape id
    foreach ($result as $item) {
        extract($item);

        $directionIdStr = "direction_$direction_id";
        $outputDirection = $output[$directionIdStr];

        // Create array for direction_id it doesn't exist.
        if ($outputDirection == null) {
            $outputDirection = array(
                "direction_id" => $direction_id,
                "shapes" => array()
            );
        }

        $outputShape = $outputDirection["shapes"][$shape_id];

        // Create array for shape if it doesn't exist.
        if ($outputShape == null) {
            $outputShape = array(
                "stops" => array()
            );
        }

        // Compute score
        $score = 0;
        if ($shelter == "Yes") $score += 10;
        if ($seating == "Yes") $score += 10;

        //$score += 5; // customer service always present, subtract 5 from next criteria.
        if ($wayfinding_accessibility == "No") $score += 4; //Some wayfinding, not wheelchair accessible: partial credit.
        else if ($wayfinding_accessibility == "Yes") $score += 8; // Some wayfinding, wheelchair accessible

        if ($sidewalk != "No") $score += 25; // Yes, sidewalk in at least one direction.
        if ($trash_can == "Yes") $score += 2;
        if ($main_street_crosswalk == "Yes") {
            // count main street crosswalk amenities
            $mainCrosswalkAmenities = 0;
            if ($traffic_light == "Yes") $mainCrosswalkAmenities++;
            if ($crosswalk_signals == "Yes") $mainCrosswalkAmenities++;
            if ($curb_cuts == "Yes") $mainCrosswalkAmenities++;
            if ($crossing_audio == "Yes") $mainCrosswalkAmenities++;
            if ($tactile_guide == "Yes") $mainCrosswalkAmenities++;

            if ($mainCrosswalkAmenities == 0) $score += 5;
            else if ($mainCrosswalkAmenities <= 1) $score += 10;
            else if ($mainCrosswalkAmenities > 2) $score += 25;
        }

        if ($boarding_area == "Asphalt") $score += 5;
        else if ($boarding_area == "Concrete sidewalk" || $boarding_area == "Brick pavers") $score += 20;


        $outputShape["stops"][] = array(
            "id" => $stop_id,
            "name" => $stop_name,
            "lat" => $stop_lat,
            "lon" => $stop_lon,
            "record_id" => $record_id,
            "census" => $record_id == null ? null : array(
                "seating" => $seating,
                "shelter" => $shelter,
                "trash_can" => $trash_can,
                "sidewalk" => $sidewalk,
                "boarding_area" => $boarding_area,
                "main_street_crosswalk" => $main_street_crosswalk,
                "cross_street_crosswalk" => $cross_street_crosswalk,
                "traffic_light" => $traffic_light,
                "crosswalk_signals" => $crosswalk_signals,
                "curb_cuts" => $curb_cuts,
                "obstacles" => $obstacles,

                "score" => $score
            )
        );
        $outputDirection["shapes"][$shape_id] = $outputShape;
        $output[$directionIdStr] = $outputDirection;
    }

    // Compute trip direction (N (northbound), S...)
    foreach ($output as $key => $item) {
        // Use the first shape to compute direction.
        $firstShape = $item["shapes"][
            array_keys($item["shapes"])[0]
        ];

        $stopsArr = $firstShape["stops"];
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
          "lon": "-84.387170",
          "census": {
              // bus stop census attributes.
          }
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
