// A set of preloaded stops.
// (More info about these stops may still need to be fetched.)
var presets = {
    "rail": [
        {"id":"MARTA_906369","name":"ARTS CENTER STATION","lat":33.789669,"lon":-84.387414},
        {"id":"MARTA_906827","name":"LENOX STATION","lat":33.845388,"lon":-84.358235},
        {"id":"MARTA_907766","name":"NORTH SPRINGS STATION","lat":33.944950,"lon":-84.357275},
        {"id":"MARTA_907775","name":"LINDBERGH STATION","lat":33.823501,"lon":-84.369313},
        {"id":"MARTA_907845","name":"SANDY SPRINGS STATION","lat":33.931671,"lon":-84.351069},
        {"id":"MARTA_907914","name":"NORTH AVENUE STATION","lat":33.771741,"lon":-84.387204},
        {"id":"MARTA_907933","name":"HE HOLMES STATION","lat":33.754553,"lon":-84.469302},
        {"id":"MARTA_907961","name":"BANKHEAD STATION","lat":33.772436,"lon":-84.428906},
        {"id":"MARTA_908023","name":"WEST LAKE STATION","lat":33.753328,"lon":-84.445329},
        {"id":"MARTA_908047","name":"DUNWOODY STATION","lat":33.921130,"lon":-84.344268},
        {"id":"MARTA_908186","name":"BROOKHAVEN STATION","lat":33.860329,"lon":-84.339245},
        {"id":"MARTA_908302","name":"OAKLAND CITY STATION","lat":33.716978,"lon":-84.425138},
        {"id":"MARTA_908374","name":"MIDTOWN STATION","lat":33.781247,"lon":-84.386342},
        {"id":"MARTA_908435","name":"DOME STATION","lat":33.756179,"lon":-84.397215},
        {"id":"MARTA_908436","name":"KING MEMORIAL STATION","lat":33.749951,"lon":-84.375675},
        {"id":"MARTA_908437","name":"INMAN PARK STATION","lat":33.757451,"lon":-84.352762},
        {"id":"MARTA_908438","name":"AVONDALE STATION","lat":33.775554,"lon":-84.281487},
        {"id":"MARTA_908515","name":"INDIAN CREEK STATION","lat":33.769856,"lon":-84.228906},
        {"id":"MARTA_908566","name":"EAST LAKE STATION","lat":33.765241,"lon":-84.312937},
        {"id":"MARTA_908599","name":"COLLEGE PARK STATION","lat":33.650577,"lon":-84.448656},
        {"id":"MARTA_908600","name":"GARNETT STATION","lat":33.748938,"lon":-84.395545},
        {"id":"MARTA_908601","name":"PEACHTREE CENTER STATION","lat":33.758189,"lon":-84.387596},
        {"id":"MARTA_908603","name":"CHAMBLEE STATION","lat":33.887929,"lon":-84.305556},
        {"id":"MARTA_908634","name":"KENSINGTON STATION","lat":33.772647,"lon":-84.251607},
        {"id":"MARTA_908639","name":"BUCKHEAD STATION","lat":33.847944,"lon":-84.367716},
        {"id":"MARTA_908695","name":"AIRPORT STATION","lat":33.640831,"lon":-84.446198},
        {"id":"MARTA_908696","name":"GEORGIA STATE STATION","lat":33.750143,"lon":-84.385882},
        {"id":"MARTA_908699","name":"CANDLER PARK STATION","lat":33.761866,"lon":-84.340456},
        {"id":"MARTA_908700","name":"DECATUR STATION","lat":33.774681,"lon":-84.295319},
        {"id":"MARTA_908705","name":"WEST END STATION","lat":33.735705,"lon":-84.413663},
        {"id":"MARTA_908706","name":"LAKEWOOD STATION","lat":33.700298,"lon":-84.428865},
        {"id":"MARTA_908707","name":"EAST POINT STATION","lat":33.676985,"lon":-84.440704},
        {"id":"MARTA_908845","name":"DORAVILLE STATION","lat":33.902787,"lon":-84.280610},
        {"id":"MARTA_908885","name":"MEDICAL CENTER STATION","lat":33.910739,"lon":-84.351759},
        {"id":"MARTA_908912","name":"CIVIC CENTER STATION","lat":33.766236,"lon":-84.387504},
        {"id":"MARTA_908958","name":"VINE CITY STATION","lat":33.756613,"lon":-84.403902},
        {"id":"MARTA_908963","name":"ASHBY STATION","lat":33.756478,"lon":-84.417230},
        {"id":"MARTA_908986","name":"FIVE POINTS STATION","lat":33.754052,"lon":-84.391452}
    ],
    "parkRide": [
        {"id":"MARTA_144950","name":"BARGE RD PARK & RIDE","lat":33.688804,"lon":-84.507221},
        {"id":"MARTA_183950","name":"SOUTH FULTON PARK & RIDE","lat":33.586794,"lon":-84.512330,"active":0},
        {"id":"MARTA_210346","name":"PANOLA PARK & RIDE","lat":33.702106,"lon":-84.172974},
        {"id":"MARTA_211482","name":"GOLDSMITH PARK & RIDE","lat":33.811196,"lon":-84.182803},
        {"id":"MARTA_212139","name":"RIVERDALE PARK & RIDE","lat":33.568350,"lon":-84.403322},
        {"id":"MARTA_902641","name":"WINDWARD PARK & RIDE","lat":34.085992,"lon":-84.260559,"active":0},
        {"id":"MARTA_903177","name":"MANSELL PARK & RIDE","lat":34.038643,"lon":-84.313173,"active":0}
    ],
    "tram": [
        {"id":"MARTA_211749","name":"KING HISTORIC DISTRICT SC","lat":33.755506,"lon":-84.374961},
        {"id":"MARTA_211750","name":"DOBBS PLAZA SC","lat":33.755565,"lon":-84.378785},
        {"id":"MARTA_211751","name":"AUBURN AVE @ PIEDMONT AVE SC","lat":33.755522,"lon":-84.382019},
        {"id":"MARTA_211752","name":"WOODRUFF PARK SC","lat":33.755995,"lon":-84.388148},
        {"id":"MARTA_211753","name":"PEACHTREE CENTER STATION SC","lat":33.758064,"lon":-84.387532},
        {"id":"MARTA_211754","name":"CARNEGIE WAY @ TED TURNER DR SC","lat":33.759485,"lon":-84.389676},
        {"id":"MARTA_211755","name":"CENTENNIAL OLYMPIC PARK SC","lat":33.759471,"lon":-84.391999},
        {"id":"MARTA_211756","name":"LUCKIE ST @ CONE ST SC","lat":33.758008,"lon":-84.390326},
        {"id":"MARTA_211757","name":"PARK PLACE SC","lat":33.755089,"lon":-84.388238},
        {"id":"MARTA_211758","name":"HURT PARK SC","lat":33.754483,"lon":-84.385283},
        {"id":"MARTA_211759","name":"SWEET AUBURN MARKET SC","lat":33.754407,"lon":-84.379845},
        {"id":"MARTA_211760","name":"EGEWOOD AVE @ HILLIARD ST SC","lat":33.754408,"lon":-84.376378}
    ],
    "busHub": [
        //{"id":"MARTA_900079","name":"CUMBERLAND MALL","lat":33.878130,"lon":-84.469190},
        {"id":"MARTA_212236","name":"CLAYTON JUSTICE CTR","lat":33.506028,"lon":-84.360042}
    ],
    "testStops": [
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
        }
    ],
    "shapes": [
        {
            shapeId: 86149, // Blue
            color: "#468fb9",
            weight: 10
        },
        {
            shapeId: 86177, // Green
            color: "#468fb9",
            weight: 10
        },
        {
            shapeId: 86167, // Gold
            color: "#ff8c1a",
            weight: 10
        },
        {
            shapeId: 86198, // Red
            color: "#ff8c1a",
            weight: 10
        },
        {
            shapeId: 86130, // Streetcar to Olympic Park
            color: "#8c8bdf",
            weight: 6
        },
        {
            shapeId: 86131, // Streetcar to Edgewood
            color: "#8c8bdf",
            weight: 6
        }
    ]
};

