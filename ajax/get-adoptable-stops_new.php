<?php

header('Content-Type: application/json');

include('../lib/db.php');
init_db();

function getJson($url) {
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);
	$result=curl_exec($ch);
	curl_close($ch);
	return json_decode($result, true);
}


if(isset($_REQUEST['lat']) && isset($_REQUEST['lon'])) {

	// get stops for specified location from OneBusAway.
	$lat = $_REQUEST['lat'];
	$lon = $_REQUEST['lon'];
	$stopsAtLocation = getJson('http://atlanta.onebusaway.org/api/api/where/stops-for-location.json' .
			'?key=TEST&lat=' . $lat . '&lon=' . $lon . '&radius=400');

	//echo json_encode($stopsAtLocation);	
	//echo jsvar_dump($stopsAtLocation);	
	//return;
	
	// Get stops that are not eligible, catch the reason for ineligibility:
	// - type <> 'SGN' (we have loaded that data into the stopdb table).$_COOKIE
	// - All bus stops already adopted with sign given and not abandonned.
	$nonEligibleStopsResult = $_DB->query(
		//"SELECT stopid, 'ADOPTED' reason FROM adoptedstops s WHERE s.agency='MARTA' AND s.given=1 and s.abandoned <> 1 " .
		//"union SELECT stopid, 'WRONGPOLE' reason FROM stopdb WHERE type <> 'SGN' "

	// New as of Dec 10, 2016: Abandonned = adoption is over 31 days and last scan is over 31 days.

		"SELECT s.stopid, 'ADOPTED' reason FROM adoptedstops s " . 
		"LEFT JOIN (select stopid, max(date) lastscan from qr_tracker group by stopid) q on concat('MARTA_', s.stopid) = q.stopid " .
		"where s.agency='MARTA' and s.abandoned <> 1  and (DATEDIFF(NOW(), s.adoptedtime) < 32 or (q.lastscan is not null and DATEDIFF(NOW(), q.lastscan) < 32)) " .
		"union SELECT stopid, 'WRONGPOLE' reason FROM stopdb WHERE type <> 'SGN' "

	);

	if(!$nonEligibleStopsResult) {
		exit(json_encode(array('status'=>'failure')));
	}

	$nonEligibleStops = array();
	while ($row = $nonEligibleStopsResult->fetch_array(MYSQLI_NUM)) {
		$stop = array('stopid' => $row[0], 'reason' => $row[1]);
		$nonEligibleStops[] = $stop;
	}

	// Iterate through stop data returned by OneBusAway.
	// Mark stop with ids that match the query above as ineligible.
	// Also mark non-MARTA stops ineligible.
	$stopList = $stopsAtLocation['data']['list'];
	foreach ($nonEligibleStops as $exclStop) {
		$index = 0;
		foreach($stopList as $obaStop) {
			if ($obaStop['id'] == 'MARTA_' . $exclStop['stopid']) { // Workaround to make OneBusAway understand MARTA data.
				$stopsAtLocation['data']['list'][$index]['reason'] = $exclStop['reason'];
			}
			if (substr($obaStop['id'], 0, 6) != 'MARTA_') {
				$stopsAtLocation['data']['list'][$index]['reason'] = 'WRONGAGENCY';
			}
			$index++;
		}
	}

	echo json_encode($stopsAtLocation);	
}
else {
	echo "lat/lon parameters were not specified.";
}

?>