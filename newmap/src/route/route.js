import React, { useContext } from 'react'
import {
  NavLink,
  Redirect,
  Route,
  Switch
} from 'react-router-dom'

import RouteContext from './route-context'
import RouteDiagram from './route-diagram'
import RouteLabel from './route-label'

const DIRECTIONS = {
	N: 'Northbound',
	S: 'Southbound',
	E: 'Eastbound',
	W: 'Westbound'
}

const RoutePane = ({ match }) => {
  const { routeData, stopsByDirection } = useContext(RouteContext)
  if (stopsByDirection) {
    const tabs = [
      {
        text: 'Overview',
        path: '',
        getContent: () => <div>Route overview</div>
      },
      ...Object.values(stopsByDirection).map(d => {
        const text = DIRECTIONS[d.direction]
        return {
          text,
          path: `/${text.toLowerCase()}`,
          getContent: () => <RouteDiagram directionObj={d} route={routeData} />
        }
      })
    ]

    return (
      <>
        <div className='info-pane-header'>
          <h2><RouteLabel route={routeData} /></h2>
          <div>{routeData.route_long_name || ""}</div>
        </div>
        <ul className='route-tabs'>
          {tabs.map(t => (
            <li key={t.text}>
              <NavLink activeClassName='selected' exact to={`${match.url}${t.path}`}>{t.text}</NavLink>
            </li>
          ))}
        </ul>
        <Switch>
          {tabs.map(t => (
            <Route exact key={t.text} path={`${match.path}${t.path}`}>
              <div>{t.getContent()}</div>
            </Route>
          ))}
          <Redirect to={match.url} />
        </Switch>
      </>
    )
  } else {
    return <p>No route data</p>
  }
}

export default RoutePane
