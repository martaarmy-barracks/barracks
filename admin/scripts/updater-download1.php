<?php
include("updater-presets.php");

// Usage: updater-download1.php?srcfile=google_transit&saveas=gtfs_20180515

// srcfile and saveas should be just the file name, no extension, no path.
// examples: //"google_transit";
function normalize($filename) {
    $maxlength = 20;
    $strippedString = preg_replace("/[^A-Za-z0-9_\-]/", "", $filename);
    return substr($strippedString, 0, min(strlen($strippedString), $maxlength));
}

echo "About to download $gtfsSourceUrl, writing to $gtfsSavedArchiveName.";

$gtfsArchiveName = normalize($_REQUEST['srcfile']) . ".zip"; 
$gtfsSourceUrl = "http://itsmarta.com/google_transit_feed/" . $gtfsArchiveName; 

$gtfsSavedArchiveName = normalize($_REQUEST['saveas']) . ".zip";


// Download zip from MARTA website
file_put_contents($gtfsSavedArchiveName, fopen($gtfsSourceUrl, 'r'));

finish("GTFS Download");
?>
