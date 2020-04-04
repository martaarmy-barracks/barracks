<?php
include("updater-presets.php");

// Download zip from MARTA website
file_put_contents($gtfsArchiveName, fopen($gtfsSourceUrl, 'r'));

finish("GTFS Download");
?>
