export default {
	inactiveStop: ({ active }) => active === 0 || active === "0"
}

export function not(filter) { return item => !filter(item) }
