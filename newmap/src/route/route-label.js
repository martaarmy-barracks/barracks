import React from 'react'

import busSvg from './images/bus-icon.svg'
import tramSvg from './images/tram-icon.svg'
import railSvg from './images/rail-icon.svg'

/**
 * Gets clickable HTML content for the given route.
 * @param {*} routes The routes to render.
 * @param {*} onRouteClickFnName Optional - The name of a global function that takes one 'index' arg.
 * @param {*} index The index for refering to the route on click. Required only if onRouteClickFnName is specified.
 */
const RouteLabel = ({ onClick, route }) => {
  const { agency_id, route_short_name: routeName } = route
  const agencyRoute = `${agency_id} ${routeName}`
  // Specific to MARTA rail lines...
  let railClass = ''
  let Svg = busSvg
  if (agency_id == 'MARTA') {
    switch (routeName) {
      case 'BLUE':
      case 'GOLD':
      case 'GREEN':
      case 'RED':
        railClass = 'rail-line'
        Svg = railSvg
        break
      case 'ATLSC':
        railClass = 'tram-line'
        routeName = 'Streetcar'
        Svg = tramSvg
        break;
      default:
    };
  }

  return (
    <span
      className={`${agencyRoute} ${railClass} route-label`}
      onClick={onClick}
      title={agencyRoute}
    >
      <Svg />
      <span>{routeName}</span>
    </span>
  )
}

export default RouteLabel
