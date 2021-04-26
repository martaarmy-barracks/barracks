import React, { Fragment } from 'react'
import { Source } from 'react-mapbox-gl'

import converters from '../../util/stop-converters'
import { circle } from './base-layers'

const HoveredStopLayer = ({ hoveredStop }) => {
  if (!hoveredStop) return null

  const LayerComponent = circle("transparent","#FF0000", 8, 3)
  const sourceFeatures = [hoveredStop]
  const layerKey = 'hovered-stop'

  return (
    <Fragment key={layerKey}>
      <Source
        geoJsonSource={{
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: sourceFeatures.map(converters.standard)
          }
        }}
        id={layerKey}
      />
      <LayerComponent
        minZoom={8}
        sourceId={layerKey}
      />
    </Fragment>
  )
}

export default HoveredStopLayer
