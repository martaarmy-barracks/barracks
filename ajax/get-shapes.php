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
    SELECT * FROM gtfs_shapes WHERE shape_id = ($id)
    and (
        ($shapeCount) <= 4000
        or shape_pt_sequence MOD (round((($shapeCount)+5000)/2000, -1)) = 1
    )
    ORDER BY shape_pt_sequence
EOT;

    $results[$id] = getFromQuery($_DB, $query, array("shape_id", "shape_pt_lat", "shape_pt_lon", "shape_pt_sequence"));    
}

mysqli_close($_DB);

echo json_encode($results);
?>
