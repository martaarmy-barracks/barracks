// A set of preloaded stops.
// (More info about these stops may still need to be fetched.)
var presets = {
    rail: [
        {ids:["MARTA_906369","MARTA_906370"],name:"ARTS CENTER STATION",lat:33.788828,lon:-84.387272},
        {ids:["MARTA_908717","MARTA_906827"],name:"LENOX STATION",lat:33.845307,lon:-84.358387},
        {ids:["MARTA_907766","MARTA_908480"],name:"NORTH SPRINGS STATION",lat:33.944950,lon:-84.357275},
        {ids:["MARTA_907775","MARTA_908055","MARTA_907823","MARTA_908054"],name:"LINDBERGH STATION",lat:33.823385,lon:-84.369357},
        {ids:["MARTA_907845","MARTA_907846"],name:"SANDY SPRINGS STATION",lat:33.931564,lon:-84.3509633},
        {ids:["MARTA_907913","MARTA_907914"],name:"NORTH AVENUE STATION",lat:33.771741,lon:-84.387204},
        {ids:["MARTA_907933","MARTA_907907"],name:"HE HOLMES STATION",lat:33.754553,lon:-84.469302},
        {ids:["MARTA_907961","MARTA_907960"],name:"BANKHEAD STATION",lat:33.772159,lon:-84.428873},
        {ids:["MARTA_908023","MARTA_907906"],name:"WEST LAKE STATION",lat:33.753328,lon:-84.445329},
        {ids:["MARTA_908047","MARTA_908051"],name:"DUNWOODY STATION",lat:33.921130,lon:-84.344268},
        {ids:["MARTA_908186","MARTA_908187"],name:"BROOKHAVEN STATION",lat:33.860329,lon:-84.339245},
        {ids:["MARTA_908301","MARTA_908302"],name:"OAKLAND CITY STATION",lat:33.7173,lon:-84.42503},
        {ids:["MARTA_908374","MARTA_908375"],name:"MIDTOWN STATION",lat:33.781247,lon:-84.386342},
        {ids:["MARTA_908435","MARTA_908694"],name:"DOME STATION",lat:33.756179,lon:-84.397215},
        {ids:["MARTA_908436","MARTA_908693"],name:"KING MEMORIAL STATION",lat:33.749951,lon:-84.375675},
        {ids:["MARTA_908437","MARTA_908692"],name:"INMAN PARK STATION",lat:33.757451,lon:-84.352762},
        {ids:["MARTA_908438","MARTA_908691"],name:"AVONDALE STATION",lat:33.775214,lon:-84.282466},
        {ids:["MARTA_908515","MARTA_908516"],name:"INDIAN CREEK STATION",lat:33.769893,lon:-84.229874},
        {ids:["MARTA_908566","MARTA_908567"],name:"EAST LAKE STATION",lat:33.765241,lon:-84.312937},
        {ids:["MARTA_908599","MARTA_907844"],name:"COLLEGE PARK STATION",lat:33.650577,lon:-84.448656},
        {ids:["MARTA_908600","MARTA_907843"],name:"GARNETT STATION",lat:33.748696,lon:-84.395741},
        {ids:["MARTA_908601","MARTA_907842"],name:"PEACHTREE CENTER STATION",lat:33.758189,lon:-84.387596},
        {ids:["MARTA_908603","MARTA_908604"],name:"CHAMBLEE STATION",lat:33.887517,lon:-84.306362},
        {ids:["MARTA_908634","MARTA_908709"],name:"KENSINGTON STATION",lat:33.772647,lon:-84.251607},
        {ids:["MARTA_908639","MARTA_908718"],name:"BUCKHEAD STATION",lat:33.847944,lon:-84.367716},
        {ids:["MARTA_908695","MARTA_906647","MARTA_906837"],name:"AIRPORT STATION",lat:33.640553,lon:-84.446198},
        {ids:["MARTA_908696","MARTA_908618"],name:"GEORGIA STATE STATION",lat:33.750143,lon:-84.385882},
        {ids:["MARTA_908699","MARTA_908476"],name:"CANDLER PARK STATION",lat:33.761866,lon:-84.340456},
        {ids:["MARTA_908700","MARTA_908475"],name:"DECATUR STATION",lat:33.774699,lon:-84.295417},
        {ids:["MARTA_908705","MARTA_908704"],name:"WEST END STATION",lat:33.736564,lon:-84.413653},
        {ids:["MARTA_908706","MARTA_908629"],name:"LAKEWOOD STATION",lat:33.70088,lon:-84.428768},
        {ids:["MARTA_908707","MARTA_908628"],name:"EAST POINT STATION",lat:33.676985,lon:-84.440704},
        {ids:["MARTA_908845","MARTA_908862"],name:"DORAVILLE STATION",lat:33.902787,lon:-84.280610},
        {ids:["MARTA_908885","MARTA_908872"],name:"MEDICAL CENTER STATION",lat:33.910757,lon:-84.35189},
        {ids:["MARTA_908911","MARTA_908912"],name:"CIVIC CENTER STATION",lat:33.766236,lon:-84.387504},
        {ids:["MARTA_908958","MARTA_908959"],name:"VINE CITY STATION",lat:33.756613,lon:-84.403902},
        {ids:["MARTA_908963","MARTA_908964"],name:"ASHBY STATION",lat:33.756477,lon:-84.417328},
        {ids:["MARTA_908986","MARTA_908976","MARTA_908990","MARTA_908981"],name:"FIVE POINTS STATION",lat:33.753899,lon:-84.39156}
    ],
    parkRide: [
        {id:"MARTA_144950",name:"BARGE RD PARK & RIDE",lat:33.688804,lon:-84.507221},
        {id:"MARTA_183950",name:"SOUTH FULTON PARK & RIDE",lat:33.586794,lon:-84.512330,"active":0},
        {id:"MARTA_210346",name:"PANOLA PARK & RIDE",lat:33.702106,lon:-84.172974},
        {id:"MARTA_211482",name:"GOLDSMITH PARK & RIDE",lat:33.811196,lon:-84.182803},
        {id:"MARTA_212139",name:"RIVERDALE PARK & RIDE",lat:33.568350,lon:-84.403322},
        {id:"MARTA_902641",name:"WINDWARD PARK & RIDE",lat:34.085992,lon:-84.260559,"active":0},
        {id:"MARTA_903177",name:"MANSELL PARK & RIDE",lat:34.038643,lon:-84.313173,"active":0}
    ],
    tram: [
        {id:"MARTA_211749",name:"KING HISTORIC DISTRICT SC",lat:33.755506,lon:-84.374961},
        {id:"MARTA_211750",name:"DOBBS PLAZA SC",lat:33.755565,lon:-84.378785},
        {id:"MARTA_211751",name:"AUBURN AVE @ PIEDMONT AVE SC",lat:33.755522,lon:-84.382019},
        {id:"MARTA_211752",name:"WOODRUFF PARK SC",lat:33.755995,lon:-84.388148},
        {id:"MARTA_211753",name:"PEACHTREE CENTER STATION SC",lat:33.758064,lon:-84.387532},
        {id:"MARTA_211754",name:"CARNEGIE WAY @ TED TURNER DR SC",lat:33.759485,lon:-84.389676},
        {id:"MARTA_211755",name:"CENTENNIAL OLYMPIC PARK SC",lat:33.759471,lon:-84.391999},
        {id:"MARTA_211756",name:"LUCKIE ST @ CONE ST SC",lat:33.758008,lon:-84.390326},
        {id:"MARTA_211757",name:"PARK PLACE SC",lat:33.755089,lon:-84.388238},
        {id:"MARTA_211758",name:"HURT PARK SC",lat:33.754483,lon:-84.385283},
        {id:"MARTA_211759",name:"SWEET AUBURN MARKET SC",lat:33.754407,lon:-84.379845},
        {id:"MARTA_211760",name:"EGEWOOD AVE @ HILLIARD ST SC",lat:33.754408,lon:-84.376378}
    ],
    busHub: [
        {id:"MARTA_900079",name:"CUMBERLAND MALL",lat:33.878130,lon:-84.469190},
        {id:"MARTA_212236",name:"CLAYTON JUSTICE CTR",lat:33.506028,lon:-84.360042}
    ],
    testStops: [
		{
			id: "MARTA_123456",
			lon: -84.40123,
			lat: 33.79322,
			name: "Stop Name"
		},
		{
			id: "MARTA_1234567",
			lon: -84.40477,
			lat: 33.79028,
			name: "Stop 2",
			active: 0
        },
        {
            id: "MARTA_1234568",
            lon: -84.406720,
            lat: 33.791626,
            name: "Stop Name SC"
        },
        {
            id: "MARTA_1234569",
            lon: -84.402731,
            lat: 33.788452,
            name: "Stop 2",
            active: 0
        },
        {id:"MARTA_906369", name: "ARTS CENTER STATION", lat:33.789669,lon:-84.387414},
        {id:"MARTA_906370", name: "ARTS CENTER STATION", lat:33.788828,lon:-84.387272}
    ],
    shapes: [
        {
            shapeId: 87105, // Blue
            color: "#468fb9",
            weight: 10
        },
        {
            shapeId: 87133, // Green
            color: "#468fb9",
            weight: 10
        },
        {
            shapeId: 87122, // Gold
            color: "#ff8c1a",
            weight: 10
        },
        {
            shapeId: 87154, // Red
            color: "#ff8c1a",
            weight: 10
        },
        {
            shapeId: 87086, // Streetcar to Olympic Park
            color: "#8c8bdf",
            weight: 6
        },
        {
            shapeId: 87087, // Streetcar to Edgewood
            color: "#8c8bdf",
            weight: 6
        }
    ]
};

