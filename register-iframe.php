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
    .form-group > input[type=text] {
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
    </style>

    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
    
</head> 

<body>

    <form id='signup-form'>
        <div class='form-group'>
            <label for='name'>Name *</label>
            <input type='text' id='name' name='name' class='form-control'/>
        </div>
        <div class='form-group'>
            <label for='email'>Email address *</label>
            <input type='text' id='email' name='email' class='form-control'/>
        </div>
        <div class='form-group'>
            <label for='email'>Phone number (optional)</label>
            <input type='text' id='phone' name='phone' class='form-control'/>
        </div>
        <div class='form-group' id='stopmap-div'>
            <label for='stoptoadopt'>Find the stop(s) you want to adopt *</label>
            <p class='helptext'>
                Enter the approximate address of the bus stop, and then pick it out from the map.<br/>
                If you can't find your stops on the map, <a href='#' class='togglelink'>click here</a>.
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
        <div class='form-group' id='stopaddress-div'>
            <label for='stoptoadopt'>Address of bus stop(s) you want to adopt *</label>
            <p class='helptext'>
                Enter the names or addresses of the bus stops you wish to adopt.<br/>
                If you want to pick your stops on a map, <a href='#' class='togglelink'>click here</a>.
            </p>
            <input type='text' id='stoptoadopt' name='stoptoadopt' class='form-control'/>
        </div>
        <div class='form-group'>
            <label for='comment'>Comment (Anything - why you want to adopt a stop, why you like transit, etc) *</label>
            <input type='text' id='comment' name='comment' class='form-control'/>
        </div>
        <p id='error-message'></p>
        <button type="submit" class="btn btn-success" >Sign Up</button>
    </form>
    <p id='success-message'>Thank you! We'll get in touch with you asap.</p>

    
    <!-- Javascript -->          
    <script type="text/javascript" src="jslib/jquery-2.1.4.min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/json2/20150503/json2.min.js"></script>
    <script src='https://api.mapbox.com/mapbox.js/v2.2.2/mapbox.js'></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.6/d3.min.js"></script>
    <script type="text/javascript" src="js/register-iframe.js"></script>
    
</body>
</html> 

