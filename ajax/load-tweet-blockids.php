<?php
date_default_timezone_set('America/New_York');
include_once('../lib/db.php');
include_once('../lib/dbutils.php');

$skipDb = ($_DB != null);
if ($skipDb) echo "Skipping DB init.";
else init_db();


getBlockIdForTweets();
if (!$skipDb) {
	echo "Closing.";
	mysqli_close($_DB);
}


function getBlockIdForTweets() {
	global $_DB;
	// echo "Getting block id for tweets...";

	$query = <<<END

update gtfs_trips t, (select * from gtfs_stop_times where stop_sequence = 1) st, gtfs_routes r, service_tweets tw
set tw.trip_id = t.trip_id, tw.block_id = t.block_id
WHERE tw.trip_id is null and tw.block_id is null
and t.trip_id = st.trip_id
and r.route_id = t.route_id
and st.departure_time = tw.stdtime
and t.service_id = tw.service_id
and r.route_short_name = tw.route
and t.direction_id = tw.direction_id
	
END;

	$r = execSimpleQuery($query);
	var_dump($r);

	if ($r) echo "Success. ";
}
?>