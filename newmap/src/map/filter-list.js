import React, { Component, Fragment } from 'react'
import { MapEventContext } from './map-context'

const filterListContents = {
  // Individual census attributes
  stopGrade: {
    // Grade: A B C D F => Circle with grade shown inside.
    label: 'Stop grade',
    options: ['A', 'B', 'C', 'D', 'F'],
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

const renderers = {
  color: {
    blackAndWhite: {
      label: 'Black and white',
      //condition: options => options.length === 2,
      render: (options, value) => value === options[0] ? '#000000' : '#FFFFFF'
    },
    multiColor: {
      label: 'Multi-color',
      render: (options, value) => {
        const colors = ['#00FF00', '#000088', '#FFFF00', '#FF00FF', '#FF0000']
        let index = options.indexOf(value)
        if (index === -1) index = colors[colors.length - 1]
        return colors[index]
      }
    }
  }
}

/**
 * Renders a list of layers showing the graphical parts of the transit stops.
 * Each #part below can render one stop attribute.
 * - #background (typically one solid color, TODO: support two colors like the contrast icon)
 * - border
 *   - #color
 *   - #line style
 *   - #thickness
 * - #content (typically a symbol)
 *
 * Each bus stop attribute needs mapper functions into content/symbol, color, thickness, line style.
 * If a mapper function is not provided, then the stop attribute cannot be rendered in that graphical part.
 */
const symbolParts = {
  background: {
    label: 'Stop background',
    type: 'color'
    //colors: ['Black', 'Brown', 'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Pink', 'White']
    // Define multiple color series
    // discrete (continuous is possible but be careful)
    // example: A => Red, B =>
  },
  borderColor: {
    label: 'Stop border color',
    type: 'color'
  },
  borderStyle: {
    label: 'Stop border style',
    type: 'pattern'
    // discrete, supports up to 3 values
    // 'solid', 'dashed', 'dotted'
    // example: safest, safe, less safe.
  },
  borderWidth: {
    label: 'Stop border width',
    type: 'width'
    // discrete (continuous is possible but be careful)
    // example: Core => 4, Basic => 2, Infrequent => 1 or 0
  },
  content: {
    label: 'Stop content',
    type: 'symbol'
    // discrete
    // example: A, B, C, emoji or symbols.
  }
}


/**
 * Renders a list of filters. Active filters appear checked.
 */
const FilterList = ({ activeFilters }) => (
  <div>
    <p>Filter options</p>
    <ul>
      {Object.keys(filterListContents).map(k => {
        const filter = activeFilters && activeFilters[k]
        return filter && (
          <li key={k}>
            <FilterListItem
              filter={filter}
              filterData={filterListContents[k]}
              name={k}
            />
          </li>
        )}
      )}
    </ul>
    <p><button>Load all stops</button></p>
  </div>
)

/**
 * Component for each filter criterion.
 */
class FilterListItem extends Component {
  static contextType = MapEventContext

  handleFilterChange = e => {
    const { filter, name } = this.props
    const { checked, value } = e.target
    let newOptions = [].concat(filter.values)

    if (checked) {
      newOptions.push(value)
    } else {
      newOptions = newOptions.filter(o => o !== value)
    }

    this.context.onFilterChange({ [name]: {...filter, values: newOptions} })
  }

  handleRendererChange = e => {
    const { filter, name } = this.props
    this.context.onFilterChange({ [name]: {...filter, renderer: e.target.value} })
  }

  handleSymbolPartChange = e => {
    const { filter, name } = this.props
    this.context.onFilterChange({ [name]: {...filter, symbolPart: e.target.value} })
  }

  render () {
    const { filter, filterData, name } = this.props
    const { renderer, symbolPart, values } = filter
    const { label, options } = filterData
    const symbolPartType = symbolParts[symbolPart].type
    const renderersForSymbolPart = renderers[symbolPartType]
    const renderFunc = renderersForSymbolPart[renderer].render
    return (
      <table>
        <tbody>
          <tr>
            <td>{label}</td>
            {options.map(o => {
              const isChecked = values.includes(o)
              return (
                <td key={o}>
                  <input
                    checked={isChecked}
                    name={name}
                    onChange={this.handleFilterChange}
                    type='checkbox'
                    value={o}
                  />
                  {o}
                </td>
              )
            })}
          </tr>
          <tr>
            <td>
              <select onChange={this.handleSymbolPartChange} value={symbolPart}>
                <option value='null'>Do not render</option>
                {Object.keys(symbolParts).map(k => (
                  <option key={k} value={k}>{symbolParts[k].label}</option>
                ))}
              </select>
              <br/>
              <select onChange={this.handleRendererChange} value={renderer}>
                {Object.keys(renderersForSymbolPart).map(k => (
                  <option key={k} value={k}>{renderersForSymbolPart[k].label}</option>
                ))}
              </select>
            </td>
            {options.map(o => {
              const isChecked = values.includes(o)
              return (
                <td key={o} style={{
                  backgroundColor: isChecked ? renderFunc(options, o) : 'transparent',
                  border: '1px solid #DDDDDD'
                }} />
              )
            })}
          </tr>
        </tbody>
      </table>
    )
  }
}

export default FilterList
