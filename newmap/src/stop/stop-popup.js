import React, { useEffect, useState } from "react";
import RouteLabels, { getModeClass } from "./route-labels";
import RouteInfo from "./route-info";

import NoService from "../../images/errorImage.svg";
import BusIcon from "../../images/bus-icon.svg";
import TrainIcon from "../../images/subway-train.svg";
import TramIcon from "../../images/streetcar-train.svg";
import LoadingIcon from "../../images/loading-buffering.gif";

// Candler Park on a Sunday
// fetch("... get-next-departures")
// { BLUE: [{...}, {...}, ...] }
// fetch("... get-stop-routes")
// [ { BLUE }, { GREEN }]
// { blue: [], green: []}

/*
// => function(...) {
//  ...
//  return {
//    blue: [{...}, {...}],
//    green: []
// }
//}

______________
| fetch 1    | fetch 2
|           ...
|           ...
_____________
| render

*/

/*
WHAT EACH FETCH LEADS TO
get-next-departures -> departuresByRoute
get-stop-routes -> stopRoutesFetched

*/
function getStopDescription(stop) {
  var stopRoutesFetched = [];
  var stopsFetched = 0;
  var fullStopIds = stop.csvIds ? stop.csvIds.split(",") : [stop.id];
  var shortStopIds = fullStopIds.map(function (idStr) {
    return getShortStopId(idStr);
  });
  var routeLabels = "[Routes]";
  if (stop.routes) {
    routeLabels = getRouteLabels(stop.routes);
  } else {
    // Get routes.
    shortStopIds.forEach(function (shortStopId) {
      $.ajax({
        url: "ajax/get-stop-routes.php?stopid=" + shortStopId,
        dataType: "json",
        success: function (routes) {
          routes.forEach(function (route) {
            // Remove duplicates on fetched routes.
            var fetchedRoutes = stopRoutesFetched.filter(function (fetched) {
              return (
                fetched.agency_id == route.agency_id &&
                fetched.route_short_name == route.route_short_name
              );
            });
            if (fetchedRoutes.length == 0) stopRoutesFetched.push(route);
          });
          stopsFetched++;
          if (stopsFetched == shortStopIds.length) {
            // TODO: sort routes, letters firt, then numbers.
            stop.routes = stopRoutesFetched;

            // Update popup content (including any links).
            if (popup) popup.setHTML(getStopDescription(stop));
          }
        },
      });
      // Get departures.
      /*
      $.ajax({
        url: "https://barracks.martaarmy.org/ajax/get-next-departures.php?stopid=" + shortStopId,
        dataType: 'json',
        success: function(departures) {
          // Sort routes, letters firt, then numbers.

          m.routes = routes;
          $("#routes").html(getRouteLabels(routes));
        }
      });
      */
    });
  }

  var stopTitle = stop.name + " (" + shortStopIds.join(", ") + ")";
  var s =
    "<div class='stop-name'>" + stopTitle + "</div><div class='stop-info'>";

  // Route labels
  if (!filters.inactiveStop(stop)) {
    if (isFinite(shortStopIds[0]) || (stop.routes && stop.routes.length)) {
      s += "<div><span id='routes'>" + routeLabels + "</span>";
      s +=
        " <a id='arrivalsLink' target='_blank' href='stopinfo.php?sids=" +
        fullStopIds.join(",") +
        "&title=" +
        encodeURIComponent(stopTitle) +
        "'>Arrivals</a></div>";
    }
  } else {
    s +=
      "<div><span style='background-color: #ff0000; color: #fff'>No service</span></div>";
  }

  // Stop amenities (streetcar only).
  if (isStreetcarStop(stop)) {
    var amenityLabels = "";
    Object.values(stopAmenities.tram).forEach(function (a) {
      amenityLabels +=
        "<li><span aria-label='" +
        a.shortText +
        "' title='" +
        a.longText +
        "'>" +
        a.contents +
        "</li>";
    });
    s +=
      "<div>Amenities (<a href='atlsc-stop-amenities.php' target='_blank'>learn more</a>):<ul class='popup-amenities inline-list'>" +
      amenityLabels +
      "</span></ul></div>";
  }

  // Custom content
  var content = callIfFunc(opts.onGetContent)(stop) || {};
  if (content.links) s += "<div>" + content.links + "</div>";
  if (content.description) s += "<div>" + content.description + "</div>";
  s += "</div>";

  return s;
}

