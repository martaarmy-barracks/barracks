import React from 'react'
import { Layer } from 'react-mapbox-gl'

const textFonts = ["DIN Offc Pro Bold", "Open Sans Semibold", "Arial Unicode MS Bold"]

// Helper functions to build basic Mapbox GL layers.
function circle (fill, stroke, radius, strokeWidth, minZoom) {
  return props => (
    <Layer
      {...props}
      type='circle'
      minzoom={minZoom || 8}
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
      minzoom={minZoom || 8}
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

export const ParkRideCircle = circle("#2d01a5","#FFFFFF", 8, 1.5)
export const ParkRideSymbol = symbol("P", "#FFFFFF")

export const StationLabel = props => (
  <Layer
    {...props}
    type='symbol'
    minzoom={8}
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
/*
var layers = {
  railCircle: {
      // TODO: get rid of IDs
      id: "rail-circle",
      appliesTo: [].concat(presets.rail, presets.busHub),
      handleClick: clickZoomInHandler,
      layers: [circle("#FFFFFF","#606060", 8, 1.5)]
  },
  tramCircle: {
      id: "tram-circle",
      appliesTo: presets.tram,
      handleClick: clickZoomInHandler,
      layers: [circle("#FFFFFF","#606060", 6, 1, 12)]
  },
  parkRideCircle: {
      id: "park-ride-circle",
      appliesTo: presets.parkRide,
      handleClick: clickZoomInHandler,
      layers: [circle("#2d01a5","#FFFFFF", 8, 1.5)]
  },
  parkRideSymbol: {
      id: "park-ride-symbol",
      appliesTo: presets.parkRide,
      layers: [presetLayers.symbol("P", "#FFFFFF")]
  },
  stationLabel: {
      id: "station-label",
      appliesTo: [].concat(
          presets.parkRide,
          presets.rail,
          presets.busHub
      ),
      layers: [{
          type: "symbol",
          minzoom: 8,
          layout: {
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
          },
          paint: {
              "text-color": "#FFFFFF",
              "text-halo-color": "#000066",
              "text-halo-width": 5
          }
      }]
  },
  inactiveStopCircle: {
      id: "inactive-circle",
      appliesTo: filters.inactiveStop,
      layers: [presetLayers.circle("#AAAAAA","#888888", 6, 1, stopsMinZoom)]
  },
  inactiveStopSymbol: {
      id: "inactive-symbol",
      appliesTo: filters.inactiveStop,
      layers: [{
          type: "symbol",
          minzoom: stopsMinZoom,
          layout: {
              "text-allow-overlap": true,
              "text-field": String.fromCharCode(215)
          },
          paint: {
              "text-color": "#fcfcfc"
          }
      }]
  },
  activeStopCircle: {
      id: "active-circle",
      layers: [presetLayers.circle("#3bb2d0","#0099ff", 8, 1, stopsMinZoom)]
  }
}
*/