var textFonts = ["DIN Offc Pro Bold", "Open Sans Semibold", "Arial Unicode MS Bold"];
var stopsMinZoom = 14;

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
        appliesTo: [].concat(
            presets.rail,
            presets.busHub
        ),
        layers: [{
            type: "circle",
            paint: {
                "circle-radius": 8,
                "circle-color": "#FFFFFF",
                "circle-stroke-color": "#606060",
                "circle-stroke-width": 1.5,
            }
        }]
    },
    tramCircle: {
        id: "tram-circle",
        appliesTo: presets.tram,
        layers: [{
            type: "circle",
            minzoom: 12,
            paint: {
                "circle-radius": 6,
                "circle-color": "#FFFFFF",
                "circle-stroke-color": "#606060",
                "circle-stroke-width": 1,
            }
        }]
    },
    parkRideCircle: {
        id: "park-ride-circle",
        appliesTo: presets.parkRide,
        layers: [{
            type: "circle",
            paint: {
                "circle-radius": 8,
                "circle-color": "#2d01a5",
                "circle-stroke-color": "#FFFFFF",
                "circle-stroke-width": 1.5,
            }
        }]
    },
    parkRideSymbol: {
        id: "park-ride-symbol",
        appliesTo: presets.parkRide,
        layers: [{
            type: "symbol",
            layout: {
                "text-allow-overlap": true,
                "text-field": "P",
                "text-font": textFonts,
                "text-line-height": 0.8,
                "text-size": 12
            },
            paint: {
                "text-color": "#ffffff"
            }
        }]
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
        layers: [{
            type: "circle",
            minzoom: stopsMinZoom,
            paint: {
                "circle-radius": 6,
                "circle-color": "#AAAAAA",
                "circle-stroke-color": "#888888",
                "circle-stroke-width": 1,
            }
        }]
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
        layers: [{
            type: "circle",
            minzoom: stopsMinZoom,
            paint: {
                "circle-radius": 8,
                "circle-color": "#3bb2d0",
                "circle-stroke-color": "#0099ff",
                "circle-stroke-width": 1,
            }
        }]
    }
}

/*
SIGN: { symbol: "library", color: "#FF4040", amenities: "TimelyTrip Full Sign" },
MINI: { symbol: "mobilephone", color: "#3bb2d0", amenities: "TimelyTrip Sticker" },
GCAN: { symbol: "shop-15", color: "#3bd0a0", amenities: "Operation CleanStop Trash Can" }
*/
