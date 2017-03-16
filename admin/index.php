<?php
include('../lib/db.php');
include('../lib/admindb.php');
init_db();

if(!isset($_COOKIE["adminsid"])) {
    header('Location: login.php');
    exit();
}

if(!validateAdminSession($_COOKIE["adminsid"])) {
    header('Location: login.php');
    exit();
}



$soldiers = getTimelyTripSoldiers();

$stats = getTimelyTripStats($soldiers);

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
    <link href="../css/admin/timelytrip.css" rel="stylesheet">
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
            <!-- Top Menu Items -->
            <ul class="nav navbar-right top-nav">
                <!-- <li class="dropdown">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown"><i class="fa fa-dashboard"></i> Operation TimelyTrip <b class="caret"></b></a>
                    <ul class="dropdown-menu">
                        <li>
                            <a href="#"><i class="fa fa-fw fa-power-off"></i> Operation TimelyTrip</a>
                        </li>
                    </ul>
                </li> -->

                <li><a href='#'><i class="fa fa-dashboard"></i> Operation TimelyTrip</a></li>
                <li>
                    <a href="logout.php"><i class="fa fa-key"></i> Logout</a>
                </li>
                
            </ul>
        </nav>

        <div id="page-wrapper">
            <div class="container-fluid">

                <!-- Page Heading -->
                <div class="row">
                    <div class="col-lg-12">
                        <h1 class="page-header">
                            Operation TimelyTrip <small>Operation Dashboard</small>
                        </h1>
                    </div>
                </div>

                <div class="row">
                    <div class="col-sm-3">
                        <div class="panel panel-green">
                            <div class="panel-heading">
                                <div class="row">
                                    <div class="col-xs-3">
                                        <i class="fa fa-users fa-5x"></i>
                                    </div>
                                    <div class="col-xs-9 text-right">
                                        <div class="huge"><?php echo $stats['num_soldiers']; ?></div>
                                        <div>Total soldiers</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="panel panel-yellow">
                            <div class="panel-heading">
                                <div class="row">
                                    <div class="col-xs-3">
                                        <i class="fa fa-bus fa-5x"></i>
                                    </div>
                                    <div class="col-xs-9 text-right">
                                        <div class="huge"><?php echo $stats['num_stops']; ?></div>
                                        <div>Stops adopted</div>
                                    </div>
                                </div>
                            </div>
                        </div> 

                        <div><a class='btn btn-primary' href='#' id='new-soldier-button'>Register new soldier</a></div>                      
                    </div>

                    <div class="col-sm-4">
                        <table class="table table-bordered table-hover table-striped">
                            <tr><td>Stops without signs</td><td><?php echo $stats['num_notgiven']; ?></td></tr>
                            <tr><td>Stops with signs given</td><td><?php echo $stats['num_given']; ?></td></tr>
                        </table>
                    </div>
                </div>
                <!-- /.row -->

                <div class="row">
                    <div class="col-lg-12">
                        <div class="panel panel-default">
                            <div class="panel-heading">
                                <h3 class="panel-title"><i class="fa fa-user fa-fw"></i> Soldiers</h3>
                            </div>
                            <div class="panel-body">
                                <div class="text-left">
                                    <button id='get-emails' class='btn btn-primary'><i class='fa fa-envelope'></i> Get Emails</button>
                                    <button id='get-signs' class='btn btn-primary'><i class='fa fa-envelope'></i> Get Signs</button>
                                    <p></p>
                                </div>
                                <div class="table-responsive">
                                    <table id='soldiers-table' class="table table-bordered table-hover table-striped">
                                        <thead>
                                            <tr>
                                                <th>Select <br/><a id='select-all-soldiers' href='#'>All</a> | <a id='select-none-soldiers' href='#'>None</a></th>
                                                <th>Updated Date <br/>&amp; time</th>
                                                <th>Name</th>
                                                <th>Stops without signs<br/> <a id='select-nosign-all-soldiers' href='#'>All</a> | <a id='select-nosign-none-soldiers' href='#'>None</a></th>
                                                <th>Stops with signs given <br/> <a id='select-sign-notask-all-soldiers' href='#'>All</a> | <a id='select-sign-notask-none-soldiers' href='#'>None</a></th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
