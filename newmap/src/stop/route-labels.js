import React from "react";

const RouteLabels = ({ routes }) =>
  routes.map((r) => {
    const agencyRoute = `${r.agency_id} ${r.route_short_name}`;
    // Hack for MARTA rail lines...
    let modeClass = "";
    if (r.agency_id == "MARTA") {
      modeClass = getModeClass(r);
    }
    return (
      <span
        className={`${agencyRoute} ${modeClass} route-label`}
        key={agencyRoute}
        title={agencyRoute}
      >
        <span>{r.route_short_name}</span>
      </span>
    );
  });

export function getModeClass(route) {
  switch (route.route_short_name) {
    case "BLUE":
    case "GOLD":
    case "GREEN":
    case "RED":
      return "rail-line";
    case "ATLSC":
      return "tram-line";
    default:
      return "bus";
  }
}

export default RouteLabels;
