<?php
include("config.php");
include("./lib/redirect-to-https.php");
?>
<!DOCTYPE html>
<html>
<head>
    <title>Early Voting Map - MARTA Army</title>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
    .dot {
        border-radius: 1em;
        color: #fff;
        display: inline-block;
        text-align: center;
        width: 1.5em;
    }
    </style>
</head>

<body>
    <div id="master-map" class="full-screen"></div>
    <div id="logo">
        <div style="background-color: #fff; padding:4px;">
            <h1 style="font-size:14px; font-weight: bold; margin: 0 0 4px;">
                Early Voting Map (Fulton, DeKalb, Clayton)
                <button id="toggler" style="background: none; border: none; display:none" onclick="$('.legend').show(); $('#toggler').hide();">&#9660;</button>
                <button class="legend" style="background: none; border: none;" onclick="$('.legend').hide(); $('#toggler').show();">&#9650;</button>
            </h1>
            <ul class="legend" style="list-style: none; margin: 0; padding-left: 0;">
                <li><span class="dot" style="background-color: #0066CC">E</span> Early voting location</li>
                <li><span class="dot" style="background-color: #008833">B</span> Ballot drop box</li>
                <li><span class="dot" style="background-color: #808080">L</span> Early voting outreach location</li>
                <li><span class="dot" style="background-color: #CC0066">EB</span> Early voting and ballot drop box</li>
                <li><span class="dot" style="background-color: #888800">LB</span> Early voting outreach and ballot drop box</li>
            </ul>
        </div>
        <a href="http://www.martaarmy.org" title="MARTA Army Website">
            <img src="images/marta-army-square.png" style="width: 50px; height: 50px;" />
        </a>
    </div>

    <script src="jslib/jquery-2.1.4.min.js"></script>
    <script src='https://api.mapbox.com/mapbox-gl-js/v1.11.0/mapbox-gl.js'></script>
    <script src="js/coremap-gl.js"></script>
    <script src="js/map-presets.js"></script>
    <link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/v1.11.0/mapbox-gl.css" />
    <link rel="stylesheet" href="css/coremap.css" />

    <script>
    var electionsPresets = {
        early: [
            // Fulton (retrieved 10/4/2020)
            {id:"MARTA_Fulton_Early_01", lon: -84.3917605, lat: 33.8752940, name: "Chastain Park Gymnasium", addr: "140 W Wieuca Rd"},
            {id:"MARTA_Fulton_Early_02", lon: -84.4916274, lat: 33.7536976, name: "C.T. Martin Natatorium & Recreation Center", addr: "3201 M L King Jr Dr SW"},
            {id:"MARTA_Fulton_Early_03", lon: -84.5578599, lat: 33.5873189, name: "Etris Community Center", addr: "5285 Lakeside Dr,107/12R"},
            {id:"MARTA_Fulton_Early_04", lon: -84.5874973, lat: 33.5614161, name: "New Beginnings Senior Center", addr: "66 Brooks Drive"},
            {id:"MARTA_Fulton_Early_05", lon: -84.5406391, lat: 33.7300078, name: "Southwest Art Center", addr: "915 New Hope Rd"},
            {id:"MARTA_Fulton_Early_06", lon: -84.5275391, lat: 33.6310296, name: "Welcome All Park", addr: "Community House,4255 Will Lee Road"},
            {id:"MARTA_Fulton_Early_07", lon: -84.3773350, lat: 33.9288021, name: "Dorothy Benson Senior Center", addr: "6500 Vernon Wood Drive SE"},
            {id:"MARTA_Fulton_Early_08", lon: -84.4572648, lat: 33.6444992, name: "GA Intl Convention Center", addr: "2000 Convention Center Concourse"},
            {id:"MARTA_Fulton_Early_09", lon: -84.3855520, lat: 33.7900632, name: "High Museum of Art", addr: "1280 Peachtree Street NE"},
            {id:"MARTA_Fulton_Early_10", lon: -84.2685781, lat: 34.0208269, name: "Park Place at Newtown", addr: "3125 Old Alabama Road"},
            {id:"MARTA_Fulton_Early_11", lon: -84.3963244, lat: 33.7572891, name: "State Farm Arena", addr: "1 State Farm Drive"},
            // DeKalb (retrieved 10/6/2020)
            {id:"MARTA_DeKalb_Early_01", lon: -84.3366626, lat: 33.7519496, name: "Coan Recreation Cetner", addr: "1530 Woodbine Ave SE, Atlanta"},
            {id:"MARTA_DeKalb_Early_02", lon: -84.3456962, lat: 33.8872024, name: "Lynwood Recreation Center", addr: "3360 Osborne Road, Brookhaven"},
            {id:"MARTA_DeKalb_Early_03", lon: -84.3089572, lat: 33.8954983, name: "Core 4 Atlanta", addr: "2050 Will Ross Court, Chamblee"},
            {id:"MARTA_DeKalb_Early_04", lon: -84.2945178, lat: 33.7692604, name: "Agnes Scott College", addr: "141 E. College Ave (E. Dougherty Street)"},
            {id:"MARTA_DeKalb_Early_05", lon: -84.1784594, lat: 33.7351497, name: "Berean Christian Church Kerwin B. Lee Fam. Life Center", addr: "2197 Young Road, Stone Mountain"},
            {id:"MARTA_DeKalb_Early_06", lon: -84.3321779, lat: 33.9449644, name: "Dunwoody Library", addr: "5339 Chamblee Dunwoody Road"},
            {id:"MARTA_DeKalb_Early_07", lon: -84.2728324, lat: 33.7085502, name: "The Gallery @ South DeKalb", addr: "2801 Candler Road"},
            {id:"MARTA_DeKalb_Early_08", lon: -84.2341173, lat: 33.6862539, name: "House of Hope Atlanta – Shepard Complex", addr: "4650 Flat Shoals Parkway, Decatur"},
            {id:"MARTA_DeKalb_Early_09", lon: -84.0874143, lat: 33.6954699, name: "Former Sam's Club Building", addr: "2994 Turner Hill Road, Stonecrest"},
            // Clayton (retrieved 10/6/2020)
            {id:"MARTA_Clayton_Early_1", lon: -84.3523866, lat: 33.5205740, name: "Elections & Registration Office", addr: "121 S. McDonough St, Jonesboro"},
            {id:"MARTA_Clayton_Early_2", lon: -84.2766090, lat: 33.5891012, name: "Carl Rhodenizer Rec. Center", addr: "3499 Rex Road"},
            {id:"MARTA_Clayton_Early_3", lon: -84.3652497, lat: 33.5529425, name: "Lee Headquarters Library", addr: "865 Battle Creek Road, Jonesboro"},
            {id:"MARTA_Clayton_Early_4", lon: -84.3413602, lat: 33.5837008, name: "Morrow Municipal Complex", addr: "1500 Morrow Road"},
            {id:"MARTA_Clayton_Early_5", lon: -84.3316765, lat: 33.4476503, name: "South Clayton Recreation Center", addr: "1837 McDonough Road, Hampton"},
            {id:"MARTA_Clayton_Early_6", lon: -84.4373051, lat: 33.5912102, name: "Virginia Burton Gray Recreation Center", addr: "1475 East Fayetteville Road"},
        ],
        earlyWithBoxes: [
            // Fulton early voting and box locations.
            {id:"MARTA_Fulton_Combined_01", lon: -84.4616669, lat: 33.7052694, name: "Adams Park Library", addr:"2231 Campbellton Rd SW"},
            {id:"MARTA_Fulton_Combined_02", lon: -84.2925119, lat: 34.0737396, name: "Alpharetta Library", addr:"10 Park Plaza"},
            {id:"MARTA_Fulton_Combined_03", lon: -84.3794027, lat: 33.8376195, name: "Buckhead Library", addr: "269 Buckhead Ave"},
            {id:"MARTA_Fulton_Combined_04", lon: -84.4406518, lat: 33.6803864, name: "East Point Library", addr: "2757 Main Street"},
            {id:"MARTA_Fulton_Combined_05", lon: -84.2939010, lat: 34.0030862, name: "East Roswell Library", addr: "2301 Holcomb Bridge Road"},
            {id:"MARTA_Fulton_Combined_06", lon: -84.5195387, lat: 33.5874112, name: "Gladys S Dennard Library at South Fulton", addr: "4055 Flat Shoals Rd"},
            {id:"MARTA_Fulton_Combined_07", lon: -84.2668915, lat: 33.9769675, name: "Johns Creek Environmental Campus", addr: "8100 Holcomb Bridge Road"},
            {id:"MARTA_Fulton_Combined_08", lon: -84.4074214, lat: 33.7185077, name: "Metropolitan Library", addr: "1332 Metropolitan Pkwy Sw"},
            {id:"MARTA_Fulton_Combined_09", lon: -84.3364919, lat: 34.0904210, name: "Milton Library", addr: "855 Mayfield Rd"},
            {id:"MARTA_Fulton_Combined_10", lon: -84.3626524, lat: 33.9658857, name: "North Fulton Service Center", addr: "7741 Roswell Road"},
            {id:"MARTA_Fulton_Combined_11", lon: -84.2231565, lat: 34.0144628, name: "Northeast/Spruill Oaks Library", addr: "9560 Spruill Road"},
            {id:"MARTA_Fulton_Combined_12", lon: -84.4254324, lat: 33.8450659, name: "Northside Library", addr: "3295 Northside Pkwy"},
            {id:"MARTA_Fulton_Combined_13", lon: -84.4700030, lat: 33.8054004, name: "Northwest Library at Scotts Crossing", addr: "2489 Perry Blvd Nw"},
            {id:"MARTA_Fulton_Combined_14", lon: -84.3553405, lat: 33.7740235, name: "Ponce De Leon Library", addr: "980 Ponce De Leon Ave"},
            {id:"MARTA_Fulton_Combined_15", lon: -84.3577890, lat: 34.0252850, name: "Roswell Library", addr: "115 Norcross St"},
            {id:"MARTA_Fulton_Combined_16", lon: -84.2096406, lat: 34.0646462, name: "Robert E. Fulton Ocee Library", addr: "5090 Abbotts Bridge Road"},
            {id:"MARTA_Fulton_Combined_17", lon: -84.3744112, lat: 33.9243015, name: "Sandy Springs Library", addr: "395 Mount Vernon Hwy Ne"},
            {id:"MARTA_Fulton_Combined_18", lon: -84.5498808, lat: 33.6014156, name: "South Fulton Service Center", addr: "5600 Stonewall Tell Road"},
            {id:"MARTA_Fulton_Combined_19", lon: -84.5746057, lat: 33.6727122, name: "Wolf Creek Library", addr: "3100 Enon Rd Sw"},
            // Dekalb combined
            {id:"MARTA_DeKalb_Combined_01", lon: -84.2464301, lat: 33.7775786, name: "Voter Registration and Elections", addr: "4380 Memorial Drive, Decatur"},
            {id:"MARTA_DeKalb_Combined_02", lon: -84.2347106, lat: 33.6549010, name: "County Line - Ellenwood Library", addr: "4331 River Road, Ellenwood"},
            {id:"MARTA_DeKalb_Combined_03", lon: -84.2087063, lat: 33.8573698, name: "Reid H. Cofer Library", addr: "5234 LaVista Road, Tucker"},
        ],
        boxes: [
            // Fulton (retrieved 10/5/2020)
            {id:"MARTA_Fulton_Box_0001", lon: -84.5001645, lat: 33.7549799, name: "Adamsville/Collier Heights Library", addr: "3424 Martin Luther King Jr Drive"},
            {id:"MARTA_Fulton_Box_0002", lon: -84.3839371, lat: 33.7552850, name: "Auburn Ave Research Library", addr: "101 Auburn Avenue"},
            {id:"MARTA_Fulton_Box_0003", lon: -84.3911379, lat: 33.6812652, name: "Cleveland Ave Library", addr: "47 Cleveland Avenue SW"},
            {id:"MARTA_Fulton_Box_0004", lon: -84.4497402, lat: 33.6556853, name: "College Park Branch Library", addr: "3647 Main Street"},
            {id:"MARTA_Fulton_Box_0005", lon: -84.4470423, lat: 33.7740452, name: "Dogwood Library", addr: "1838 Donald Lee Hollowell Parkway"},
            {id:"MARTA_Fulton_Box_0006", lon: -84.5068194, lat: 33.7247332, name: "Evelyn G. Lowery @ Cascade Rd", addr: "3665 Cascade Road"},
            {id:"MARTA_Fulton_Box_0007", lon: -84.5849767, lat: 33.5667782, name: "Fairburn Branch Library", addr: "60 Valley View Drive"},
            {id:"MARTA_Fulton_Box_0008", lon: -84.5163309, lat: 33.7745171, name: "Fulton County Airport", addr: "3929 Aviation Circle, Suite A"},
            {id:"MARTA_Fulton_Box_0009", lon: -84.3010540, lat: 34.0629165, name: "Fulton County Svc Center @ Maxwell Rd", addr: "11575 Maxwell Road"},
            {id:"MARTA_Fulton_Box_0010", lon: -84.3925827, lat: 33.7510423, name: "Fulton County Gvt Center", addr: "130 Peachtree Street"},
            {id:"MARTA_Fulton_Box_0011", lon: -84.4046184, lat: 33.6590349, name: "Hapeville Senior Center", addr: "527 King Arnold Street"},
            {id:"MARTA_Fulton_Box_0012", lon: -84.3939695, lat: 33.7147398, name: "Louise Watley Library @ Southeast Atlanta", addr: "1463 Pryor Road"},
            {id:"MARTA_Fulton_Box_0013", lon: -84.3952514, lat: 33.7434782, name: "Mechanicsville Library", addr: "400 Formwalt Street"},
            {id:"MARTA_Fulton_Box_0014", lon: -84.3806596, lat: 33.8923217, name: "North Training Center", addr: "5025 Roswell Road"},
            {id:"MARTA_Fulton_Box_0015", lon: -84.4237808, lat: 33.7542219, name: "Washington Park Library", addr: "1116 Martin Luther King Jr Drive"},
            {id:"MARTA_Fulton_Box_0016", lon: -84.4206954, lat: 33.7405685, name: "West End Library", addr: "525 Peeples Street SW"},
            // DeKalb (retrieved 10/6/2020)
            {id:"MARTA_DeKalb_Box_0001", lon: -84.3340612, lat: 33.8707467, name: "Brookhaven City Hall", addr: "4362 Peachtree Road"},
            {id:"MARTA_DeKalb_Box_0002", lon: -84.2860298, lat: 33.7335924, name: "Sterling @ Candler Village", addr: "2536 Mellville Ave, Decatur"},
            {id:"MARTA_DeKalb_Box_0003", lon: -84.2537939, lat: 33.7072522, name: "Exchange Park", addr: "2771 Columbia Drive, Decatur"},
            {id:"MARTA_DeKalb_Box_0004", lon: -84.0837125, lat: 33.6905119, name: "Stonecrest City Hall", addr: "3120 Stonecrest Blvd"},
            {id:"MARTA_DeKalb_Box_0005", lon: -84.1696985, lat: 33.8050332, name: "Stone Mountain City Hall", addr: "875 Main Street"},
            {id:"MARTA_DeKalb_Box_0006", lon: -84.3387481, lat: 33.9369700, name: "Dunwoody City Hall", addr: "4800 Ashford Dunwoody Road"},
            {id:"MARTA_DeKalb_Box_0007", lon: -84.2782540, lat: 33.9009712, name: "Doraville City Hall", addr: "3725 Park Avenue"},
            {id:"MARTA_DeKalb_Box_0008", lon: -84.2388625, lat: 33.8410911, name: "Tucker City Hall", addr: "1975 Lakeside Parkway"},
            {id:"MARTA_DeKalb_Box_0009", lon: -84.3070090, lat: 33.8092145, name: "Toco Hill Library", addr: "1282 McConnell Drive"},
            {id:"MARTA_DeKalb_Box_0010", lon: -84.2388266, lat: 33.8050581, name: "Clarkston Library", addr: "951 N. Indian Creek Drive"},
            {id:"MARTA_DeKalb_Box_0011", lon: -84.2211294, lat: 33.7043681, name: "Wesley Chapel Library", addr: "2861 Wesley Chapel Road"},
            {id:"MARTA_DeKalb_Box_0012", lon: -84.2962292, lat: 33.7737833, name: "Decatur City Hall", addr: "509 N. McDonough Street"},
            {id:"MARTA_DeKalb_Box_0013", lon: -84.1634392, lat: 33.7140803, name: "Lou Walker Senior Center", addr: "2538 Panola Road, Stonecrest"},
            // DeKalb (retrieved 10/21/2020)
            {id:"MARTA_DeKalb_Box_0014", lon: -84.1658654, lat: 33.7865219, name: "Wade Walker YMCA", addr: "5605 Rockbridge Rd, Stone Mountain"},
            {id:"MARTA_DeKalb_Box_0015", lon: -84.1050092, lat: 33.7860913, name: "Fire station #25", addr: "7136 Rockbridge Rd, Stone Mountain"},
            {id:"MARTA_DeKalb_Box_0016", lon: -84.2393137, lat: 33.8088244, name: "Clarkston City Hall", addr: "3921 Church Street, Clarkston"},
            {id:"MARTA_DeKalb_Box_0017", lon: -84.1778940, lat: 33.6778953, name: "Salem-Panola Library", addr: "5137 Salem Road, Lithonia"},
            {id:"MARTA_DeKalb_Box_0018", lon: -84.3098498, lat: 33.7180925, name: "DeKalb County Library - Gresham Branch", addr: "2418 Gresham Rd"},
            {id:"MARTA_DeKalb_Box_0019", lon: -84.1423457, lat: 33.7457487, name: "Redan-Trotti Library", addr: "1569 Wellborn Rd, Lithonia"},
            {id:"MARTA_DeKalb_Box_0020", lon: -84.3211808, lat: 33.7516013, name: "Kirkwood Branch Library", addr: "11 Kirkwood Road NE"}
        ],
        // Fulton limited outreach only https://www.fultoncountyga.gov/services/voting-and-elections/early-voting-locations
        limited: [
            {id:"MARTA_Fulton_Limited_1", lon:-84.4456025, lat: 33.6769759, name: "HJ C Bowden Senior Facility", addr: "2885 Church Street, East Point"},
            {id:"MARTA_Fulton_Limited_2", lon:-84.3398419, lat: 34.0893719, name: "Crabapple Neighborhood Senior Center", addr: "12624 Broadwell Road, Alpharetta"},
            {id:"MARTA_Fulton_Limited_3", lon:-84.4059661, lat: 33.7096295, name: "Atlanta Metropolitan College, Student Activity Center", addr: "Building 800 - Conference Room A, 1630 Metropolitan Parkway"},
            {id:"MARTA_Fulton_Limited_4", lon:-84.3927025, lat: 33.7804264, name: "Georgia Tech, McCamish Pavilion", addr: "965 Fowler Street"},
            {id:"MARTA_Fulton_Limited_5", lon:-84.5195266, lat: 33.7266125, name: "Quality Living Services", addr: "4001 Danforth Rd"},
            {id:"MARTA_Fulton_Limited_6", lon:-84.3847137, lat: 33.7526929, name: "Georgia State University, Veterans Memorial Hall in Dahlberg Hall", addr: "55 Gilmer St"}
        ],
        limitedWithBoxes: [
            {id:"MARTA_Fulton_BoxLimited_1", lon: -84.6642773, lat: 33.5305252, name: "Palmetto Branch Library", addr: "9111 Cascade Palmetto Highway"}
        ]
    };
    function circle(id, appliesTo, fill) {
        return {
            id: id,
            appliesTo: appliesTo,
            layers: [presetLayers.circle(fill, "#606060", 8, 1.5)]
        };
    }
    var allCircles = [
        layers.railCircle,
        layers.tramCircle,
        circle("early-circle", electionsPresets.early, "#0066CC"),
        circle("early-box-circle", electionsPresets.earlyWithBoxes, "#CC0066"),
        circle("box-circle", electionsPresets.boxes, "#008833"),
        circle("limited-circle", electionsPresets.limited, "#808080"),
        circle("limited-box-circle", electionsPresets.limitedWithBoxes, "#888800"),
        layers.inactiveStopCircle,
        layers.activeStopCircle
    ];
    function symbol(id, appliesTo, text) {
        return {
            id: id,
            appliesTo: appliesTo,
            layers: [presetLayers.symbol(text, "#FFFFFF")]
        };
    }
    var allSymbols = [
        symbol("early-symbol", electionsPresets.early, "E"),
        symbol("early-box-symbol", electionsPresets.earlyWithBoxes, "EB"),
        symbol("box-symbol", electionsPresets.boxes, "B"),
        symbol("limited-symbol", electionsPresets.limited, "L"),
        symbol("limited-box-symbol", electionsPresets.limitedWithBoxes, "LB"),
        layers.inactiveStopSymbol
    ];

    layers.stationLabel.layers[0].minzoom = 12;
    layers.railCircle.layers[0].paint["circle-radius"] = 6;
    layers.railCircle.layers[0].paint["circle-stroke-width"] = 1;

    var linksByType = {
        Fulton_Early: "https://fultoncountyga.gov/services/voting-and-elections/early-voting-locations",
        Fulton_Box: "https://www.fultoncountyga.gov/absenteedropbox",
        Fulton_Limited: "https://fultoncountyga.gov/services/voting-and-elections/early-voting-locations",
        DeKalb_Early: "https://www.dekalbcountyga.gov/sites/default/files/users/user304/AV%20LOCATIONS%20AND%20HOURS.pdf",
        DeKalb_Box: "https://www.dekalbcountyga.gov/sites/default/files/users/user304/DeKalb%20Dropbox%20Locations%20100620.pdf",
        Clayton_Early: "https://www.claytoncountyga.gov/government/elections-and-registration/advance-voting"
    };

    $(function() {
        mapboxgl.accessToken = "<?=$MAPBOX_ACCESSTOKEN?>";
        coremap.init({
            containerId: "master-map",
            dynamicFetch: true,
            logoContainerId: "logo",
            symbolLists: [allCircles, allSymbols, [layers.stationLabel]],
            useDeviceLocation: false,
            onGetContent: function(stop) {
                var links, description;
                if (stop.addr) {
                    var idParts = stop.id.split("_");
                    var county = idParts[1];
                    var type = idParts[2];
                    description = "<br/>" + stop.addr + " <b>[" + county + "]</b>"
                        + ((type == "Early" || type == "Combined") ? "<br/><span class='dot' style='background-color: #0066CC'>E</span> Early voting - <a target='_blank' href='" + linksByType[county + "_Early"] + "'>Check hours</a>" : "")
                        + ((type == "Box" || type == "Combined" || type == "BoxLimited") ? "<br/><span class='dot' style='background-color: #008833'>B</span> Ballot drop-box - <a target='_blank' href='" + linksByType[county + "_Box"] + "'>Information</a>" : "")
                        + ((type == "Limited" || type == "BoxLimited") ? "<br/><span class='dot' style='background-color: #808080'>L</span> Early voting outreach (<b>limited days/hours</b>) - <a target='_blank' href='" + linksByType[county + "_Limited"] + "'>Information</a>" : "")
                        ;
                    links = "<a id='arrivalsLink2' target='_blank' href='stopinfo.php?lat=" + stop.lat + "&lon=" + stop.lon + "&title=" + encodeURIComponent("Transit near " + stop.name) + "&radius=0.008'>View nearby transit departures</a>";
                }
                return {
                    description: description,
                    links: links
                }
            }
        });
    });
    </script>
</body>
</html>
