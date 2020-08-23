var textFonts = ["DIN Offc Pro Bold", "Open Sans Semibold", "Arial Unicode MS Bold"];
var layers = {
    railCircle: {
        type: "circle",
        paint: {
            "circle-radius": 8,
            "circle-color": "#FFFFFF",
            "circle-stroke-color": "#606060",
            "circle-stroke-width": 1.5,
        }
    },
    tramCircle: {
        type: "circle",
        minzoom: 12,
        paint: {
            "circle-radius": 4,
            "circle-color": "#FFFFFF",
            "circle-stroke-color": "#606060",
            "circle-stroke-width": 1,
        }
    },
    parkRideCircle: {
        type: "circle",
        paint: {
            "circle-radius": 8,
            "circle-color": "#2d01a5",
            "circle-stroke-color": "#FFFFFF",
            "circle-stroke-width": 1.5,
        }
    },
    parkRideSymbol: {
        type: "symbol",
        layout: {
            "text-field": "P",
            "text-font": textFonts,
            "text-line-height": 0.8,
            "text-size": 12
        },
        paint: {
            "text-color": "#ffffff"
        }
    },
    stationLabel: {
        fixedName: "stations-layer-text",
        type: "symbol",
        minzoom: 11,
        layout: {
            // get the title name from the source's "nameDisplayed" property
            "text-field": ["get", "nameDisplayed"],
            "text-font": textFonts,
            "text-justify": "auto",
            "text-line-height": 0.8, //em
            "text-radial-offset": 0.8,
            "text-size": 14,
            "text-transform": "uppercase",
            "text-variable-anchor": ["bottom-left", "top-right"]
        },
        paint: {
            "text-color": "#FFFFFF",
            "text-halo-color": "#000066",
            "text-halo-width": 5
        }
    }
}

var presets = {
    "rail": [
        {"id":"906369","name":"ARTS CENTER STATION","lat":"33.789669","lon":"-84.387414"},
        {"id":"906827","name":"LENOX STATION","lat":"33.845388","lon":"-84.358235"},
        {"id":"907766","name":"NORTH SPRINGS STATION","lat":"33.944950","lon":"-84.357275"},
        {"id":"907775","name":"LINDBERGH STATION","lat":"33.823501","lon":"-84.369313"},
        {"id":"907845","name":"SANDY SPRINGS STATION","lat":"33.931671","lon":"-84.351069"},
        {"id":"907914","name":"NORTH AVENUE STATION","lat":"33.771741","lon":"-84.387204"},
        {"id":"907933","name":"HE HOLMES STATION","lat":"33.754553","lon":"-84.469302"},
        {"id":"907961","name":"BANKHEAD STATION","lat":"33.772436","lon":"-84.428906"},
        {"id":"908023","name":"WEST LAKE STATION","lat":"33.753328","lon":"-84.445329"},
        {"id":"908047","name":"DUNWOODY STATION","lat":"33.921130","lon":"-84.344268"},
        {"id":"908186","name":"BROOKHAVEN STATION","lat":"33.860329","lon":"-84.339245"},
        {"id":"908302","name":"OAKLAND CITY STATION","lat":"33.716978","lon":"-84.425138"},
        {"id":"908374","name":"MIDTOWN STATION","lat":"33.781247","lon":"-84.386342"},
        {"id":"908435","name":"DOME STATION","lat":"33.756179","lon":"-84.397215"},
        {"id":"908436","name":"KING MEMORIAL STATION","lat":"33.749951","lon":"-84.375675"},
        {"id":"908437","name":"INMAN PARK STATION","lat":"33.757451","lon":"-84.352762"},
        {"id":"908438","name":"AVONDALE STATION","lat":"33.775554","lon":"-84.281487"},
        {"id":"908515","name":"INDIAN CREEK STATION","lat":"33.769856","lon":"-84.228906"},
        {"id":"908566","name":"EAST LAKE STATION","lat":"33.765241","lon":"-84.312937"},
        {"id":"908599","name":"COLLEGE PARK STATION","lat":"33.650577","lon":"-84.448656"},
        {"id":"908600","name":"GARNETT STATION","lat":"33.748938","lon":"-84.395545"},
        {"id":"908601","name":"PEACHTREE CENTER STATION","lat":"33.758189","lon":"-84.387596"},
        {"id":"908603","name":"CHAMBLEE STATION","lat":"33.887929","lon":"-84.305556"},
        {"id":"908634","name":"KENSINGTON STATION","lat":"33.772647","lon":"-84.251607"},
        {"id":"908639","name":"BUCKHEAD STATION","lat":"33.847944","lon":"-84.367716"},
        {"id":"908695","name":"AIRPORT STATION","lat":"33.640831","lon":"-84.446198"},
        {"id":"908696","name":"GEORGIA STATE STATION","lat":"33.750143","lon":"-84.385882"},
        {"id":"908699","name":"CANDLER PARK STATION","lat":"33.761866","lon":"-84.340456"},
        {"id":"908700","name":"DECATUR STATION","lat":"33.774681","lon":"-84.295319"},
        {"id":"908705","name":"WEST END STATION","lat":"33.735705","lon":"-84.413663"},
        {"id":"908706","name":"LAKEWOOD STATION","lat":"33.700298","lon":"-84.428865"},
        {"id":"908707","name":"EAST POINT STATION","lat":"33.676985","lon":"-84.440704"},
        {"id":"908845","name":"DORAVILLE STATION","lat":"33.902787","lon":"-84.280610"},
        {"id":"908885","name":"MEDICAL CENTER STATION","lat":"33.910739","lon":"-84.351759"},
        {"id":"908912","name":"CIVIC CENTER STATION","lat":"33.766236","lon":"-84.387504"},
        {"id":"908958","name":"VINE CITY STATION","lat":"33.756613","lon":"-84.403902"},
        {"id":"908963","name":"ASHBY STATION","lat":"33.756478","lon":"-84.417230"},
        {"id":"908986","name":"FIVE POINTS STATION","lat":"33.754052","lon":"-84.391452"}
    ],
    "parkRide": [
        {"id":"144950","name":"BARGE RD PARK & RIDE","lat":"33.688804","lon":"-84.507221"},
        {"id":"183950","name":"SOUTH FULTON PARK & RIDE","lat":"33.586794","lon":"-84.512330"},
        {"id":"210346","name":"PANOLA PARK & RIDE","lat":"33.702106","lon":"-84.172974"},
        {"id":"211482","name":"GOLDSMITH PARK & RIDE","lat":"33.811196","lon":"-84.182803"},
        {"id":"212139","name":"RIVERDALE PARK & RIDE","lat":"33.568350","lon":"-84.403322"},
        {"id":"902641","name":"WINDWARD PARK & RIDE","lat":"34.085992","lon":"-84.260559"},
        {"id":"903177","name":"MANSELL PARK & RIDE","lat":"34.038643","lon":"-84.313173"}
    ],
    "tram": [
        {"id":"211749","name":"KING HISTORIC DISTRICT SC","lat":"33.755506","lon":"-84.374961"},
        {"id":"211750","name":"DOBBS PLAZA SC","lat":"33.755565","lon":"-84.378785"},
        {"id":"211750","name":"AUBURN AVE @ PIEDMONT AVE SC","lat":"33.755522","lon":"-84.382019"},
        {"id":"211752","name":"WOODRUFF PARK SC","lat":"33.755995","lon":"-84.388148"},
        {"id":"211754","name":"CARNEGIE WAY @ TED TURNER DR SC","lat":"33.759485","lon":"-84.389676"},
        {"id":"211755","name":"CENTENNIAL OLYMPIC PARK SC","lat":"33.759471","lon":"-84.391999"},
        {"id":"211756","name":"LUCKIE ST @ CONE ST SC","lat":"33.758008","lon":"-84.390326"},
        {"id":"211756","name":"LUCKIE ST @ CONE ST SC","lat":"33.758008","lon":"-84.390326"},
        {"id":"211757","name":"PARK PLACE SC","lat":"33.755089","lon":"-84.388238"},
        {"id":"211758","name":"HURT PARK SC","lat":"33.754483","lon":"-84.385283"},
        {"id":"211759","name":"SWEET AUBURN MARKET SC","lat":"33.754407","lon":"-84.379845"},
        {"id":"211760","name":"EGEWOOD AVE @ HILLIARD ST SC","lat":"33.754408","lon":"-84.376378"},
        {"id":"211760","name":"EGEWOOD AVE @ HILLIARD ST SC","lat":"33.754408","lon":"-84.376378"}
    ],
    "busHub": [
        {"id":"900079","name":"CUMBERLAND MALL","lat":"33.878130","lon":"-84.469190"},
        {"id":"212236","name":"CLAYTON JUSTICE CTR","lat":"33.506028","lon":"-84.360042"}
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
            shapeId: 86130, // Streetcar out
            color: "#8c8bdf",
            weight: 6
        },
        {
            shapeId: 115584, // Streetcar in
            color: "#8c8bdf",
            weight: 6
        }
    ]
};

