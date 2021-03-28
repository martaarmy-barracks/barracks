import React from 'react'
import { MapContext } from 'react-mapbox-gl'

function withMap (Component) {
  return props => (
    <MapContext.Consumer>
      {map => <Component map={map} {...props} />}
    </MapContext.Consumer>
  )
}

export default withMap
