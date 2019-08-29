<?php

header('Content-Type: application/json');

function finishWith($status) {
	exit(json_encode(array('status'=>$status)));
}

include('../lib/db.php');
init_db();

$stopIdReq = trim($_REQUEST['stopid']);
$headsignsOnlyReq = false;
if (isset($_REQUEST['headsignsonly'])) $headsignsOnlyReq = (trim($_REQUEST['headsignsonly']) <> "0");

echo getScheduleForStop($stopIdReq, $headsignsOnlyReq);

mysqli_close($_DB);

function getScheduleForStop($stopId, $headsignsOnly) {
	global $_DB;

	/*
    -- Existing query
select CONCAT('{\"route\": \"', route_short_name, '\", \"route_id\": \"', route_id, '\", \"direction_id\": \"', direction_id,  '\", \"dest\": \"', destination, '\", \"',
case x.service_id when 5 then 'weekday' when 3 then 'saturday' when 4 then 'sunday' end, '\": [',
              GROUP_CONCAT(distinct concat('\"', departure_time, '\"') order by departure_time separator ','),
      ']}') departuresbyday from

(SELECT r.route_short_name, r.route_id, t.trip_headsign, t.service_id, t.direction_id, st.departure_time, bt.stop_name destination FROM `gtfs_stop_times` st, gtfs_trips t, gtfs_routes r, bus_terminus bt
WHERE st.trip_id = t.trip_id
and t.route_id = r.route_id
and bt.route_id = t.route_id
and bt.direction_id = t.direction_id
and st.stop_id = 901229
) x

group by x.route_id, x.service_id


-- better query
select CONCAT('{\"route\": \"', x.route_short_name, '\", \"route_id\": \"', x.route_id, '\", \"direction_id\": \"', x.direction_id, '\", \"dest\": \"', y.destinations, '\", \"',
case x.service_id when 5 then 'weekday' when 3 then 'saturday' when 4 then 'sunday' end, '\": [',
GROUP_CONCAT(distinct concat('\"', x.departure_time, case when y.destinations like concat(x.destination, '%') then '' else '*' end, '\"') order by departure_time separator ','),


']}') departuresbyday from



(SELECT r.route_short_name, r.route_id, t.service_id, t.direction_id, st.departure_time, t.terminus_name destination FROM gtfs_stop_times st, gtfs_trips t, gtfs_routes r


WHERE st.trip_id = t.trip_id

and t.route_id = r.route_id

and st.stop_id = 902435


) x,

(

select route_id, group_concat(destination order by occurrences desc separator ' or *') destinations from
(
SELECT t.route_id, t.terminus_name destination, count(t.terminus_name) occurrences from gtfs_stop_times st, gtfs_trips t
WHERE st.trip_id = t.trip_id
and st.stop_id = 902435

group by t.route_id, t.terminus_name
order by t.route_id, count(t.terminus_name) desc
) t3

) y

where y.route_id = x.route_id
group by x.route_id, x.service_id









Output for:
http://barracks.martaarmy.org/ajax/get-schedule-for-stop.php?stopid=901229

{"stop_id": "901230", "stop_name": "10TH ST NE @ PIEDMONT AVE NE", "orientation": "E", "timetables": [
	{"route": "36", "route_id": "7656", "direction_id": "0", "dest": "DECATUR STATION - SWANTON WAY",
		"saturday": ["06:37:11","07:37:11","08:37:11","09:37:11","10:37:11","11:37:11","12:37:11","13:37:11","14:37:11","15:37:11","16:37:11","17:37:11","18:37:11","19:37:11","20:37:11"]},
	{"route": "36", "route_id": "7656", "direction_id": "0", "dest": "DECATUR STATION - SWANTON WAY",
		"sunday": ["06:37:11","07:37:11","08:37:11","09:37:11","10:37:11","11:37:11","12:37:11","13:37:11","14:37:11","15:37:11","16:37:11","17:37:11","18:37:11","19:37:11","20:37:11"]},
	{"route": "36", "route_id": "7656", "direction_id": "0", "dest": "DECATUR STATION - SWANTON WAY",
		"weekday": ["05:57:11","06:37:11","07:17:11","07:57:11","08:37:11","09:17:11","09:57:11","10:37:11","11:17:11","11:57:11","12:37:11","13:17:11","13:57:11","14:37:11","15:17:11","15:57:44","16:37:44","17:17:44","17:57:44","18:37:11","19:17:11","19:57:11","20:37:11","21:17:11","21:57:11","22:37:11","23:17:11","23:57:11"]},
	{"route": "109", "route_id": "7693", "direction_id": "1", "dest": "GA STATE STATION - PIEDMONT AVE",
		"weekday": ["05:43:15","06:23:15","07:03:15","07:43:15","08:23:15","09:03:15","09:43:15","10:23:15","11:03:15","11:43:15","12:23:15","13:03:15","13:43:15","14:23:15","15:03:15","15:43:15","16:23:15","17:03:15","17:43:15","18:23:15","19:03:15","19:43:15","20:23:15","21:03:15","21:43:15","22:23:15","23:03:15"]}
]}

Output for:
http://barracks.martaarmy.org/ajax/get-schedule-for-stop.php?stopid=901229&headsignsonly=1

{"stop_id": "901230", "stop_name": "10TH ST NE @ PIEDMONT AVE NE", "orientation": "E", "timetables": [
	{"route": "36", "route_id": "7656", "direction_id": "0", "dest": "DECATUR STATION - SWANTON WAY",
		"saturday": []},
	{"route": "36", "route_id": "7656", "direction_id": "0", "dest": "DECATUR STATION - SWANTON WAY",
		"sunday": []},
	{"route": "36", "route_id": "7656", "direction_id": "0", "dest": "DECATUR STATION - SWANTON WAY",
		"weekday": []},
	{"route": "109", "route_id": "7693", "direction_id": "1", "dest": "GA STATE STATION - PIEDMONT AVE",
		"weekday": []}
]}

	*/

	$query2 = "select stop_name, orientation from gtfs_stops where stop_id = ($stopId)";
	if (!$queryResult2 = $_DB->query($query2)) {
		exit(json_encode(array('status'=>'failure')));
	}
	
	$stopname = null;
	$orientation = null;
	while ($row = $queryResult2->fetch_array(MYSQLI_NUM)) {
		$stopname = $row[0];
		$orientation = $row[1];
		break;	
	}


    $query =
        "select CONCAT('{\"route\": \"', x.route_short_name, '\", \"route_id\": \"', x.route_id, '\", \"direction_id\": \"', x.direction_id, '\", \"dest\": \"', y.destinations, '\", \"', " .
        "case x.service_id when 5 then 'weekday' when 3 then 'saturday' when 4 then 'sunday' end, '\": [', " .
				($headsignsOnly ? "GROUP_CONCAT('' order by departure_time separator '')" :  "GROUP_CONCAT(distinct concat('\"', x.departure_time, case when y.destinations like concat(x.destination, '%') then '' else '*' end, '\"') order by departure_time separator ','), ") .
		  "']}') departuresbyday from " .

		"(SELECT r.route_short_name, r.route_id, t.service_id, t.direction_id, st.departure_time, t.terminus_name destination FROM gtfs_stop_times st, gtfs_trips t, gtfs_routes r " .
		"WHERE st.trip_id = t.trip_id and t.route_id = r.route_id and st.stop_id = ($stopId) ) x, " .

        "(select route_id, group_concat(destination order by occurrences desc separator ' or *') destinations from ( " .
            "SELECT t.route_id, t.terminus_name destination, count(t.terminus_name) occurrences from gtfs_stop_times st, gtfs_trips t " .
            "WHERE st.trip_id = t.trip_id and st.stop_id = ($stopId) " .

            "group by t.route_id, t.terminus_name order by t.route_id, count(t.terminus_name) desc " .
        ") t3 ) y " .

        "where y.route_id = x.route_id group by x.route_id, x.service_id "
    ;

	if (!$queryResult = $_DB->query($query)) {
		exit(json_encode(array('status'=>'failure')));
	}
	

	$output = "{\"stop_id\": \"" . $stopId . "\", \"stop_name\": \"" . $stopname . "\", \"orientation\": \"" . $orientation . "\", \"timetables\": [";
	$first = true;
	while ($row = $queryResult->fetch_array(MYSQLI_NUM)) {
		if (!$first) $output .= ",";
		$output .= $row[0];
		$first = false;
	}

	$output .= "]}";
	return $output;
}

?>