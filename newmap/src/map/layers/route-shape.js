import { LngLatBounds } from 'mapbox-gl'
import React, { Fragment, useEffect, useState } from 'react'
import { Layer, Source } from 'react-mapbox-gl'
import { useRouteMatch } from 'react-router-dom'

import withMap from '../with-map'

const RouteShape = ({ map }) => {
  const [routeState, setRouteState] = useState({ routeData: null, routeNumber: null })
  const [shapes, setShapes] = useState()
  const match = useRouteMatch('/route/:routeNumber')

  useEffect(() => {
    if (!match) {
      setRouteState({ routeData: null, routeNumber: null })
      setShapes(null)
    } else {
      const { routeNumber } = match.params
      if (!routeNumber) {
        setRouteState({ routeData: null, routeNumber: null })
        setShapes(null)
      } else if (routeNumber !== routeState.routeNumber) {
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
              const routeBounds = Object.values(shapes).reduce((currentBounds, shape) =>
                shape.reduce((bounds, coord) => {
                  return bounds.extend(coord);
                  }, currentBounds),
                  new LngLatBounds(shape1[0], shape1[0])
              )

              console.log('about to fit route bounds')
              map.fitBounds(routeBounds, {
                padding: 20
              });

              setShapes(shapes)
            }
          })
        })
      }
    }
  })

  if (!shapes) return null

  return Object.keys(shapes).map(function(shapeId) {
    // Code below almost same as RailLines.
    const sourceName = 'route-shape-' + shapeId
    const sourceOptions = {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: shapes[shapeId]
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
        "line-color": '#000',
        "line-opacity": 0.5,
        "line-width": 2
      }
    }

    return (
      <Fragment key={sourceName}>
        <Source
          id={sourceName}
          geoJsonSource={sourceOptions}
        />
        <Layer
          before='preloaded-shape-[0]'
          id={sourceName}
          type='line'
          layout={layerOptions.layout}
          paint={layerOptions.paint}
          sourceId={sourceName}
        />
      </Fragment>
    )
  });
}

export default withMap(RouteShape)
