<?php
include("updater-presets.php");

$v = $_DB->query(<<<EOT
    update gtfs_trips t, (select st.trip_id, min(st.departure_time) trip_start_time, max(st.departure_time) trip_end_time from gtfs_stop_times st group by st.trip_id) tst
    set t.trip_start_time = tst.trip_start_time, t.trip_end_time = tst.trip_end_time
    where t.trip_id = tst.trip_id
EOT
);
if (!$v) error("Error populating trip start times.");

finish("Trip Start Times");
?>
