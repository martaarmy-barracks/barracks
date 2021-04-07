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

import MyMapContext from './map/map-context'
import withMap from './map/with-map'
import ParkAndRides from './map/layers/park-rides'
import parkRideData from './map/layers/park-ride-data'
import RailLines from './map/layers/rail-lines'
import RouteShape from './map/layers/route-shape'
import Stations from './map/layers/stations'
import stationData from './map/layers/station-data'
import StopLayer from './map/layers/stops'
import TramStations from './map/layers/tram-stations'
import TransitRoute from './route/route'
import TransitRouteProvider from './route/route-provider'
import TransitRoutes from './route/routes'
import Stop from './stop/stop'
import Stops from './stop/stops'
import Home from './ui/home'
import './App.css'
import { mapboxAccessToken } from './App.config'

const DEFAULT_CENTER = [-84.38117980957031, 33.7615242074253];
const DEFAULT_ZOOM = [10]
const Map = ReactMapboxGl({
  accessToken: mapboxAccessToken
});

function getUpdatedStops (stops, state) {
  const { loadedStops, loadedStopIds } = state
  const newLoadedStopIds = [].concat(loadedStopIds)
  const newLoadedStops = [].concat(loadedStops)
  stops.forEach(function(s) {
    if (newLoadedStopIds.indexOf(s.id) == -1) {
      newLoadedStopIds.push(s.id);
      newLoadedStops.push(s);
    }
  });

  return {
    loadedStopIds: newLoadedStopIds,
    loadedStops: newLoadedStops
  }
}

let initialStopState = {
  loadedStopIds: [],
  loadedStops: []
}
initialStopState = getUpdatedStops(parkRideData, initialStopState)
initialStopState = getUpdatedStops(stationData, initialStopState)

class App extends Component {
  state = {
    // id, name, lat, lon, and more...
    ...initialStopState,
    mapBounds: null,
    mapSelectedStopFeature: null
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
      this.handleStopClick(e)
    }
  }

  handleStopClick = e => {
    this.setSelectedStop(e.features[0])
    // callIfFunc(opts.onMarkerClicked)(stop);
    e.preventDefault()
  }

  handleStopsFetched = stops => {
    // If a stop id wasn't in the loaded list, add it.
    const { loadedStops, loadedStopIds } = getUpdatedStops (stops, this.state)
    
    console.log(`There are ${loadedStopIds.length} stops loaded.`, loadedStopIds)
    this.setState({
      loadedStopIds,
      loadedStops
    })
  }

  setSelectedStop = feature => {
    if (this.state.mapSelectedStopFeature !== feature) {
      this.setState({ mapSelectedStopFeature: feature })
    }
  }
  
  render () {
    const { loadedStops, mapBounds, mapSelectedStopFeature } = this.state
    const mapContext = {
      loadedStops,
      mapBounds,
      onStationClick: this.handleStationClick,
      onStopClick: this.handleStopClick,
      onStopsFetched: this.handleStopsFetched
    }
  
    return (
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
                    <Route path='/route/:id' component={TransitRoute} />
                    <Route path='/stops' component={Stops} />
                    <Route path='/stop/:id' component={Stop} />
                    <Route exact path='/' component={Home}/>
                    <Redirect to="/" />
                  </Switch>
                </div>
              </div>
            </div>
            <div className='map-pane'>
              <MyMapContext.Provider value={mapContext}>
                <Map
                  center={DEFAULT_CENTER}
                  containerStyle={{ height: '100%', width: '100%' }}
                  onMoveEnd={this.handleMoveEnd}
                  style="mapbox://styles/mapbox/streets-v11"
                  zoom={DEFAULT_ZOOM}
                >
                  <ZoomControl/>
                  <Stations />
                  <TramStations />
                  <ParkAndRides />
                  <RailLines />
                  <StopLayer />
                  <Switch>
                    <Route path='/route/:id' component={RouteShape} />
                  </Switch>
                  {mapSelectedStopFeature && (
                    <Popup
                      coordinates={mapSelectedStopFeature.geometry.coordinates}
                    >
                      <h1>Popup</h1>
                    </Popup>
                  )}
                </Map>
              </MyMapContext.Provider>
            </div>
          </div>
        </TransitRouteProvider>
      </Router>
    )
  }
}

export default App
