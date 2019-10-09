<?php
function execSimpleQuery($query) {
    global $_DB;
    $results = $_DB->query($query);
    
    //var_dump($results);

    if($results == FALSE) {
        exit(json_encode(array('status'=>'failure')));
	}
	return $results;
}
?>