var textFonts = ["DIN Offc Pro Bold", "Open Sans Semibold", "Arial Unicode MS Bold"];
var stopsMinZoom = 14;
// Helper functions to build basic Mapbox GL layers.
var presetLayers = {
    circle: function(fill, stroke, radius, strokeWidth, minZoom) {
        return {
            type: "circle",
            minzoom: minZoom || 8,
            paint: {
                "circle-radius": radius || 8,
                "circle-color": fill,
                "circle-stroke-color": stroke,
                "circle-stroke-width": strokeWidth || 1
            }
        };
    },
    symbol: function(symbol, color, size, minZoom) {
        return {
            type: "symbol",
            minzoom: minZoom || 8,
            layout: {
                "text-allow-overlap": true,
                "text-field": symbol,
                "text-font": textFonts,
                "text-line-height": 0.8,
                "text-size": size || 12
            },
            paint: {
                "text-color": color
            }
        }
    }
};

function clickZoomInHandler(map, defaultHandler) {
    return function (e) {
        if (map.getZoom() < 14) {
            var coordinates = e.features[0].geometry.coordinates.slice();
            map.flyTo({center: coordinates, zoom: 15});
        }
        else defaultHandler(e);
    }
}

// This will apply the specified layers for a specific stop
// when the first appliesTo is satisfied.
// appliesTo takes two forms:
// - a func returning boolean, or,
// - an array of elements each containing an id field.
// - null/undefined/omitted means it applies to what remains.
var layers = {
    railCircle: {
        // TODO: get rid of IDs
        id: "rail-circle",
        appliesTo: [].concat(presets.rail, presets.busHub),
        handleClick: clickZoomInHandler,
        layers: [presetLayers.circle("#FFFFFF","#606060", 8, 1.5)]
    },
    tramCircle: {
        id: "tram-circle",
        appliesTo: presets.tram,
        handleClick: clickZoomInHandler,
        layers: [presetLayers.circle("#FFFFFF","#606060", 6, 1, 12)]
    },
    parkRideCircle: {
        id: "park-ride-circle",
        appliesTo: presets.parkRide,
        handleClick: clickZoomInHandler,
        layers: [presetLayers.circle("#2d01a5","#FFFFFF", 8, 1.5)]
    },
    parkRideSymbol: {
        id: "park-ride-symbol",
        appliesTo: presets.parkRide,
        layers: [presetLayers.symbol("P", "#FFFFFF")]
    },
    stationLabel: {
        id: "station-label",
        appliesTo: [].concat(
            presets.parkRide,
            presets.rail,
            presets.busHub
        ),
        layers: [{
            type: "symbol",
            layout: {
                // get the title name from the source's "label" property
                "text-field": ["get", "label"],
                "text-font": textFonts,
                "text-justify": "auto",
                "text-line-height": 0.8, //em
                "text-padding": 8,
                "text-radial-offset": 0.1,
                "text-size": 14,
                "text-transform": "uppercase",
                "text-variable-anchor": ["bottom-left", "top-right"]
            },
            paint: {
                "text-color": "#FFFFFF",
                "text-halo-color": "#000066",
                "text-halo-width": 5
            }
        }]
    },
    inactiveStopCircle: {
        id: "inactive-circle",
        appliesTo: filters.inactiveStop,
        layers: [presetLayers.circle("#AAAAAA","#888888", 6, 1, stopsMinZoom)]
    },
    inactiveStopSymbol: {
        id: "inactive-symbol",
        appliesTo: filters.inactiveStop,
        layers: [{
            type: "symbol",
            minzoom: stopsMinZoom,
            layout: {
                "text-allow-overlap": true,
                "text-field": String.fromCharCode(215)
            },
            paint: {
                "text-color": "#fcfcfc"
            }
        }]
    },
    activeStopCircle: {
        id: "active-circle",
        layers: [presetLayers.circle("#3bb2d0","#0099ff", 8, 1, stopsMinZoom)]
    }
}

