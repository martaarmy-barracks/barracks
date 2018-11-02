<?php

header('Content-Type: application/json');

include('../lib/db.php');
init_db();

$results = $_DB->query(
	//"SELECT db.name, db.lat, db.lng FROM adoptedstops s, stopdb db ".
	//"WHERE s.agency='MARTA' AND s.stopid = db.stopid AND s.given=1 and s.abandoned <> 1");

	// New as of Dec 10, 2016: Abandonned = adoption is over 31 days and last scan is over 31 days.

"SELECT db.name, db.lat, db.lng, s.abandoned <> 0 or (DATEDIFF(NOW(), s.adoptedtime) >= 32 and (q.lastscan is null or DATEDIFF(NOW(), q.lastscan) >= 32)) abandonned FROM adoptedstops s JOIN stopdb db on s.stopid = db.stopid " .
		"LEFT JOIN (select stopid, max(date) lastscan from qr_tracker group by stopid) q on concat('MARTA_', s.stopid) = q.stopid " .
		"where s.agency='MARTA'" );

if(!$results) {
	exit(json_encode(array('status'=>'failure')));
}

$stopdetails = array();

while ($row = $results->fetch_array(MYSQLI_NUM)) {
	$stop = array('name' => $row[0], 'lat' => $row[1], 'lng' => $row[2], 'abandonned' => $row[3]);
	$stopdetails[] = $stop;
}

echo json_encode(array('status'=>'success', 'stopdetails'=>$stopdetails));

?>