<?php
include("updater-presets.php");

function backupTable($sourceTableName) {
    global $_DB;
    global $backupTableSuffix;
    
    $targetTableName = $sourceTableName . $backupTableSuffix;

    $v = $_DB->query("DELETE from $targetTableName WHERE 1");
    if (!$v) error("Error truncating $targetTableName");

    $v = $_DB->query("INSERT INTO $targetTableName SELECT * FROM $sourceTableName WHERE 1");
    if (!$v) error("Error backing up $targetTableName");
    
	return $v;
}

// Backup tables
backupTable("gtfs_agency");
backupTable("gtfs_calendar");
backupTable("gtfs_calendar_dates");
backupTable("gtfs_routes");
backupTable("gtfs_shapes");
backupTable("gtfs_stop_times");
backupTable("gtfs_stops");
backupTable("gtfs_trips");
backupTable("bus_terminus");

finish("GTFS Backup");
?>
