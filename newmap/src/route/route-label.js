import React from "react";

import BusIcon from "./images/bus-icon.svg";
import TramIcon from "./images/tram-icon.svg";
import TrainIcon from "./images/rail-icon.svg";

function renderModeIcon(mainMode) {
  let src;
  let alt;
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

/**
 * Gets clickable HTML content for the given route.
 * @param {*} routes The routes to render.
 * @param {*} onRouteClickFnName Optional - The name of a global function that takes one 'index' arg.
 * @param {*} index The index for refering to the route on click. Required only if onRouteClickFnName is specified.
 */
const RouteLabel = ({ onClick, route }) => {
  const { agency_id, route_short_name: routeName } = route;
  const agencyRoute = `${agency_id} ${routeName}`;
  // Specific to MARTA rail lines...
  let railClass = "";
  if (agency_id == "MARTA") {
    switch (routeName) {
      case "BLUE":
      case "GOLD":
      case "GREEN":
      case "RED":
        railClass = "rail-line";
        break;
      case "ATLSC":
        railClass = "tram-line";
        routeName = "Streetcar";
        break;
      default:
    }
  }

  return (
    <span
      className={`${agencyRoute} ${railClass} route-label`}
      onClick={onClick}
      title={agencyRoute}
    >
      {renderModeIcon(railClass)}
      <span>{routeName}</span>
    </span>
  );
};

export default RouteLabel;
