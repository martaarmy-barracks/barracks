<?php
header('Content-Type: application/json');

include('stop-funcs.php');
include('../lib/db.php');
init_db();

$stopIdReq = trim($_REQUEST['ids']);
$ids = explode(',', $stopIdReq);

$results = array();
foreach ($ids as $id) {
    $shapeCountQuery = "select count(*) count from gtfs_shapes where shape_id = ($id)";
    $shapeCount = getOneFromQuery($_DB, $shapeCountQuery, array("count"))["count"];
    $query = <<<EOT
    SELECT shape_pt_lat, shape_pt_lon FROM gtfs_shapes WHERE shape_id = ($id)
    and (
        ($shapeCount) <= 4000
        or shape_pt_sequence MOD (round((($shapeCount)+5000)/2000, -1)) = 1
    )
    ORDER BY shape_pt_sequence
EOT;

    $rawResult = getFromQuery($_DB, $query, array("shape_pt_lat", "shape_pt_lon"));

    $func = function($pt) {
        return array($pt["shape_pt_lat"], $pt["shape_pt_lon"]);
    };

    $transformedResult = array_map($func, $rawResult);
    $results[$id] = $transformedResult;
}

mysqli_close($_DB);

$output = 
    str_replace('","', ',',
    str_replace('"]', ']',
    str_replace('["', '[', json_encode($results))));
echo $output;
?>
