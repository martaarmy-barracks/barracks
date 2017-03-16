<?php

$adminsid = $_COOKIE['adminsid'];

include('../lib/db.php');
init_db();

setcookie('adminsid', '', time()-1); // expire in a year
header('Location: login.php');

$stmt = $_DB->prepare("DELETE adminsessions WHERE id=?");
$stmt->bind_param('s', $adminsid);
$stmt->execute();

?>