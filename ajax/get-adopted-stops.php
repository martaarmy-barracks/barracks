<?php

header('Content-Type: application/json');

include('../lib/db.php');
init_db();

$results = $_DB->query(
	// "SELECT db.name, db.lat, db.lng FROM adoptedstops s, stopdb db ".
	// "WHERE s.agency='MARTA' AND s.stopid = db.stopid AND s.given=1 and s.abandoned <> 1");
	"SELECT db.name, db.lat, db.lng, s.given, s.abandoned FROM adoptedstops s, stopdb db ".
	"WHERE s.agency='MARTA' AND s.stopid = db.stopid AND s.abandoned <> 1");

if(!$results) {
	exit(json_encode(array('status'=>'failure')));
}

$stopdetails = array();

while ($row = $results->fetch_array(MYSQLI_NUM)) {
	$stop = array('name' => $row[0], 'lat' => $row[1], 'lng' => $row[2]);
	$stopdetails[] = $stop;
}

echo json_encode(array('status'=>'success', 'stopdetails'=>$stopdetails));

?>