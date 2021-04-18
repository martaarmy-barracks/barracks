import React from 'react'
import { Layer } from 'react-mapbox-gl'

import filters from '../../util/filters'
import parkRideData from './park-ride-data'
import stationData from './station-data'
import tramStationData from './tram-station-data'

const textFonts = ["DIN Offc Pro Bold", "Open Sans Semibold", "Arial Unicode MS Bold"]

// Helper functions to build basic Mapbox GL layers.
function circle (fill, stroke, radius, strokeWidth) {
  return props => (
    <Layer
      {...props}
      type='circle'
      paint={{
        "circle-radius": radius || 8,
        "circle-color": fill,
        "circle-stroke-color": stroke,
        "circle-stroke-width": strokeWidth || 1
      }}
    />
  )
}

function symbol (symbol, color, size) {
  return props => (
    <Layer
      {...props}
      type='symbol'
      layout={{
        "text-allow-overlap": true,
        "text-field": symbol,
        "text-font": textFonts,
        "text-line-height": 0.8,
        "text-size": size || 12
      }}
      paint={{
        "text-color": color
      }}
    />
  )
}

export const STOPS_MIN_ZOOM = 14;

const StationLabel = props => (
  <Layer
    {...props}
    type='symbol'
    layout={{
      // get the title name from the source's "label" property
      "text-field": ["get", "label"],
      "text-font": textFonts,
      "text-justify": "auto",
      "text-line-height": 0.8, //em
      "text-padding": 8,
      "text-radial-offset": 0.1,
      "text-size": 14,
      "text-transform": "uppercase",
      "text-variable-anchor": ["bottom-left", "top-right"]
    }}
    paint={{
      "text-color": "#FFFFFF",
      "text-halo-color": "#000066",
      "text-halo-width": 5
    }}
  />
)

// This will apply the specified layers for a specific stop
// when the first appliesTo is satisfied.
// appliesTo takes two forms:
// - a func returning boolean, or,
// - an array of elements each containing an id field.
// - null/undefined/omitted means it applies to what remains.
const layers = {
  railCircle: {
    appliesTo: stationData, // includes bus hubs
    component: circle("#FFFFFF","#606060", 8, 1.5)
    //handleClick: clickZoomInHandler,
  },
  tramCircle: {
    appliesTo: tramStationData,
    component: circle("#FFFFFF","#606060", 6, 1, 12),
    //handleClick: clickZoomInHandler,
    minZoom: 12
  },
  parkRideCircle: {
    appliesTo: parkRideData,
    component: circle("#2d01a5","#FFFFFF", 8, 1.5)
    //handleClick: clickZoomInHandler,
  },
  parkRideSymbol: {
    appliesTo: parkRideData,
    component: symbol("P", "#FFFFFF")
  },
  stationLabel: {
    appliesTo: [].concat(parkRideData, stationData),
    component: StationLabel
  },
  routeStopCircle: {
    appliesTo: filters.activeRoute,
    component: circle("#000000","#000000", 4, 1),
    maxZoom: STOPS_MIN_ZOOM
  },
  inactiveStopCircle: {
    appliesTo: filters.inactiveStop,
    component: circle("#AAAAAA","#888888", 6, 1),
    minZoom: STOPS_MIN_ZOOM
  },
  inactiveStopSymbol: {
    appliesTo: filters.inactiveStop,
    component: symbol(String.fromCharCode(215), "#fcfcfc"),
    minZoom: STOPS_MIN_ZOOM
  },
  inactiveCheckedCircle: {
    appliesTo: stop => filters.inactiveStop(stop) && stop.record_id,
    component: circle("#bbbb00","#888888", 6, 1),
    minZoom: STOPS_MIN_ZOOM
  },
  activeCheckedCircle: {
    appliesTo: stop => !filters.inactiveStop(stop) && stop.record_id,
    component: circle("#33cc33","#228822", 8, 1),
    minZoom: STOPS_MIN_ZOOM
  },
  checkedSymbol: {
    appliesTo: stop => stop.record_id,
    component: symbol("✔", "#ffffff", 11),
    minZoom: STOPS_MIN_ZOOM
  },
  activeStopCircle: {
    component: circle("#3bb2d0","#0099ff", 8, 1),
    minZoom: STOPS_MIN_ZOOM
  }
}

export default layers