var converters = {
    stationToGeoJson: function(station) {
        return {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [station.lon, station.lat]
            },
            properties: {
                stop: station,
                nameDisplayed: station.name
                    .replace(" PARK & RIDE", "")
                    .replace(" STATION", "")
            }
        };
    },
    stopToGeoJson: function(stop) {
        var stopActive = stop.active != 0 && stop.active != "0";
        var symb = {};
        if (!stopActive) {
            symb.color = "#AAAAAA";
            symb.text = String.fromCharCode(215);
        }

        var marker = {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [stop.lon, stop.lat]
            },
            properties: {
                isActive: stopActive,
                markerFill: symb.color,
                markerSymbol: symb.symbol,
                markerText: symb.text,
                stopname: stop.name,
                stopid: stop.id,
                amenities: symb.amenities,
                reason: stop.reason
            }
        };
        return marker;
    },
    shapeToGeoJson: function(shape) {
        return {
            type: "geojson",
            data: {
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: shape.points_arr
                }
            }
        };
    }
}

var defaultFeatures = [
    {
        name: "rail",
        allEntities: presets.rail,
        converter: converters.stationToGeoJson,
        layers: [layers.railCircle, layers.stationLabel]
    },
    {
        name: "busHub",
        allEntities: presets.busHub,
        converter: converters.stationToGeoJson,
        layers: [layers.railCircle, layers.stationLabel]
    },
    {
        name: "tram",
        allEntities: presets.tram,
        converter: converters.stationToGeoJson,
        layers: [layers.tramCircle]
    },
    {
        name: "parkRide",
        allEntities: presets.parkRide,
        converter: converters.stationToGeoJson,
        layers: [layers.parkRideCircle, layers.parkRideSymbol, layers.stationLabel]
    },
    {
        name: "busStop",
        allEntities: [],
        converter: converters.stopToGeoJson,
        layers: [layers.parkRideCircle, layers.parkRideSymbol, layers.stationLabel]
    }

];
