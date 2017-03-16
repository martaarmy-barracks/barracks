<?php
header('Content-Type: application/json');

function finishWith($status, $sid=NULL) {
	exit(json_encode(array('status'=>$status)));
}

if(!isset($_COOKIE["sid"])) { finishWith('nologin'); }

include('../lib/db.php');
init_db();

$user = getSessionUser($_COOKIE["sid"]);

if(is_null($user)) {
    setcookie('sid', '', time() - 3600);
    finishWith('nologin');
}

if(!isset($_POST['current-password']) || !isset($_POST['new-password'])) {
	finishWith('incomplete');
}

$currPass = $_POST['current-password'];
$newPass = $_POST['new-password'];

$result = changePassword($user['id'], $currPass, $newPass);

if($result!==TRUE) { finishWith($result); }

finishWith('success');

?>