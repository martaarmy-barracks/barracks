import React, { useEffect } from "react";

function getModeClass(route) {
  switch (route) {
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

// [
//     {agency: "MARTA", route: "102", destination: "NORTH AVE STATION", time: "16:35:00", trip_started: "0",…},
//     {agency: "MARTA", route: "102", destination: "NORTH AVE STATION", time: "16:55:00", trip_started: "0",…}
//     ...

// ],

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
      {/* This is the code that prints 'BLUE' */}
      <span className="label">{route}</span>
      <span className="label">
        Arrivals:
        {firstTwoDepartures.map(({ time }) => {
          console.log("TIME: ", time);
          return time;
        })}
      </span>
    </div>
  );
}

export default RouteInfo;
