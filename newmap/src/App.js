import React, { Component } from 'react'
import {
  HashRouter as Router,
  Switch,
  Redirect,
  Route
} from 'react-router-dom'

import TransitRoute from './route/route'
import TransitRoutes from './route/routes'
import Stop from './stop/stop'
import Stops from './stop/stops'
import Home from './ui/home'
import './App.css'

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
              <div id='master-map' className='fill'></div>
          </div>
        </div>
      </Router>
    )
  }
}

export default App
