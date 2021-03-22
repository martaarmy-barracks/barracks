import React, { Fragment } from 'react'
import { Source } from 'react-mapbox-gl'

import converters from '../../util/stop-converters'
import data from './station-data'
import { StationCircle, StationLabel } from './base-layers'

const Stations = () => {
  const sourceName = 'preloaded-stations'
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
      <StationCircle
        id='station-circle'
        sourceId={sourceName}
      />
      <StationLabel
        id='station-label'
        sourceId={sourceName}
      />
    </Fragment>
  )

}

export default Stations
