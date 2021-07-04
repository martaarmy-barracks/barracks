import 'mapbox-gl/dist/mapbox-gl.css'
import React, { Component } from 'react'
import ReactMapboxGl, {
  Popup,
  ZoomControl
} from 'react-mapbox-gl'
import {
  HashRouter as Router,
  Redirect,
  Route,
  Switch
} from 'react-router-dom'

import { MapEventContext } from './map/map-context'
import layers from './map/layers/base-layers'
import RailLines from './map/layers/rail-lines'
import HoveredStopLayer from './map/layers/hovered-stop-layer'
import RouteShape from './map/layers/route-shape'
import StopLayers from './map/layers/stop-layers'
import TransitRoute from './route/route'
import TransitRouteProvider from './route/route-provider'
import TransitRoutes from './route/routes'
import Stop from './stop/stop'
import StopPopup from './stop/stop-popup'
import Stops from './stop/stops'
import Home from './ui/home'
import { getShortStopId, isAtStation, isStreetcarStop } from './util/stops'

import './App.css'
import { mapboxAccessToken } from './App.config'

const DEFAULT_CENTER = [-84.38117980957031, 33.7615242074253];
const DEFAULT_ZOOM = [10]
const Map = ReactMapboxGl({
  accessToken: mapboxAccessToken
});

const symbolLists = [
  [
    layers.railCircle,
    layers.tramCircle,
    layers.parkRideCircle,

    layers.activeRouteCheckedCircle,
    layers.activeRouteStopCircle,

    layers.activeCheckedCircle,
    layers.inactiveCheckedCircle,
    layers.inactiveStopCircle,
    layers.activeStopCircle
  ],
  [layers.parkRideSymbol, layers.checkedSymbol, layers.activeRouteCheckedSymbol, layers.inactiveStopSymbol],
  [layers.stationLabel]
]

