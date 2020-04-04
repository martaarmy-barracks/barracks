<?php
// Common includes.
header("Content-Type: text/plain");
include("../../lib/db.php");
include("../../lib/admindb.php");
init_db();

if (redirectIfNotAdmin("../login.php")) exit();

// Configuration parameters - Hopefully this rarely changes!
$gtfsArchiveName = "google_transit.zip"; 
$gtfsSourceUrl = "http://itsmarta.com/google_transit_feed/$gtfsArchiveName"; 
$backupTableSuffix = "_bak";
$gtfsDir = "/home/barrapzs/public_html/admin/scripts";

$startTime = time();

// Print message and duration when operation is complete. 
function finish($message) {
    global $startTime;
    $duration = time() - $startTime;

    echo "$message completed in $duration s.";
}

// Print an error message.
// TODO: Set an error flag.
function error($message) {
    echo $message;
}
?>
