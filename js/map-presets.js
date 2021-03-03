// A set of preloaded stops.
// (More info about these stops may still need to be fetched.)
var presets = {
    rail: [
        {ids:["MARTA_908695","MARTA_906647","MARTA_906837"],name:"AIRPORT STATION",lat:33.640553,lon:-84.446198},
        {ids:["MARTA_906369","MARTA_906370"],name:"ARTS CENTER STATION",lat:33.788828,lon:-84.387272},
        {ids:["MARTA_908963","MARTA_908964"],name:"ASHBY STATION",lat:33.756477,lon:-84.417328},
        {ids:["MARTA_908438","MARTA_908691"],name:"AVONDALE STATION",lat:33.775214,lon:-84.282466},
        {ids:["MARTA_907961","MARTA_907960"],name:"BANKHEAD STATION",lat:33.772159,lon:-84.428873},
        {ids:["MARTA_908186","MARTA_908187"],name:"BROOKHAVEN STATION",lat:33.860329,lon:-84.339245},
        {ids:["MARTA_908639","MARTA_908718"],name:"BUCKHEAD STATION",lat:33.847944,lon:-84.367716},
        {ids:["MARTA_908699","MARTA_908476"],name:"CANDLER PARK STATION",lat:33.761866,lon:-84.340456},
        {ids:["MARTA_908603","MARTA_908604"],name:"CHAMBLEE STATION",lat:33.887517,lon:-84.306362},
        {ids:["MARTA_908911","MARTA_908912"],name:"CIVIC CENTER STATION",lat:33.766236,lon:-84.387504},
        {ids:["MARTA_908599","MARTA_907844"],name:"COLLEGE PARK STATION",lat:33.650577,lon:-84.448656},
        {ids:["MARTA_908700","MARTA_908475"],name:"DECATUR STATION",lat:33.774699,lon:-84.295417},
        {ids:["MARTA_908435","MARTA_908694"],name:"DOME STATION",lat:33.756179,lon:-84.397215},
        {ids:["MARTA_908845","MARTA_908862"],name:"DORAVILLE STATION",lat:33.902787,lon:-84.280610},
        {ids:["MARTA_908047","MARTA_908051"],name:"DUNWOODY STATION",lat:33.921130,lon:-84.344268},
        {ids:["MARTA_908566","MARTA_908567"],name:"EAST LAKE STATION",lat:33.765241,lon:-84.312937},
        {ids:["MARTA_908707","MARTA_908628"],name:"EAST POINT STATION",lat:33.676985,lon:-84.440704},
        {ids:["MARTA_908986","MARTA_908976","MARTA_908990","MARTA_908981"],name:"FIVE POINTS STATION",lat:33.753899,lon:-84.39156},
        {ids:["MARTA_908600","MARTA_907843"],name:"GARNETT STATION",lat:33.748696,lon:-84.395741},
        {ids:["MARTA_908696","MARTA_908618"],name:"GEORGIA STATE STATION",lat:33.750143,lon:-84.385882},
        {ids:["MARTA_907933","MARTA_907907"],name:"HE HOLMES STATION",lat:33.754553,lon:-84.469302},
        {ids:["MARTA_908515","MARTA_908516"],name:"INDIAN CREEK STATION",lat:33.769893,lon:-84.229874},
        {ids:["MARTA_908437","MARTA_908692"],name:"INMAN PARK STATION",lat:33.757451,lon:-84.352762},
        {ids:["MARTA_908634","MARTA_908709"],name:"KENSINGTON STATION",lat:33.772647,lon:-84.251607},
        {ids:["MARTA_908436","MARTA_908693"],name:"KING MEMORIAL STATION",lat:33.749951,lon:-84.375675},
        {ids:["MARTA_908706","MARTA_908629"],name:"LAKEWOOD STATION",lat:33.70088,lon:-84.428768},
        {ids:["MARTA_908717","MARTA_906827"],name:"LENOX STATION",lat:33.845307,lon:-84.358387},
        {ids:["MARTA_907775","MARTA_908055","MARTA_907823","MARTA_908054"],name:"LINDBERGH STATION",lat:33.823385,lon:-84.369357},
        {ids:["MARTA_908885","MARTA_908872"],name:"MEDICAL CENTER STATION",lat:33.910757,lon:-84.35189},
        {ids:["MARTA_908374","MARTA_908375"],name:"MIDTOWN STATION",lat:33.781247,lon:-84.386342},
        {ids:["MARTA_907913","MARTA_907914"],name:"NORTH AVENUE STATION",lat:33.771741,lon:-84.387204},
        {ids:["MARTA_907766","MARTA_908480"],name:"NORTH SPRINGS STATION",lat:33.944950,lon:-84.357275},
        {ids:["MARTA_908301","MARTA_908302"],name:"OAKLAND CITY STATION",lat:33.7173,lon:-84.42503},
        {ids:["MARTA_908601","MARTA_907842"],name:"PEACHTREE CENTER STATION",lat:33.758189,lon:-84.387596},
        {ids:["MARTA_907845","MARTA_907846"],name:"SANDY SPRINGS STATION",lat:33.931564,lon:-84.3509633},
        {ids:["MARTA_908958","MARTA_908959"],name:"VINE CITY STATION",lat:33.756613,lon:-84.403902},
        {ids:["MARTA_908705","MARTA_908704"],name:"WEST END STATION",lat:33.736564,lon:-84.413653},
        {ids:["MARTA_908023","MARTA_907906"],name:"WEST LAKE STATION",lat:33.753328,lon:-84.445329}
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
        {id:"MARTA_211750",name:"DOBBS PLAZA SC",lat: 33.755536,lon:-84.378786},
        {id:"MARTA_211751",name:"AUBURN AVE @ PIEDMONT AVE SC",lat:33.755556,lon:-84.382020},
        {id:"MARTA_211752",name:"WOODRUFF PARK SC",lat:33.755995,lon:-84.388148},
        {id:"MARTA_211753",name:"PEACHTREE CENTER STATION SC",lat:33.758068,lon:-84.387582},
        {id:"MARTA_211754",name:"CARNEGIE WAY @ TED TURNER DR SC",lat:33.759506,lon:-84.389635},
        {id:"MARTA_211755",name:"CENTENNIAL OLYMPIC PARK SC",lat:33.759426,lon:-84.392033},
        {id:"MARTA_211756",name:"LUCKIE ST @ CONE ST SC",lat:33.758048,lon:-84.390322},
        {id:"MARTA_211757",name:"PARK PLACE SC",lat:33.755091,lon:-84.388256},
        {id:"MARTA_211758",name:"HURT PARK SC",lat:33.754462,lon:-84.385337},
        {id:"MARTA_211759",name:"SWEET AUBURN MARKET SC",lat:33.754416,lon:-84.379993},
        {id:"MARTA_211760",name:"EGEWOOD AVE @ HILLIARD ST SC",lat:33.754377,lon:-84.376304}
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
    shapes: [],
    preloadedShapes: [
        {
            id: "ATLSC",
            color: "#8c8bdf",
            weight: 6,
            points: [
[-84.374447, 33.755506],
[-84.387263, 33.755590],
[-84.387590, 33.755631],
[-84.387855, 33.755753],
[-84.388346, 33.756167],
[-84.388369, 33.756475],
[-84.387666, 33.757618],
[-84.387583, 33.757882],
[-84.387583, 33.758347],
[-84.387714, 33.758462],
[-84.388533, 33.758432],
[-84.389880, 33.759746],
[-84.391901, 33.759733],
[-84.392025, 33.759629],
[-84.392036, 33.759293],
[-84.391880, 33.759130],
[-84.391124, 33.758837],
[-84.388269, 33.756028],
[-84.388050, 33.755832],
[-84.387966, 33.755615],
[-84.388436, 33.754761],
[-84.388399, 33.754595],
[-84.388222, 33.754487],
[-84.380313, 33.754420],
[-84.377261, 33.754386],
[-84.374605, 33.754357],
[-84.374393, 33.754447],
[-84.374354, 33.754568],
[-84.374361, 33.755405],
[-84.374393, 33.755474],
[-84.374447, 33.755506]
            ]
        },
        {
            id: "GREEN",
            color: "#468fb9",
            weight: 10,
            points: [
[-84.428873, 33.772159], // Bankhead
[-84.428601, 33.770408],
[-84.427657, 33.768445],
[-84.425898, 33.766697],
[-84.425168, 33.765877],
[-84.424653, 33.764771],
[-84.423537, 33.759419],
[-84.423178, 33.758807],
[-84.422764, 33.758384],
[-84.421992, 33.757671],
[-84.421477, 33.757350],
[-84.420905, 33.756950],
[-84.420042, 33.756633],
[-84.419117, 33.756515],
[-84.417328, 33.756477] // Ashby
            ]
        },
        {
            id: "RED",
            color: "#ff8c1a",
            weight: 10,
            points: [
[-84.357275, 33.944950], // N Springs
[-84.357303, 33.937708],
[-84.357034, 33.936550],
[-84.356525, 33.935759],
[-84.355495, 33.934655],
[-84.350963, 33.931564], // Sandy Springs
[-84.346590, 33.928869],
[-84.346011, 33.928317],
[-84.345560, 33.927622],
[-84.345217, 33.926875],
[-84.345002, 33.926056],
[-84.344268, 33.921130], // Dunwoody
[-84.343652, 33.917068],
[-84.343584, 33.916051],
[-84.343652, 33.915401],
[-84.343993, 33.914440],
[-84.344435, 33.913734],
[-84.346104, 33.911897],
[-84.346853, 33.911304],
[-84.347704, 33.910937],
[-84.348757, 33.910757],
[-84.351890, 33.910757], // Med center
[-84.353335, 33.910757],
[-84.353966, 33.910707],
[-84.355075, 33.910422],
[-84.355708, 33.910040],
[-84.356149, 33.909682],
[-84.356473, 33.909306],
[-84.356824, 33.908929],
[-84.357137, 33.908467],
[-84.357303, 33.908107],
[-84.357474, 33.907626],
[-84.357828, 33.906468],
[-84.358338, 33.905079],
[-84.358883, 33.903952],
[-84.364472, 33.894133],
[-84.364750, 33.893316],
[-84.364899, 33.892695],
[-84.364964, 33.892215],
[-84.364804, 33.872578],
[-84.364858, 33.871981],
[-84.365008, 33.871357],
[-84.365255, 33.870698],
[-84.365673, 33.869976],
[-84.366113, 33.869388],
[-84.368100, 33.867116],
[-84.368475, 33.866403],
[-84.368776, 33.865592],
[-84.368915, 33.864844],
[-84.368980, 33.864256],
[-84.369859, 33.852763],
[-84.369838, 33.852139],
[-84.369720, 33.851622],
[-84.369516, 33.851034],
[-84.369216, 33.850544],
[-84.367716, 33.847944], // Buckhead
[-84.367114, 33.846953],
[-84.366706, 33.846454],
[-84.366084, 33.845794],
[-84.365247, 33.845135],
[-84.362307, 33.843371],
[-84.361470, 33.842675],
[-84.360762, 33.841856],
[-84.360097, 33.840804],
[-84.359818, 33.839984],
[-84.359582, 33.838968],
[-84.359560, 33.838095],
[-84.359659, 33.836992],
[-84.359808, 33.835939],
[-84.359970, 33.835232],
[-84.360633, 33.833960], // Jct
            ]
        },
        {
            id: "GOLD",
            color: "#ff8c1a",
            weight: 10,
            points: [
[-84.280610, 33.902787], // Doraville
[-84.287449, 33.898067],
[-84.288745, 33.897305],
[-84.290095, 33.896723],
[-84.298564, 33.893291],
[-84.299585, 33.892674],
[-84.300235, 33.892119],
[-84.302964, 33.889422],
[-84.304078, 33.888682],
[-84.306362, 33.887517], // Chamblee
[-84.312912, 33.884301],
[-84.315902, 33.883232],
[-84.316753, 33.882792],
[-84.318662, 33.881475],
[-84.319985, 33.880199],
[-84.321340, 33.879057],
[-84.329533, 33.874200],
[-84.330652, 33.873361],
[-84.331619, 33.872308],
[-84.333426, 33.870129],
[-84.336522, 33.865772],
[-84.339245, 33.860329], // Brookhaven
[-84.340021, 33.858599],
[-84.340636, 33.857834],
[-84.341250, 33.857349],
[-84.342141, 33.856865],
[-84.347670, 33.854722],
[-84.348838, 33.853982],
[-84.349759, 33.853140],
[-84.350374, 33.852120],
[-84.351326, 33.849900],
[-84.352002, 33.849084],
[-84.353046, 33.848165],
[-84.353661, 33.847833],
[-84.358387, 33.845307], // Lenox
[-84.359475, 33.844822],
[-84.360593, 33.843803],
[-84.361329, 33.842716],
[-84.361602, 33.841470],
[-84.361356, 33.840134],
[-84.360129, 33.837597],
[-84.359884, 33.836442],
[-84.360102, 33.835038],
[-84.360620, 33.833973],
[-84.361165, 33.833271],
[-84.362365, 33.832184], // Junction
[-84.367231, 33.828415],
[-84.367692, 33.827919],
[-84.368248, 33.827198],
[-84.368573, 33.826376],
[-84.369357, 33.823385], // Lindbergh
[-84.370269, 33.820159],
[-84.370526, 33.819481],
[-84.371041, 33.818733],
[-84.375762, 33.813099],
[-84.377521, 33.809926],
[-84.377822, 33.809498],
[-84.378723, 33.808642],
[-84.385911, 33.803614],
[-84.386464, 33.803169],
[-84.386979, 33.802492],
[-84.387494, 33.801672],
[-84.387752, 33.800816],
[-84.387988, 33.799496],
[-84.388173, 33.798231],
[-84.388151, 33.797072],
[-84.387937, 33.795645],
[-84.387873, 33.794629],
[-84.387787, 33.791936],
[-84.387722, 33.791205],
[-84.387272, 33.788828], // Arts Center
[-84.386536, 33.785675],
[-84.386365, 33.784854],
[-84.386300, 33.784302],
[-84.386342, 33.781247], // Midtown
[-84.386469, 33.777221],
[-84.387204, 33.771741], // North Ave
[-84.387435, 33.769837],
[-84.387504, 33.766236], // Civic Ctr
[-84.387596, 33.758189], // Peachtree Ctr
[-84.387638, 33.757839],
[-84.387831, 33.757446],
[-84.388475, 33.756519],
[-84.388776, 33.756180],
[-84.390794, 33.754735],
[-84.390979, 33.754581],
[-84.391560, 33.753899], // Five Pts
[-84.395741, 33.748696], // Garnett
[-84.399047, 33.744557],
[-84.399739, 33.743981],
[-84.400473, 33.743523],
[-84.401267, 33.743066],
[-84.402490, 33.742524],
[-84.406870, 33.741084],
[-84.408031, 33.740881],
[-84.410517, 33.740643],
[-84.411332, 33.740372],
[-84.412045, 33.740050],
[-84.412636, 33.739695],
[-84.413186, 33.739034],
[-84.413471, 33.738339],
[-84.413654, 33.737729],
[-84.413675, 33.737306],
[-84.413653, 33.736564], // West End
[-84.413753, 33.732781],
[-84.414010, 33.731746],
[-84.414740, 33.730568],
[-84.417272, 33.727284],
[-84.422636, 33.722501],
[-84.423319, 33.721664],
[-84.423791, 33.720683],
[-84.425030, 33.717300], // Oakland City
[-84.427046, 33.711114],
[-84.427367, 33.709883],
[-84.428768, 33.700880], // Lakewood
[-84.429535, 33.696119],
[-84.429899, 33.695102],
[-84.430629, 33.694138],
[-84.431552, 33.693352],
[-84.432195, 33.692924],
[-84.435028, 33.691460],
[-84.435693, 33.690942],
[-84.436208, 33.690371],
[-84.436680, 33.689817],
[-84.440049, 33.685229],
[-84.440285, 33.684586],
[-84.440457, 33.683747],
[-84.440435, 33.682747],
[-84.439985, 33.680550],
[-84.439963, 33.679604],
[-84.440070, 33.679086],
[-84.440704, 33.676985], // East Point
[-84.442520, 33.671729],
[-84.443422, 33.669515],
[-84.444366, 33.667443],
[-84.448915, 33.655388],
[-84.449044, 33.654405],
[-84.449065, 33.653369],
[-84.448656, 33.650577], // College Park
[-84.448346, 33.648528],
[-84.448045, 33.647915],
[-84.446757, 33.646007],
[-84.446456, 33.645478],
[-84.446355, 33.645033],
[-84.446255, 33.644169],
[-84.446198, 33.640553] // Airport
            ]
        },
        {
            id: "BLUE",
            color: "#468fb9",
            weight: 10,
            points: [
[-84.469302, 33.754553], // HE Holmes
[-84.466432, 33.754639],
[-84.465721, 33.754610],
[-84.465045, 33.754451],
[-84.456059, 33.751379],
[-84.455053, 33.751120],
[-84.453977, 33.750975],
[-84.452919, 33.751019],
[-84.451983, 33.751163],
[-84.451011, 33.751408],
[-84.445329, 33.753328], // West Lake
[-84.442989, 33.754073],
[-84.442238, 33.754252],
[-84.433569, 33.755625],
[-84.430200, 33.756250],
[-84.427539, 33.756499],
[-84.417328, 33.756477], // Ashby
[-84.410165, 33.756316],
[-84.409178, 33.756316],
[-84.403902, 33.756613], // Vine City
[-84.402221, 33.756706],
[-84.400289, 33.756706],
[-84.399495, 33.756688],
[-84.398809, 33.756545],
[-84.397215, 33.756179], // Dome
[-84.394237, 33.755316],
[-84.393250, 33.754870],
[-84.391560, 33.753899], // Five Pts
[-84.385882, 33.750143], // GA State
[-84.384645, 33.749339],
[-84.383980, 33.749018],
[-84.383293, 33.748840],
[-84.382886, 33.748822],
[-84.379131, 33.749036],
[-84.378573, 33.749143],
[-84.377908, 33.749286],
[-84.375675, 33.749951], // King Mem
[-84.367415, 33.752497],
[-84.364904, 33.753175],
[-84.362694, 33.753639],
[-84.358188, 33.754460],
[-84.357458, 33.754638],
[-84.356493, 33.755031],
[-84.355634, 33.755459],
[-84.354905, 33.755869],
[-84.352762, 33.757451], // Inman Park
[-84.350213, 33.759362],
[-84.349377, 33.759862],
[-84.348368, 33.760290],
[-84.347124, 33.760665],
[-84.346008, 33.760879],
[-84.340456, 33.761866], // Candler Park
[-84.336870, 33.762380],
[-84.335582, 33.762434],
[-84.334509, 33.762327],
[-84.333522, 33.762131],
[-84.332600, 33.761792],
[-84.328458, 33.760293],
[-84.327385, 33.760115],
[-84.326527, 33.760061],
[-84.325325, 33.760168],
[-84.324381, 33.760347],
[-84.323330, 33.760739],
[-84.317601, 33.764147],
[-84.316421, 33.764717],
[-84.315712, 33.764878],
[-84.314768, 33.765038],
[-84.312937, 33.765241], // East Lake
[-84.310728, 33.765380],
[-84.309583, 33.765589],
[-84.308723, 33.766015],
[-84.308043, 33.766511],
[-84.303747, 33.772166],
[-84.302995, 33.772910],
[-84.301885, 33.773714],
[-84.301097, 33.774160],
[-84.299952, 33.774458],
[-84.298842, 33.774636],
[-84.297911, 33.774755],
[-84.295417, 33.774699], // Decatur
[-84.289314, 33.774556],
[-84.286096, 33.774217],
[-84.285516, 33.774288],
[-84.284851, 33.774449],
[-84.282466, 33.775214], // Avondale
[-84.280079, 33.775961],
[-84.273728, 33.778065],
[-84.270402, 33.779117],
[-84.269179, 33.779421],
[-84.268084, 33.779510],
[-84.266647, 33.779421],
[-84.265552, 33.779207],
[-84.264394, 33.778725],
[-84.263535, 33.778226],
[-84.260467, 33.775301],
[-84.259673, 33.774783],
[-84.259008, 33.774427],
[-84.257978, 33.774052],
[-84.257163, 33.773749],
[-84.251607, 33.772647], // Kensington
[-84.243420, 33.770909],
[-84.234794, 33.770017],
[-84.229874, 33.769893] // Indian Creek
            ]
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
            minzoom: 8,
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
        contents: "<i class=\"amenity accessible\"></i>",
        longText: "This stop is accessible to people with mobility impairments.",
        shortText: "Accessible"
    },
    lighting: {
        contents: "<i class=\"amenity lighting\"></i>",
        longText: "This stop is lit at night.",
        shortText: "Lighting"
    },
    map: {
        contents: "<i class=\"amenity map\"></i>",
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
            //+ "</svg>",
        longText: "This stop has seating.",
        shortText: "Seating"
    },
    shelter: {
        contents: "<i class=\"amenity shelter\"></i>",
        longText: "This stop has a shelter.",
        shortText: "Shelter"
    },
    ticketing: {
        contents: "<i class=\"amenity ticketing\"></i>",
        longText: "This stop has ticket vending.",
        shortText: "Ticketing"
    },
    trash: {
        contents: "<i class=\"amenity trash\"></i>",
        longText: "This stop has a trash can.",
        shortText: "Trash can"
    },
    trafficLight: {
        contents: "🚦", // "<sup>🚦</sup>",
        longText: "A traffic light is in the vicinity of this stop.",
        shortText: "Traffic light",
    },
    crosswalk: {
        contents: "<i class=\"amenity crosswalk\"></i>",
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
