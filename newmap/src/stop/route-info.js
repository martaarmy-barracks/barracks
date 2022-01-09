import React from "react";
import RouteLabel from "../route/route-label";
import { formatTime } from "../util/time";

function RouteInfo({ agency = "MARTA", route, departures }) {
  const firstTwoDepartures = departures.slice(0, 2);

  return (
    <div className="popup-route-info">
      <span style={{ textAlign: 'center', width: '56px' }}>
        <RouteLabel
          route={{
            agency_id: agency,
            route_short_name: route
          }}
          showRouteLabel={false}
        />
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
