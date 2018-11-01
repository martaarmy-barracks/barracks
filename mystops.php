<?php
include('lib/db.php');
include('lib/admindb.php');
$useFake = 0;
$authorizedCampaignId = "274b98379c";

if ($useFake == 0) init_db();
?>

<!DOCTYPE html>
<!--[if IE 8]> <html lang="en" class="ie8"> <![endif]-->  
<!--[if IE 9]> <html lang="en" class="ie9"> <![endif]-->  
<!--[if !IE]><!--> <html lang="en"> <!--<![endif]-->  
<head>
    <title>MARTA Army - Manage My Stops</title>
    <!-- Meta -->
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- <link rel="shortcut icon" href="favicon.ico">  -->

    <!-- <link href='http://fonts.googleapis.com/css?family=Lato:300,400,300italic,400italic' rel='stylesheet' type='text/css'> -->
    <link href='https://fonts.googleapis.com/css?family=Raleway:400,300,100,200' rel='stylesheet' type='text/css'>    
    <link href='https://api.mapbox.com/mapbox.js/v2.2.2/mapbox.css' rel='stylesheet' />

    <!-- <link rel="stylesheet" href="jslib/bootstrap/css/bootstrap.min.css">   
    <link rel="stylesheet" href="jslib/font-awesome/css/font-awesome.css">
    <link rel="stylesheet" href="jslib/ionicons/css/ionicons.css">     -->
    
    <!-- Theme CSS -->  
    <style type="text/css">
    label, p {
        font-family: Garamond,Baskerville,Baskerville Old Face,Hoefler Text,Times New Roman,serif; 
        font-size: 18px;
        color: rgba(26,26,26,0.7);
        display: block;
    }
    li { 
        font-family: Garamond,Baskerville,Baskerville Old Face,Hoefler Text,Times New Roman,serif; 
        font-size: 18px;
        color: rgba(26,26,26,0.7);
    }
    p.helptext {
        margin: 0 0 10px 0;
        font-style: italic;
        font-family: sans-serif;
        font-size: 0.8em;
        font-weight: 100;
    }
    .form-group {
        width: 100%;
        box-sizing: border-box;
    }
    .form-group > input[type=text], .form-group > input[type=email] {
        width: 100%;
        box-sizing: border-box;
        display: block;
        font-family: sans-serif;
        font-size: 12px;
        padding: 12px;
        margin: 6px 0 28px 0;
        border: 1px solid #ccc;
        background-color: #fafafa;
    }
    .form-group > input:focus { outline: 0;}

    #map { width: 70%; height: 500px; float: left; }
    #stoplist { width: 30%; float: left; }

    #stoplist p { margin-left: 20px; }
    #stoplist p.stopselectedtitle {
        margin: 0 0 0 20px;
    }
    #stoplist p#nostopselectedmsg {
        font-style: italic;
        font-family: sans-serif;
        font-size: 0.8em;
        font-weight: 100;
        margin: 0 0 10px 20px;
    }
    #stoplist_ol { display: none; }
    #stoplist_ol li span.stopid { display: none; }
    #stoplist_ol li a { font-family: sans-serif; font-size: 14px; font-style: italic; opacity: 0.7; line-height: 18px; }

    #stopmap-div { margin-bottom: 20px; }
    #stopaddress-div { display: none; }

    button {
        text-transform: uppercase;
        color: #fff;
        background-color: #1a1a1a;
        border: none;
        font-family: raleway;
        padding: 10px 15px;
        font-size: 14px;
        letter-spacing: 2px;
    }
    #success-message {
        display: none;
    }
    #error-message {
        display: none;
        color: #f77;
    }

    .leaflet-control-mapbox-geocoder.active .leaflet-control-mapbox-geocoder-wrap { 
        width: 400px;
    }
    .leaflet-control-mapbox-geocoder .leaflet-control-mapbox-geocoder-form input {
        width: 400px;
    }
    table {
        border-collapse: collapse;
    }
    table td, table th {
        border: 1px solid #AAAAAA;
        padding: 4px;
    }
    </style>

    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
    
</head> 

