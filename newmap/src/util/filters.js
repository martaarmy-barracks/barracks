export default {
	activeRoute: 'active-route',
	hoveredStop: 'hovered-stop',
	hasCensus: stop => stop.record_id,
	inactiveStop: ({ active }) => active === 0 || active === "0"
}

export function not(filter) { return item => !filter(item) }

export function all(filters) { return item => filters.every(filter => filter(item)) }
