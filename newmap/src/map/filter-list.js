import React, { Component, Fragment } from 'react'
import { MapEventContext } from './map-context'

const filterListContents = {
  // Individual census attributes
  stopGrade: {
    // Grade: A B C D F => Circle with grade shown inside.
    label: 'Stop grade',
    options: ['A', 'B', 'C', 'D', 'F']
    // TODO: how to render
  },
  trashCan: {
    // Trash can:yes/no
    label: 'Trash can',
    options: ['Yes', 'No']
    // TODO: how to render
  }
/*  
- Accessible
- Traffic light
- Crosswalk
- Sidewalk
- Shelter
- Seating

Other bus stop attributes
- Frequency: sparse, basic (30m-30m), core (15m-30m) => border thickness?
*/
}

/**
 * Renders a list of filters. Active filters appear checked.
 */
class FilterList extends Component {
  static contextType = MapEventContext

  handleFilterChange = e => {
    const { activeFilters } = this.props
    const key = e.target.name
    const value = e.target.value
    let newOptions = activeFilters ? [].concat(activeFilters[key]) : []

    if (e.target.checked) {
      newOptions.push(value)
    } else {
      newOptions = newOptions.filter(o => o !== value)
    }

    this.context.onFilterChange({ [key]: newOptions })
  }

  render () {
    const { activeFilters } = this.props
    return (
      <div>
        <p>Filter options</p>
        <ul>
          {Object.keys(filterListContents).map(k => {
            const e = filterListContents[k]
            return (
              <li key={k}>
                {e.label}
                {' '}
                {e.options.map(o => {
                  const isChecked = activeFilters && activeFilters[k]?.includes(o)
                  return <Fragment key={o}><input checked={isChecked} name={k} onChange={this.handleFilterChange} type='checkbox' value={o} />{o}{' '}</Fragment>
                })}
              </li>
            )}
          )}
        </ul>
        <p><button>Load all stops</button></p>
      </div>
    )
  }
}

export default FilterList
