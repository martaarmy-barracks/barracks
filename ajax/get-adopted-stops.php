<?php
header('Content-Type: application/json');

include('../lib/db.php');
init_db();

$results = $_DB->query(
	/*
select s.stop_id, s.stop_name, s.stop_lat, s.stop_lon, b.type from gtfs_stops s, 
(select a.stopid id, coalesce(a.type, 'SIGN') type from adoptedstops a WHERE a.agency='MARTA' AND a.abandoned <> 1 union select * from special_stops) b

where b.id = s.stop_id	
	*/
	"select s.stop_id, s.stop_name, s.stop_lat, s.stop_lon, b.type from gtfs_stops s, " .
	"(select a.stopid id, coalesce(a.type, 'SIGN') type from adoptedstops a WHERE a.agency='MARTA' AND a.abandoned <> 1 union select * from special_stops) b " .
	
	"where b.id = s.stop_id"
);

if(!$results) {
	exit(json_encode(array('status'=>'failure')));
}

$stopdetails = array();

while ($row = $results->fetch_array(MYSQLI_NUM)) {
	$stop = array(
		'id' => 'MARTA_' . $row[0],
		'name' => $row[1],
		'lat' => $row[2],
		'lon' => $row[3],
		'type' => $row[4]);
	$stopdetails[] = $stop;
}

echo json_encode(array('status'=>'success', 'stopdetails'=>$stopdetails));
?>