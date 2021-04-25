import React, { useContext, useEffect, useState } from 'react'
import { useRouteMatch } from 'react-router-dom'

import { MapEventContext } from '../map/map-context'
import RouteContext from './route-context'

const emptyState = { routeData: null, routeNumber: null, stops: null, stopsByDirection: null }

/**
 * Component that provides a transit route context.
 */
const RouteProvider = ({ children }) => {
  const [state, setState] = useState(emptyState)
  const match = useRouteMatch('/route/:routeNumber') || { params: {} }
  const { routeNumber } = match.params
  const mapEvents = useContext(MapEventContext)

  useEffect(() => {
    if (routeNumber) {
      // Convert route number to id
      fetch(`https://barracks.martaarmy.org/ajax/get-route.php?routenum=${routeNumber}`)
      .then(res => res.json())
      .then(routeData => {
        setState({ routeData, routeNumber, stopsByDirection: null })

        // Fetch route stops
        fetch(`https://barracks.martaarmy.org/ajax/get-route-stops.php?routeid=${routeData.route_id}`)
        .then(res => res.json())
        .then(stopsByDirection => {
          let newStops = []
          Object.values(stopsByDirection).forEach(directionObj => {
            Object.values(directionObj.shapes).forEach(sh => newStops = newStops.concat(sh.stops))
          })
          setState({ routeData, routeNumber, stops: newStops, stopsByDirection })
          mapEvents.onStopsFetched(newStops)
        })
      })
    }
    else {
      setState(emptyState)
    }
  }, [routeNumber]); // listen to routeNumber.

  return (
    <RouteContext.Provider value={state}>
      {children}
    </RouteContext.Provider>
  )
}

export default RouteProvider
