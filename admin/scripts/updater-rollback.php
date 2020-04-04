<?php
include("updater-presets.php");

function rollbackTable($sourceTableName) {
    global $_DB;
    global $backupTableSuffix;
    
    $targetTableName = $sourceTableName . $backupTableSuffix;

    $v = $_DB->query("DELETE from $sourceTableName WHERE 1");
    if (!$v) error("Error truncating $sourceTableName");

    $v = $_DB->query("INSERT INTO $sourceTableName SELECT * FROM $targetTableName WHERE 1");
    if (!$v) error("Error rolling back $sourceTableName");
}

// Rollback tables
rollbackTable("gtfs_agency");
rollbackTable("gtfs_calendar");
rollbackTable("gtfs_calendar_dates");
rollbackTable("gtfs_routes");
rollbackTable("gtfs_shapes");
rollbackTable("gtfs_stop_times");
rollbackTable("gtfs_stops");
rollbackTable("gtfs_trips");

finish("GTFS Rollback");
?>
