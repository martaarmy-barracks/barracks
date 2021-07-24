import React from 'react'
import { Marker } from 'react-mapbox-gl'

const HoveredStopLayer = ({ hoveredStop }) => (
  hoveredStop && (
    <Marker anchor='center' coordinates={[hoveredStop.lon, hoveredStop.lat]}>
      <div style={{ border: '2px solid #ff0000', height: '16px', width: '16px' }} />
    </Marker>
  )
)

export default HoveredStopLayer