/*
SIGN: { symbol: "library", color: "#FF4040", amenities: "TimelyTrip Full Sign" },
MINI: { symbol: "mobilephone", color: "#3bb2d0", amenities: "TimelyTrip Sticker" },
GCAN: { symbol: "shop-15", color: "#3bd0a0", amenities: "Operation CleanStop Trash Can" }
*/
// Icons from iconmonstr.com, except where indicated.
var presetAmenities = {
    accessible: {
        // Derived from accessibleicon.org
        contents: "<svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" viewBox=\"250 160 624 460\" enable-background=\"new 0 0 1224 792\" xml:space=\"preserve\">"
            + "<g><path d=\"M833.556,367.574c-7.753-7.955-18.586-12.155-29.656-11.549l-133.981,7.458l73.733-83.975 c10.504-11.962,13.505-27.908,9.444-42.157c-2.143-9.764-8.056-18.648-17.14-24.324c-0.279-0.199-176.247-102.423-176.247-102.423 c-14.369-8.347-32.475-6.508-44.875,4.552l-85.958,76.676c-15.837,14.126-17.224,38.416-3.097,54.254 c14.128,15.836,38.419,17.227,54.255,3.096l65.168-58.131l53.874,31.285l-95.096,108.305 c-39.433,6.431-74.913,24.602-102.765,50.801l49.66,49.66c22.449-20.412,52.256-32.871,84.918-32.871 c69.667,0,126.346,56.68,126.346,126.348c0,32.662-12.459,62.467-32.869,84.916l49.657,49.66 c33.08-35.166,53.382-82.484,53.382-134.576c0-31.035-7.205-60.384-20.016-86.482l51.861-2.889l-12.616,154.75 c-1.725,21.152,14.027,39.695,35.18,41.422c1.059,0.086,2.116,0.127,3.163,0.127c19.806,0,36.621-15.219,38.257-35.306 l16.193-198.685C845.235,386.445,841.305,375.527,833.556,367.574z\"/>"
            + "<path d=\"M762.384,202.965c35.523,0,64.317-28.797,64.317-64.322c0-35.523-28.794-64.323-64.317-64.323 c-35.527,0-64.323,28.8-64.323,64.323C698.061,174.168,726.856,202.965,762.384,202.965z\"/>"
            + "<path d=\"M535.794,650.926c-69.668,0-126.348-56.68-126.348-126.348c0-26.256,8.056-50.66,21.817-70.887l-50.196-50.195 c-26.155,33.377-41.791,75.393-41.791,121.082c0,108.535,87.983,196.517,196.518,196.517c45.691,0,87.703-15.636,121.079-41.792 l-50.195-50.193C586.452,642.867,562.048,650.926,535.794,650.926z\"/>"
            + "</g></svg>",
        longText: "This stop is accessible to people with mobility impairments.",
        shortText: "Accessible"
    },
    lighting: {
        contents: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill-rule=\"evenodd\" clip-rule=\"evenodd\"><path d=\"M14.25 23l-1.188.782c-.154.139-.38.218-.615.218h-.894c-.235 0-.461-.079-.616-.218l-1.187-.782h4.5zm.042-2c.276 0 .5.224.5.5 0 .277-.224.5-.5.5h-4.558c-.276 0-.5-.223-.5-.5 0-.276.224-.5.5-.5h4.558zm.494-1h-5.572c0-3.949-3.214-5.659-3.214-9.228 0-3.723 2.998-5.772 5.997-5.772 3.001 0 6.003 2.052 6.003 5.772 0 3.569-3.214 5.224-3.214 9.228m4.953-7.229l2.699 1.224-.827 1.822-2.596-1.177c.301-.6.55-1.215.724-1.869m-15.477 0c.173.664.415 1.261.719 1.87l-2.592 1.176-.827-1.822 2.7-1.224zm15.55-3.771h3.188v2h-3.003c.021-.67-.04-1.345-.185-2m-15.625 0c-.143.654-.203 1.326-.184 1.995v.005h-3.003v-2h3.187zm13.856-3.428l2.485-1.763 1.158 1.631-2.505 1.777c-.292-.582-.67-1.132-1.138-1.645m-12.087-.001c-.46.503-.837 1.05-1.138 1.645l-2.503-1.776 1.157-1.631 2.484 1.762zm8.869-2.092l1.327-2.69 1.793.885-1.327 2.69c-.557-.367-1.161-.664-1.793-.885m-5.651-.002c-.631.22-1.236.516-1.794.884l-1.326-2.687 1.794-.885 1.326 2.688zm3.826-.416c-.668-.078-1.309-.082-2-.003v-3.058h2v3.061z\"/></svg>",
        longText: "This stop is lit at night.",
        shortText: "Lighting"
    },
    map: {
        contents: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path d=\"M17.492 15.432c-.433 0-.855-.087-1.253-.259l.467-1.082c.25.107.514.162.786.162.222 0 .441-.037.651-.11l.388 1.112c-.334.118-.683.177-1.039.177zm-10.922-.022c-.373 0-.741-.066-1.093-.195l.407-1.105c.221.081.451.122.686.122.26 0 .514-.05.754-.148l.447 1.09c-.382.157-.786.236-1.201.236zm8.67-.783l-1.659-.945.583-1.024 1.66.945-.584 1.024zm-6.455-.02l-.605-1.011 1.639-.981.605 1.011-1.639.981zm3.918-1.408c-.243-.101-.5-.153-.764-.153-.23 0-.457.04-.674.119l-.401-1.108c.346-.125.708-.188 1.075-.188.42 0 .83.082 1.217.244l-.453 1.086zm7.327-.163c-.534 0-.968.433-.968.968 0 .535.434.968.968.968.535 0 .969-.434.969-.968 0-.535-.434-.968-.969-.968zm-16.061 0c-.535 0-.969.433-.969.968 0 .535.434.968.969.968s.969-.434.969-.968c0-.535-.434-.968-.969-.968zm18.031-.832v6.683l-4 2.479v-4.366h-1v4.141l-4-2.885v-3.256h-2v3.255l-4 2.885v-4.14h-1v4.365l-4-2.479v-13.294l4 2.479v3.929h1v-3.927l4-2.886v4.813h2v-4.813l1.577 1.138c-.339-.701-.577-1.518-.577-2.524l.019-.345-2.019-1.456-5.545 4-6.455-4v18l6.455 4 5.545-4 5.545 4 6.455-4v-11.618l-.039.047c-.831.982-1.614 1.918-1.961 3.775zm2-8.403c0-2.099-1.9-3.801-4-3.801s-4 1.702-4 3.801c0 3.121 3.188 3.451 4 8.199.812-4.748 4-5.078 4-8.199zm-5.5.199c0-.829.672-1.5 1.5-1.5s1.5.671 1.5 1.5-.672 1.5-1.5 1.5-1.5-.671-1.5-1.5zm-.548 8c-.212-.992-.547-1.724-.952-2.334v2.334h.952z\"/></svg>",
        longText: "This stop has route maps.",
        shortText: "Map"
    },
    seating: {
        // Derived from https://svgsilh.com/svg_v2/44084.svg (marked as public domain)
        contents: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1280 1280\">"
            + "<g transform=\"translate(300,1280) scale(0.1,-0.1)\" fill=\"#000000\" stroke=\"none\">"
            + "<path d=\"M2112 12790 c-155 -22 -348 -87 -478 -162 -356 -204 -600 -548 -668 -943 -21 -117 -21 -343 0 -460 100 -581 574 -1031 1164 -1104 515 -65 1039 196 1312 654 136 227 205 533 180 794 -60 608 -487 1082 -1087 1206 -93 19 -332 28 -423 15z\"/>"
            + "<path d=\"M2305 9884 c-11 -3 -55 -11 -97 -20 -366 -70 -694 -317 -848 -638 -83 -175 -114 -341 -107 -570 4 -139 10 -188 46 -361 24 -110 168 -823 321 -1585 402 -2000 369 -1838 410 -1950 127 -351 401 -620 740 -729 182 -59 67 -55 1748 -61 l1542 -5 0 -1580 c0 -954 4 -1624 10 -1690 17 -192 71 -335 168 -448 90 -102 190 -168 327 -214 68 -22 98 -26 205 -27 144 -1 227 16 327 67 190 97 309 247 366 458 l22 84 0 2185 c0 1757 -3 2198 -13 2250 -44 220 -139 404 -284 550 -118 120 -259 200 -446 253 -77 22 -81 22 -1301 27 l-1224 5 -49 245 c-599 3017 -583 2943 -669 3112 -167 330 -436 543 -789 624 -64 15 -365 28 -405 18z\"/>"
            + "<path d=\"M422 8316 c-206 -50 -375 -223 -411 -420 -23 -126 -31 -79 158 -1001 49 -242 180 -881 290 -1420 110 -539 209 -1014 220 -1056 81 -306 237 -625 434 -888 96 -129 348 -381 474 -474 334 -247 684 -396 1069 -454 110 -17 212 -18 1289 -18 1113 0 1173 1 1230 19 205 63 336 208 379 418 20 97 20 139 1 234 -46 219 -171 355 -390 422 -43 14 -204 17 -1175 22 l-1125 6 -105 26 c-149 37 -190 52 -325 118 -148 72 -253 149 -370 271 -172 179 -293 398 -367 664 -18 63 -185 875 -523 2530 -64 314 -123 595 -131 625 -78 279 -348 442 -622 376z\"/>"
            + "</g></svg>",
        longText: "This stop has seating.",
        shortText: "Seating"
    },
    shelter: {
        contents: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path d=\"M14.763 9.901l.415-.72c.218-.376.089-.858-.287-1.075-.377-.218-.858-.089-1.076.288l-.415.717c-4.92-2.366-9.273-.269-11.4 2.425 2.325-1.091 5.238.59 5.455 3.149 2.293-1.076 5.18.55 5.398 3.117 2.325-1.092 5.295.622 5.512 3.182 1.263-3.172.862-7.988-3.602-11.083zm-3.978 6.888l-3.48 6.03c-.652 1.129-2.097 1.517-3.227.864-1.129-.652-1.517-2.097-.864-3.226l.394-.682 1.363.788-.393.682c-.218.375-.088.857.287 1.073.377.218.859.089 1.076-.287l3.49-6.045c.553.113.962.335 1.354.803zm11.098-11.789c-1.787.869-2.921 1.403-3.422 2.268-.5.868-.197 1.979.678 2.484.875.506 1.99.213 2.49-.654.5-.866.395-2.116.254-4.098zm-7.98-3.979c-1.787.869-2.921 1.403-3.421 2.268-.501.868-.197 1.979.678 2.484.875.506 1.988.213 2.489-.654.501-.866.396-2.116.254-4.098zm6.006-1.021c-1.43.695-2.337 1.122-2.737 1.814-.4.694-.158 1.583.543 1.987.699.405 1.591.17 1.991-.523.4-.693.316-1.692.203-3.278z\"/></svg>",
        longText: "This stop has a shelter.",
        shortText: "Shelter"
    },
    ticketing: {
        contents: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path d=\"M22 4h-20c-1.104 0-2 .896-2 2v12c0 1.104.896 2 2 2h20c1.104 0 2-.896 2-2v-12c0-1.104-.896-2-2-2zm0 13.5c0 .276-.224.5-.5.5h-19c-.276 0-.5-.224-.5-.5v-6.5h20v6.5zm0-9.5h-20v-1.5c0-.276.224-.5.5-.5h19c.276 0 .5.224.5.5v1.5zm-9 6h-9v-1h9v1zm-3 2h-6v-1h6v1zm10-2h-3v-1h3v1z\"/></svg>",
        longText: "This stop has ticket vending.",
        shortText: "Ticketing"
    },
    trash: {
        contents: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path d=\"M3 6v18h18v-18h-18zm5 14c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm4-18v2h-20v-2h5.711c.9 0 1.631-1.099 1.631-2h5.315c0 .901.73 2 1.631 2h5.712z\"/></svg>",
        longText: "This stop has a trash can.",
        shortText: "Trash can"
    },
    trafficLight: {
        contents: "<sup>🚦</sup>",
        longText: "A traffic light is in the vicinity of this stop.",
        shortText: "Traffic light",
    },
    crosswalk: {
        // Original: https://commons.m.wikimedia.org/wiki/Crossing_signs#/media/File%3AItalian_traffic_signs_-_attraversamento_pericoloso.svg
        contents: "<svg viewBox=\"0 0 105 105\" xmlns=\"http://www.w3.org/2000/svg\"><g>"
            + "<path id=\"path2803\" d=\"m31.26314,66.47522l7.71373,0l-3.03098,32.16062l-12.51278,0l7.83003,-32.16062z\" stroke-miterlimit=\"4\" stroke-linejoin=\"round\" stroke-linecap=\"round\" fill-rule=\"evenodd\" fill=\"black\"/>"
            + "<path id=\"path2809\" d=\"m65.99307,66.47522l8.59777,0l7.95631,32.16062l-12.1339,0l-4.42018,-32.16062z\" stroke-miterlimit=\"4\" stroke-linejoin=\"round\" stroke-linecap=\"round\" fill-rule=\"evenodd\" fill=\"black\"/>"
            + "<path style=\"vector-effect: non-scaling-stroke;\" d=\"m55.17081,14.12238c-0.61749,-0.00202 -1.22699,0.13085 -1.78016,0.38806l-6.87224,3.22092c-0.57669,0.272 -1.074,0.67158 -1.44897,1.16419l-16.9322,22.00314c-1.28039,1.6717 -0.87261,3.99984 0.91078,5.20004c1.78339,1.2002 4.26708,0.81796 5.54747,-0.85374l9.77017,-12.68964l3.60172,8.49857l-21.77589,41.32865c-0.69966,1.20016 -0.62726,2.65491 0.1656,3.80301c0.79286,1.14812 2.18854,1.81448 3.64311,1.70747c1.45457,-0.10702 2.71986,-0.96196 3.31192,-2.21196l19.58174,-37.13758l17.22199,36.08981c0.57317,1.22954 1.80533,2.07321 3.22912,2.21196c1.42378,0.13872 2.81239,-0.4595 3.64311,-1.55225c0.83071,-1.09273 0.97727,-2.50918 0.37259,-3.7254l-18.54676,-38.76744c-0.1469,-0.32017 -0.31151,-0.63069 -0.53819,-0.89254l2.60814,-13.27174l6.37545,6.13139l0.86938,8.80902c0.05336,1.37685 0.91355,2.61877 2.23555,3.22092c1.322,0.60215 2.86934,0.46228 4.0571,-0.34926c1.18777,-0.81153 1.82145,-2.16734 1.61456,-3.53137l-0.95218,-10.16724c-0.07784,-0.86166 -0.47302,-1.6711 -1.11777,-2.28957l-15.93862,-15.21205c-0.75056,-0.72191 -1.78115,-1.12793 -2.85653,-1.12538z\" id=\"path1884\" stroke-miterlimit=\"4\" stroke-linejoin=\"round\" stroke-linecap=\"round\" stroke=\"white\" stroke-width=\"0.1\" fill-rule=\"evenodd\" fill=\"black\"/>"
            + "<path id=\"path1892\" d=\"m55.30688,7.35623c0,3.84065 -2.55525,6.95408 -5.70733,6.95408c-3.15209,0 -5.70734,-3.11343 -5.70734,-6.95408c0,-3.84063 2.55525,-6.95408 5.70734,-6.95408c3.15207,0 5.70733,3.11345 5.70733,6.95408z\" stroke-miterlimit=\"4\" stroke-linejoin=\"round\" stroke-width=\"6\" fill-rule=\"evenodd\" fill=\"black\"/>"
            + "<path d=\"m49.70158,66.47522l7.08227,0l2.02065,32.16062l-11.37616,0l2.27324,-32.16062z\" id=\"rect2800\" stroke-miterlimit=\"4\" stroke-linejoin=\"round\" stroke-linecap=\"round\" fill-rule=\"evenodd\" fill=\"black\"/>"
            + "<path d=\"m15.22423,66.47522l9.60809,0l-10.60842,32.16062l-13.27051,0l14.27085,-32.16062z\" id=\"path2807\" stroke-miterlimit=\"4\" stroke-linejoin=\"round\" stroke-linecap=\"round\" fill-rule=\"evenodd\" fill=\"black\"/>"
            + "<path d=\"m81.02165,66.47522l9.6081,0l13.89197,32.16062l-12.63906,0l-10.86101,-32.16062z\" id=\"path2811\" stroke-miterlimit=\"4\" stroke-linejoin=\"round\" stroke-linecap=\"round\" fill-rule=\"evenodd\" fill=\"black\"/>"
            + "</g></svg>",
        longText: "This stop has a safe crosswalk nearby.",
        shortText: "Safe crosswalk"
    }
};
var stopAmenities = {
    tram: [
        presetAmenities.accessible,
        presetAmenities.shelter,
        presetAmenities.seating,
        presetAmenities.map,
        presetAmenities.trash,
        presetAmenities.ticketing,
        presetAmenities.trafficLight,
        presetAmenities.crosswalk,
        presetAmenities.lighting
    ]
};
