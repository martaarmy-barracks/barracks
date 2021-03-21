import 'mapbox-gl/dist/mapbox-gl.css'
import React, { Component } from 'react'
import ReactMapboxGl, {
  Feature,
  Layer,
  ScaleControl,
  ZoomControl
} from 'react-mapbox-gl'
import {
  HashRouter as Router,
  Switch,
  Redirect,
  Route
} from 'react-router-dom'

import RailLines from './map/layers/rail-lines'
import TransitRoute from './route/route'
import TransitRoutes from './route/routes'
import Stop from './stop/stop'
import Stops from './stop/stops'
import Home from './ui/home'
import './App.css'
import { mapboxAccessToken } from './App.config.js'

const defaultCenter = [-84.38117980957031, 33.7615242074253];
const Map = ReactMapboxGl({
  accessToken: mapboxAccessToken
});

class App extends Component {
  render () {
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
            <Map
              center={defaultCenter}
              style="mapbox://styles/mapbox/streets-v11"
              zoom={[10]}
              containerStyle={{
                height: '100%',
                width: '100%'
              }}>
                <ScaleControl />
                <ZoomControl/>
                <RailLines />
                <Layer
                  type="symbol"
                  id="marker"
                  layout={{ "icon-image": "marker-15" }}>
                  <Feature coordinates={defaultCenter}/>
                </Layer>
            </Map>
          </div>
        </div>
      </Router>
    )
  }
}

export default App
