<?php

header('Content-Type: application/json');

function finishWith($status) {
	exit(json_encode(array('status'=>$status)));
}

include('../../lib/db.php');
init_db();

include('../../lib/admindb.php');

if(!isset($_POST['id']) || !isset($_POST['stopname']) 
	|| !isset($_POST['stopid']) || !isset($_POST['agency']) 
	|| !isset($_POST['given']) || !isset($_POST['nameonsign']) || !isset($_POST['abandoned']) ) {

	finishWith('missing');
}

$id = trim($_POST['id']);

$stopname = trim($_POST['stopname']);
$stopid = empty($_POST['stopid']) ? null : intval($_POST['stopid']);
$agency = empty($_POST['agency']) ? null : trim($_POST['agency']);

if(!is_null($stopid) && is_null($agency)) {
	finishWith('agencynull');
}
$given = ($_POST['given']=='true') ? true : false;
$nameonsign = trim($_POST['nameonsign']);
$abandoned = ($_POST['abandoned']=='true') ? true : false;

if( $given && empty($nameonsign) ) {
	finishWith('given_nameonsign');
}

$result = updateAdoptedStop($id, $stopname, $stopid, $agency, $given, $nameonsign, $abandoned);

if($result===TRUE) {
	if($given) {
		$stop_classification = 'notask';
	} else {
		$stop_classification = 'notgiven';
	}
	echo json_encode(array('status'=>'success', 'stop_classification'=>$stop_classification));
	exit();
} else {
	finishWith('phperror: '.$result);
}


?>