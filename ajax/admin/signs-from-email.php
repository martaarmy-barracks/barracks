<?php

header('Content-Type: application/json');

function finishWith($status) {
	exit(json_encode(array('status'=>$status)));
}

include('../../lib/db.php');
init_db();

include('../../lib/admindb.php');

$emails = trim($_REQUEST['emails']);

echo json_encode(getSignsFromEmail($emails));

?>