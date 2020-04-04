<?php
include("updater-presets.php");

function appendData($sourceTableName, $sourceCsv) {
    global $_DB;
    $v = $_DB->query("LOAD DATA LOCAL INFILE '" . $sourceCsv . "' INTO TABLE $sourceTableName FIELDS TERMINATED BY ',' IGNORE 1 LINES ");
    if (!$v) error("Error loading $sourceCsv into $sourceTableName");
}

function postProcess() {
    global $_DB;
    $agency = "CCT";
    $v = $_DB->query("update gtfs_routes set agency_id = '$agency' where route_id between 2000 and 2999");
    if (!$v) error("Error adding agency CCT.");
}

// Load data into staging tables
appendData("gtfs_routes", "$gtfsDir/cobb_routes.txt");
appendData("gtfs_stop_times", "$gtfsDir/cobb_stop_times.txt");
appendData("gtfs_trips", "$gtfsDir/cobb_trips.txt");

postProcess();

finish("Regional GTFS Loading");
?>
