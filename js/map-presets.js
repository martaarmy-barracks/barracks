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
            name: "Stop Name"
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
        layers: [presetLayers.circle("#FFFFFF","#606060", 8, 1.5)]
    },
    tramCircle: {
        id: "tram-circle",
        appliesTo: presets.tram,
        layers: [presetLayers.circle("#FFFFFF","#606060", 6, 1, 12)]
    },
    parkRideCircle: {
        id: "park-ride-circle",
        appliesTo: presets.parkRide,
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
