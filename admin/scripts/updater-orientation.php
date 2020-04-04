<?php
include("updater-presets.php");

// non-stop-specific query.
$v = $_DB->query( <<<EOT
update gtfs_stops s, 
(
select stop_id, case
when angle > -22.5 and angle < 22.5 then 'E'
when angle >= 22.5 and angle < 67.5 then 'NE'
when angle >= 67.5 and angle < 112.5 then 'N'
when angle >= 112.5 and angle < 157.5 then 'NW'
when angle >= 157.5 and angle <= 180.0 then 'W'
when angle <= -22.5 and angle > -67.5 then 'SE'
when angle <= -67.5 and angle > -112.5 then 'S'
when angle <= -112.5 and angle > -157.5 then 'SW'
when angle <= -157.5 and angle >= -180.0 then 'W'
else 'U' end orientation
from
(

select a.stop_id, 180/PI() * atan(sh.shape_pt_lat - a.lat1, sh.shape_pt_lon - a.lon1) angle from gtfs_shapes sh, 
(


SELECT y.stop_id, y.shape_id, sh.shape_pt_lat lat1, sh.shape_pt_lon lon1, sh.shape_pt_sequence seq1, sh.shape_pt_sequence+1 seq2
from gtfs_shapes sh,
(
    SELECT z.stop_id, z.shape_id, z.stop_lat, z.stop_lon,
    min(pow(sh.shape_pt_lat - z.stop_lat, 2) + pow(sh.shape_pt_lon - z.stop_lon, 2)) dist from gtfs_shapes sh,
    (
        select z1.shape_id, z1.stop_id, s.stop_lat, s.stop_lon
        from gtfs_stops s, (
            select min(t.shape_id) shape_id, st.stop_id from gtfs_trips t, gtfs_stop_times st
            where t.trip_id = st.trip_id group by st.stop_id
        ) z1
        where z1.stop_id = s.stop_id
    ) z
    where sh.shape_id = z.shape_id group by z.stop_id

) y where y.shape_id = sh.shape_id and y.dist = pow(sh.shape_pt_lat - y.stop_lat, 2) + pow(sh.shape_pt_lon - y.stop_lon, 2)



) a where sh.shape_id = a.shape_id and sh.shape_pt_sequence = a.seq2
) b


) t1

set s.orientation = t1.orientation where s.stop_id = t1.stop_id
EOT
);
if (!$v) error("Error populating stop orientation.");

finish("Stop Orientation");
?>
