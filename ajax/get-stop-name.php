<?php
header('Content-Type: application/json');

include('stop-funcs.php');
include('../lib/db.php');
init_db();

echo json_encode(getStopName($_DB, $_REQUEST['stopid']));

mysqli_close($_DB);
?>
