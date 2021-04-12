import React from 'react'
import { Layer } from 'react-mapbox-gl'

import filters from '../../util/filters'

import parkRideData from './park-ride-data'
import stationData from './station-data'
import tramStationData from './tram-station-data'

const textFonts = ["DIN Offc Pro Bold", "Open Sans Semibold", "Arial Unicode MS Bold"]

// Helper functions to build basic Mapbox GL layers.
function circle (fill, stroke, radius, strokeWidth, minZoom) {
  return props => (
    <Layer
      {...props}
      type='circle'
      minZoom={minZoom || 8}
      paint={{
        "circle-radius": radius || 8,
        "circle-color": fill,
        "circle-stroke-color": stroke,
        "circle-stroke-width": strokeWidth || 1
      }}
    />
  )
}

function symbol (symbol, color, size, minZoom) {
  return props => (
    <Layer
      {...props}
      type='symbol'
      minZoom={minZoom || 8}
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

const ParkRideCircle = circle("#2d01a5","#FFFFFF", 8, 1.5)
const ParkRideSymbol = symbol("P", "#FFFFFF")
const StationCircle = circle("#FFFFFF","#606060", 8, 1.5)
const TramStationCircle = circle("#FFFFFF","#606060", 6, 1, 12)
const ActiveStopCircle = circle("#3bb2d0","#0099ff", 8, 1, STOPS_MIN_ZOOM)
const InactiveStopCircle = circle("#AAAAAA","#888888", 6, 1, STOPS_MIN_ZOOM)
const InactiveStopSymbol = symbol(String.fromCharCode(215), "#fcfcfc", null, STOPS_MIN_ZOOM)

const StationLabel = props => (
  <Layer
    {...props}
    type='symbol'
    minZoom={8}
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
    appliesTo: [].concat(stationData), //, presets.busHub),
    component: StationCircle
    //handleClick: clickZoomInHandler,
    //layers: [presetLayers.circle("#FFFFFF","#606060", 8, 1.5)]
  },
  tramCircle: {
    appliesTo: tramStationData,
    component: TramStationCircle
    //handleClick: clickZoomInHandler,
    //layers: [presetLayers.circle("#FFFFFF","#606060", 6, 1, 12)]
  },
  parkRideCircle: {
    appliesTo: parkRideData,
    component: ParkRideCircle
    //handleClick: clickZoomInHandler,
    //layers: [presetLayers.circle("#2d01a5","#FFFFFF", 8, 1.5)]
  },
  parkRideSymbol: {
    appliesTo: parkRideData,
    component: ParkRideSymbol
    //layers: [presetLayers.symbol("P", "#FFFFFF")]
  },
  stationLabel: {
    appliesTo: [].concat(
      parkRideData,
      stationData
      //presets.busHub
    ),
    component: StationLabel
  },
  inactiveStopCircle: {
    appliesTo: filters.inactiveStop,
    component: InactiveStopCircle
    //layers: [presetLayers.circle("#AAAAAA","#888888", 6, 1, STOPS_MIN_ZOOM)]
  },
  inactiveStopSymbol: {
    appliesTo: filters.inactiveStop,
    component: InactiveStopSymbol
    //layers: [{
    //    type: "symbol",
    //    minzoom: STOPS_MIN_ZOOM,
    //    layout: {
    //        "text-allow-overlap": true,
    //        "text-field": String.fromCharCode(215)
    //    },
    //    paint: {
    //        "text-color": "#fcfcfc"
    //    }
    //}]
  },
  activeStopCircle: {
    component: ActiveStopCircle
    //layers: [presetLayers.circle("#3bb2d0","#0099ff", 8, 1, STOPS_MIN_ZOOM)]
  }
}

export default layers
