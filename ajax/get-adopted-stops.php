<?php
header('Content-Type: application/json');

include('../lib/db.php');
include('stop-funcs.php');
init_db();

$agency = 'MARTA';

$query = <<<EOT
select concat('$agency', '_', s.stop_id), s.stop_name, s.stop_lat, s.stop_lon, b.type from gtfs_stops s, 
(select a.stopid id, coalesce(a.type, 'SIGN') type from adoptedstops a WHERE a.agency='$agency' AND a.abandoned <> 1
union select * from special_stops) b
where b.id = s.stop_id	
EOT;

$stopdetails = getFromQuery($_DB, $query, array("id", "name", "lat", "lon", "type"));
mysqli_close($_DB);
echo json_encode(array('status'=>'success', 'stopdetails'=>$stopdetails));
?>