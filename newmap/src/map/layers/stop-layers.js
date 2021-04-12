import mapboxgl from 'mapbox-gl'
import React, { Fragment, useContext, useEffect, useState } from 'react'
import { Source } from 'react-mapbox-gl'

import MapContext from '../map-context'
import withMap from '../with-map'
import converters from '../../util/stop-converters'
import { not } from '../../util/filters'
import { STOPS_MIN_ZOOM } from './base-layers'

const StopLayers = ({ map, symbolLists }) => {
  const mapContext = useContext(MapContext)

  const { mapBounds } = mapContext
  const [fetchedBounds, setFetchedBounds] = useState([])
  const [lastMapBounds, setMapBounds] = useState()

  useEffect(() => {
    if (mapBounds) {
      const mapNE = mapBounds.getNorthEast()
      const mapSW = mapBounds.getSouthWest()
      if (!lastMapBounds || mapNE !== lastMapBounds.getNorthEast() || mapSW !== lastMapBounds.getSouthWest()) {
        console.log('StopLayers updating lastMapBounds', mapBounds)
        setMapBounds(mapBounds)

        if (map.getZoom() >= STOPS_MIN_ZOOM) {
          // Determine if current map bounds are in fetching area.
          let boundsIsInFetchedBounds = false
          fetchedBounds.forEach(b => {
            boundsIsInFetchedBounds |= (b.contains(mapNE) && b.contains(mapSW))
          })

          if (!boundsIsInFetchedBounds) {
            // Extend map bounds by ~50% for fetching.
            const deltaLat = mapNE.lat - mapSW.lat
            const deltaLng = mapNE.lng - mapSW.lng
            const extNE = new mapboxgl.LngLat(mapNE.lng + deltaLng / 2, mapNE.lat + deltaLat / 2)
            const extSW = new mapboxgl.LngLat(mapSW.lng - deltaLng / 2, mapSW.lat - deltaLat / 2)
            const extendedBounds = new mapboxgl.LngLatBounds(extSW, extNE)

            console.log('StopLayers about to fetch')
            fetch('https://barracks.martaarmy.org/ajax/get-stops-in-bounds.php'
              + `?sw_lat=${extSW.lat}&sw_lon=${extSW.lng}&ne_lat=${extNE.lat}&ne_lon=${extNE.lng}`)
            .then(res => res.json())
            .then(stops => {
              const newFetchedBounds = [...fetchedBounds, extendedBounds]
              setFetchedBounds(newFetchedBounds)

              mapContext.onStopsFetched(stops)
            })
          }
        }
      }
    }
  })

  // For each layer
  let contents = []
  symbolLists.forEach((symbols, i) => {
    // Keep track of stops that have not been assigned a previous layer or background.
    let remainingStops = [].concat(mapContext.loadedStops);

    contents = contents.concat(symbols.map((s, j) => {
      if (!s) return null

      // Create a source
      const appliesToType = typeof s.appliesTo
      const LayerComponent = s.component

      let sourceFeatures
      if (appliesToType === 'function') {
        sourceFeatures = remainingStops.filter(s.appliesTo)
        remainingStops = remainingStops.filter(not(s.appliesTo))
      }
      else if (appliesToType === 'object') {
        sourceFeatures = []
        s.appliesTo.forEach(function(stop) {
          const ids = stop.ids
          if (ids && ids.length) {
            // Build a combined feature and remove individual child stops.
            ids.forEach(function(child) {
              const chIndex = remainingStops.indexOf(child)
              if (chIndex != -1) {
                remainingStops.splice(chIndex, 1)
              }
            })
            const combinedStop = Object.assign(stop)
            combinedStop.csvIds = ids.join(',')
            sourceFeatures.push(combinedStop)
          }
          else if (stop.id) {
            const sIndex = remainingStops.indexOf(stop)
            if (sIndex != -1) {
              sourceFeatures.push(stop)
              remainingStops.splice(sIndex, 1)
            }
          }
        })
      }
      else if (appliesToType === 'undefined') {
        sourceFeatures = remainingStops
        remainingStops = []
      }

      if (sourceFeatures) {
        const sourceFinalData = {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: sourceFeatures.map(converters.standard)
          }
        }
        // Hook the layer
        const layerKey = `symbols-[${i}]-[${j}]`
        return (
          <Fragment key={layerKey}>
            <Source
              id={layerKey}
              geoJsonSource={sourceFinalData}
            />
            <LayerComponent
              onClick={mapContext.onStationClick}
              sourceId={layerKey}
            />
          </Fragment>
        )
          }
      else {
        return null
      }
    }))
  })

  return contents
}

export default withMap(StopLayers)
