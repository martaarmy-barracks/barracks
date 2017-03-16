<?php

header('Content-Type: application/json');

function finishWith($status, $sid=NULL) {
	exit(json_encode(array('status'=>$status, 'sid'=>$sid)));
}

if(!isset($_POST['email'])) { finishWith('noemail'); }
if(!isset($_POST['password'])) { finishWith('nopassword'); }

$email = $_POST['email'];
$password = $_POST['password'];

include('../lib/db.php');
init_db();

$sid = createNewSession($email, $password);
if(is_null($sid)) {
	finishWith('fail');
} else {
	finishWith('success', $sid);
}

?>