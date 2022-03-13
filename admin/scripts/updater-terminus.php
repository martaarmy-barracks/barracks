<?php
include("updater-presets.php");

// Populates terminus_id and name into gtfs_trips.
/* ORIGINAL query (takes too long, must be split per below.)
update gtfs_trips t, gtfs_stop_times st, gtfs_stops s, 
(select trip_id, max(stop_sequence) sq from gtfs_stop_times group by trip_id) t1 
set t.terminus_id = st.stop_id, t.terminus_name = s.stop_name 
where t.trip_id = t1.trip_id and st.stop_id = s.stop_id and t1.trip_id = st.trip_id and st.stop_sequence = t1.sq
*/
$v = $_DB->query(<<<EOT
    update gtfs_trips t, gtfs_stop_times st,
    (select trip_id, max(stop_sequence) sq from gtfs_stop_times group by trip_id) t1
    set t.terminus_id = st.stop_id
    where t.trip_id = t1.trip_id and t1.trip_id = st.trip_id and st.stop_sequence = t1.sq
EOT
);
if (!$v) error("Error populating terminus data.");

$v = $_DB->query(<<<EOT
    update gtfs_trips t, gtfs_stops s
    set t.terminus_name = s.stop_name
    where t.terminus_id = s.stop_id
EOT
);
if (!$v) error("Error populating terminus names.");


// Replaces gtfs_trips.terminus_name with value from terminues_names.
$v = $_DB->query(<<<EOT
    update gtfs_trips t, terminus_names tn, gtfs_stops s
    set t.terminus_name = tn.stop_name
    where t.terminus_id = s.stop_id
    and tn.stop_id = s.stop_code
EOT
);
if (!$v) error("Error populating enhanced terminus names.");


// Empty and populate table bus_terminus (for full-size signs)
$v = $_DB->query("DELETE from bus_terminus WHERE 1");
if (!$v) error("Error in truncating bus_terminus");

$v = $_DB->query(<<<EOT
    insert into bus_terminus
    (route_short_name, route_id, direction_id, stop_id, stop_code, stop_name, is_station)
    
    select distinct r.route_short_name, t.route_id, -(t.direction_id - 1) direction_id, s.stop_id, s.stop_code,
    case when tn.stop_name is null then s.stop_name else tn.stop_name end stop_name,
    case when s.stop_name like '% STATION%' or tn.stop_name like '% STATION%' then 1 when s.stop_name like '% RIDE%' or tn.stop_name like '% RIDE%' then 1 else 0 end is_station
    
    from gtfs_stop_times st, gtfs_trips t, gtfs_routes r, gtfs_stops s
    left join terminus_names tn on tn.stop_id = s.stop_code
    
    where t.trip_id = st.trip_id
    and r.route_id = t.route_id
    and s.stop_id = st.stop_id

    and st.stop_sequence = 1
    and t.service_id <> 2
EOT
);
if (!$v) error("Error populating bus_terminus");
    
finish("Terminus Update");
?>
