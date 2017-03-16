<?php /****** REQUIRES '$user', '$css' VARIABLES TO BE AVAILABLE BEFORE BEING INCLUDED ******/ ?>
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
    <!-- Global CSS -->
    <link rel="stylesheet" href="jslib/bootstrap/css/bootstrap.min.css">   
    <!-- Plugins CSS -->
    <link rel="stylesheet" href="jslib/font-awesome/css/font-awesome.css">
    <link rel="stylesheet" href="jslib/ionicons/css/ionicons.css">
    <link id="theme-style" rel="stylesheet" href="css/float-label.css">
    
    <!-- Theme CSS -->  
    <link rel="stylesheet" href="css/main.css">
    <?php
    foreach($css as $c) {
        echo "<link rel='stylesheet' href='css/$c'>";
    }
    ?>
    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
    
</head> 

<body>
    <!-- ******HEADER****** --> 
    <header class="header">
        <div class="container"> 
            <div class='row'>                      
                <div class="title-content col-xs-6">
                    <img class="logo-image img-responsive" src="images/marta-army.png" alt="The MARTA Army" />
                    <h1 class="title">Barracks</h1>
                </div>
                <div class="profile-content col-xs-6 col-sm-3 col-sm-offset-3">
                    <div class='welcome dropdown'>
                        <p class='name dropdown-toggle' data-toggle="dropdown">
                            <?php echo $user['name']; ?>
                            <span class="down-icon glyphicon glyphicon-chevron-down" aria-hidden="true"></span>
                        </p>
                        <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">
                            <li><a href='prefs.php'>Change Password</a></li>
                            <li><a id='logout'>Logout</a></li>
                        </ul>
                    </div>
                    <div id='rank' data-value='<?php echo $user['points']; ?>'
                    data-toggle='tooltip' data-placement="bottom" title=''>
                        <p class='rank-name-container'><i class="ionicons ion-ribbon-b"></i> <span id='rank-name'>Captain</span> </p>
                        <div id="rank-progress"></div>
                    </div>
                    <!-- opt: password change etc -->
                    <!-- opt: link to "ladder system" -->
                </div>
            </div> <!-- //row-->
        </div><!--//container-->
    </header><!--//header-->