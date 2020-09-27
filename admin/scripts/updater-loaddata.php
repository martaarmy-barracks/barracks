<?php
include("updater-presets.php");

function truncate($sourceTableName) {
    global $_DB;
    $v = $_DB->query("DELETE from $sourceTableName WHERE 1");
    if (!$v) error("Error truncating $sourceTableName\n");
    // else echo "Truncated $sourceTableName.\n";
}

function loadData($sourceTableName, $sourceCsv) {
    global $_DB;
    try {
        $v = $_DB->query("LOAD DATA LOCAL INFILE '" . $sourceCsv . "' INTO TABLE $sourceTableName FIELDS TERMINATED BY ',' IGNORE 1 LINES ");
        if (!$v) error("Error loading $sourceCsv into $sourceTableName.");
        // else echo "$sourceCsv was loaded into $sourceTableName"; 
    }
    catch (Exception $e) {
        error("Exception message: " . $e.message);
    }
}

function postProcess() {
    global $_DB;
    $agency = "MARTA";
    $v = $_DB->query("update gtfs_routes set agency_id = '$agency'");
    if (!$v) error("Error adding default agency.");
    
    $v = $_DB->query("update gtfs_trips set block_id = null");
    if (!$v) error("Error in processing blocks.");

    // COVID-19 - Mark stops active and inactive
    $v = $_DB->query("update gtfs_stops set active = 1");
    if (!$v) error("Error in setting stop active state.");
    $v = $_DB->query("insert into gtfs_stops select * from gtfs_stops_1 where stop_id not in (select stop_id from gtfs_stops)");
    if (!$v) error("Error in loading inactive stops.");
}

// Unzip flattened archive into same directory.
$zip = new ZipArchive;
if ($zip->open($gtfsArchiveName) === TRUE) {
    // Remove path info (it has to be done file by file).
    for($i = 0; $i < $zip->numFiles; $i++) {
        $filename = $zip->getNameIndex($i);
        $fileinfo = pathinfo($filename);
        copy("zip://".$gtfsArchiveName."#".$filename, "./".$fileinfo['basename']);
    }    
    $zip->close();
    echo "Unzip ok";
} else {
    error("Unzip failed");
}

// For some reason, the succession of truncate-load
// doesn't seem to work anymore, so we separate truncate from load.
// Truncate tables first.
truncate("gtfs_agency");
truncate("gtfs_calendar");
truncate("gtfs_calendar_dates");
truncate("gtfs_routes");
truncate("gtfs_shapes");
truncate("gtfs_stop_times");
truncate("gtfs_stops");
truncate("gtfs_trips");


// Load data into staging tables
loadData("gtfs_agency", "agency.txt");
loadData("gtfs_calendar", "$gtfsDir/calendar.txt");
loadData("gtfs_calendar_dates", "$gtfsDir/calendar_dates.txt");
loadData("gtfs_routes", "$gtfsDir/routes.txt");
loadData("gtfs_shapes", "$gtfsDir/shapes.txt");
loadData("gtfs_stop_times", "$gtfsDir/stop_times.txt");
loadData("gtfs_stops", "$gtfsDir/stops.txt");
loadData("gtfs_trips", "$gtfsDir/trips.txt");

// Some post-processing.
postProcess();

finish("GTFS Loading");
?>
