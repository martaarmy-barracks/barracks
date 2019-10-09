<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <title>Adopt-A-Stop - MARTA Army</title>
    <link href='https://api.mapbox.com/mapbox.js/v3.1.1/mapbox.css' rel='stylesheet' />
    
    <style>
    .leaflet-control-mapbox-geocoder.active .leaflet-control-mapbox-geocoder-wrap { 
        width: 400px;
    }
    .leaflet-control-mapbox-geocoder .leaflet-control-mapbox-geocoder-form input {
        width: 400px;
    }

    label, p, .stopselectedtitle {
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
        margin-bottom: 8px;
        box-sizing: border-box;
    }
    .form-group > input[type=text], .form-group > select {
        width: 100%;
        display: block;
        box-sizing: border-box;
        font-size: 14px;
        padding: 6px 6px 6px 100px;        
        border: 1px solid #ccc;
        background-color: #fafafa;
    }
    .form-group label {
        position: absolute;
        padding: 5px 6px;
    }
    /*.form-group > input:focus { outline: 0;}*/

    #stoplist p#nostopselectedmsg {
        font-style: italic;
        font-family: sans-serif;
        font-size: 0.8em;
        font-weight: 100;
    }
    #stoplist_ol li a { font-family: sans-serif; font-size: 14px; font-style: italic; opacity: 0.7; line-height: 18px; }

    button, a.btn {
        text-transform: uppercase;
        color: #fff;
        background-color: #1a1a1a;
        border: none;
        font-family: raleway;
        font-size: 12px;
        padding: 10px 15px;
        cursor: pointer;
    }

    body {margin: 0; overflow-x: hidden;}
    form {padding: 4px; box-sizing: border-box;}
    .btn, .btn-nav {float: right;}
    .btn-nav.back {float: left; text-decoration: underline;}
    #master-map {width:100%; height:100%;}
    #map-frame {width: 100%;}
    #signup-form, #map-frame, #logo {position:absolute;}
    #logo {width: 75px; height: 75px; top: 40px; left: 10px;}

    /* Initial states */
    #success-tab, #info-tab, #stoplist_ol, #error-message {display: none;}

    </style>
    <style>
        #signup-form {width:100%; height:50%; top:50%;}
        #map-frame {height:50%; left: 0;}
    </style>
    <style media="screen and (min-width:800px)">
        #signup-form {width:400px; height:100%; top: 0;}
        #map-frame {height:100%; left:400px; padding-right: 400px; box-sizing: border-box;}
    </style>
</head> 

<body>
    <div id="map-frame">
        <div id='master-map'></div>
        <img id='logo' src='images/marta-army-square.png'/>
    </div>
    <form id='signup-form'>
        <div id="stops-tab">
            <a class="btn btn-nav next">Next</a>        

            <div class='form-group' id='stopmap-div'>
                <div id='stopselection'>
                    <div class='stopselectedtitle'>Select the stops to adopt:</div>
                    <div id='stoplist'>
                        <p id='nostopselectedmsg'>No stops selected. Pick from above map, then click Next.</p>
                        <ol id='stoplist_ol'>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
        <div id="info-tab">
            <div class='stopselectedtitle'>Enter your contact info:</div>
            <div class='form-group'>
                <label for='name'>Name*:</label>
                <input type='text' id='name' name='name' class='form-control' placeholder='J Smith'/>
            </div>
            <div class='form-group'>
                <label for='email'>Email*:</label>
                <input type='text' id='email' name='email' class='form-control' placeholder='jsmith@example.com'/>
            </div>
            <div class='form-group' style="display:none">
                <label for='email'>Phone number (optional)</label>
                <input type='text' id='phone' name='phone' class='form-control'/>
            </div>

            <label for='event'>When can you pick up your sign? *</label>
            <div class='form-group'>
                <select id='event' name='event' class='form-control' style="padding-left:inherit">
                    <option disabled value="0">Sorry, an error occured finding events.</option>
                </select>
                <p id="event-details" style="display:none;">
                    <a target="_blank" id="event-url">Registration or tickets may be required to attend this event. (Click for more information.)</a>
                </p>
            </div>
            <div class='form-group'>
                <label for='comment'>Comments:</label>
                <input type='text' id='comment' name='comment' class='form-control' placeholder='(Optional) I like MARTA Army because...' />
            </div>
            <p id='error-message'></p>

            <a class="btn-nav back">Back to list of stops</a>
            <button type="submit" class="btn btn-success" >Sign Up</button>

        </div>
        <div id='success-tab'>
            <p>Thank you for adopting a bus stop today!</p>        
        </div>
    </form>
    
    <!-- Javascript -->          
    <script type="text/javascript" src="jslib/jquery-2.1.4.min.js"></script>
    <script src='https://api.mapbox.com/mapbox.js/v3.1.1/mapbox.js'></script>
    <script type="text/javascript" src="js/coremap.js"></script>
    <script type="text/javascript" src="js/register-iframe1.js"></script>
</body>
</html> 
