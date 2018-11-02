<?php

header('Content-Type: application/json');

include('../lib/db.php');
init_db();

$results = $_DB->query(
	// "SELECT db.name, db.lat, db.lng FROM adoptedstops s, stopdb db ".
	// "WHERE s.agency='MARTA' AND s.stopid = db.stopid AND s.given=1 and s.abandoned <> 1"
	//"SELECT db.name, db.lat, db.lng, s.given, s.abandoned FROM adoptedstops s, stopdb db ".
	//"WHERE s.agency='MARTA' AND s.stopid = db.stopid AND s.abandoned <> 1"

	//"SELECT s.stop_id, s.stop_name, s.stop_lat, s.stop_lon, a.type, a.given, a.abandoned FROM adoptedstops a, gtfs_stops s " .
	//"WHERE a.agency='MARTA' AND a.stopid = s.stop_id AND a.abandoned <> 1"

	/*
select s.stop_id, s.stop_name, s.stop_lat, s.stop_lon, b.type from gtfs_stops s, 
(select a.stopid id, a.type from adoptedstops a WHERE a.agency='MARTA' AND a.abandoned <> 1 union select * from special_stops) b

where b.id = s.stop_id
	
	*/
	"select s.stop_id, s.stop_name, s.stop_lat, s.stop_lon, b.type from gtfs_stops s, " .
	"(select a.stopid id, a.type from adoptedstops a WHERE a.agency='MARTA' AND a.abandoned <> 1 union select * from special_stops) b " .
	
	"where b.id = s.stop_id"
	
);

if(!$results) {
	exit(json_encode(array('status'=>'failure')));
}

$stopdetails = array();

while ($row = $results->fetch_array(MYSQLI_NUM)) {
	$stop = array(
		'id' => $row[0],
		'name' => $row[1],
		'lat' => $row[2],
		'lng' => $row[3],
		'type' => $row[4]);
	$stopdetails[] = $stop;
}

echo json_encode(array('status'=>'success', 'stopdetails'=>$stopdetails));

?>