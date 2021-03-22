import React, { Fragment } from 'react'
import { Source } from 'react-mapbox-gl'

import converters from '../../util/stop-converters'
import data from './tram-station-data'
import { TramStationCircle } from './base-layers'

const TramStations = () => {
  const sourceName = 'preloaded-tram-stations'
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
      <TramStationCircle
        id='tram-station-circle'
        sourceId={sourceName}
      />
    </Fragment>
  )

}

export default TramStations