const CensusLinks = ({ stop }) => {
  if (isAtStation(stop) || isStreetcarStop(stop)) return null
  else {
    const shortStopId = getShortStopId(stop.id)
    const stopNameParts = stop.name.split("@")
    const street = stopNameParts[0].trim()
    const landmark = (stopNameParts[1] || "").trim()
    const routeNumbers = stop.routes && stop.routes.map(r => r.route_short_name).join(", ")
    const lonlatArray = [stop.lon, stop.lat]
    const isSurveyed = stop.record_id

    return (
      <ul>
        <li>
          <a
            // Google Street View link (docs: https://developers.google.com/maps/documentation/urls/guide#street-view-action)
            href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lonlatArray[1]},${lonlatArray[0]}`}
            target='_blank'
          >
            Street View from this stop
          </a>
        </li>
        {isSurveyed && <li>ℹ️ This stop has already been surveyed.</li>}
        <li>
          <b>
            <a
              href={`../wp/5-2/?stopid=${shortStopId}&street=${street}&routes=${routeNumbers}&landmark=${landmark}`}
              target='_blank'
            >
              Take the Bus Stop Census {isSurveyed ? 'again' : ''}
            </a>
          </b>
        </li>
      </ul>
    )
  }
}

// Add stops that weren't loaded to the list of loaded stops.
function getUpdatedStops (stops, state) {
  const { loadedStops, loadedStopIds } = state
  let newLoadedStopIds = [].concat(loadedStopIds)
  let newLoadedStops = [].concat(loadedStops)
  const isNewId = id => id && newLoadedStopIds.indexOf(id) === -1

  stops.forEach(function(s) {
    if (s.ids) {
      const newIds = s.ids.filter(isNewId)
      newLoadedStopIds = newLoadedStopIds.concat(newIds)
      newLoadedStops = newLoadedStops.concat(newIds.map(id => ({ id })))
    }
    else if (isNewId(s.id)) {
      newLoadedStopIds.push(s.id);
      newLoadedStops.push(s);
    }
  });

  return {
    hoveredStop: null,
    loadedStopIds: newLoadedStopIds,
    loadedStops: newLoadedStops
  }
}

let initialStopState = {
  hoveredStop: null,
  loadedStopIds: [],
  loadedStops: []
}
// Where appliesTo is an array in the presets, load those stops.
symbolLists.forEach(function(symbolList) {
  symbolList.forEach(function(s) {
    if (typeof s.appliesTo === 'object') { // i.e. array
      initialStopState = getUpdatedStops(s.appliesTo, initialStopState)
    }
  });
});

class App extends Component {
  state = {
    ...initialStopState,
    mapBounds: null,
    mapCenter: DEFAULT_CENTER,
    mapFilters: {
      stopGrade: {
        values: ['B'],
        renderer: 'multiColor',
        symbolPart: 'background'
      },
      trashCan: {
        values: [],
        renderer: 'blackAndWhite',
        symbolPart: 'borderColor'
      }
    },
    mapSelectedStop: null
  }

  handleFilterChange = partialFilterState => {
    const newMapFilters = {
      ...this.state.mapFilters,
      ...partialFilterState
    }
    this.setState({ mapFilters: newMapFilters })
  }

  handleMapClick = () => {
    this.setState({ mapSelectedStop: null })
  }

  handleMoveEnd = map => {
    this.setState({ mapBounds: map.getBounds() })
  }

  handleStationClick = e => {
    const { features, target: map } = e
    console.log('map zoom: ' + map.getZoom())
    if (map.getZoom() < 14) {
      // Zoom into station if zoomed out.
      const coordinates = features[0].geometry.coordinates.slice()
      map.flyTo({center: coordinates, zoom: 15})
    } else {
      this.handleStopClick(e.features[0].properties)
    }
  }

  handleStopClick = (stop, recenter) => {
    this.setSelectedStop(stop, recenter)
  }

  handleStopSidebarHover = stop => {
    if (!this.state.hoveredStop || this.state.hoveredStop.id !== stop.id) {
      this.setState({ hoveredStop: stop })
    }
  }

  handleStopsFetched = stops => {
    // If a stop id wasn't in the loaded list, add it.
    const { loadedStops, loadedStopIds } = getUpdatedStops(stops, this.state)

    console.log(`There are ${loadedStopIds.length} stops loaded.`, loadedStopIds)
    this.setState({
      loadedStopIds,
      loadedStops
    })
  }

  /**
   * Sets the selected stop. Optionally allows recentering
   * if stop is outside of map bounds.
   */
  setSelectedStop = (stop, recenter) => {
    const { mapBounds, mapCenter, mapSelectedStop } = this.state
    if (mapSelectedStop !== stop) {
      const stopCoords = [stop.lon, stop.lat]
      const shouldRecenter = recenter && !mapBounds.contains(stopCoords)
      if (shouldRecenter) console.log('Need to recenter')
      this.setState({
        mapCenter: shouldRecenter ? stopCoords : mapCenter,
        mapSelectedStop: stop
      })
    }
  }

  mapEvents = {
    onFilterChange: this.handleFilterChange,
    onStationClick: this.handleStationClick,
    onStopClick: this.handleStopClick,
    onStopSidebarHover: this.handleStopSidebarHover,
    onStopsFetched: this.handleStopsFetched
  }

  render () {
    const { hoveredStop, loadedStops, mapBounds, mapCenter, mapFilters, mapSelectedStop } = this.state
    return (
      <MapEventContext.Provider value={this.mapEvents}>
        <Router>
          <TransitRouteProvider>
            <div className='app info-visible'>
              <div className='info-pane'>
                <div>
                  <button id='collapse-button' title='Click to collapse pane.'>
                    <span></span>
                  </button>
                  <div id='info-pane-content'>
                    <Switch>
                      <Route path='/routes' component={TransitRoutes} />
                      <Route path='/route/:id' render={props => <TransitRoute activeFilters={mapFilters} {...props} />} />
                      <Route path='/stops' component={Stops} />
                      <Route path='/stop/:id' component={Stop} />
                      <Route exact path='/' component={Home}/>
                      <Redirect to="/" />
                    </Switch>
                  </div>
                </div>
              </div>
              <div className='map-pane'>
                <Map
                  center={mapCenter}
                  containerStyle={{ height: '100%', width: '100%' }}
                  onClick={this.handleMapClick}
                  onMoveEnd={this.handleMoveEnd}
                  style="mapbox://styles/mapbox/streets-v11"
                  zoom={DEFAULT_ZOOM}
                >
                  <ZoomControl/>
                  <RailLines />
                  <Route path='/route/:routeNumber?' component={RouteShape} />
                  <StopLayers
                    activeFilters={mapFilters}
                    loadedStops={loadedStops}
                    mapBounds={mapBounds}
                    symbolLists={symbolLists}
                  />
                  <HoveredStopLayer hoveredStop={hoveredStop} />
                  {mapSelectedStop && (
                    <Popup coordinates={[mapSelectedStop.lon, mapSelectedStop.lat]}>
                      <StopPopup
                        Links={CensusLinks}
                        stop={mapSelectedStop}
                      />
                    </Popup>
                  )}
                </Map>
              </div>
            </div>
          </TransitRouteProvider>
        </Router>
      </MapEventContext.Provider>
    )
  }
}

export default App
