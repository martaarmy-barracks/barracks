<?php
$_DB = NULL;

date_default_timezone_set('America/New_York');

include ('init_db.php');
include('crypto.php');

function dateTimeFromDb($datetimestr) {
	return DateTime::createFromFormat('Y-m-j H:i:s', $datetimestr);
}
function dateTimeToDb($datetime) {
	return $datetime->format('Y-m-j H:i:s');
}
function booleanFromDb($boolint) {
	if($boolint==0) return FALSE;
	else return TRUE;
}
function booleanToDb($bool) {
	if($bool) return 1;
	else return 0;
}

function createOrGetUser($name, $email, $phone, $notes, &$op_result) {
	global $_DB;
	$joindatestr = dateTimeToDb(new DateTime());

	$email = strtolower($email);

	if(!filter_var($email, FILTER_VALIDATE_EMAIL)) { 
		$error = 'bademail';
		return FALSE;
	}

	$stmt = $_DB->prepare("SELECT id FROM users WHERE email=?");
	$stmt->bind_param('s', $email);
	$stmt->execute();

	$results = $stmt->get_result();
	if($results->num_rows != 0) {
		$row = $results->fetch_array(MYSQLI_NUM);
		$userid = $row[0];
		// todo update user, return user id
		$stmt = $_DB->prepare("UPDATE users SET name=?, phone=?, notes=concat(notes, ' ', ?) WHERE id=?");
		$stmt->bind_param("sssi", $name, $phone, $notes, $userid);
		$result = $stmt->execute();
		if(!$result) {
			$op_result = 'failure';
			return FALSE;
		}
		$op_result = 'already';
		return $userid;
	} else {
		$stmt = $_DB->prepare("INSERT INTO users (name, email, phone, joindate, notes) ".
	                      "VALUES (?,?,?,?,?)");
		$stmt->bind_param("sssss", $name, $email, $phone, $joindatestr, $notes);
		$result = $stmt->execute();
		if(!$result) {
			$op_result = 'failure';
			return FALSE;
		}

		$op_result = 'newuser';
		$userid = $_DB->insert_id;
		return $userid;
	}	
}

function createNewSession($email, $password) {
	global $_DB;
	$email = strtolower($email);

	$stmt = $_DB->prepare("SELECT `passwordhash`, `id` FROM `users` WHERE `email` = ?");
	$stmt->bind_param('s', $email);
	$stmt->execute();
	$results = $stmt->get_result();
	if($results->num_rows != 1) { 
		return NULL;
	}

	$row = $results->fetch_array(MYSQLI_NUM);
	$correct_hash = $row[0];

	if(!validate_password($password, $correct_hash)) {
		return NULL;
	}

	// create new session now
	$userid = $row[1];
	return createNewSessionByUserid($userid);
}

function createNewSessionByUserid($userid) {
	global $_DB;
	$sid = get_random_string();

	// todo check for uniq sid in sessions

	$stmt = $_DB->prepare("INSERT INTO `sessions` (`id`, `userid`) VALUES (?, ?)");
	$stmt->bind_param('si', $sid, $userid);
	$stmt->execute();

	return $sid;
}

function getSessionUser($sid) {
	global $_DB;

	$stmt = $_DB->prepare("SELECT `userid` FROM `sessions` WHERE `id` = ?");
	$stmt->bind_param('s', $sid);
	$stmt->execute();
	$results = $stmt->get_result();

	if($results->num_rows != 1) {
		return NULL;
	}
	$row = $results->fetch_array(MYSQLI_NUM);
	$userid = $row[0];

	$stmt = $_DB->prepare("SELECT `id`, `name`, `points` FROM `users` WHERE `id` = ?");
	$stmt->bind_param('i', $userid);
	$stmt->execute();
	$results = $stmt->get_result();

	$row = $results->fetch_array(MYSQLI_NUM);

	return array('id'=>$row[0], 'name'=>$row[1], 'points'=>$row[2]);
}

function changePassword($userid, $currPass, $newPass) {
	global $_DB;

	$stmt = $_DB->prepare("SELECT passwordhash FROM users WHERE id = ?");
	$stmt->bind_param('i', $userid);
	$res = $stmt->execute();
	if(!$res) { return 'error'; }
	$results = $stmt->get_result();
	if($results->num_rows != 1) { return 'error'; }

	$row = $results->fetch_array(MYSQLI_NUM);
	$correct_hash = $row[0];

	if(!validate_password($currPass, $correct_hash)) { return 'invalidpass'; }

	$newhash = create_hash($newPass);

	$stmt = $_DB->prepare("UPDATE users SET passwordhash=? WHERE id=?");
	$stmt->bind_param('si', $newhash, $userid);
	$res = $stmt->execute();
	if(!$res) { return 'error'; }

	return TRUE;
}

