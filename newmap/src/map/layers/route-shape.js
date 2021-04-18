import { LngLatBounds } from 'mapbox-gl'
import React, { Fragment, useEffect, useState } from 'react'
import { Layer, Source } from 'react-mapbox-gl'
import { useRouteMatch } from 'react-router-dom'

import withMap from '../with-map'

const RouteShape = ({ map }) => {
  const [routeState, setRouteState] = useState({ routeData: null, routeNumber: null })
  const [shapes, setShapes] = useState(null)
  const match = useRouteMatch('/route/:routeNumber') || { params: {} }

  useEffect(() => {
    const { routeNumber = null } = match.params
    if (routeNumber !== routeState.routeNumber) {
      if (!routeNumber) {
        setRouteState({ routeData: null, routeNumber: null })
        setShapes(null)
      } else {
        // Fetch route data

        // Convert route number to id
        fetch(`https://barracks.martaarmy.org/ajax/get-route.php?routenum=${routeNumber}`)
        .then(res => res.json())
        .then(routeData => {
          setRouteState({ routeData, routeNumber })

          // Fetch route shapes
          fetch(`https://barracks.martaarmy.org/ajax/get-route-shapes.php?routeid=${routeData.route_id}`)
          .then(res => res.json())
          .then(shapes => {
            const keys = Object.keys(shapes)
            if (keys.length > 0) {
              // Compute bounds (example from https://docs.mapbox.com/mapbox-gl-js/example/zoomto-linestring/)
              const shape1 = shapes[keys[0]]
              const routeBounds = Object.values(shapes).reduce(
                (currentBounds, shape) => shape.reduce(
                  (bounds, coord) => bounds.extend(coord),
                  currentBounds
                ),
                new LngLatBounds(shape1[0], shape1[0])
              )

              map.fitBounds(routeBounds, { padding: 20 });
              setShapes(shapes)
            }
          })
        })
      }
    }
  })

  return shapes && Object.keys(shapes).map(shapeId => {
    // Code below almost same as RailLines.
    const sourceName = `route-shape-${shapeId}`
    return (
      <Fragment key={sourceName}>
        <Source
          id={sourceName}
          geoJsonSource={{
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: shapes[shapeId]
              }
            }
          }}
        />
        <Layer
          before='preloaded-shape-[0]'
          id={sourceName}
          type='line'
          layout={{
            'line-join': 'round',
            'line-cap': 'round'
          }}
          paint={{
            'line-color': '#000',
            'line-opacity': 0.5,
            'line-width': 2
          }}
          sourceId={sourceName}
        />
      </Fragment>
    )
  })
}

export default withMap(RouteShape)
