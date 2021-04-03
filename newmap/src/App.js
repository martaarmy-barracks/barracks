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
import RailLines from './map/layers/rail-lines'
import RouteShape from './map/layers/route-shape'
import Stations from './map/layers/stations'
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

const RouteShapeWithMap = withMap(RouteShape)

class App extends Component {
  state = {
    mapSelectedStopFeature: null
  }

  handleStationClick = e => {
    const { features, target: map } = e
    console.log('map zoom: ' + map.getZoom())
    if (map.getZoom() < 14) {
      // Zoom into station if zoomed out.
      const coordinates = features[0].geometry.coordinates.slice();
      map.flyTo({center: coordinates, zoom: 15});
    } else {
      this.handleStopClick(e)
    }
  }

  handleStopClick = e => {
    this.setSelectedStop(e.features[0])
    // callIfFunc(opts.onMarkerClicked)(stop);
    e.preventDefault()
  }

  setSelectedStop = feature => {
    if (this.state.mapSelectedStopFeature !== feature) {
      this.setState({ mapSelectedStopFeature: feature })
    }
  }
  
  mapContext = {
    onStationClick: this.handleStationClick,
    onStopClick:this.handleStopClick
  }

  render () {
    const { mapSelectedStopFeature } = this.state

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
              <MyMapContext.Provider value={this.mapContext}>
                <Map
                  center={DEFAULT_CENTER}
                  containerStyle={{ height: '100%', width: '100%' }}
                  style="mapbox://styles/mapbox/streets-v11"
                  zoom={DEFAULT_ZOOM}
                >
                  <ZoomControl/>
                  <Stations />
                  <TramStations />
                  <ParkAndRides />
                  <RailLines />
                  <Switch>
                    <Route path='/route/:id' component={RouteShapeWithMap} />
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