// Add a span and call the className
// <RouteLabels routes={routes}/>

function getShortStopId(longId) {
  return longId.split("_")[1]; // can be undefined.
}

function renderModeIcon(mainMode) {
  // Take this away so that all 'undefined' images become bus icon

  let src;
  let alt;
  if (!mainMode) {
    src = NoService;
    alt = "No service icon";
  }
  if (mainMode === "rail-line") {
    src = TrainIcon;
    alt = "Train icon";
  } else if (mainMode === "tram-line") {
    src = TramIcon;
    alt = "Tram icon";
  } else {
    src = BusIcon;
    alt = "Bus icon";
  }
  return <img src={src} alt={alt} className="img" />;
}

// js => coremap-gl.js
const StopPopup = ({ Description, Links, stop }) => {
  const { name } = stop;

  const fullStopIds = stop.csvIds ? stop.csvIds.split(",") : [stop.id];
  const shortStopIds = fullStopIds.map(getShortStopId);

  const [fetchState, setFetchState] = useState({
    fetched: false,
    // Route Numbers
    stopRoutesFetched: [],
    stopsFetched: 0,
  });

  const [departuresByRoute, setDeparturesByRoute] = useState();
  // Holds the combined departures for all routes that serve the stop.
  const [departuresForAllRoutes, setDeparturesForAllRoutes] = useState();

  // Effect for fetching routes at this stop. (Unfiltered)
  useEffect(() => {
    //shortStopIds.forEach((shortStopId) => {
    // Returns // [
    //     {
    //     "agency_id": "MARTA",
    //     "route_short_name": "BLUE"
    //     },
    // ]
    const fetch1 = fetch(
      `https://barracks.martaarmy.org/ajax/get-stop-routes.php?stopids=${shortStopIds.join(
        ","
      )}`
    );

    const fetch2 = fetch(
      `https://barracks.martaarmy.org/ajax/get-next-departures-by-stops.php?stopids=${shortStopIds.join(
        ","
      )}`
    );

    Promise.all([fetch1, fetch2])
      .then((responses) => Promise.all(responses.map((res) => res.json())))
      .then((values) => {
        const [routes, newNextDepartures] = values;

        const { stopRoutesFetched, stopsFetched } = fetchState;
        routes.forEach((route) => {
          // Remove duplicates on fetched routes.
          const fetchedRoutes = stopRoutesFetched.filter((fetched) => {
            return (
              fetched.agency_id == route.agency_id &&
              fetched.route_short_name == route.route_short_name
            );
          });
          if (fetchedRoutes.length == 0) stopRoutesFetched.push(route);
        });
        setFetchState({
          fetched: true,
          stopRoutesFetched,
          stopsFetched: stopsFetched + 1,
        });

        const newDeparturesByRoute = {
          /* */
          BLUE: [],
          GREEN: [],
        };

        //});
        // For Candler Park on Sundays, returns { BLUE: [{...}, {...}, ...] }

        // Sort next departures by route number...
        // Build an object like this, if the routes at this stop are 2 and 102.
        // const newDeparturesByRoute = departuresByRoute || {}; //{};
        newNextDepartures.departures.forEach((d) => {
          // check that there is an entry for the route for this departure
          // If not, initialize an empty array for that.
          if (!newDeparturesByRoute[d.route]) {
            newDeparturesByRoute[d.route] = [];
          }
          newDeparturesByRoute[d.route].push(d);
        });
        /*
      Above code builds a variable with contents like this:
      const departuresByRoute = {
        "102": [
          {agency: "MARTA", route: "102", destination: "NORTH AVE STATION", time: "16:35:00", trip_started: "0",…},
          {agency: "MARTA", route: "102", destination: "NORTH AVE STATION", time: "16:55:00", trip_started: "0",…}

        ],
        "6": [
          ...
        ]
      }
      */
        console.log(
          "after get-next-departures-routes",
          stopRoutesFetched,
          departuresByRoute,
          newDeparturesByRoute
        );
        setDeparturesByRoute(newDeparturesByRoute);
      });
  });

  // WHERE FETCH 2 WAS

  // Effect for getting next departures on each route. (Filtered)
  //   useEffect(() => {
  //     // For Candler Park on Sundays, returns { BLUE: [{...}, {...}, ...] }
  //     fetch(
  //       `https://barracks.martaarmy.org/ajax/get-next-departures-by-stops.php?stopids=${shortStopIds.join(
  //         ","
  //       )}`
  //     )
  //       .then((res) => res.json())
  //       .then((newNextDepartures) => {
  //         // Sort next departures by route number...
  //         // Build an object like this, if the routes at this stop are 2 and 102.
  //         // const newDeparturesByRoute = departuresByRoute || {}; //{};
  //         const newDeparturesByRoute = { ...departuresByRoute } || {}; //{};
  //         newNextDepartures.departures.forEach((d) => {
  //           // check that there is an entry for the route for this departure
  //           // If not, initialize an empty array for that.
  //           if (!newDeparturesByRoute[d.route]) {
  //             newDeparturesByRoute[d.route] = [];
  //           }
  //           newDeparturesByRoute[d.route].push(d);
  //         });
  //         /*
  //         Above code builds a variable with contents like this:
  //         const departuresByRoute = {
  //           "102": [
  //             {agency: "MARTA", route: "102", destination: "NORTH AVE STATION", time: "16:35:00", trip_started: "0",…},
  //             {agency: "MARTA", route: "102", destination: "NORTH AVE STATION", time: "16:55:00", trip_started: "0",…}

  //           ],
  //           "6": [
  //             ...
  //           ]
  //         }
  // */
  //         console.log(
  //           "after get-next-departures-routes",
  //           stopRoutesFetched,
  //           departuresByRoute,
  //           newDeparturesByRoute
  //         );
  //         setDeparturesByRoute(newDeparturesByRoute);
  //       });
  //   }, []); // [] runs the effect once.

  console.log("Stop Pop-up Render", stop);
  const { fetched, stopRoutesFetched, stopsFetched } = fetchState;
  let mainMode;
  if (stopRoutesFetched[0]) {
    mainMode = getModeClass(stopRoutesFetched[0]);
  }

  // const imageUrl = ...

  // const trainSubwayIcon =
  //   "https://barracks.martaarmy.org/images/subway-train.svg";
  // const trainStreetcarIcon =
  //   "https://barracks.martaarmy.org/images/streetcar-train.svg";
  // const busIcon = "https://www.atltransit.org/assets/images/bus_icon.jpg";

  return (
    <div>
      <div className="wrapper">
        <div>
          {/* Train or Bus label */}
          {!fetched ? (
            <img className="img" src={LoadingIcon} alt="" />
          ) : (
            renderModeIcon(mainMode)
          )}
        </div>
        <div>
          <h1 className="stop-name">{name}</h1>
        </div>
        {/* Labels */}
        {/* departuresByRoute */}

        <span className="label">Bus 1</span>
        <span className="label">Arrivals</span>

        <span className="label">Bus 2</span>
        <span className="label">Arrivals</span>

        {/** <RouteInfo route="102" departures={...}> */}
        {departuresByRoute &&
          Object.keys(departuresByRoute).map((k) => (
            <RouteInfo key={k} route={k} departures={departuresByRoute[k]} />
          ))}

        <div className="nested">
          {/* Insert routes */}
          {/*
          <RouteLabels routes={stopRoutesFetched} />
          */}
          {/* Next Arrivals */}
          {/* <span>Next Arrivals 3:25pm 3:45pm</span>
          <RouteLabels routes={stopRoutesFetched} />
          <RouteLabels routes={stopRoutesFetched} /> */}
        </div>
      </div>
      <div className="stop-info">
        {Links && <Links stop={stop} />}
        {Description && <Description stop={stop} />}
      </div>
    </div>
  );
};

// getRouteLabels differentiates between the correct css

// If this stop, then run this
// className goes to rail, or className goes to bus, or className that goes to street car

export default StopPopup;
