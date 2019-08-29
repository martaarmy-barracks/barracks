<?php
function execSimpleQuery($query) {
    global $_DB;
    $results = $_DB->query($query);
    
    if(!$results) {
        exit(json_encode(array('status'=>'failure')));
    }    
}
?>