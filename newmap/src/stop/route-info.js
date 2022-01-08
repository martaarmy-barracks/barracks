import React, { useEffect } from "react";
import { getModeClass } from "../util/stops";
import { formatTime } from "../util/time";

function RouteInfo({ agency = "MARTA", route, departures }) {
  const firstTwoDepartures = departures.slice(0, 2);
  const agencyRoute = `${agency} ${route}`;
  // Hack for MARTA rail lines...
  let modeClass = "";
  if (agency == "MARTA") {
    modeClass = getModeClass(route);
  }

  console.log("THIS IS A TEST");

  return (
    <div className="popup-route-info">
      <span
        className={`${agencyRoute} ${modeClass} route-label popup-route-column`}
        title={agencyRoute}
      >
        <span>{route}</span>
      </span>

      <span className="label">
        Arrivals:
        {firstTwoDepartures.length
          ? firstTwoDepartures.map(({ time }) => {
              console.log("TIME: ", time);
              return " " + formatTime(time);
            })
          : " No departures in the next two hours..."}
      </span>
    </div>
  );
}

export default RouteInfo;
