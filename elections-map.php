<?php
include("./lib/redirect-to-https.php");
include("config.php");
?>
<!DOCTYPE html>
<html>
<head>
    <title>Elections Map - MARTA Army</title>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body>
    <div id="master-map" class="full-screen"></div>
    <div id="logo">
        <a href="https://www.martaarmy.org/" title="To the MARTA Army website"><img class="ma-logo-gl" src="images/marta-army-square.png" alt="MARTA Army logo" /></a>
    </div>

    <script src="jslib/jquery-2.1.4.min.js"></script>
    <script src='https://api.mapbox.com/mapbox-gl-js/v1.11.0/mapbox-gl.js'></script>
    <script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.5.1/mapbox-gl-geocoder.min.js"></script>
    <script src="js/coremap-gl.js"></script>
    <script src="js/map-presets.js"></script>
    <link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/v1.11.0/mapbox-gl.css" />
    <link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.5.1/mapbox-gl-geocoder.css" type="text/css" />
    <link rel="stylesheet" href="css/coremap.css" />

    <script>
    var electionsPresets = {
        fultonEarly: [
            // Fulton: Retrieved 10/4/2020 https://fultoncountyga.gov/services/voting-and-elections/early-voting-locations
            {id:"MARTA_Fulton_Early_01", lon: -84.3917605823057, lat: 33.8752940222011, name: "Chastain Park Gymnasium", addr: "140 W Wieuca Rd"},
            {id:"MARTA_Fulton_Early_02", lon: -84.4916274569987, lat: 33.7536976470116, name: "C.T. Martin Natatorium & Recreation Center", addr: "3201 M L King Jr Dr SW"},
            {id:"MARTA_Fulton_Early_03", lon: -84.5578599750675, lat: 33.5873189750927, name: "Etris Community Center", addr: "5285 Lakeside Dr,107/12R"},
            {id:"MARTA_Fulton_Early_04", lon: -84.5874973061374, lat: 33.5614161352789, name: "New Beginnings Senior Center", addr: "66 Brooks Drive"},
            {id:"MARTA_Fulton_Early_05", lon: -84.5406391195127, lat: 33.7300078412091, name: "Southwest Art Center", addr: "915 New Hope Rd"},
            {id:"MARTA_Fulton_Early_06", lon: -84.5275391762521, lat: 33.6310296901210, name: "Welcome All Park", addr: "Community House,4255 Will Lee Road"},
            {id:"MARTA_Fulton_Early_07", lon: -84.3773350000000, lat: 33.9288021000000, name: "Dorothy Benson Senior Center", addr: "6500 Vernon Wood Drive SE"},
            {id:"MARTA_Fulton_Early_08", lon: -84.4572648000000, lat: 33.6444992000000, name: "GA Intl Convention Center", addr: "2000 Convention Center Concourse"},
            {id:"MARTA_Fulton_Early_09", lon: -84.3855520000000, lat: 33.7900632000000, name: "High Museum of Art", addr: "1280 Peachtree Street NE"},
            {id:"MARTA_Fulton_Early_10", lon: -84.2685781000000, lat: 34.0208269000000, name: "Park Place at Newtown", addr: "3125 Old Alabama Road"},
            {id:"MARTA_Fulton_Early_11", lon: -84.3963244000000, lat: 33.7572891000000, name: "State Farm Arena", addr: "1 State Farm Drive"},
            // DeKalb: Retrieved 10/6/2020 https://www.dekalbcountyga.gov/sites/default/files/users/user304/AV%20LOCATIONS%20AND%20HOURS.pdf
            {id:"MARTA_DeKalb_Early_01", lon: -84.3366626000000, lat: 33.7519496000000, name: "Coan Recreation Cetner", addr: "1530 Woodbine Ave SE, Atlanta"},
            {id:"MARTA_DeKalb_Early_02", lon: -84.3456962000000, lat: 33.8872024000000, name: "Lynwood Recreation Center", addr: "3360 Osborne Road, Brookhaven"},
            {id:"MARTA_DeKalb_Early_03", lon: -84.3089572000000, lat: 33.8954983000000, name: "Core 4 Atlanta", addr: "2050 Will Ross Court, Chamblee"},
            {id:"MARTA_DeKalb_Early_04", lon: -84.2945178000000, lat: 33.7692604000000, name: "Agnes Scott College", addr: "141 E. College Ave (E. Dougherty Street)"},
            {id:"MARTA_DeKalb_Early_05", lon: -84.1784594444613, lat: 33.7351497658010, name: "Berean Christian Church Kerwin B. Lee Fam. Life Center", addr: "2197 Young Road, Stone Mountain"},
            {id:"MARTA_DeKalb_Early_06", lon: -84.3321779000000, lat: 33.9449644000000, name: "Dunwoody Library", addr: "5339 Chamblee Dunwoody Road"},
            {id:"MARTA_DeKalb_Early_07", lon: -84.2728324000000, lat: 33.7085502000000, name: "The Gallery @ South DeKalb", addr: "2801 Candler Road"},
            {id:"MARTA_DeKalb_Early_08", lon: -84.2341173000000, lat: 33.6862539000000, name: "House of Hope Atlanta – Shepard Complex", addr: "4650 Flat Shoals Parkway, Decatur"},
            {id:"MARTA_DeKalb_Early_09", lon: -84.0874143000000, lat: 33.6954699000000, name: "Former Sam's Club Building", addr: "2994 Turner Hill Road, Stonecrest"},
            // Clayton: Retrieved 10/6/2020 https://www.claytoncountyga.gov/government/elections-and-registration/advance-voting
            {id:"MARTA_Clayton_Early_1", lon: -84.3523866000000, lat: 33.5205740000000, name: "Elections & Registration Office", addr: "121 S. McDonough St, Jonesboro"},
            {id:"MARTA_Clayton_Early_2", lon: -84.2766090000000, lat: 33.5891012000000, name: "Carl Rhodenizer Rec. Center", addr: "3499 Rex Road"},
            {id:"MARTA_Clayton_Early_3", lon: -84.3652497000000, lat: 33.5529425000000, name: "Lee Headquarters Library", addr: "865 Battle Creek Road, Jonesboro"},
            {id:"MARTA_Clayton_Early_4", lon: -84.3413602000000, lat: 33.5837008000000, name: "Morrow Municipal Complex", addr: "1500 Morrow Road"},
            {id:"MARTA_Clayton_Early_5", lon: -84.3316765000000, lat: 33.4476503000000, name: "South Clayton Recreation Center", addr: "1837 McDonough Road, Hampton"},
            {id:"MARTA_Clayton_Early_6", lon: -84.4373051000000, lat: 33.5912102000000, name: "Virginia Burton Gray Recreation Center", addr: "1475 East Fayetteville Road"},
        ],
        fultonEarlyWithBoxes: [
            // Combines early voting and box locations.
            {id:"MARTA_Fulton_Combined_01", lon: -84.4616669832531, lat: 33.7052694923985, name: "Adams Park Library", addr:"2231 Campbellton Rd SW"},
            {id:"MARTA_Fulton_Combined_02", lon: -84.2925119146093, lat: 34.0737396365250, name: "Alpharetta Library", addr:"10 Park Plaza"},
            {id:"MARTA_Fulton_Combined_03", lon: -84.3794027948646, lat: 33.8376195562980, name: "Buckhead Library", addr: "269 Buckhead Ave"},
            {id:"MARTA_Fulton_Combined_04", lon: -84.4406518000000, lat: 33.6803864000000, name: "East Point Library", addr: "2757 Main Street"},
            {id:"MARTA_Fulton_Combined_05", lon: -84.2939010097745, lat: 34.0030862211415, name: "East Roswell Library", addr: ",2301 Holcomb Bridge Road"},
            {id:"MARTA_Fulton_Combined_06", lon: -84.5195387458386, lat: 33.5874112554950, name: "Gladys S Dennard Library at South Fulton", addr: "4055 Flat Shoals Rd"},
            {id:"MARTA_Fulton_Combined_07", lon: -84.2668915000000, lat: 33.9769675000000, name: "Johns Creek Environmental Campus", addr: "8100 Holcomb Bridge Road"},
            {id:"MARTA_Fulton_Combined_08", lon: -84.4074214461284, lat: 33.7185077132821, name: "Metropolitan Library", addr: "1332 Metropolitan Pkwy Sw"},
            {id:"MARTA_Fulton_Combined_09", lon: -84.3364919479729, lat: 34.0904210620484, name: "Milton Library", addr: "855 Mayfield Rd"},
            {id:"MARTA_Fulton_Combined_10", lon: -84.3626524000000, lat: 33.9658857000000, name: "North Fulton Service Center", addr: "7741 Roswell Road"},
            {id:"MARTA_Fulton_Combined_11", lon: -84.2231565437936, lat: 34.0144628357564, name: "Northeast/Spruill Oaks Library", addr: "9560 Spruill Road"},
            {id:"MARTA_Fulton_Combined_12", lon: -84.4254324493057, lat: 33.8450659293640, name: "Northside Library", addr: "3295 Northside Pkwy"},
            {id:"MARTA_Fulton_Combined_13", lon: -84.4700030857422, lat: 33.8054004836194, name: "Northwest Library at Scotts Crossing", addr: "2489 Perry Blvd Nw"},
            {id:"MARTA_Fulton_Combined_14", lon: -84.3553405827748, lat: 33.7740235018853, name: "Ponce De Leon Library", addr: "980 Ponce De Leon Ave"},
            {id:"MARTA_Fulton_Combined_15", lon: -84.3577890304060, lat: 34.0252850613378, name: "Roswell Library", addr: "115 Norcross St"},
            {id:"MARTA_Fulton_Combined_16", lon: -84.2096406000000, lat: 34.0646462000000, name: "Robert E. Fulton Ocee Library", addr: "5090 Abbotts Bridge Road"},
            {id:"MARTA_Fulton_Combined_17", lon: -84.3744112073907, lat: 33.9243015393576, name: "Sandy Springs Library", addr: "395 Mount Vernon Hwy Ne"},
            {id:"MARTA_Fulton_Combined_18", lon: -84.5498808000000, lat: 33.6014156000000, name: "South Fulton Service Center", addr: "5600 Stonewall Tell Road"},
            {id:"MARTA_Fulton_Combined_19", lon: -84.5746057424618, lat: 33.6727122099875, name: "Wolf Creek Library", addr: "3100 Enon Rd Sw"},
            // Dekalb combined
            {id:"MARTA_DeKalb_Combined_01", lon: -84.2464301000000, lat: 33.7775786000000, name: "Voter Registration and Elections", addr: "4380 Memorial Drive, Decatur"},
            {id:"MARTA_DeKalb_Combined_02", lon: -84.2347106000000, lat: 33.6549010000000, name: "County Line - Ellenwood Library", addr: "4331 River Road, Ellenwood"},
            {id:"MARTA_DeKalb_Combined_03", lon: -84.2087063000000, lat: 33.8573698000000, name: "Reid H. Cofer Library", addr: "5234 LaVista Road, Tucker"},
        ],
        fultonBoxes: [
            // Fulton: Retrieved 10/5/2020 https://www.fultoncountyga.gov/absenteedropbox
            {id:"MARTA_Fulton_Box_0001", lon: -84.5001645000000, lat: 33.7549799000000, name: "Adamsville/Collier Heights Library", addr: "3424 Martin Luther King Jr Drive"},
            {id:"MARTA_Fulton_Box_0002", lon: -84.3839371000000, lat: 33.7552850000000, name: "Auburn Ave Research Library", addr: "101 Auburn Avenue"},
            {id:"MARTA_Fulton_Box_0003", lon: -84.3911379520864, lat: 33.6812652971759, name: "Cleveland Ave Library", addr: "47 Cleveland Avenue SW"},
            {id:"MARTA_Fulton_Box_0004", lon: -84.4497402000000, lat: 33.6556853000000, name: "College Park Branch Library", addr: "3647 Main Street"},
            {id:"MARTA_Fulton_Box_0005", lon: -84.4470423000000, lat: 33.7740452000000, name: "Dogwood Library", addr: "1838 Donald Lee Hollowell Parkway"},
            {id:"MARTA_Fulton_Box_0006", lon: -84.5068194000000, lat: 33.7247332000000, name: "Evelyn G. Lowery @ Cascade Rd", addr: "3665 Cascade Road"},
            {id:"MARTA_Fulton_Box_0007", lon: -84.5849767000000, lat: 33.5667782000000, name: "Fairburn Branch Library", addr: "60 Valley View Drive"},
            {id:"MARTA_Fulton_Box_0008", lon: -84.5163309000000, lat: 33.7745171000000, name: "Fulton County Airport", addr: "3929 Aviation Circle, Suite A"},
            {id:"MARTA_Fulton_Box_0009", lon: -84.3010540000000, lat: 34.0629165000000, name: "Fulton County Svc Center @ Maxwell Rd", addr: "11575 Maxwell Road"},
            {id:"MARTA_Fulton_Box_0010", lon: -84.3925827000000, lat: 33.7510423000000, name: "Fulton County Gvt Center", addr: "130 Peachtree Street"},
            {id:"MARTA_Fulton_Box_0011", lon: -84.4046184000000, lat: 33.6590349000000, name: "Hapeville Senior Center", addr: "527 King Arnold Street"},
            {id:"MARTA_Fulton_Box_0012", lon: -84.3939695000000, lat: 33.7147398000000, name: "Louise Watley Library @ Southeast Atlanta", addr: "1463 Pryor Road"},
            {id:"MARTA_Fulton_Box_0013", lon: -84.3952514000000, lat: 33.7434782000000, name: "Mechanicsville Library", addr: "400 Formwalt Street"},
            {id:"MARTA_Fulton_Box_0014", lon: -84.3806596000000, lat: 33.8923217000000, name: "North Training Center", addr: "5025 Roswell Road"},
            {id:"MARTA_Fulton_Box_0015", lon: -84.6642773000000, lat: 33.5305252000000, name: "Palmetto Branch Library", addr: "9111 Cascade Palmetto Highway"},
            {id:"MARTA_Fulton_Box_0016", lon: -84.4237808000000, lat: 33.7542219000000, name: "Washington Park Library", addr: "1116 Martin Luther King Jr Drive"},
            {id:"MARTA_Fulton_Box_0017", lon: -84.4206954360340, lat: 33.7405685221794, name: "West End Library", addr: "525 Peeples Street SW"},
            // DeKalb: https://www.dekalbcountyga.gov/sites/default/files/users/user304/DeKalb%20Dropbox%20Locations%20100620.pdf
            {id:"MARTA_DeKalb_Box_0001", lon: -84.3340612000000, lat: 33.8707467000000, name: "Brookhaven City Hall", addr: "4362 Peachtree Road"},
            {id:"MARTA_DeKalb_Box_0002", lon: -84.2860298000000, lat: 33.7335924000000, name: "Sterling @ Candler Village", addr: "2536 Mellville Ave, Decatur"},
            {id:"MARTA_DeKalb_Box_0003", lon: -84.2537939000000, lat: 33.7072522000000, name: "Exchange Park", addr: "2771 Columbia Drive, Decatur"},
            {id:"MARTA_DeKalb_Box_0004", lon: -84.0837125000000, lat: 33.6905119000000, name: "Stonecrest City Hall", addr: "3120 Stonecrest Blvd"},
            {id:"MARTA_DeKalb_Box_0005", lon: -84.1696985000000, lat: 33.8050332000000, name: "Stone Mountain City Hall", addr: "875 Main Street"},
            {id:"MARTA_DeKalb_Box_0006", lon: -84.3387481000000, lat: 33.9369700000000, name: "Dunwoody City Hall", addr: "4800 Ashford Dunwoody Road"},
            {id:"MARTA_DeKalb_Box_0007", lon: -84.2782540000000, lat: 33.9009712000000, name: "Doraville City Hall", addr: "3725 Park Avenue"},
            {id:"MARTA_DeKalb_Box_0008", lon: -84.2388625000000, lat: 33.8410911000000, name: "Tucker City Hall", addr: "1975 Lakeside Parkway"},
            {id:"MARTA_DeKalb_Box_0009", lon: -84.3070090000000, lat: 33.8092145000000, name: "Toco Hill Library", addr: "1282 McConnell Drive"},
            {id:"MARTA_DeKalb_Box_0010", lon: -84.2388266000000, lat: 33.8050581000000, name: "Clarkston Library", addr: "951 N. Indian Creek Drive"},
            {id:"MARTA_DeKalb_Box_0011", lon: -84.2211294000000, lat: 33.7043681000000, name: "Wesley Chapel Library", addr: "2861 Wesley Chapel Road"},
            {id:"MARTA_DeKalb_Box_0012", lon: -84.2962292000000, lat: 33.7737833000000, name: "Decatur City Hall", addr: "509 N. McDonough Street"},
            {id:"MARTA_DeKalb_Box_0013", lon: -84.1634392000000, lat: 33.7140803000000, name: "Lou Walker Senior Center", addr: "2538 Panola Road, Stonecrest"}
        ]
    };
    var electionsLayers = {
        earlyCircle: {
            id: "early-circle",
            appliesTo: [].concat(
                electionsPresets.fultonEarly,
            ),
            layers: [{
                type: "circle",
                paint: {
                    "circle-radius": 8,
                    "circle-color": "#0066CC",
                    "circle-stroke-color": "#606060",
                    "circle-stroke-width": 1.5,
                }
            }]
        },
        earlySymbol: {
            id: "early-symbol",
            appliesTo: [].concat(
                electionsPresets.fultonEarly,
            ),
            layers: [{
                type: "symbol",
                layout: {
                    "text-allow-overlap": true,
                    "text-field": "E",
                    "text-font": textFonts,
                    "text-line-height": 0.8,
                    "text-size": 12
                },
                paint: {
                    "text-color": "#ffffff"
                }
            }]
        },
        earlyBoxCircle: {
            id: "early-box-circle",
            appliesTo: [].concat(
                electionsPresets.fultonEarlyWithBoxes,
            ),
            layers: [{
                type: "circle",
                paint: {
                    "circle-radius": 8,
                    "circle-color": "#CC0066",
                    "circle-stroke-color": "#606060",
                    "circle-stroke-width": 1.5,
                }
            }]
        },
        earlyBoxSymbol: {
            id: "early-box-symbol",
            appliesTo: [].concat(
                electionsPresets.fultonEarlyWithBoxes,
            ),
            layers: [{
                type: "symbol",
                layout: {
                    "text-allow-overlap": true,
                    "text-field": "EB",
                    "text-font": textFonts,
                    "text-line-height": 0.8,
                    "text-size": 12
                },
                paint: {
                    "text-color": "#ffffff"
                }
            }]
        },
        boxCircle: {
            id: "box-circle",
            appliesTo: [].concat(
                electionsPresets.fultonBoxes,
            ),
            layers: [{
                type: "circle",
                paint: {
                    "circle-radius": 8,
                    "circle-color": "#008833",
                    "circle-stroke-color": "#606060",
                    "circle-stroke-width": 1.5,
                }
            }]
        },
        boxSymbol: {
            id: "box-symbol",
            appliesTo: [].concat(
                electionsPresets.fultonBoxes,
            ),
            layers: [{
                type: "symbol",
                layout: {
                    "text-allow-overlap": true,
                    "text-field": "B",
                    "text-font": textFonts,
                    "text-line-height": 0.8,
                    "text-size": 12
                },
                paint: {
                    "text-color": "#ffffff"
                }
            }]
        }
    };
    layers.stationLabel.layers[0].minzoom = 12;
    layers.railCircle.layers[0].paint["circle-radius"] = 6;
    layers.railCircle.layers[0].paint["circle-stroke-width"] = 1;

    $(function() {
        mapboxgl.accessToken = "<?=$MAPBOX_ACCESSTOKEN?>";
        var initiativesOnly = location.search.indexOf("mode=initiatives") > -1;
        
        coremap.init({
            containerId: "master-map",
            dynamicFetch: !initiativesOnly,
            logoContainerId: "logo",
            symbolLists: [
                [layers.railCircle, layers.tramCircle, electionsLayers.earlyCircle, electionsLayers.earlyBoxCircle, electionsLayers.boxCircle, layers.inactiveStopCircle, layers.activeStopCircle],
                [electionsLayers.earlySymbol, electionsLayers.earlyBoxSymbol, electionsLayers.boxSymbol, layers.inactiveStopSymbol],
                [layers.stationLabel]
            ],
            useDeviceLocation: !initiativesOnly,
            onGetContent: function(stop) {
                var address = stop.addr;
                var links;
                if (stop.addr) {
                    links = "<a id='arrivalsLink' target='_blank' href='stopinfo.php?lat=" + stop.lat + "&lon=" + stop.lon + "&title=" + encodeURIComponent("Transit near " + stop.name) + "&radius=0.008'>Arrivals</a>";
                }

                return {
                    description: address && "<br/>" + address,
                    links: links
                }
            }
        });
    });
    </script>
</body>
</html> 
