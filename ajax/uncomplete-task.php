<?php

header('Content-Type: application/json');

function finishWith($status) {
	exit(json_encode(array('status'=>$status)));
}

if(!isset($_COOKIE["sid"])) { finishWith('nologin'); }

include('../lib/db.php');
include('../lib/op-with-tasks-view.php');
init_db();

$user = getSessionUser($_COOKIE["sid"]);

if(is_null($user)) {
    setcookie('sid', '', time() - 3600);
    finishWith('nologin');
}

if(!isset($_POST['taskid'])) {
	finishWith('notaskid');
}

$taskid = intval($_POST['taskid']);

$return = markTaskIncomplete($taskid, $user);
$status = $return['status'];

if($status!==TRUE) {
	finishWith($status);
}
	
echo json_encode(array('status'=>'success', 'removedpoints'=>$return['removedpoints']));

?>