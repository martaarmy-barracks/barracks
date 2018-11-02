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
	$stopList = getJson('http://barracks.martaarmy.org/ajax/get-stops-at-location.php' .
			'?lat=' . $lat . '&lon=' . $lon . '&radius=0.008');
	
	// Get stops that are not eligible, catch the reason for ineligibility:
	// - type <> 'SGN' (we have loaded that data into the stopdb table).$_COOKIE
	// - All bus stops already adopted with sign given and not abandonned.
	$nonEligibleStopsResult = $_DB->query(
		"SELECT stopid, 'ADOPTED' reason FROM adoptedstops s WHERE s.agency='MARTA' and s.abandoned <> 1 " .
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
	foreach ($nonEligibleStops as $exclStop) {
		$index = 0;
		foreach($stopList as $obaStop) {
			if ($obaStop['id'] == 'MARTA_' . $exclStop['stopid']) { // Workaround to make OneBusAway understand MARTA data.
				$stopList[$index]['reason'] = $exclStop['reason'];
			}
			$index++;
		}
	}

	echo json_encode($stopList);	
}
else {
	echo "lat/lon parameters were not specified.";
}

?>