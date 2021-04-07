import React, { useContext } from 'react'
import { Source } from 'react-mapbox-gl'

import MapContext from '../map-context'
import converters from '../../util/stop-converters'
import data from './park-ride-data'
import { ParkRideCircle, ParkRideSymbol, StationLabel } from './base-layers'

const sourceName = 'preloaded-park-ride'
const sourceOptions = {
  type: "geojson",
  data: {
    type: "FeatureCollection",
    features: data.map(converters.standard)
  }
}

const ParkAndRides = () => {
  const mapContext = useContext(MapContext)
  return (
    <>
      <Source
        id={sourceName}
        geoJsonSource={sourceOptions}
      />      
      <ParkRideCircle
        id='park-ride-circle'
        onClick={mapContext.onStationClick}
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
    </>
  )
}

export default ParkAndRides
