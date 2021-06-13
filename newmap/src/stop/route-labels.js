import React, { useEffect, useState } from 'react'

function getShortStopId(longId) {
	return longId.split("_")[1]; // can be undefined.
}

const RouteLabels = ({ stop }) => {
  // Fetch the routes for that stop
  // i.e. fetch the routes for each "Substop" of this stop
  const fullStopIds = stop.csvIds ? stop.csvIds.split(",") : [stop.id];
  const shortStopIds = fullStopIds.map(function(idStr) { return getShortStopId(idStr); });

  const [fetchState, setFetchState] = useState({ stopRoutesFetched: [], stopsFetched: 0 })

  useEffect(() => {
    shortStopIds.forEach(shortStopId => {
      fetch(`https://barracks.martaarmy.org/ajax/get-stop-routes.php?stopid=${shortStopId}`)
        .then(res => res.json())
        .then(routes => {
          const { stopRoutesFetched, stopsFetched } = fetchState 
          routes.forEach(route => {
            // Remove duplicates on fetched routes.
            const fetchedRoutes = stopRoutesFetched.filter(fetched => {
              return fetched.agency_id == route.agency_id
                && fetched.route_short_name == route.route_short_name;
            });
            if (fetchedRoutes.length == 0) stopRoutesFetched.push(route);
          });
          setFetchState({ stopRoutesFetched, stopsFetched: stopsFetched + 1 })
      })
    })
  }, []) // [] runs the effect once.
        

  // Render the route labels when all the stops have been fetched.
  return fetchState.stopRoutesFetched.map(function (r) {
    const agencyRoute = `${r.agency_id} ${r.route_short_name}`
    // Hack for MARTA rail lines...
    let modeClass = ''
    if (r.agency_id == 'MARTA') {
      switch (r.route_short_name) {
        case 'BLUE':
        case 'GOLD':
        case 'GREEN':
        case 'RED':
          modeClass = 'rail-line'
          break
        case 'ATLSC':
          modeClass = 'tram-line'
          r.route_short_name = 'Streetcar'
          break
        default:
          modeClass = 'bus'
      }
    }
    return (
      <span
        className={`${agencyRoute} ${modeClass} route-label`}
        key={agencyRoute}
        title={agencyRoute}
      >
        <span>{r.route_short_name}</span>
      </span>
    )
  })
}

export default RouteLabels
