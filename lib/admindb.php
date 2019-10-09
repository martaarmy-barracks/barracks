<?php
function getFromQuery_admindb($_DB, $query, $fields) {
	$results = array();
	if ($r = $_DB->query($query)) {
		while ($row = $r->fetch_array(MYSQLI_NUM)) {
			$results[] = makeEntry_admindb($row, $fields);
		}
		$r->close();
	}
	return $results;
}

function makeEntry_admindb($row, $fields) {
	$result = array();
	for ($i = 0; $i < count($fields); $i++) {
		$result[$fields[$i]] = $row[$i];
	}
	return $result;
}

function redirectIfNotAdmin($url) {
	$result = false;
	
	if(!isset($_COOKIE["adminsid"])) {
		$result = true;		
	}
	else if(!validateAdminSession($_COOKIE["adminsid"])) {
		$result = true;
	}

	if ($result) header("Location: $url");
	return $result;
}

function validateAdminSession($adminsid) {
	global $_DB;

	$stmt = $_DB->prepare("SELECT 1 FROM `adminsessions` WHERE `id` = ?");
	$stmt->bind_param('s', $adminsid);
	$stmt->execute();
	//$results = $stmt->get_result();

	//if($results->num_rows != 1) {
	//	return FALSE;
	//}


	$outcome = null;
	if ($stmt->bind_result($outcome)) {
		while ($stmt->fetch()) {
			break; // once only.
		};
	}
	else {
		header('Location: login.php?msg=Database+Error');
		exit();
	}
	$stmt->close();
	

	if($outcome != 1) {
		return FALSE;
	}
	return TRUE;
}

class Soldier {
	var $id, $name, $email, $phone, $notes, $joindate, $updatedate;
	var $stops, $stops_given, $stops_notgiven;

	function __construct($id, $name, $email, $phone, $notes, $joindate)
	{
		$this->id = $id;
		$this->name = $name;
		$this->email = $email;
		$this->phone = $phone;
		$this->notes = $notes;
		$this->joindate = $joindate;
		$this->updatedate = $joindate;
		
		$this->stops = array();
		$this->stops_given = array();
		$this->stops_notgiven = array();
	}

	function addStop($stop) {
		$this->stops[] = $stop;
		if($stop->given) {
			$this->stops_given[] = $stop;
		} else {
			$this->stops_notgiven[] = $stop;
		}

		$this->updatedate = $stop->adoptedtime;
	}
}

class Stop {
	var $id, $adoptedtime, $stopname, $stopid, $agency, $given, $nameonsign, $abandoned, $type, $dateprinted, $dategiven, $dateexpire, $routes, $eventid;

	function __construct($id, $adoptedtime, $stopname, $stopid, $agency, $given, $nameonsign, $abandoned, $type, $dateprinted, $dategiven, $dateexpire, $routes, $eventid) {
		$this->id = $id;
		$this->adoptedtime = $adoptedtime;
		$this->stopname = $stopname;
		$this->stopid = $stopid;
		$this->agency = $agency;
		$this->given = $given;
		$this->nameonsign = $nameonsign;
		$this->abandoned = $abandoned;
		$this->type = $type;
		$this->dateprinted = $dateprinted;
		$this->dategiven = $dategiven;
		$this->dateexpire = $dateexpire;
		$this->routes = $routes;
		$this->eventid = $eventid;
	}
}

function getTimelyTripSoldiers() {
	global $_DB;

	$query = 
		"SELECT u.id, u.name, u.email, u.phone, u.notes, u.joindate, ".
		"s.id id_, s.adoptedtime, s.stopname, s.stopid, s.agency, s.given, s.nameonsign, s.abandoned, d.type, " .
		"s.dateprinted, s.dategiven, s.dateexpire, s.routes, s.eventid " .
		"FROM users u LEFT JOIN adoptedstops s ON u.id = s.userid ".
		"LEFT JOIN stopdb d on s.stopid = d.stopid ". 
		"ORDER BY u.joindate DESC";
	//$stmt = $_DB->prepare($query);
	//$stmt->execute();
	//$results = $stmt->get_result();

	$results = getFromQuery_admindb($_DB, $query,
		array("id", "name", "email", "phone", "notes", "joindate",
				"id_", "adoptedtime", "stopname", "stopid", "agency", "given", "nameonsign", "abandoned", "type",
				"dateprinted", "dategiven", "dateexpire", "routes", "eventid"));

	$soldiers = array();

	function findSoldier($soldiers, $userid) {
		$found = null;
		foreach($soldiers as $s) {
			if ($s->id == $userid) {
			    $found = $s;
			    break;
			}
		}
		return $found;
	}

	//while ($row = $results->fetch_array(MYSQLI_NUM)) {
	//	$userid = $row[0];
	foreach ($results as $row) {
		$userid = $row["id"];

		$soldier = findSoldier($soldiers, $userid);
		if(is_null($soldier)) {
			//$soldier = new Soldier($userid, $row[1], $row[2], $row[3], $row[4], dateTimeFromDb($row[5]));
			$soldier = new Soldier($userid, $row["name"], $row["email"], $row["phone"], $row["notes"], dateTimeFromDb($row["joindate"]));
			$soldiers[] =  $soldier;
		}
		
		//if(is_null($row[6])) { continue; }
		if(is_null($row["id_"])) { continue; }

		//$stop = new Stop(
		//	$row[6], dateTimeFromDb($row[7]), $row[8], $row[9], 
		//	$row[10], booleanFromDb($row[11]), $row[12], booleanFromDb($row[13]), $row[14],
		//	$row[15], $row[16], $row[17], $row[18], $row[19]	
		//);


		$stop = new Stop(
			$row["id_"], dateTimeFromDb($row["adoptedtime"]), $row["stopname"], $row["stopid"], 
			$row["agency"], booleanFromDb($row["given"]), $row["nameonsign"], booleanFromDb($row["abandoned"]), $row["type"],
			$row["dateprinted"], $row["dategiven"], $row["dateexpire"], $row["routes"], $row["eventid"]	
		);

		$soldier->addStop($stop);		
	}	
	function cmpSoldierByUpdateDate($s1, $s2) {
		if($s1->updatedate > $s2->updatedate) { return -1; }
		if($s1->updatedate == $s2->updatedate) { return -1; }
		if($s1->updatedate < $s2->updatedate) { return 1; }
	}

	usort($soldiers, "cmpSoldierByUpdateDate");
	return $soldiers;
}

function _findStopById($stops, $id) {
	foreach($stops as $stop) {
		if($stop->id == $id) {
			return $stop;
		}
	}

	return NULL;
}

function updateAdoptedStop($id, $stopname, $stopid, $agency, $given, $nameonsign, $abandoned) {
	global $_DB;

	$given = booleanToDb($given);
	$abandoned = booleanToDb($abandoned);
	
	$stmt = $_DB->prepare(
		"UPDATE adoptedstops SET stopname=?, stopid=?, agency=?, given=?, nameonsign=?, abandoned=? ".
		"WHERE id=?");
	$stmt->bind_param("sssisis", $stopname, $stopid, $agency, $given, $nameonsign, $abandoned, $id);
	$result = $stmt->execute();
	
	return $result;
}


?>