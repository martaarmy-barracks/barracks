<?php

header('Content-Type: application/json');

function finishWith($status, $sid=NULL) {
	exit(json_encode(array('status'=>$status)));
}

if(!isset($_POST['name']) || !isset($_POST['email']) || !isset($_POST['phone']) || !isset($_POST['comment']) || !isset($_POST['stopmode'])) {
	finishWith('incomplete');
}

$userid = '';
if (isset($_POST['userid'])) $userid = trim($_POST['userid']);
$name = trim($_POST['name']);
$email = trim($_POST['email']);
$phone = trim($_POST['phone']);
$notes = trim($_POST['comment']);
$eventid = $_POST['eventid'];

if ($userid == '') {
	if($name === '') { finishWith('noname'); }
	if(!filter_var($email, FILTER_VALIDATE_EMAIL)) { finishWith('bademail'); }
	// if($notes === '') { finishWith('nocomment'); } // Comment box is optional now.
	if ($eventid == null || $eventid == "" || $eventid == "null") finishWith('noevent');
}

include('../lib/db.php');
include('../lib/email-lib.php');
init_db();

$op_result = 'already';
if ($userid == '') {
	$op_result = '';
	$userid = createOrGetUser($name, $email, $phone, $notes, $op_result);
	if($userid === FALSE) { finishWith('failure'); }
}

$stopmode = $_POST['stopmode'];
if($stopmode=='stopids') {
	if(!isset($_POST['stopids']) || !isset($_POST['stopnames'])) {
		finishWith('nostoptoadopt');
	}
	$stopid_inps = $_POST['stopids'];
	$stopnames = $_POST['stopnames'];

	if(count($stopid_inps)==0) { finishWith('nostoptoadopt'); }
	if(count($stopid_inps)!=count($stopnames)) { finishWith('nostoptoadopt'); }

	// User will not have more than 4 stops adopted.
	$maxCount = 10;
	$adoptedCount = getAdoptedCount($userid);
	$addedCount = count($stopid_inps);

	if ($adoptedCount + $addedCount > $maxCount) {
		finishWith('quotaexceeded,' . $adoptedCount);
	}
	else {
		for($i=0; $i<count($stopid_inps); $i++) {
			$stopid_inp = $stopid_inps[$i];
			$stopname = $stopnames[$i];
			$parts = explode('_', $stopid_inp);
			$agency = $parts[0];
			$stopid = $parts[1];

			$result = addAdoptedStop($userid, $stopname, $stopid, $agency, $eventid, $op_result=='already');
			if(!$result) {
				finishWith('failure');
			}
		}

		$stops_for_email = array();
		for($i=0; $i<count($stopid_inps); $i++) {
			$stopid_inp = $stopid_inps[$i];
			$stopname = $stopnames[$i];

			$stops_for_email[] = "$stopname ($stopid_inp)";
		}

		sendNewSignupEmail($name, $email, $stops_for_email, $notes, $op_result=='already');
		finishWith('success');
	}
} else if($stopmode=='stopaddress') {
	if(!isset($_POST['stopaddress'])) {
		finishWith('incomplete');
	}

	$stoptoadopt = trim($_POST['stopaddress']);
	if(empty($stoptoadopt)) {
		finishWith('nostoptoadopt');
	}

	$result = addAdoptedStop($userid, $stoptoadopt, null, null, $eventid);
	if(!$result) { finishWith('failure'); }

	sendNewSignupEmail($name, $email, array($stoptoadopt), $notes, $op_result=='already');

	finishWith('success');

} else {
	finishWith('invalidstopmode');
}



?>