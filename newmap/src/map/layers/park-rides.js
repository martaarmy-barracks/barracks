import React, { Fragment } from 'react'
import { Source } from 'react-mapbox-gl'

import converters from '../../util/stop-converters'
import data from './park-ride-data'
import { ParkRideCircle, ParkRideSymbol, StationLabel } from './base-layers'

const ParkAndRides = () => {
  const sourceName = 'preloaded-park-ride'
  const sourceOptions = {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: data.map(converters.standard)
    }
  }

  return (
    <Fragment>
      <Source
        id={sourceName}
        geoJsonSource={sourceOptions}
      />      
      <ParkRideCircle
        id='park-ride-circle'
        sourceId={sourceName}
      />
      <ParkRideSymbol
        id='park-ride-symbol'
        sourceId={sourceName}
      />
      <StationLabel
        id='park-ride-label'
        sourceId={sourceName}
      />
    </Fragment>
  )

}

export default ParkAndRides
