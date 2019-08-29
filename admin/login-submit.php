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

$userid = null;
if ($stmt->bind_result($userid)) {
    while ($stmt->fetch()) {
        break; // once only.
    };
}
else {
	header('Location: login.php?msg=Database+Error');
    exit();
}
$stmt->close();

if($userid == null) { 
	header('Location: login.php?msg=Bad+Login');
    exit();
}


$adminsid = get_random_string_len(16);

$stmt = $_DB->prepare("INSERT INTO adminsessions (id, userid) VALUES (?, ?)");
$stmt->bind_param('si', $adminsid, $userid);
$stmt->execute();

setcookie('adminsid', $adminsid, time()+3600*24*7); // expire in a week.

mysqli_close($_DB);

header('Location: index.php');
?>
