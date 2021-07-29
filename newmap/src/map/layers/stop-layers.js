import React, {
  Fragment,
  useContext,
  useEffect,
  useState
} from 'react'
import { Source } from 'react-mapbox-gl'

import { ALL_VALUES, getOptions, getRenderer } from '../filter-list'
import { MapEventContext } from '../map-context'
import RouteContext from '../../route/route-context'
import converters from '../../util/stop-converters'
import * as filters from '../../util/filters'
import { getLetterGrade } from '../../util/stops'
import withMap from '../with-map'
import layers, { circle, STOPS_MIN_ZOOM } from './base-layers'

const { all, not } = filters

/**
 * Obtains rendering info (selected/possible values, )
 * @param {*} activeFilters
 * @param {*} symbolPart
 */
 function getRenderingInfo (activeFilters, mapSymbols, symbolPart) {
  const filterKeys = Object.keys(activeFilters)
  const filterKey = filterKeys.find(k => activeFilters[k].symbolPart === symbolPart)
  if (filterKey) {
    const filter = activeFilters[filterKey]
    const values = filter.values || []
    if (values.length === 0) values.push(ALL_VALUES)
    return {
      options: getOptions(filterKey),
      renderer: getRenderer(mapSymbols[symbolPart], symbolPart), //(filter),
      values
    }
  }

  // Default info if filterKey does not exist
  return {
    options: [],
    values: [ALL_VALUES]
  }
}

/**
 * Creates a filter function for the given filter and layer.
 * Only stops with a census result object are included.
 */
function createStopFilterFunction (activeFilters, layer) {
  return function (stop) {
    let includeStop = true
    if (!stop.census) includeStop = false
    else {
      const fullStopData = {...stop}
      fullStopData.census.stopGrade = getLetterGrade(stop.census.score)

      Object.keys(activeFilters).forEach(k => {
        const attrValue = layer[activeFilters[k].symbolPart]
        if (fullStopData.census[k] !== attrValue && attrValue !== ALL_VALUES) {
          includeStop = false
        }
      })
    }
    return includeStop
  }
}


function createCircleLayersForFilters (activeFilters, mapSymbols) {
  // First the circle: background, borderColor, borderStyle, borderWidth
  const renderingInfo = {}
  const parts = ['background', 'borderColor', 'borderStyle', 'borderWidth']
  parts.forEach(part => {
    renderingInfo[part] = getRenderingInfo(activeFilters, mapSymbols, part)
  })
  const { background, borderColor, borderStyle, borderWidth } = renderingInfo

  // Build the different combinations of layers from the attribute values above.
  // TODO: Make this recursive.
  const layerCombinations = []
  for (let i1 = 0; i1 < background.values.length; i1++) {
    for (let i2 = 0; i2 < borderColor.values.length; i2++) {
      for (let i3 = 0; i3 < borderStyle.values.length; i3++) {
        for (let i4 = 0; i4 < borderWidth.values.length; i4++) {
          layerCombinations.push({
            background: background.values[i1],
            borderColor: borderColor.values[i2],
            borderStyle: borderStyle.values[i3],
            borderWidth: borderWidth.values[i4]
          })
        }
      }
    }
  }

  // Build the layers for each of the combinations above.
  // For each combination, build two layers, one for the active route and one for the stops in zoom range.
  const result = []
  layerCombinations.forEach(l => {
    // consts below are common with filter-list (refactor)
    // Provide a color if (i) a renderer func is available and (ii) the color is not ALL_VALUES
    const stopBackgroundColor = l.background !== ALL_VALUES && typeof background.renderer === 'function'
      ? background.renderer(background.options, l.background)
      : 'transparent'
    const stopBorderColor = l.borderColor !== ALL_VALUES && typeof borderColor.renderer === 'function'
      ? borderColor.renderer(borderColor.options, l.borderColor)
      : 'transparent'

    const component = circle(
      stopBackgroundColor,
      stopBorderColor,
      8,
      1.5
    )
    const stopFilterFunction = createStopFilterFunction(activeFilters, l)

    // layer for the active route
    result.push({
      component,
      conditions: [
        filters.activeRoute,
        stopFilterFunction
      ],
      tag: l
    })
    // layer for other stops
    result.push({
      component,
      conditions: [
        stopFilterFunction
      ],
      minZoom: STOPS_MIN_ZOOM,
      tag: l
    })
  })
  return result
}

/**
 * Makes the symbol lists for the given filters.
 */
function createSymbolLists (activeFilters, mapSymbols) {
  const filterCircleLayers = createCircleLayersForFilters(activeFilters, mapSymbols)
  return [
    [
      layers.railCircle,
      layers.tramCircle,
      layers.parkRideCircle,

      // Create one layer for each of the filter settings
      ...filterCircleLayers,
      layers.activeStopCircle2
    ],
    [layers.parkRideSymbol], //, layers.checkedSymbol, layers.activeRouteCheckedSymbol, layers.inactiveStopSymbol],
    [layers.stationLabel]
  ]
}

/**
 * Map layer that renders transit stops.
 */
const StopLayers = ({ activeFilters, loadedStops, map, mapSymbols }) => {
  const mapEvents = useContext(MapEventContext)
  const { stops } = useContext(RouteContext)
  const [ symbolLists, setSymbolLists ] = useState(createSymbolLists(activeFilters, mapSymbols))

  // Filters for current conditions
  const activeRouteStopsFilter = stop => stops && stops.find(st => st.id === stop.id)
  const mapZoom = map.getZoom()

  console.log('Rendering StopLayers')
  useEffect(() => {
    setSymbolLists(createSymbolLists(activeFilters, mapSymbols))
  }, [activeFilters, mapSymbols])

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

      // Create a source
      const appliesToType = typeof s.appliesTo
      const LayerComponent = s.component

      let sourceFeatures = null

      if (s.conditions) { // assume array
        // Convert "text" filters to functions.
        const mappedFilters = s.conditions.map(c => {
          if (c === filters.activeRoute) return activeRouteStopsFilter
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
              data: {
                type: 'FeatureCollection',
                features: sourceFeatures.map(converters.standard)
              },
              type: 'geojson'
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

export default withMap(StopLayers)
