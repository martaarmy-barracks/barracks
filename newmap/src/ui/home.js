import React from 'react'
import {
  Link
} from 'react-router-dom'
  
const Home = () => (
    <div>
        <h1>Welcome!</h1>
        <ul>            
            <li><Link to="/routes">Routes</Link></li>
            <li><Link to="/route/73">Route 73</Link></li>
            <li><Link to="/stops">Stops</Link></li>
            <li><Link to="/stop/901789">Stop 901789</Link></li>
        </ul>


    </div>
)

export default Home
