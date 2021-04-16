import React, { Fragment } from 'react'
import {
  Layer,
  Source
} from 'react-mapbox-gl'
import railLineShapes from './rail-line-data'

const RailLines = () => railLineShapes.map((sc, i) => {
  const sourceName = `preloaded-shape-[${i}]`
  const sourceOptions = {
    type: "geojson",
    data: {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: sc.points
      }
    }
  }
  const layerOptions = {
    id: sourceName,
    type: "line",
    //source: sourceName,
    layout: {
      "line-join": "round",
      "line-cap": "round"
    },
    paint: {
      "line-color": sc.color,
      "line-opacity": 0.5,
      "line-width": sc.weight
    }
  }

  return (
    <Fragment key={sourceName}>
      <Source
        id={sourceName}
        geoJsonSource={sourceOptions}
      />
      <Layer
        id={sourceName}
        type='line'
        layout={layerOptions.layout}
        paint={layerOptions.paint}
        sourceId={sourceName}
      />
    </Fragment>
  )
});

export default RailLines
