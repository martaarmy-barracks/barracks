<?php
include('../lib/db.php');
include('../lib/admindb.php');
init_db();

if (redirectIfNotAdmin("login.php")) exit();

?>
<!DOCTYPE html>
<html lang="en" ng-app="MA_Barracks">
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

                <ul class="nav nav-tabs">
                    <li class="active"><a data-toggle="tab" href="#soldiers">Soldiers &amp; Signs</a></li>
                    <li><a data-toggle="tab" href="#markuptools">GTFS Tools</a></li>
                    <li><a data-toggle="tab" href="#busterminus">Terminus Tools</a></li>
                    <li><a data-toggle="tab" href="#distribution">Tracking Tools</a></li>
                </ul>                
                <div class="tab-content">
                    <div id="soldiers" class="tab-pane fade in active">
                        <h3>Soldiers &amp; Signs</h3>
                        <div class="row" ng-controller="SoldiersStopCtrl">
                                <div class="col-lg-12">
                                    <div class="panel panel-default">
                                        <div class="panel-heading">
                                            <h3 class="panel-title" style="display:inline-block;"><span class="huge"><i class="fa fa-users fa-fw"></i>{{soldiers.length}}</span> Soldiers</h3>
                                            
                                            <!--div class="btn-group" data-toggle="buttons"-->
                                            <span><a class='btn btn-primary' href='#' id='new-soldier-button' title="Register new soldier">+</a></span>
                                            <span class="btn-group">
                                                <label class="btn btn-primary active"><input type="radio" ng-value="true" ng-model="activeFilter" />Active ({{activeCount}})</label>
                                                <label class="btn btn-primary"><input type="radio" ng-value="false" ng-model="activeFilter" />Inactive ({{inactiveCount}})</label>
                                            </span>
            
                                            <span class="huge"><i class="fa fa-bus fa-fw"></i>{{activeStopCount}}</span> Stops Adopted,
                                            {{givenStopCount}} with signs, {{activeStopCount - givenStopCount}} without.
                                        </div>
                                        <div class="panel-body">
                                            <div class="text-left">
                                                <button id='get-emails' class='btn btn-primary'><i class='fa fa-envelope'></i> Get Emails</button>
                                                <button id='get-signs' class='btn btn-primary'><i class='fa fa-envelope'></i> Get Signs</button>
                                                <button id='signs-from-emails-button' class='btn btn-primary'><i class='fa fa-envelope'></i>Get Signs From Emails</button>
                                            </div>
                                            <div class="table-responsive">
                                                <table id='soldiers-table' class="table table-bordered table-hover table-striped">
                                                    <thead>
                                                        <tr>
                                                            <th>Select <br/><a id='select-all-soldiers' href='#'>All</a> | <a id='select-none-soldiers' href='#'>None</a></th>
                                                            <th>Name</th>
                                                            <th>Stops (excludes abandoned)</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
            <tr ng-repeat="s in soldiers | filter: {isActive: activeFilter}" data-userid="{{s.id}}">
                <td class='selection'><input type='checkbox'/></td>
                <td class='user-data $notesclass'>
                    <a class='soldier-name' href='#'>{{s.name}}</a>
                    <span class='email'>{{s.email}}</span>
                    <span class='phone'>{{s.phone}}</span>
                    <span class='notes'>{{s.notes}}</span>
                    <br/><span class='update-date'>Updated {{formatDate(s.updatedate.date)}}</span>
                    <br/><span class='join-date'>Joined {{formatDate(s.joindate.date)}}</span>
                </td>
                <td>
                    <ul class="stoplist">
                        <li ng-repeat="st in s.stops | filter: {abandoned: false}">
                            <span class="stop {{getStopClass(st)}}" title="{{getStopTitle(st)}}">
                                <span class='id'>{{st.id}}</span>
                                <span class='adoptedtime'>{{formatDate(st.adoptedtime)}}</span>
                                <span class='stopid'>{{st.stopid}}</span>
                                <span class='fa fa-file-o' ng-show="st.dateprinted"></span>
                                <span class='fa fa-clock-o' ng-show="st.dateexpire"></span>
                                
                                <span class="busroute">{{formatRoutes(st)}}</span>
                                <span class='name'>{{st.stopname}}</span>
                                <span class='agency'>{{st.agency}}</span>
                                <span class='given'>{{isGiven(st)}}</span>
                                <span class='nameonsign'>{{st.nameonsign ? st.nameonsign : s.name}}</span>
                            </span>
                            
                        </li> 
                    </ul>
                </td>
                <!--td class='notgiven-td'>Old - not given stops</td>
                <td class='notask-td'>Old - given stops</td-->
                <td><a href='#' class='addstoplink'>Add Stop</a></td>
            </tr>
                    
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- /.row -->
                    </div>
                    <div id="markuptools" class="tab-pane fade" ng-controller="GtfsManagerCtrl">
                        <div ng-repeat="s in commands">
                            <h3>{{s.header}}</h3>
                            <p>{{s.description}}</p>
                            <p><a class="btn btn-primary" href="#" ng-click="executeAllSteps(s)">Execute {{s.header}}</a></p>
                            <ol>
                                <li ng-repeat="st in s.steps">
                                    {{st.text}} ({{st.url}})
                                    <span class="progress" style="display:inline-block; width: 120px; margin: 0;" ng-if="st.isRunning">
                                        <div class="progress-bar progress-bar-striped active" role="progressbar" style="width: 100%"></div>
                                    </span>
                                    <span ng-if="st.outcome" style="display:inline-block; max-height:1.1em; max-width:400px; overflow: hidden;"> - {{st.outcome}}</span>
                                </li>
                            </ol>        
                        </div>
        
                            
                        <h3>Sign Expiration</h3>
                        <div class="row">
                                <div><a class='btn btn-primary' href='#' id='update-stop-routes-button'>Update routes for adopted stops</a></div>
                                <div><a class='btn btn-primary' href='#' id='get-emails-for-changed-routes'>Get user emails for changed routes</a>
                                <div><a class='btn btn-primary' href='#' id='expire-stops-with-changed-routes'>Expire stops with changed routes</a>
                                    Changed routes: <input id="changed-routes-input" size="40" placeholder="110,140,258" />
                                    Expiration date: <input id="expiration-input" size="10" placeholder="yyyy-MM-dd" /></div>                        
                                </div>
                            <div>Recent markups:
                                <ul>
                                    <li>2017-08-05: 1,12,30,33,37,67,68,75,78,79,81,82,84,93,119,120,121,125,140,141,162,189,191,192,193,194,195,196,221,800</li>
                                    <li>2017-12-09: 3,4,6,12,13,16,19,24,32,36,37,40,42,49,55,74,78,81,86,95,107,110,111,115,116,126,140,141,142,155,162,172,186,194,295</li>
                                    <li>2018-04-14: 1,3,12,13,14,24,26,37,39,40,50,51,53,56,58,60,66,67,68,82,84,93,94,116,121,153,165,180,181,189,191,195,196,850,867</li>
                                    <li>2018-08-18: 2,3,5,6,9,14,15,16,21,25,27,30,32,33,36,49,60,68,74,99,102,104,107,109,110,124,133,142,148,153,165,180,185,192,195,196,809,816,825,832,867,899</li>
                                </ul>
                            </div>
                        </div>

                        <h3>Database Tables</h3>
                        <p>Use <a href="table_definitions.txt">the snippets in this script</a> to repair database tables in phpMyAdmin.</p>

                    </div>
                    <div id="busterminus" class="tab-pane fade" ng-controller="TerminusManagerCtrl">
                        <h3>Manage Bus Terminus Names</h3>
                        <p><a href ng-click="populate()">Populate</a> and review how the terminus names below will be displayed
                        on our signs, stickers, and real-time interface, and update the ones you need.</p>
                        <p><a href="bus-sign/busdata/MARTA/updater-terminus.php">Reprocess terminii when you are done</a></p>

                        <table class="table table-bordered table-hover table-striped">
                            <tr><th>ID</th><th>Name</th><th>Routes</th></tr>
                            <tr>
                                <td><input style="width:100%;min-width:75px;" type="text" ng-model="newItem[0]" placeholder="Enter stop ID" /></td>
                                <td>
                                    <input style="width:100%;min-width:400px;" type="text" ng-model="newItem[1]" placeholder="Enter stop name" />
                                    <br/><input type="button" value="Add stop" ng-click="updateName(newItem);terminii.push(newItem);" />
                                </td>
                            </tr>
                            <tr ng-repeat="t in terminii">
                                <td>{{t[0]}}</td>
                                <td style="min-width:400px;">
                                    <span ng-if="t.msg">{{t.msg}}: </span>
                                    <span ng-if="state.editedItem!=t">{{t[1]}} <a href ng-click="state.editedItem=t; t.msg=undefined;">Edit</a></span>
                                    <span ng-if="state.editedItem==t">
                                        <input style="width:100%;min-width:400px;" type="text" ng-model="t[1]" placeholder="Enter stop name" />
                                        <br/><input type="button" value="Apply" ng-click="updateName(t)" /><input type="button" value="Cancel" ng-click="state.editedItem=undefined" />
                                    </span>
                                </td>
                                <td>{{t[2]}}</td>
                            </tr>
                        </table>
                        <p ng-if="errorMsg">{{errorMsg}}</p>

                    </div>
                    <div id="distribution" class="tab-pane fade">
                        <h3>Manage Sign Status</h3>
                        <p>Scan the QR code below and pick an action. Then, scan the QR code on a sign to manage its status.</p>
                        <?php
                            $qrcode_url = "http://barracks.martaarmy.org/admin/bus-sign/qr_master.php";
                            echo "<img class='QR' src='bus-sign/qr.php?p=$qrcode_url' title='$qrcode_url'/>";
                        ?>
                    </div>
                </div>

            </div><!-- /.container-fluid -->
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
                    <!-- Print from: <input class="signs-base-url" value="http://localhost/barracks/admin/" / -->
                    Print from: <input class="signs-base-url" value="http://barracks.martaarmy.org/admin/" />
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
                <div class='modal-body' style='height:1050px;'>
                    <iframe src='../register-iframe.php' style='width:100%; height:100%; border:none;'></iframe>
                </div>
                <div class='modal-footer'>
                    <button type='button' class='btn btn-default' data-dismiss='modal'>Close</a>
                </div>
            </div>
        </div>
    </div>

    <div class='modal fade' id='signs-from-emails-modal'>
        <div class="modal-dialog"  style='width:1000px;'>
            <div class='modal-content' style="height: 800px;">
                <div class='modal-header'>
                    <h4 class='modal-title operation-title'>Get signs from email</h4>
                </div>
                <div class='modal-body' style='height:650px; overflow-y:auto;'>
                    <textarea id='signs-from-emails-input' style='width:100%;'></textarea>
                    <div id='signs-from-emails-results'></div>

                </div>
                <div class='modal-footer'>
                    <button type='button' class='btn btn-primary getsigns-submit'>Get Signs</button>
                    <button type='button' class='btn btn-default' data-dismiss='modal'>Cancel</a>
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
    <script type="text/javascript" src="../jslib/angular.min.js"></script>
    <script type="text/javascript" src="../jslib/bootstrap/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="../js/admin/timelytrip.js"></script>
    <script type="text/javascript" src="../js/float-label.js"></script>
    <script type="text/javascript" src="../js/admin/barracks.js"></script>

    <script>
    var soldiers = <?php echo json_encode(getTimelyTripSoldiers()); ?>;
    </script>

</body>
</html>
