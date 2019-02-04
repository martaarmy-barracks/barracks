<?php
// Example Usage: qr.php?s=MARTA_905384

include('lib/db.php');
init_db();

// URL forwarding parameters
$stopid_param = 's';
//$targetUrlTemplate = 'http://atlanta.onebusaway.org/where/standard/stop.action?id=';
$targetUrlTemplate = 'https://barracks.martaarmy.org/stopinfo.php?sid=';
$bannerDuration = 2; // seconds
$greetingPage = 'qr_magreet.html';

session_start();


function logScan($stopid) {
	global $_DB;
	
	$stmt = $_DB->prepare("INSERT into qr_tracker (stopid) VALUES (?)");
	$stmt->bind_param('s', $stopid);
	return $stmt->execute();
}

function setPrinted($stopid) {
	global $_DB;
	
	$stmt = $_DB->prepare("update adoptedstops a set a.dateprinted = now() where concat(case when a.agency is null or a.agency = '' then 'MARTA' else a.agency end,'_', a.stopid) = ?");
	$stmt->bind_param('s', $stopid);
	return $stmt->execute();
}

function setGiven($stopid) {
	global $_DB;
	
	$stmt = $_DB->prepare("update adoptedstops a set a.dategiven = now() where concat(case when a.agency is null or a.agency = '' then 'MARTA' else a.agency end,'_', a.stopid) = ?");
	$stmt->bind_param('s', $stopid);
	return $stmt->execute() | setAbandoned($stopid, 0);
}

function setAbandoned($stopid, $value) {
	global $_DB;
	
	$stmt = $_DB->prepare("update adoptedstops a set a.abandoned = ? where concat(case when a.agency is null or a.agency = '' then 'MARTA' else a.agency end,'_', a.stopid) = ?");
	$stmt->bind_param('ds', $value, $stopid);
	return $stmt->execute();
}

if (isset($_REQUEST[$stopid_param]) && $_REQUEST[$stopid_param] != "") {	
	$stopid = $_REQUEST[$stopid_param]; 

	if (isset($_SESSION['isMaster'])) {
		if (isset($_SESSION['scanAction'])) {
			$scanAction = $_SESSION['scanAction'];

			if ($scanAction == "SET_PRINTED_TODAY") {
				$shouldPrintError = !setPrinted($stopid);
				$msg = $shouldPrintError ? "Problem updating DatePrinted" : "Printed Today";
			}
			else if ($scanAction == "SET_GIVEN_TODAY") {
				$shouldPrintError = !setGiven($stopid);
				$msg = $shouldPrintError ? "Problem updating DateGiven" : "Given Today";
			}
			else if ($scanAction == "SET_PRINTEDANGIVEN_TODAY") {
				$shouldPrintError = !setPrinted($stopid);
				$shouldPrintError |= !setGiven($stopid);
				$msg = $shouldPrintError ? "Problem updating DateGiven" : "Printed/Given Today";
			}
			else if ($scanAction == "SET_ABANDONED") {
				$shouldPrintError = !setAbandoned($stopid, 1);
				$msg = $shouldPrintError ? "Problem updating Abandoned" : "Abandoned";
			}

// FIRST PAGE: SIGN MGT.
?>	
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>MARTA Army Sign Management</title>
	<style>
	body {text-align:center; font-family:sans-serif;}
	</style>
</head>
<body>
	<h1><?=$stopid?> =&gt; <?=$msg?></h1>
	</body>
</html>
<?php

		} 
	} 
	else {
		$targetUrl = $targetUrlTemplate . $stopid;
		$shouldPrintError = !logScan($stopid);
		$errorMsg = $shouldPrintError ? "Encountered a minor problem logging your scan but we'll get you to your schedules." : "";

// SECOND PAGE: NORMAL AUTO REDIRECT.
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="refresh" content="<?=$bannerDuration?>;url=<?=$targetUrl?>">
<title>Welcome to MARTA Army</title>
	<style>
body {margin: 0; position: absolute; top: 0; bottom: 0; width: 100%;}
iframe {width:100%; height:100%;}
footer {position: absolute; bottom: 0; width: 100%; font-size:80%;}
	</style>
</head>
<body>
<iframe src="<?=$greetingPage?>"></iframe>

<footer>(<a href='<?=$targetUrl?>'>Click here if you are not automatically redirected within 5 seconds.</a>)
<br/><?=$errorMsg;?></footer>
</body>
</html>
<?php
		$_DB->close();
	}
}
else {

// THIRD PAGE: STATIC BANNER.
?>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="refresh" content="0;url=<?=$greetingPage?>">
</head>
<body>
</body>
</html>
<?php
}
?>

