import React, { useEffect, useState } from "react";
import { getModeClass, getShortStopId, isAtStation, isStreetcarStop } from "../util/stops";
import RouteInfo from "./route-info";

import { getAmenityContents } from '../amenities'
import NoService from "../../images/errorImage.svg";
import BusIcon from "../../images/bus-icon.svg";
import TrainIcon from "../../images/subway-train.svg";
import TramIcon from "../../images/streetcar-train.svg";
import LoadingIcon from "../../images/loading-buffering.gif";

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

const StopPopup = ({ stop }) => {
  const fullStopIds = stop.csvIds ? stop.csvIds.split(",") : [stop.code];
  const shortStopIds = fullStopIds.map(getShortStopId);
  const idsWithCommas = shortStopIds.join(",");
  const isSurveyed = stop.record_id;

  const [fetchState, setFetchState] = useState({
    fetched: false,
    // Route Numbers
    stopRoutesFetched: [],
    stopsFetched: 0,
  });

  const [departuresByRouteAndDestination, setdeparturesByRouteAndDestination] = useState();

  // Effect for fetching routes at this stop. (Unfiltered)
  useEffect(() => {
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

          const newdeparturesByRouteAndDestination = {};

          // Sort next departures by route number and destination...
          // Build an object like this, if the routes at this stop are 2 and 102.
          // For Candler Park on Sundays, returns { "BLUE::Indian Creek": [{...}, {...}, ...] }
          newNextDepartures.departures.forEach((d) => {
            const routeDestination = `${d.route}::${d.destination}`
            // Check that there is an entry for the route for this departure.
            // If not, initialize an empty array for that.
            if (!newdeparturesByRouteAndDestination[routeDestination]) {
              newdeparturesByRouteAndDestination[routeDestination] = [];
            }
            newdeparturesByRouteAndDestination[routeDestination].push(d);
          });

          // Will become, based on stopRoutesFetched:
          // {
          //  "6::Lindbergh Station": [],
          //  ...
          // }
          stopRoutesFetched.forEach((route) => {
            // Initialize with an empty departure list if the route was not already added.
            const isRoutePresent = Object.keys(newdeparturesByRouteAndDestination).find(
              k => k.split("::")[0] === route.route_short_name
            );
            if (!isRoutePresent) {
              newdeparturesByRouteAndDestination[route.route_short_name] = [];
            }
          });

          setdeparturesByRouteAndDestination(newdeparturesByRouteAndDestination);
        });
    }
  }, []); // [] runs the effect once.

  const { fetched, stopRoutesFetched } = fetchState;
  let mainMode;
  if (stopRoutesFetched[0]) {
    mainMode = getModeClass(stopRoutesFetched[0].route_short_name);
  }

  if (stop.census && typeof stop.census === "string") {
    stop.census = JSON.parse(stop.census)
  }
  const amenityIcons = isSurveyed && stop.census && getAmenityContents(stop.census) || {}
  const lonlatArray = [stop.lon, stop.lat];

  return (
    <div>
      <div>
        <div className="popup-route-info">
          {/* Train or bus icon */}
          {!fetched
            ? <img alt="Loading" className="popup-route-column" src={LoadingIcon} />
            : renderModeIcon(mainMode)
          }
          <div>
            <h1 className="popup-detail">
              {stop.name}
            </h1>
            <div style={{ lineHeight: "initial" }}>
              <small>
                {shortStopIds.length > 1 ? "Stops" : "Stop"} {shortStopIds.join(", ")}
              </small>
              <a
                className="street-view-link"
                // Google Street View link (docs: https://developers.google.com/maps/documentation/urls/guide#street-view-action)
                href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lonlatArray[1]},${lonlatArray[0]}`}
                target="_blank"
              >
                Street View
              </a>
            </div>
          </div>
        </div>

        {departuresByRouteAndDestination && (
          <ul className="stop-route-list">
            {Object.keys(departuresByRouteAndDestination)
              .sort()
              .map((k, index) => {
                const href = `https://barracks.martaarmy.org/stopinfo.php?sids=${idsWithCommas}&title=${stop.name}`
                const route = k.split("::")[0]
                return (
                  <RouteInfo
                    departures={departuresByRouteAndDestination[k]}
                    href={index === 0 && href}
                    key={k}
                    route={route}
                  />
                )
              }
            )}
          </ul>
        )}
      </div>
      <div className="stop-info">
        Amenities:
        {' '}
        {!isAtStation(stop) && !isStreetcarStop(stop) && isSurveyed
          ? (
            <ul className="stop-amenities-list">
              {Object.values(amenityIcons).map((icon, index) => <li key={index}>{icon}</li>)}
            </ul>
          ) 
          : "No data"
        }
      </div>
    </div>
  );
};

export default StopPopup;
