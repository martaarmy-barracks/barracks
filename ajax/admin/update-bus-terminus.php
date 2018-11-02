<?php
header('Content-Type: application/json');

function finishWith($status) {
	exit(json_encode(array('status'=>$status)));
}

include('../../lib/db.php');
init_db();

include('../../lib/admindb.php');

$missedArg = "";
if(!isset($_REQUEST['stop_id'])) $missedArg .= 'stop_id,';
if(!isset($_REQUEST['stop_name'])) $missedArg .= 'stop_name,';
$missedArg = $_REQUEST;


if(!isset($_REQUEST['stop_id']) || !isset($_REQUEST['stop_name'])) {
	finishWith('missing ' . json_encode($missedArg));
}

$id = trim($_REQUEST['stop_id']);
$stopname = trim($_REQUEST['stop_name']);

echo json_encode(array('status'=>updateBusTerminus($id, $stopname)));

function updateBusTerminus($id, $name) {
	global $_DB;

	// Upsert in table terminus_names.
	$query = "insert into terminus_names (stop_id, stop_name) values ((?), (?)) on duplicate key update stop_name = (?)";

	$stmt = $_DB->prepare($query);
	$stmt->bind_param('sss', $id, $name, $name);

	if (!($stmt->execute())) {
		$results = $errorMsg = "Update failed: (" . $stmt->errno . ") " . $stmt->error;
	}
	else {
		$results = "Updated";
	}
	
	return $results;
}
?>