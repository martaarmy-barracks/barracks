import mapboxgl from 'mapbox-gl'
import React, { useContext, useEffect, useState } from 'react'
import { Source } from 'react-mapbox-gl'

import MapContext from '../map-context'
import withMap from '../with-map'
import converters from '../../util/stop-converters'
import { ActiveStopCircle, STOPS_MIN_ZOOM } from './base-layers'

const sourceName = 'stops'

const Stops = ({ map }) => {
  const mapContext = useContext(MapContext)
  const { mapBounds } = mapContext
  const [fetchedBounds, setFetchedBounds] = useState([])
  const [lastMapBounds, setMapBounds] = useState()

  useEffect(() => {
    if (mapBounds) {
      const mapNE = mapBounds.getNorthEast()
      const mapSW = mapBounds.getSouthWest()
      if (!lastMapBounds || mapNE !== lastMapBounds.getNorthEast() || mapSW !== lastMapBounds.getSouthWest()) {
        console.log('StopsInner updating lastMapBounds', mapBounds)
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
  
            console.log('StopsInner about to fetch')
            // TODO: create API call using bounds.
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

  const sourceOptions = {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: mapContext.loadedStops.map(converters.standard)
    }
  }

  return (
    <>
      <Source
        id={sourceName}
        geoJsonSource={sourceOptions}
      />
      <ActiveStopCircle
        id='stops-circle'
        onClick={mapContext.onStationClick}
        sourceId={sourceName}
      />
    </>
  )
}

export default withMap(Stops)
