<?php

header('Content-Type: application/json');

/*
return:
{
	'status': 'success' // 'fail', 'nologin', 'missingdata', 'missingfield'
}
*/

function finishWith($status, $sid=NULL) {
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

if(!isset($_POST['opid'])) { finishWith('missingopid'); }
$opid = intval($_POST['opid']);

$op = getOperationById($opid);

$op_part_data = NULL;

if(!is_null($op['data'])) {
	if(!isset($_POST['data'])) { finishWith('missingdata'); }

	$indata = json_decode($_POST['data']);
	$opdata = $op['data'];

	$indata_processed = new stdClass();

	foreach($opdata as $opfield) {
		$opfieldid = $opfield->id;
		$opfieldtype = $opfield->type;

		if(!property_exists($indata, $opfieldid)) { finishWith('missingfield: ' . $opfieldid); }
		$inval = $indata->$opfieldid;

		switch ($opfieldtype) {
			case 'text':
				if(!is_string($inval)) { finishWith('invalid: ' . $opfieldid); }
				break;
			case 'list':
				if(!is_array($inval)) { finishWith('invalid: ' . $opfieldid); }
				foreach($inval as $val) {
					if(!is_string($val)) { finishWith('invalid val in ' . $opfieldid); }
				}
				break;
		}

		$indata_processed->$opfieldid = $inval;
	}

	$op_part_data = json_encode($indata_processed);
}

$return = joinOperation($op['id'], $user['id'], $op_part_data);
$status = $return['status'];

if($status !== TRUE) {
	finishWith($status);
}

attachParticipantToOperation($op, $user['id']);
$opHtml = renderOpWithTasks($op);

echo json_encode(array('status'=>'success', 'ophtml'=>$opHtml, 'addedpoints'=>$return['addedpoints']));

?>