function getOperationById($opid) {
	global $_DB;

	$stmt = $_DB->prepare(
		"SELECT id, name, description, detail, data FROM operations WHERE id=?");
	$stmt->bind_param('i', $opid);
	$stmt->execute();
	$results = $stmt->get_result();

	if($results->num_rows != 1) {
		return NULL;
	}

	$row = $results->fetch_array(MYSQLI_NUM);
	
	$data = $row[4];
	if(!is_null($data)) {
		$data = json_decode($data);
	}

	return array('id'=>$row[0], 'name'=>$row[1], 'description'=>$row[2], 'detail'=>$row[3], 'data'=>$data);
}

function getNonParticipatingOperations($userid) {
	global $_DB;

	$stmt = $_DB->prepare(
		"SELECT id, name, description, detail, data FROM operations WHERE id NOT IN (select opid from operation_participants where userid=?)");
	$stmt->bind_param('i', $userid);
	$stmt->execute();
	$results = $stmt->get_result();

	$operations = array();

	while ($row = $results->fetch_array(MYSQLI_NUM)) {
		$data = $row[4];
		if(!is_null($data)) {
			$data = json_decode($data);
		}
		array_push($operations, array('id'=>$row[0], 'name'=>$row[1], 'description'=>$row[2], 'detail'=>$row[3], 'data'=>$data));
	}

	return $operations;
}

function getParticipatingOperationsAndTasks($userid) {
	global $_DB;

	$stmt = $_DB->prepare(
		"SELECT id, name, description, detail, data FROM operations WHERE id IN (select opid from operation_participants where userid=?)");
	$stmt->bind_param('i', $userid);
	$stmt->execute();
	$results = $stmt->get_result();

	$operations = array();
	
	while ($row = $results->fetch_array(MYSQLI_NUM)) {
		$opdata = $row[4];
		if(!is_null($opdata)) {
			$opdata = json_decode($opdata);
		}
		$op = array('id'=>$row[0], 'name'=>$row[1], 'description'=>$row[2], 'detail'=>$row[3], 'data'=>$opdata);
		attachParticipantToOperation($op, $userid);
		array_push($operations, $op);
	}

	return $operations;
}

function attachParticipantToOperation(&$op, $userid) {
	global $_DB;

	$tasks_stmt = $_DB->prepare("SELECT id, title, description, deadline, completed ".
	                            "FROM participant_tasks WHERE userid=? AND opid=? ".
	                            "ORDER BY completed, deadline");

	$tasks_stmt->bind_param("ii", $userid, $op['id']);
	$tasks_stmt->execute();
	$tasks_results = $tasks_stmt->get_result();

	$tasks = array();
	while($task_row = $tasks_results->fetch_array(MYSQLI_NUM)) {
		array_push($tasks, array('id'=>$task_row[0], 'title'=>$task_row[1], 'description'=>$task_row[2],
		                         'deadline'=>new DateTime($task_row[3]), 'completed'=>$task_row[4]));
	}
	$op['tasks'] = $tasks;

	$part_stmt = $_DB->prepare("SELECT data FROM operation_participants WHERE opid=? AND userid=?");
	$part_stmt->bind_param("ii", $op['id'], $userid);
	$part_stmt->execute();
	$results = $part_stmt->get_result();

	// opt: check that only one row was returned

	$row = $results->fetch_array(MYSQLI_NUM);
	if(!is_null($row[0])) {
		$op['participant_data'] = json_decode($row[0]);	
	} else {
		$op['participant_data'] = NULL;
	}
}

function getOpAndTaskAndUserByTaskCode($taskcode) {
	global $_DB;

	$stmt = $_DB->prepare("SELECT id, title, description, deadline, completed, opid, userid ".
	                            "FROM participant_tasks WHERE taskcode = ?");

	$stmt->bind_param("s", $taskcode);
	$stmt->execute();
	$results = $stmt->get_result();

	if($results->num_rows != 1) {
		return NULL;
	}

	$task_row = $results->fetch_array(MYSQLI_NUM);
	$task = array('id'=>$task_row[0], 'title'=>$task_row[1], 'description'=>$task_row[2],
		                         'deadline'=>new DateTime($task_row[3]), 'completed'=>$task_row[4]);
	$opid = $task_row[5];
	$userid = $task_row[6];

	$op = getOperationById($opid);
	if(is_null($op)) {
		return NULL;
	}

	$op['single_task'] = $task;
	return array('op'=>$op, 'userid'=>$userid);
}

