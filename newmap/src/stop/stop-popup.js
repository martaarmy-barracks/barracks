import React from 'react'

import RouteLabels from './route-labels'

function getStopDescription(stop) {
  var stopRoutesFetched = [];
  var stopsFetched = 0;
  var fullStopIds = stop.csvIds ? stop.csvIds.split(",") : [stop.id];
  var shortStopIds = fullStopIds.map(function(idStr) { return getShortStopId(idStr); });
  var routeLabels = "[Routes]";
  if (stop.routes) {
    routeLabels = getRouteLabels(stop.routes);
  }
  else {
    // Get routes.
    shortStopIds.forEach(function(shortStopId) {
      $.ajax({
        url: "ajax/get-stop-routes.php?stopid=" + shortStopId,
        dataType: 'json',
        success: function (routes) {
          routes.forEach(function(route) {
            // Remove duplicates on fetched routes.
            var fetchedRoutes = stopRoutesFetched.filter(function(fetched) {
              return fetched.agency_id == route.agency_id
                && fetched.route_short_name == route.route_short_name;
            });
            if (fetchedRoutes.length == 0) stopRoutesFetched.push(route);
          });
          stopsFetched++;
          if (stopsFetched == shortStopIds.length) {
            // TODO: sort routes, letters firt, then numbers.
            stop.routes = stopRoutesFetched;

            // Update popup content (including any links).
            if (popup) popup.setHTML(getStopDescription(stop));
          }
        }
      });
      // Get departures.
      /*
      $.ajax({
        url: "https://barracks.martaarmy.org/ajax/get-next-departures.php?stopid=" + shortStopId,
        dataType: 'json',
        success: function(departures) {
          // Sort routes, letters firt, then numbers.

          m.routes = routes;
          $("#routes").html(getRouteLabels(routes));
        }
      });
      */
    });
  }

  var stopTitle = stop.name + " (" + shortStopIds.join(", ") + ")";
  var s = "<div class='stop-name'>" + stopTitle + "</div><div class='stop-info'>";

  // Route labels
  if (!filters.inactiveStop(stop)) {
    if (isFinite(shortStopIds[0]) || stop.routes && stop.routes.length) {
      s += "<div><span id='routes'>" + routeLabels + "</span>";
      s += " <a id='arrivalsLink' target='_blank' href='stopinfo.php?sids=" + fullStopIds.join(",") + "&title=" + encodeURIComponent(stopTitle) + "'>Arrivals</a></div>";
    }
  }
  else {
    s += "<div><span style='background-color: #ff0000; color: #fff'>No service</span></div>";
  }

  // Stop amenities (streetcar only).
  if (isStreetcarStop(stop)) {
    var amenityLabels = "";
    Object.values(stopAmenities.tram).forEach(function(a) {
      amenityLabels += "<li><span aria-label='" + a.shortText + "' title='" + a.longText + "'>" + a.contents + "</li>";
    });
    s += "<div>Amenities (<a href='atlsc-stop-amenities.php' target='_blank'>learn more</a>):<ul class='popup-amenities inline-list'>" + amenityLabels + "</span></ul></div>";
  }

  // Custom content
  var content = callIfFunc(opts.onGetContent)(stop) || {};
  if (content.links) s += "<div>" + content.links + "</div>";
  if (content.description) s += "<div>" + content.description + "</div>";
  s += "</div>";

  return s;
}

const StopPopup = ({ Description, Links, stop }) => {
  const { name } = stop
  return (
    <div>
      <h1 className='stop-name'>{name}</h1>
      {/* Insert routes */}
      <RouteLabels stop={stop} />
      <div className='stop-info'>
        {Links && <Links stop={stop} />}
        {Description && <Description stop={stop} />}
      </div>
    </div>
  )
}

export default StopPopup
