import mapboxgl from 'mapbox-gl'
import React, { Component, Fragment, useContext, useEffect, useState } from 'react'
import { Source } from 'react-mapbox-gl'

import { MapEventContext } from '../map-context'
import RouteContext from '../../route/route-context'
import converters from '../../util/stop-converters'
import * as filters from '../../util/filters'
import withMap from '../with-map'
import { STOPS_MIN_ZOOM } from './base-layers'

const { all, not } = filters

const filterListContents = {
  // Individual census attributes
  stopGrade: {
    // Grade: A B C D F => Circle with grade shown inside.
    label: 'Stop grade',
    options: ['A', 'B', 'C', 'D', 'F']
    // TODO: how to render
  },
  trashCan: {
    // Trash can:yes/no
    label: 'Trash can',
    options: ['Yes', 'No']
    // TODO: how to render
  }
/*  
- Accessible
- Traffic light
- Crosswalk
- Sidewalk
- Shelter
- Seating

Other bus stop attributes
- Frequency: sparse, basic (30m-30m), core (15m-30m) => border thickness?
*/
}

/**
 * Map layer that renders transit stops.
 */
const StopLayers = ({ activeFilters, loadedStops, map, mapBounds, symbolLists }) => {
  const mapEvents = useContext(MapEventContext)
  const { stops } = useContext(RouteContext)
  const mapZoom = map.getZoom()

  const [fetchedBounds, setFetchedBounds] = useState([])
  const [lastMapBounds, setMapBounds] = useState()

  console.log('Rendering StopLayers')
  const mapNE = mapBounds && mapBounds.getNorthEast()
  const mapSW = mapBounds && mapBounds.getSouthWest()

  useEffect(() => {
    if (mapBounds) {
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

              mapEvents.onStopsFetched(stops)
            })
          }
        }
      }
    }
  }, [mapNE, mapSW, loadedStops.length])

  // For each layer
  let contents = []
  symbolLists.forEach((symbols, i) => {
    // Keep track of stops that have not been assigned a previous layer or background.
    let remainingStops = [].concat(loadedStops)

    // Attention, symbols are taken in the order they are defined in the symbol list.
    contents = contents.concat(symbols.map((s, j) => {
      if (!s) return null

      // Only consider if map zoom applies.
      if ((s.maxZoom && mapZoom > s.maxZoom) || (s.minZoom && mapZoom < s.minZoom)) return null

      // Filters for current conditions
      const activeRouteStopsFilter = stop => stops && stops.find(st => st.id === stop.id)
      const activeRouteOrStopZoomRangeStopsFilter = stop => ((map.getZoom() >= STOPS_MIN_ZOOM) || activeRouteStopsFilter(stop))

      // Create a source
      const appliesToType = typeof s.appliesTo
      const LayerComponent = s.component

      let sourceFeatures = null

      if (s.conditions) { // assume array
        // Convert "text" filters to functions.
        const mappedFilters = s.conditions.map(c => {
          if (c === filters.activeRoute) return activeRouteStopsFilter
          if (c === filters.activeRouteOrStopZoomRange) return activeRouteOrStopZoomRangeStopsFilter
          return c
        });
        const allFilters = all(mappedFilters)
        sourceFeatures = remainingStops.filter(allFilters)
        remainingStops = remainingStops.filter(not(allFilters))
      }
      else if (s.appliesTo === filters.activeRoute && stops) {
        sourceFeatures = remainingStops.filter(activeRouteStopsFilter)
        remainingStops = remainingStops.filter(not(activeRouteStopsFilter))
      }
      else if (appliesToType === 'function') {
        sourceFeatures = remainingStops.filter(s.appliesTo)
        remainingStops = remainingStops.filter(not(s.appliesTo))
      }
      else if (appliesToType === 'object') {
        sourceFeatures = []
        s.appliesTo.forEach(function(stop) {
          const ids = stop.ids
          if (ids && ids.length) {
            // Build a combined feature and remove individual child stops.
            remainingStops = remainingStops.filter(s => !ids.includes(s.id))
            const combinedStop = {
              ...stop,
              csvIds: ids.join(',')
            }
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

      // Hook the layer
      const layerKey = `symbols-[${i}]-[${j}]`
      return sourceFeatures && (
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
            maxZoom={s.maxZoom}
            minZoom={s.minZoom || 8}
            onClick={mapEvents.onStationClick}
            sourceId={layerKey}
          />
        </Fragment>
      )
    }))
  })

  return contents
}

/**
 * A wrapper around StopLayer that only updates when map bounds
 * or the loaded stops have changed.
 */
class StopLayerWrapper extends Component {
  shouldComponentUpdate (nextProps) {
    const { loadedStops, mapBounds } = this.props
    const { loadedStops: nextStops, mapBounds: nextBounds } = nextProps
    const mapNE = mapBounds && mapBounds.getNorthEast()
    const mapSW = mapBounds && mapBounds.getSouthWest()
    const nextNE = nextBounds && nextBounds.getNorthEast()
    const nextSW = nextBounds && nextBounds.getSouthWest()

    return mapNE !== nextNE || mapSW !== nextSW || loadedStops.length !== nextStops.length
  }

  render () {
    return <StopLayers {...this.props} />
  }
}

export default withMap(StopLayerWrapper)
