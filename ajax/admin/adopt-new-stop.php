<?php

header('Content-Type: application/json');

function finishWith($status) {
	exit(json_encode(array('status'=>$status)));
}

include('../../lib/db.php');
init_db();

include('../../lib/admindb.php');

if(!isset($_POST['userid']) || !isset($_POST['stopname']) || !isset($_POST['stopid']) || !isset($_POST['agency'])) {
	finishWith('missing');
}

$userid = intval($_POST['userid']);
$stopname = trim($_POST['stopname']);
$stopid = empty($_POST['stopid']) ? null : intval($_POST['stopid']);
$agency = empty($_POST['agency']) ? null : trim($_POST['agency']);

if(!is_null($stopid) && is_null($agency)) {
	finishWith('agencynull');
}

$result = addAdoptedStop($userid, $stopname, $stopid, $agency);

if($result !== TRUE) {
	finishWith('failure');
} else {
	finishWith('success');
}

?>