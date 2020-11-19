<!DOCTYPE html>
<html>
<head>
    <title>Layout test</title>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            margin: 0;
        }
        h1 {
            font-size: 24px;
        }
        #root > * {
            position: absolute;
        }
        #info-pane {
            box-sizing: border-box;            
            display: block;
            background-color: #ffffff;
            padding: 8px;
        }
        #map-pane {
            bottom: 0;
            left: 0;
            right: 0;
            top: 0;
        }
        .collapse-button {
            background: transparent;
            border: none;
            display: block;
            padding: 4px;
        }
        .collapse-button:hover {
            background: #D0D0D0;
        }
        @media screen and (min-width:801px) {
            #info-pane {
                transition: left 0.2s;
                bottom: 0;
                left: -400px;
                top: 0;
                width:400px;
            }
            .info-visible #info-pane {
                left: 0;
            }
            .info-visible #map-pane {
                bottom: 0;
                left: 400px;
            }
            .collapse-button {
                float: right;
                border-radius: 4px;
                font-size: 200%;
                line-height: 1em;
            }
            .collapse-button > span:before {
                content: "×";
            }
        }
        @media screen and (max-width:800px) {
            #info-pane {
                transition: top 0.2s;
                left: 0;
                top: 100%;
                width: 100%;
            }
            .info-visible #info-pane {
                top: 60%;
            }
            .info-visible #map-pane {
                bottom: 40%;
                left: 0;
            }
            .collapse-button {
                float: none;
                line-height: 8px;
                margin-top: -8px;
                width: 100%;
            }
            .collapse-button > span {
                background-color: grey;
                border-radius: 4px;
                display: inline-block;
                height: 4px;
                width: 100px;
            }
            .collapse-button > span:before {
                background-color: grey;
                border-radius: 4px;
                display: inline-block;
            }
        }
    </style>
    <script src="jslib/jquery-2.1.4.min.js"></script>
</head>

<body>
    <div id="root" class="info-visible">
        <div id="map-pane" style="background-color: #FFCC00;">
            Map Pane
        </div>
        <div id="info-pane">
            <button class="collapse-button" onclick="$('#root').removeClass('info-visible')" title="Click to collapse pane.">
                <span></span>
            </button>
            <div class="message hint">
                <p><b>Welcome!</b></p>
                <div>Zoom and pan the map to find your bus stop, then click its marker.</div>
                <div>Can't find your stop? <a href="/wp/5-2/">Start a blank survey.</a></div>
            </div>
        </div>
    </div>    

</body>
</html> 
