<?php
if(!isset($_POST['username']) || !isset($_POST['password'])) {
	header('Location: login.php?msg=Invalid');
    exit();
}

$username = $_POST['username'];
$password = $_POST['password'];

include('../lib/db.php');
include('../lib/admindb.php');
init_db();

// todo: dont store plaintext passwords!
$stmt = $_DB->prepare("SELECT id FROM admins WHERE username=? AND password=?");
$stmt->bind_param('ss', $username, $password);
$stmt->execute();
$results = $stmt->get_result();
if($results->num_rows != 1) { 
	header('Location: login.php?msg=Bad+Login');
    exit();
}

$row = $results->fetch_array(MYSQLI_NUM);
$userid = $row[0];

$adminsid = get_random_string_len(16);

$stmt = $_DB->prepare("INSERT INTO adminsessions (id, userid) VALUES (?, ?)");
$stmt->bind_param('si', $adminsid, $userid);
$stmt->execute();

setcookie('adminsid', $adminsid, time()+3600*24*365); // expire in a year

header('Location: index.php');

?>