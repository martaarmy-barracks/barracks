import React from "react";
import RouteLabel from "../route/route-label";
import { formatTime } from "../util/time";

function RouteInfo({ agency = "MARTA", departures, href, route }) {
  const firstTwoDepartures = departures.slice(0, 2);
  const firstDestination = departures.length ? departures[0].destination : ""
  const firstDestinationTwoWords = firstDestination.split(" ").slice(0, 2).join(" ");

  return (
    <li>
      <span className="popup-route-column" style={{ minWidth: '50px', width: 'auto' }}>
        <RouteLabel
          route={{
            agency_id: agency,
            route_short_name: route
          }}
          showModeIcon={false}
        />
      </span>

      {firstTwoDepartures.length
        ? (
          <>
            {/* Print the first two words of the first destination for conciseness. */}
            <span className="label" style={{
              display: "inline-block",
              marginRight: "6px",
              width: "150px",
              whiteSpace: "nowrap"
            }}>
              {firstDestinationTwoWords}
            </span>
            <span className="label">
              {firstTwoDepartures.map(
                ({ time }) => formatTime(time)
              ).join(", ") + (departures.length > 2 ? ", …" : "")}
            </span>
          </>
        )
        : <span className="label">No departures in the next two hours.</span>
      }
      {' '}
      {href && <a className="label" href={href} target="_blank">More...</a>}
    </li>
  );
}

export default RouteInfo;
