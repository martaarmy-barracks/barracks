import React, { useEffect, useState } from "react";
import { getModeClass } from "../util/stops";
import RouteInfo from "./route-info";

import NoService from "../../images/errorImage.svg";
import BusIcon from "../../images/bus-icon.svg";
import TrainIcon from "../../images/subway-train.svg";
import TramIcon from "../../images/streetcar-train.svg";
import LoadingIcon from "../../images/loading-buffering.gif";

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

    if (!fetchState.fetched) {
      // Wait for the two fetches above to complete so we have all data to fill routes and departures.
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

          const newDeparturesByRoute = {};
          // Will become, based on stopRoutesFetched:
          // {
          //  "6": [],
          //  ...
          // }
          stopRoutesFetched.forEach((route) => {
            // Initialize with an empty departure list.
            newDeparturesByRoute[route.route_short_name] = [];
          });

          // Sort next departures by route number...
          // Build an object like this, if the routes at this stop are 2 and 102.
          // For Candler Park on Sundays, returns { BLUE: [{...}, {...}, ...] }
          newNextDepartures.departures.forEach((d) => {
            // check that there is an entry for the route for this departure
            // If not, initialize an empty array for that.
            if (!newDeparturesByRoute[d.route]) {
              newDeparturesByRoute[d.route] = [];
            }
            newDeparturesByRoute[d.route].push(d);
          });
          setDeparturesByRoute(newDeparturesByRoute);
        });
    }
  }, []); // [] runs the effect once.

  const { fetched, stopRoutesFetched, stopsFetched } = fetchState;
  let mainMode;
  if (stopRoutesFetched[0]) {
    mainMode = getModeClass(stopRoutesFetched[0]);
  }

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

        {departuresByRoute &&
          Object.keys(departuresByRoute).map((k) => (
            <RouteInfo key={k} route={k} departures={departuresByRoute[k]} />
          ))}
      </div>
      <div className="stop-info">
        {Links && <Links stop={stop} />}
        {Description && <Description stop={stop} />}
      </div>
    </div>
  );
};

export default StopPopup;
