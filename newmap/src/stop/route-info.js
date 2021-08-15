import React, { useEffect } from "react";
import { getModeClass } from "../util/stops";

function RouteInfo({ agency = "MARTA", route, departures }) {
  let firstTwoDepartures = [];

  // There is a more direct way to do it!
  for (let i = 0; i < Math.min(2, departures.length); i++) {
    firstTwoDepartures.push(departures[i]);
  }

  const agencyRoute = `${agency} ${route}`;
  // Hack for MARTA rail lines...
  let modeClass = "";
  if (agency == "MARTA") {
    modeClass = getModeClass(route);
  }

  console.log("THIS IS A TEST");

  return (
    <div>
      <span
        className={`${agencyRoute} ${modeClass} route-label`}
        title={agencyRoute}
      >
        <span>{route}</span>
      </span>

      <span className="label">
        Arrivals:
        {firstTwoDepartures.length
          ? firstTwoDepartures.map(({ time }) => {
              console.log("TIME: ", time);
              return time;
            })
          : "No departures in the next two hours..."}
      </span>
    </div>
  );
}

export default RouteInfo;
