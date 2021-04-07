import React, { useContext, useEffect, useState } from 'react'
import { Source } from 'react-mapbox-gl'

import MapContext from '../map-context'
import withMap from '../with-map'
import converters from '../../util/stop-converters'
import { StationCircle } from './base-layers'

const sourceName = 'stops'

const Stops = ({ map }) => {
  const ctr = map.getCenter();
  const mapContext = useContext(MapContext)
  const { mapBounds } = mapContext
  const [fetchedBounds, setFetchedBounds] = useState([])
  const [lastMapBounds, setMapBounds] = useState()

  useEffect(() => {
    //console.log('StopsInner useEffect', lastMapBounds)
    if (mapBounds) {
      const mapNE = mapBounds.getNorthEast()
      const mapSW = mapBounds.getSouthWest()
      if (!lastMapBounds || mapNE !== lastMapBounds.getNorthEast() || mapSW !== lastMapBounds.getSouthWest()) {
        console.log('StopsInner updating lastMapBounds', mapBounds)
        setMapBounds(mapBounds)
  
        let boundsIsInFetchedBounds = fetchedBounds.length > 0
        fetchedBounds.forEach(b => {
          boundsIsInFetchedBounds &= b.contains(mapNE) && b.contains(mapSW) 
        })
    
        if (!boundsIsInFetchedBounds) {
          console.log('StopsInner about to fetch')
          // TODO: create API call using bounds.
          fetch('https://barracks.martaarmy.org/ajax/get-adoptable-stops.php?lat=' + ctr.lat + '&lon=' + ctr.lng)
          .then(res => res.json())
          .then(stops => {
            const newFetchedBounds = [...fetchedBounds, mapBounds]
            setFetchedBounds(newFetchedBounds)
    
            mapContext.onStopsFetched(stops)
          })
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
      <StationCircle
        id='stops-circle'
        onClick={mapContext.onStationClick}
        sourceId={sourceName}
      />
    </>
  )
}

export default withMap(Stops)
