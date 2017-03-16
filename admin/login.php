<?php
include('../lib/db.php');
include('../lib/admindb.php');
init_db();

if(isset($_COOKIE["adminsid"]) && validateAdminSession($_COOKIE["adminsid"])) {
    header('Location: index.php');
    exit();
}

?>

<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>MARTA Army Admin</title>

    <link href="../jslib/bootstrap/css/bootstrap.min.css" rel="stylesheet">
    <link href="../jslib/font-awesome/css/font-awesome.min.css" rel="stylesheet" type="text/css">

    <link href="../css/admin/sb-admin.css" rel="stylesheet">
    <link id="theme-style" rel="stylesheet" href="../css/float-label.css">
    

    <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
        <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
        <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->

</head>

<body>

    <div id="wrapper">
        <nav class="navbar navbar-inverse navbar-fixed-top" role="navigation">
            <div class="navbar-header">
                <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-ex1-collapse">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <a class="navbar-brand" href="index.html">MARTA Army</a>
            </div>
        </nav>

        <div id="page-wrapper">
            <div class="container-fluid">

                <!-- Page Heading -->
                <div class="row">
                    <div class="col-lg-12">
                        <h1 class="page-header">
                            Login
                        </h1>

                        <form action='login-submit.php' method='POST' style='width: 400px'>
                            <div class='form-group float-label'>
                                <label>Username</label>
                                <span class="error-message"></span>
                                <input type='text' name='username' class='form-control'/>
                            </div>
                            <div class='form-group float-label'>
                                <label>Password </label>
                                <span class="error-message"></span>
                                <input type='password' name='password' class='form-control'/>
                            </div>
                            <button type="submit" id='submit-button' class="btn btn-success">Login</button>
                        </form>
                    </div>
                </div>
                <!-- /.row -->

            </div>
            <!-- /.container-fluid -->

        </div> <!-- /#page-wrapper -->
        

    </div> <!-- /#wrapper -->

    
    <script type="text/javascript" src="../jslib/jquery-2.1.4.min.js"></script>
    <script type="text/javascript" src="../jslib/bootstrap/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="../js/float-label.js"></script>
</body>

</html>

<?php
function getTimelyTripStats($soldiers) {
    
    function getStopsFromSoldier($s) { 
        return array_merge(
            $s['stops_notgiven'], $s['stops_notasks'], $s['stops_pendingtasks'], 
            $s['stops_overduetasks'], $s['stops_uptodate']
        );
    }

    $allstops_2d = array_map("getStopsFromSoldier", $soldiers);
    $allstops = array();

    $nosign_count = 0;

    foreach($allstops_2d as $stopsarr) {
        foreach($stopsarr as $stop) {
            if(!$stop['given']) $nosign_count++;

            $allstops[] = $stop;
        }
    }

    return array('num_soldiers'=>count($soldiers), 'num_stops'=>count($allstops), 'num_nosign'=>$nosign_count);
}

?>
