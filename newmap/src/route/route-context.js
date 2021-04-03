import{ createContext } from 'react'

const RouteContext = createContext({
  routeData: null,
  routeNumber: null,
  stopsByDirection: null
})

export default RouteContext
