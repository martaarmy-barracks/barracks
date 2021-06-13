const RouteLabels = ({ stop }) => {
  // Fetch the routes for that stop
  // i.e. fetch the routes for each "Substop" of this stop
  const fullStopIds = stop.csvIds ? stop.csvIds.split(",") : [stop.id];
  const shortStopIds = fullStopIds.map(function(idStr) { return getShortStopId(idStr); });

  const [fetchState, setFetchState] = useState({ stopRoutesFetched: [], stopsFetched: 0 })

  useEffect(() => {
    shortStopIds.forEach(function(shortStopId) {
      fetch(`ajax/get-stop-routes.php?stopid=${shortStopId}`)
        .then(res => res.json())
        .then(routes => {
          const { stopRoutesFetched, stopsFetched } = fetchState 
          routes.forEach(function(route) {
            // Remove duplicates on fetched routes.
            var fetchedRoutes = stopRoutesFetched.filter(function(fetched) {
              return fetched.agency_id == route.agency_id
                && fetched.route_short_name == route.route_short_name;
            });
            if (fetchedRoutes.length == 0) stopRoutesFetched.push(route);
          });
          stopsFetched++;
          setFetchState({ stopRoutesFetched, stopsFetched })

          if (stopsFetched == shortStopIds.length) {
            // TODO: sort routes, letters firt, then numbers.
            stop.routes = stopRoutesFetched;

            // Update popup content (including any links).
            if (popup) popup.setHTML(getStopDescription(stop));
          }
      })
  })
        

  // Render the route labels
  return...
}
