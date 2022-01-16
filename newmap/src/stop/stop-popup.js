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
  return <img src={src} alt={alt} className="popup-route-column" />;
}

const StopPopup = ({ Description, Links, stop }) => {
  const fullStopIds = stop.csvIds ? stop.csvIds.split(",") : [stop.code];
  const shortStopIds = fullStopIds.map(getShortStopId);

  const [fetchState, setFetchState] = useState({
    fetched: false,
    // Route Numbers
    stopRoutesFetched: [],
    stopsFetched: 0,
  });

  const [departuresByRoute, setDeparturesByRoute] = useState();

  // Effect for fetching routes at this stop. (Unfiltered)
  useEffect(() => {
    const idsWithCommas = shortStopIds.join(",");
    // fetch1 returns:
    // [
    //     {
    //     "agency_id": "MARTA",
    //     "route_short_name": "BLUE"
    //     },
    // ]
    const fetch1 = fetch(
      `https://barracks.martaarmy.org/ajax/get-stop-routes-2.php?stops=${idsWithCommas}`
    );
    const fetch2 = fetch(
      `https://barracks.martaarmy.org/ajax/get-next-departures-by-stops.php?stops=${idsWithCommas}`
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

  const { fetched, stopRoutesFetched } = fetchState;
  let mainMode;
  if (stopRoutesFetched[0]) {
    mainMode = getModeClass(stopRoutesFetched[0].route_short_name);
  }

  return (
    <div>
      <div>
        <div className="popup-route-info">
          {/* Train or Bus label */}
          {!fetched ? (
            <img className="popup-route-column" src={LoadingIcon} alt="" />
          ) : (
            renderModeIcon(mainMode)
          )}
          <div>
            <h1 className="popup-detail">
              {stop.name}
            </h1>
            <div style={{ lineHeight: "initial" }}>
              <small>
                {shortStopIds.length > 1 ? "Stops" : "Stop"} {shortStopIds.join(", ")}
              </small>
            </div>
          </div>
        </div>

        {departuresByRoute &&
          Object.keys(departuresByRoute).map((k) => (
            <RouteInfo departures={departuresByRoute[k]} key={k} route={k} />
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
