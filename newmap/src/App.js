import 'mapbox-gl/dist/mapbox-gl.css'
import React, { Component } from 'react'
import ReactMapboxGl, {
  Popup,
  ZoomControl
} from 'react-mapbox-gl'
import {
  HashRouter as Router,
  Switch,
  Redirect,
  Route
} from 'react-router-dom'

import MapContext from './map/map-context'
import ParkAndRides from './map/layers/park-rides'
import RailLines from './map/layers/rail-lines'
import Stations from './map/layers/stations'
import TramStations from './map/layers/tram-stations'
import TransitRoute from './route/route'
import TransitRoutes from './route/routes'
import Stop from './stop/stop'
import Stops from './stop/stops'
import Home from './ui/home'
import './App.css'
import { mapboxAccessToken } from './App.config'

const DEFAULT_CENTER = [-84.38117980957031, 33.7615242074253];
const DEFAULT_ZOOM = 10
const Map = ReactMapboxGl({
  accessToken: mapboxAccessToken
});

class App extends Component {
  state = {
    mapSelectedStopFeature: null
  }

  handleStationClick = e => {
    const { features, target: map } = e
    if (map.getZoom() < 14) {
      // Zoom into station if zoomed out.
      const coordinates = features[0].geometry.coordinates.slice();
      map.flyTo({center: coordinates, zoom: 15});
    } else {
      this.handleStopClick(e)
    }
  }

  handleStopClick = e => {
    // Set stop in state to display popup.
    this.setState({ mapSelectedStopFeature: e.features[0] })
    // callIfFunc(opts.onMarkerClicked)(stop);
  }
  
  mapContext = {
    onStationClick: this.handleStationClick,
    onStopClick:this.handleStopClick
  }

  render () {
    const { mapSelectedStopFeature } = this.state

    return (
      <Router>
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
            <MapContext.Provider value={this.mapContext}>
              <Map
                center={DEFAULT_CENTER}
                containerStyle={{ height: '100%', width: '100%' }}
                style="mapbox://styles/mapbox/streets-v11"
                zoom={[DEFAULT_ZOOM]}
              >
                <ZoomControl/>
                <Stations />
                <TramStations />
                <ParkAndRides />
                <RailLines />
                {mapSelectedStopFeature && (
                  <Popup
                    coordinates={mapSelectedStopFeature.geometry.coordinates}
                  >
                    <h1>Popup</h1>
                  </Popup>
                )}
              </Map>
            </MapContext.Provider>
          </div>
        </div>
      </Router>
    )
  }
}

export default App