<?php
    function formatDateTime($dt) { return $dt->format('j-M-Y') . "<br/>" . $dt->format('g:iA'); }

    foreach($soldiers as $s) {
        $userid = $s->id;
        $name = $s->name;
        $email = $s->email;
        $phone = $s->phone;
        $notes = $s->notes;
        $joindate = formatDateTime($s->joindate);
        $updatedate = formatDateTime($s->updatedate);

        $notesclass = '';
        if(!is_null($notes)) {
            $notes = htmlentities($notes);
            $notesclass = 'hasnotes';
        }

        $notgivenhtml = '';
        foreach($s->stops_notgiven as $st) {
            $notgivenhtml .= getStopHtml($st, 'not-given');
        }

        $givenhtml = '';
        foreach($s->stops_given as $st) {
            $givenhtml .= getStopHtml($st, 'no-tasks');
        }

        echo <<<SOLDIER_ROW
                                            <tr data-userid='$userid'>
                                                <td class='selection'><input type='checkbox'/></td>
                                                <td class='dates'>
                                                    <span class='update-date'>$updatedate</span>
                                                    <span class='join-date'>$joindate</span>
                                                </td>
                                                <td class='user-data $notesclass'>
                                                    <a class='soldier-name' href='#'>$name</a>
                                                    <span class='email'>$email</span>
                                                    <span class='phone'>$phone</span>
                                                    <span class='notes'>$notes</span>
                                                </td>
                                                <td class='notgiven-td'>$notgivenhtml</td>
                                                <td class='notask-td'>$givenhtml</td>
                                                <td><a href='#' class='addstoplink'>Add Stop</a></td>
                                            </tr>
SOLDIER_ROW;
    }

    function getStopHtml($st, $extraclass) {
        $stopname = trim($st->stopname);
        if(empty($stopname)) {
            $stopname = '(no name)';
            $extraclass .= ' noname ';
        }

        $id = $st->id;
        $adoptedtime = $st->adoptedtime->format('j-M-Y/g:iA');
        $stopid = $st->stopid;
        $agency = $st->agency;
        $stopgiven = $st->given ? 'true' : 'false';
        $nameonsign = $st->given ? $st->nameonsign : '';
        $abandoned = $st->abandoned;
        $type = $st->type;
        
        if(is_null($stopid)) {
            $extraclass .= " nostopid ";
            $stopid = '';
        }
        else if($abandoned) {
            $extraclass .= " abandoned ";
        }
        else if ($type != 'SGN') {
            $extraclass .= " noteligible ";
        }
        

	$title = $stopname . "\n" . $stopid . ' - ' . $type;
	if ($stopid == '') $title .= "\nStop ID not populated. Determine Stop ID before printing.";
	else if ($abandoned) $title .= "\nAbandonned. Assign to and print from another soldier.";
	else if ($type != 'SGN') $title .= "\nShould not print, unless there is a U-channel pole at that location.";

        return <<<STOP
        <span class='stop $extraclass' title='$title'>
            <span class='id'>$id</span>
            <span class='adoptedtime'>$adoptedtime</span>
            <span class='name'>$stopname</span>
            <span class='stopid'>$stopid</span>
            <span class='agency'>$agency</span>
            <span class='given'>$stopgiven</span>
            <span class='nameonsign'>$nameonsign</span>
        </span>
STOP;
    }