<body>

    <?php 
    $campaignId = "";
    if(isset($_REQUEST["campaign"])) $campaignId = $_REQUEST["campaign"];

    if (!isset($_REQUEST["campaign"]) || strcmp($campaignId, $authorizedCampaignId) != 0) {
        header('HTTP/1.0 503 Unavailable');
        echo "<p>Sorry, this service is not available. (HTTP 503 Unavailable)</p>";
    }
    else if(!isset($_REQUEST["email"])) {
    ?>
    <h1><img src="images/timelytrip_mini.png" alt="MARTA Army - TimelyTrip Adopt-A-Stop"/></h1>
            <form id="lookup-form" action="mystops.php" method="post">
                <div class='form-group'>
                    <label for='email'>Enter your email or user ID:</label>
                    <input type='email' id='email' name='email' class='form-control' placeholder='address@email.com'/>
                </div>
                <button type="submit" class="btn btn-success" >Find</button>
            </form>
    <?php
    } else {
        $email = $_REQUEST["email"];
    ?>
    <h1><img src="images/timelytrip_mini.png" alt="MARTA Army - TimelyTrip Adopt-A-Stop"/></h1>
            <p><?=$email?> - Rank: Soldier</p>
            <h2>Manage My Stops</h2>

            <table>
            <thead><tr><th></th><th>Stop No.</th><th>Stop Name</th><th>Name on Sign</th><th colspan="2">Print sign</th></tr></thead>
            <tbody>
            <?php 
            $myStops = getMyStops($email);
            $count = 0;
            
            foreach($myStops as $s) {
                $count++;

                $stopId = $s->stopId;
                $stopName = $s->stopName;
                $signType = $s->signType;
                $status = $s->status;
                $nameOnSign = $s->nameOnSign;

                $fullSizeUrl = "http://barracks.martaarmy.org/admin/bus-sign/signs.php?sids[]=MARTA_$stopId&adopters[]=$nameOnSign";
                $miniSizeUrl = "http://barracks.martaarmy.org/admin/bus-sign/mini.php?sids[]=MARTA_$stopId&adopters[]=$nameOnSign";

                echo "<tr><td>$count</td><td>$stopId</td><td>$stopName</td><td>$nameOnSign</td><td><a href='$fullSizeUrl'>Full-size</a></td><td><a href='$miniSizeUrl'>Sticker-size</a></td></tr>";
            }

            ?>
            </tbody>
            </table>
            <p><?=$count ?> stops found.</p>



            <h2>Find More Stops</h2>
            <form id='signup-form'>
                <div class='form-group' id='stopmap-div'>
                    <label for='stoptoadopt'>Find the stop(s) you want to adopt *</label>
                    <p class='helptext'>
                        Enter the approximate address of the bus stop, and then pick it out from the map.<br/>
                        <!--If you can't find your stops on the map, <a href='#' class='togglelink'>click here</a>.-->
                    </p>
                    <div id='stopselection'>
                        <div id="map"></div>
                        <div id='stoplist'>
                            <p class='stopselectedtitle'>Stops selected:</p>
                            <p id='nostopselectedmsg'>None</p>
                            <ol id='stoplist_ol'>
                            </ol>
                        </div>
                    </div>
                    <br style='clear:both'/>            
                </div>
                <!--div class='form-group' id='stopaddress-div'>
                    <label for='stoptoadopt'>Address of bus stop(s) you want to adopt *</label>
                    <p class='helptext'>
                        Enter the names or addresses of the bus stops you wish to adopt.<br/>
                        If you want to pick your stops on a map, <a href='#' class='togglelink'>click here</a>.
                    </p>
                    <input type='text' id='stoptoadopt' name='stoptoadopt' class='form-control'/>
                </div-->
                <p id='error-message'></p>
                <button type="submit" class="btn btn-success" >Adopt selected stops</button>
            </form>
            <p id='success-message'>Thank you! We'll get in touch with you asap.</p>

            <!-- Javascript -->          
            <script type="text/javascript" src="jslib/jquery-2.1.4.min.js"></script>
            <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/json2/20150503/json2.min.js"></script>
            <script src='https://api.mapbox.com/mapbox.js/v2.2.2/mapbox.js'></script>
            <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.6/d3.min.js"></script>
            <script type="text/javascript" src="js/mystops.js"></script>

    <?php
    }
    ?>
    
    
</body>
</html> 

<?php
class MyStop {
	var $id, $stopId, $stopName, $signType, $nameOnSign, $status;

	function __construct($id, $stopId, $stopName, $signType, $nameOnSign, $status) {
		$this->id = $id;
		$this->stopName = $stopName;
		$this->stopId = $stopId;
		$this->signType = $signType;
        $this->nameOnSign = $nameOnSign;
        $this->status = $status;
	}
}

function getMyStops($emailOrUserid) {
	global $_DB;
    global $useFake;

    $myStops = array();
    if ($useFake == 0) {
        $stmt = $_DB->prepare(
            "SELECT a.id, a.stopid, a.type, a.stopname, a.nameonsign, 'Given' status FROM `adoptedstops` a, users u "
            . "WHERE a.userid = u.id and (u.email = (?) or u.id = (?)) and a.abandoned <> 1 order by a.stopid asc"
        );
        $stmt->bind_param('ss', $emailOrUserid, $emailOrUserid);
        $stmt->execute();
        $results = $stmt->get_result();

        while ($row = $results->fetch_array(MYSQLI_NUM)) {
            $id = $row[0];
            $stopId = $row[1];
            $signType = $row[2];
            $stopName = $row[3];
            $nameOnSign = $row[4];
            $status = $row[5];
            $stop = new MyStop($id, $stopId, $stopName, $signType, $nameOnSign, $status);

            $myStops[] = $stop;
        }	

    }
    else {
        for ($i = 0; $i < 5; $i++) {
            $id = $i;
            $stopId = $i;
            $signType = "SM";
            $stopName = "Peachtree $i";
            $nameOnSign = "George P. Burdell";
            $status = "Given";
            $stop = new MyStop($id, $stopId, $stopName, $signType, $nameOnSign, $status);

            $myStops[] = $stop;            
        }        
    }

	return $myStops;
}
?>
