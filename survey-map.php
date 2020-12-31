<?php
date_default_timezone_set("America/New_York");

$SURVEY_DEADLINE = strtotime("2021-01-01");
if (strtotime("now") < $SURVEY_DEADLINE) {
    header("Location: http://" . $_SERVER["HTTP_HOST"] . "/survey-map-open.php", true, 307);
    exit;
}
else {
    header("Location: http://" . $_SERVER["HTTP_HOST"] . "/survey-map-closed.php", true, 307);
    exit;
}