?>

                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- /.row -->

            </div>
            <!-- /.container-fluid -->

        </div> <!-- /#page-wrapper -->
        

    </div> <!-- /#wrapper -->

    <div class='modal fade' id='stopdetail-modal'>
        <div class="modal-dialog">
            <div class='modal-content'>
                <div class='modal-header'>
                    <h4 class='modal-title operation-title'>Update Stop Details</h4>
                </div>
                <div class='modal-body'>
                    
                    <form>
                        <div class='form-group float-label stopname'>
                            <label>Stop Name</label>
                            <span class="error-message"></span>
                            <input type='text' class='form-control'/>
                        </div>
                        <p><b>Adopted date/time:</b> <span class='adoptedtime'></span></p>
                        <div class='form-group float-label stopid'>
                            <label>Stop Id</label>
                            <span class="error-message"></span>
                            <input type='text' class='form-control'/>
                        </div>
                        <div class='form-group agency'>
                            <label>Agency</label>
                            <select>
                                <option value=''>Not Set</option>
                                <option value='MARTA'>MARTA</option>
                                <option value='CCT'>CCT</option>
                                <option value='GRTA'>GRTA</option>
                            </select>
                        </div>
                        <div class='form-group given'>
                            <span class="error-message"></span>
                            <input type='checkbox' class='form-control'/>
                            <label>Sign Given</label>
                        </div>
                        <div class='form-group float-label nameonsign'>
                            <label>Name on sign</label>
                            <span class="error-message"></span>
                            <input type='text' class='form-control'/>
                        </div>
                        <div class='form-group abandoned'>
                            <span class="error-message"></span>
                            <input type='checkbox' class='form-control'/>
                            <label>Stop abandoned</label>
                        </div>

                    </form>
                </div>
                <div class='modal-footer'>
                    <button type='button' class='btn btn-default get-sign'>Get Sign</a>
                    <button type='button' class='btn btn-default' data-dismiss='modal'>Cancel</a>
                    <button type='button' class='btn btn-primary stopdetail-submit'>Update</button>
                </div>
            </div>
        </div>
    </div>

    <div class='modal fade' id='newsoldier-modal'>
        <div class="modal-dialog"  style='width:1000px;'>
            <div class='modal-content' style="height: 1200px;">
                <div class='modal-header'>
                    <h4 class='modal-title operation-title'>Register New Soldier</h4>
                </div>
                <div class='modal-body' style='height:1080px;'>
                    <iframe src='../register-iframe.php' style='width:100%; height:100%; border:none;'></iframe>
                </div>
                <div class='modal-footer'>
                    <button type='button' class='btn btn-default' data-dismiss='modal'>Close</a>
                </div>
            </div>
        </div>
    </div>

    <div class='modal fade' id='addstop-modal'>
        <div class="modal-dialog">
            <div class='modal-content'>
                <div class='modal-header'>
                    <h4 class='modal-title operation-title'>Add Adopted Stop</h4>
                </div>
                <div class='modal-body'>

                    <form>
                        <div class='form-group float-label stopname'>
                            <label>Stop Name</label>
                            <span class="error-message"></span>
                            <input type='text' class='form-control'/>
                        </div>
                        <div class='form-group float-label stopid'>
                            <label>Stop Id</label>
                            <span class="error-message"></span>
                            <input type='text' class='form-control'/>
                        </div>
                        <div class='form-group agency'>
                            <label>Agency</label>
                            <select><option value='MARTA'>MARTA</option><option value='CCT'>CCT</option><option value='GRTA'>GRTA</option></select>
                        </div>

                    </form>
                </div>
                <div class='modal-footer'>
                    <button type='button' class='btn btn-default' data-dismiss='modal'>Cancel</a>
                    <button type='button' class='btn btn-primary addstop-submit'>Add Stop</button>
                </div>
            </div>
        </div>
    </div>

    <div class='modal fade' id='email-list-modal'>
        <div class="modal-dialog">
            <div class='modal-content'>
                <div class='modal-header'>
                    <h4 class='modal-title operation-title'>Selected Emails</h4>
                    <p>Select these emails and copy them</p>
                </div>
                <div class='modal-body'>
                    
                </div>
                <div class='modal-footer'>
                    <button type='button' class='btn btn-default' data-dismiss='modal'>Okay</a>
                </div>
            </div>
        </div>
    </div>

    <div class='modal fade' id='soldier-details-modal'>
        <div class="modal-dialog">
            <div class='modal-content'>
                <div class='modal-header'>
                    <h4 class='modal-title operation-title'>Soldier details</h4>
                </div>
                <div class='modal-body'>
                    <form>
                        <div class='form-group float-label soldiername'>
                            <label>Name</label>
                            <span class="error-message"></span>
                            <input type='text' class='form-control'/>
                        </div>
                        <div class='form-group float-label soldieremail'>
                            <label>Email</label>
                            <span class="error-message"></span>
                            <input type='text' class='form-control'/>
                        </div>
                        <div class='form-group float-label soldierphone'>
                            <label>Phone</label>
                            <span class="error-message"></span>
                            <input type='text' class='form-control'/>
                        </div>
                        <div class='form-group float-label soldiernotes'>
                            <label>Notes</label>
                            <span class="error-message"></span>
                            <textarea class='form-control'></textarea>
                        </div>
                    </form>
                </div>
                <div class='modal-footer'>
                    <button type='button' class='btn btn-default' data-dismiss='modal'>Okay</a>
                    <button type='button' class='btn btn-primary update-soldierdetails'>Update</a>
                </div>
            </div>
        </div>
    </div>

    <div class='modal fade' id='get-signs-modal'>
        <div class="modal-dialog">
            <div class='modal-content'>
                <div class='modal-header'>
                    <h4 class='modal-title operation-title'>Create Signs</h4>
                    <p>These are the signs that are going to be created</p>
                </div>
                <div class='modal-body'>
                    <table id='signs-to-print-table' class="table table-bordered table-hover table-striped">
                        <thead><tr>
                        <th>Adopter Name</th>
                        <th>Stops with signs NEVER given<br/> <a id='select-never-given-signs' href='#'>All</a> | <a id='deselect-never-given-signs' href='#'>None</a></th>
                        <th>Stops with signs previously given <br/> <a id='select-previously-given-signs' href='#'>All</a> | <a id='deselect-previously-given-signs' href='#'>None</a></th>
                        </tr></thead>
                        <tbody></tbody>
                    </table>
                </div>
                <div class='modal-footer'>
                    <button type='button' class='btn btn-default' data-dismiss='modal'>Cancel</a>
                    <button type='button' class='btn btn-default copy-stopids'>Copy Stopids</a>
                    <button type='button' class='btn btn-primary get-signs-ok-button'>Okay, Get PDF</a>
                </div>
            </div>
        </div>
    </div>
    
    <script type="text/javascript" src="../jslib/jquery-2.1.4.min.js"></script>
    <script type="text/javascript" src="../jslib/bootstrap/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="../js/admin/timelytrip.js"></script>
    <script type="text/javascript" src="../js/float-label.js"></script>
</body>

</html>

<?php
function getTimelyTripStats($soldiers) {
    $nosign_count = 0;

    $total_stops_adopted = 0;
    $total_stops_given = 0;
    $total_stops_notgiven = 0;

    foreach($soldiers as $s) {
        $total_stops_adopted += count($s->stops);
        $total_stops_given += count($s->stops_given);
        $total_stops_notgiven += count($s->stops_notgiven);
    }

    return array('num_soldiers'=>count($soldiers), 
        'num_stops'=>$total_stops_adopted, 
        'num_given'=>$total_stops_given,
        'num_notgiven'=>$total_stops_notgiven);
}

?>
