// General helper functions
export function not (filter) { return item => !filter(item) }

export function all (filters) { return item => filters.every(filter => filter(item)) }

// General map filters
export const activeRoute = 'active-route'

export const activeRouteOrStopZoomRange = 'active-route-or-stop-zoom-range'

export const hoveredStop = 'hovered-stop'

// Filters below should work in two ways:
// - Categories. Categories are AND'ed together (e.g. stop bus frequency AND presence of shelter).
// - Each category has mutually-exclusive options/buckets that are OR'ed for display
//   (e.g grades C, D, F, or bus frequency low, average, high). 
// 

// active|inactive stop
export function inactiveStop ({ active }) { return active === 0 || active === "0" }

export const activeStop = {
	label: 'Active stop',
	buckets: {
		active: not(inactiveStop),
		inactive: inactiveStop
	}	
}

// Bus stop census filters
export function hasCensus (stop) { return !!stop.record_id }

export const census = {
	label: 'Census',
	buckets: {
		surveyed: hasCensus,
		notSurveyed: not(hasCensus)
	}	
}
