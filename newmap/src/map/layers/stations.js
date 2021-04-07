import React, { useContext } from 'react'
import { Source } from 'react-mapbox-gl'

import MapContext from '../map-context'
import converters from '../../util/stop-converters'
import data from './station-data'
import { StationCircle, StationLabel } from './base-layers'

const sourceName = 'preloaded-stations'
const sourceOptions = {
  type: "geojson",
  data: {
    type: "FeatureCollection",
    features: data.map(converters.standard)
  }
}

const Stations = () => {
  const mapContext = useContext(MapContext)
  return (
    <>
      <Source
        id={sourceName}
        geoJsonSource={sourceOptions}
      />
      <StationCircle
        id='station-circle'
        onClick={mapContext.onStationClick}
        sourceId={sourceName}
      />
      <StationLabel
        id='station-label'
        sourceId={sourceName}
      />
    </>
  )
}

export default Stations
