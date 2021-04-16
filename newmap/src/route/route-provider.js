import React, { useContext, useEffect, useState } from 'react'
import { useRouteMatch } from 'react-router-dom'

import MapContext from '../map/map-context'
import RouteContext from './route-context'

/**
 * Component that provides a transit route context.
 */
const RouteProvider = ({ children }) => {
  const [state, setState] = useState({ routeData: null, routeNumber: null, stopsByDirection: null })
  const match = useRouteMatch('/route/:routeNumber')
  const mapContext = useContext(MapContext)

  useEffect(() => {
    if (match) {
      const { routeNumber } = match.params
      if (routeNumber !== state.routeNumber) {
        // Convert route number to id
        fetch(`https://barracks.martaarmy.org/ajax/get-route.php?routenum=${routeNumber}`)
        .then(res => res.json())
        .then(routeData => {
          setState({ routeData, routeNumber, stopsByDirection: null })

          // Fetch route stops
          fetch(`https://barracks.martaarmy.org/ajax/get-route-stops.php?routeid=${routeData.route_id}`)
          .then(res => res.json())
          .then(stopsByDirection => {
            setState({ routeData, routeNumber, stopsByDirection })

            let newStops = []
            Object.values(stopsByDirection).forEach(directionObj => {
              Object.values(directionObj.shapes).forEach(sh => newStops = newStops.concat(sh.stops))
            })
            mapContext.onStopsFetched(newStops)
          })
        })
      }
    }
  });

  return (
    <RouteContext.Provider value={state}>
      {children}
    </RouteContext.Provider>
  )
}

export default RouteProvider
