import React from "react";
import RouteLabel from "../route/route-label";
import { formatTime } from "../util/time";

function RouteInfo({ agency = "MARTA", departures, route }) {
  const firstTwoDepartures = departures.slice(0, 2);

  return (
    <div className="popup-route-info">
      <span className="popup-route-column" style={{ minWidth: '50px', width: 'auto' }}>
        <RouteLabel
          route={{
            agency_id: agency,
            route_short_name: route
          }}
          showRouteLabel={false}
        />
      </span>

      <span className="label">
        Arrivals:{" "}
        {firstTwoDepartures.length
          ? firstTwoDepartures.map(({ time }) => formatTime(time)).join(", ")
          : "None in the next two hours..."
        }
      </span>
    </div>
  );
}

export default RouteInfo;