function joinOperation($opid, $userid, $opdata) {
	global $_DB;

	$stmt = $_DB->prepare(
		"SELECT `id` FROM operation_participants WHERE userid=? and opid=?");
	$stmt->bind_param('ii', $userid, $opid);
	$stmt->execute();
	$results = $stmt->get_result();

	if($results->num_rows != 0) {
		return array('status'=>'already');
	}

	// join operation
	$stmt = $_DB->prepare("INSERT INTO operation_participants (opid, userid, data) VALUES(?, ?, ?)");
	$stmt->bind_param("iis", $opid, $userid, $opdata);
	$stmt->execute();

	// add default tasks
	$stmt = $_DB->prepare("INSERT INTO participant_tasks (opid, userid, title, description, deadline, completed) ".
		"SELECT ?, ?, title, description, deadline, 0 FROM operation_default_tasks where opid=? and is_active = 1");
	$stmt->bind_param('iii', $opid, $userid, $opid);
	$stmt->execute();
	
	// add points
	$stmt = $_DB->prepare("UPDATE users SET points=points+5 WHERE id=?");
	$stmt->bind_param('i', $userid);
	$stmt->execute();

	return array('status'=>TRUE, 'addedpoints'=>5);
}

function addAdoptedStop($userid, $stopname, $stopid, $agency) {
	global $_DB;
	
	$stmt = $_DB->prepare("SELECT 1 FROM users WHERE id=?");
	$stmt->bind_param('i', $userid);
	$stmt->execute();
	$results = $stmt->get_result();
	
	if($results->num_rows != 1) {
		return 'nouserid';
	}

	$stmt = $_DB->prepare("SELECT 1 FROM adoptedstops WHERE userid=? AND stopid=? AND agency=?");
	$stmt->bind_param('iss', $userid, $stopid, $agency);
	$stmt->execute();
	$results = $stmt->get_result();
	if($results->num_rows > 0) {
		return TRUE;
	}

	if(is_null($stopid) && !is_null($agency)) { return 'stopid_agency_mismatch'; }
	if(!is_null($stopid) && is_null($agency)) { return 'stopid_agency_mismatch'; }

	$id = get_random_string_len(8);
	$adoptedtime = dateTimeToDb(new DateTime());
	
	$stmt = $_DB->prepare(
		"INSERT INTO adoptedstops (id, userid, adoptedtime, stopname, stopid, agency) ".
		"VALUES (?,?,?,?,?,?)");
	$stmt->bind_param('sissss', $id, $userid, $adoptedtime, $stopname, $stopid, $agency);;
	$result = $stmt->execute();

	return $result;
}

function markTaskComplete($taskid, $user) {
	global $_DB;

	$stmt = $_DB->prepare("SELECT completed FROM participant_tasks WHERE id = ?");
	$stmt->bind_param('i', $taskid);
	$stmt->execute();
	$results = $stmt->get_result();
	$row = $results->fetch_array(MYSQLI_NUM);
	$completed = $row[0];
	if($completed==1) {
		return array('status'=>FALSE, 'addedpoints'=>0);
	}

	$userid = $user['id'];

	$stmt = $_DB->prepare("UPDATE participant_tasks SET completed=1 WHERE userid=? AND id=?");
	$stmt->bind_param('ii', $userid, $taskid);
	$stmt->execute();

	$stmt = $_DB->prepare("SELECT deadline FROM participant_tasks WHERE id=?");
	$stmt->bind_param("i", $taskid);
	$stmt->execute();
	$results = $stmt->get_result();
	$row = $results->fetch_array(MYSQLI_NUM);
	
	$deadline = new DateTime($row[0]);
	$now = new DateTime();

	$addedpoints = 0;
	if($deadline < $now) {
		$addedpoints = 20;
	} else {
		$addedpoints = 10;
	}

	// add points
	$stmt = $_DB->prepare("UPDATE users SET points=points+$addedpoints WHERE id=?");
	$stmt->bind_param('i', $userid);
	$stmt->execute();

	return array('status'=>TRUE, 'addedpoints'=>$addedpoints);
}

function markTaskIncomplete($taskid, $user) {
	global $_DB;

	$stmt = $_DB->prepare("SELECT completed FROM participant_tasks WHERE id = ?");
	$stmt->bind_param('i', $taskid);
	$stmt->execute();
	$results = $stmt->get_result();
	$row = $results->fetch_array(MYSQLI_NUM);
	$completed = $row[0];
	if($completed==0) {
		return array('status'=>FALSE, 'removedpoints'=>0);
	}

	$userid = $user['id'];

	$stmt = $_DB->prepare("UPDATE participant_tasks SET completed=0 WHERE userid=? AND id=?");
	$stmt->bind_param('ii', $userid, $taskid);
	$stmt->execute();

	$stmt = $_DB->prepare("SELECT deadline FROM participant_tasks WHERE id=?");
	$stmt->bind_param("i", $taskid);
	$stmt->execute();
	$results = $stmt->get_result();
	$row = $results->fetch_array(MYSQLI_NUM);
	
	$deadline = new DateTime($row[0]);
	$now = new DateTime();

	$removedpoints = 0;
	if($deadline < $now) {
		$removedpoints = 20;
	} else {
		$removedpoints = 10;
	}

	// add points
	$stmt = $_DB->prepare("UPDATE users SET points=points-$removedpoints WHERE id=?");
	$stmt->bind_param('i', $userid);
	$stmt->execute();

	return array('status'=>TRUE, 'removedpoints'=>$removedpoints);
}

?>