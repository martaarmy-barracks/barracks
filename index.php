<?php
include('lib/db.php');

init_db();

if(isset($_COOKIE["sid"])) {
    $sid = $_COOKIE["sid"];
    $user = getSessionUser($sid);

    if(!is_null($user)) {
        header('Location: home.php');
        exit();
    } else {
        setcookie('session', '', time() - 3600);
    }
}

?>
<!DOCTYPE html>
<!--[if IE 8]> <html lang="en" class="ie8"> <![endif]-->  
<!--[if IE 9]> <html lang="en" class="ie9"> <![endif]-->  
<!--[if !IE]><!--> <html lang="en"> <!--<![endif]-->  
<head>
    <title>The MARTA Army Barracks</title>
    <!-- Meta -->
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <link rel="shortcut icon" href="favicon.ico"> 

    <link href='http://fonts.googleapis.com/css?family=Lato:300,400,300italic,400italic' rel='stylesheet' type='text/css'>
    <link href='http://fonts.googleapis.com/css?family=Montserrat:400,700' rel='stylesheet' type='text/css'> 
    
    <link rel="stylesheet" href="jslib/bootstrap/css/bootstrap.min.css">   
    <link rel="stylesheet" href="jslib/font-awesome/css/font-awesome.css">
    <link rel="stylesheet" href="jslib/ionicons/css/ionicons.css">    
    
    <!-- Theme CSS -->  
    <link id="theme-style" rel="stylesheet" href="css/main.css">
    <link id="theme-style" rel="stylesheet" href="css/float-label.css">
    <link id="theme-style" rel="stylesheet" href="css/login.css">

    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
    
</head> 

<body>

    <div class="container-fluid login-page-container">
        <div class='shader'></div>
        <div class="row">
            <div class="col-xs-12 login-page-content">
                <img class="big-logo-image" src="images/marta-army-white.png" alt="The MARTA Army"/>
                <h1 class="title">Barracks</h1>
            </div>
        </div>

        <div class="row" id='login-page-content'>
            
        </div>
    </div>
    
    <?php
    $scripts = array('login.js', 'register.js');
    include('common/footer.php');
    ?>
 

