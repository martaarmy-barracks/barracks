<?php
include("./lib/redirect-to-https.php");
$showLargeWelcome = isset($_REQUEST["from"]) && !isset($_COOKIE["welcomed"]);
?>
<!DOCTYPE html>
<html>
<head>
    <title>Bus Stop Census - MARTA Army</title>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="https://api.mapbox.com/mapbox.js/v3.1.1/mapbox.css" />
    <link rel="stylesheet" href="css/coremap.css" />
    <style>
        h1 {
            font-size: 24px;
        }
        .message {
            position: absolute;
            bottom: 20px;
            left: 5px;
            right: 5px;
            text-align: center;
            background-color: #fff;
            font-family: sans-serif;
            padding-bottom: 10px;
        }
        .welcome {
            top: 5px;
            padding-top: 40px;
        }
    </style>
</head>

<body>
    <div id="master-map" class="full-screen"></div>
    <img class="ma-logo" src="images/census.png" style="width: 129px; height: 51px;" />
    <img class="ma-logo" src="images/marta-army-square.png" style="width: 50px; height: 50px; top: 85px;" />

    <div class="message hint">
        <p><b>Welcome!</b></p>
        <div>Zoom and pan the map, and click the marker for your bus stop.</div>
        <div>Click 'Take the Bus Stop Census' to start the survey.</div>
        <div><button onclick="javascript:$('.hint').hide();">OK</button></div>
    </div>

    <?php
    if ($showLargeWelcome) {
    ?>
        <div class="message welcome">
            <div><img src="images/censusbg600x200.jpg" style="width: 100%; max-width: 600px;" /></div>
            <div>
                <h1>Operation Bus Stop Census</h1>
                <p>Hi! Thank you for fighting for Transit Equity and for helping MARTA Army and our partners
                    catalog the state of bus stops around Atlanta.
                </p>
                <p>
                    Your participation to <b>Operation Bus Stop Census</b> will
                    help inform jurisdictions on bus stop access and the work needed to raise the quality of bus stop amenities.
                </p>
                <div><button>Start</button></div>
            </div>
        </div>
    <?php
    }
    ?>

    <script src="jslib/jquery-2.1.4.min.js"></script>
    <script src="https://api.mapbox.com/mapbox.js/v3.1.1/mapbox.js"></script>
    <script src="js/coremap.js"></script>
    <script>
    $(function() {
        coremap.init({
            useDeviceLocation: true,
            dynamicFetch: true,
            excludeInitiatives: true,
            onGetContent: function(m) {
                var shortStopId = m.stopid.split("_")[1];
                var isStationFacility = m.stopname.indexOf("STATION") >= 0 
                    && m.stopname.indexOf("STATION)") == -1;

                var stopNameParts = m.stopname.split("@");
                var street = stopNameParts[0].trim();
                var landmark = (stopNameParts[1] || "").trim();
                
                return isStationFacility ? {} : {
                    links: "<a target='_blank' href='stopinfo.php?sid=" + m.stopid + "'>Arrivals</a>"
                        + "<br/><b><a target='_blank' href='/wp/5-2/?stopid=" + shortStopId + "&street=" + street + "&landmark=" + landmark + "'>Take the Bus Stop Census</a></b>" //,
                    // description: !m.amenities ? "" : ("<br/>At this stop: " + m.amenities
                    //	+ "<br/><a target='_blank' href='https://docs.google.com/forms/d/e/1FAIpQLScpNuf9aMtBiLA2KUbgvD0D5565RmWt5Li2HfiuLlb-2i3kUA/viewform?usp=pp_url&entry.460249385=" + m.stopid + "&entry.666706278=" + m.stopname.replace(" ", "+") + "'>Report incorrect data</a>")
                }
            }
        });
        $(".welcome button").click(function () {
            $(".welcome").hide();
            document.cookie = "census-welcomed=true; expires=" + new Date(new Date().valueOf() + 3600000*24*30).toUTCString() + "; path=/";
        });
    });
    </script>
</body>
</html> 
