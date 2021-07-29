import React, { Component, Fragment } from 'react'
import { MapEventContext } from './map-context'

export const ALL_VALUES = '$all$'

const filterListContents = {
  // Individual census attributes
  stopGrade: {
    // Grade: A B C D F => Circle with grade shown inside.
    label: 'Stop grade',
    options: ['A', 'B', 'C', 'D', 'F'],
    // TODO: how to render
  },
  trash_can: {
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
 * Returns the renderer function for the given filter.
 */
export function getRenderer (filter, symbolPart) {
  const { renderer } = filter
  const symbolPartType = symbolParts[symbolPart].type
  const renderersForSymbolPart = renderers[symbolPartType]
  return renderersForSymbolPart[renderer].render
}

/**
 * Returns the options for the given filter.
 */
export function getOptions (filterName) {
  return filterListContents[filterName].options
}

/**
 * Renders a list of filters. Active filters appear checked.
 */
const FilterList = ({ activeFilters, mapSymbols }) => (
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
    <p>Render options</p>
    <ul>
      {Object.keys(symbolParts).map(k => (
        <li key={k}>
          <RenderListItem
            mapSymbol={mapSymbols[k]}
            symbolPart={k}
          />
        </li>
      ))}
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
    let newOptions = filter.values.filter(v => v !== ALL_VALUES)

    if (checked) {
      newOptions.push(value)
    } else {
      newOptions = newOptions.filter(o => o !== value)
    }

    this.context.onFilterChange({ [name]: {...filter, values: newOptions} })
  }

  render () {
    const { filter, filterData, name } = this.props
    const { values } = filter
    const { label, options } = filterData
    return (
      <>
        {label}
        {options.map(o => (
          <Fragment key={o}>
            <input
              checked={values.includes(o)}
              name={name}
              onChange={this.handleFilterChange}
              type='checkbox'
              value={o}
            />
            {o}
          </Fragment>
        ))}
      </>
    )
  }
}

/**
 * Component for each symbol part render criterion.
 */
 class RenderListItem extends Component {
  static contextType = MapEventContext

  handleRendererChange = e => {
    const { mapSymbol, symbolPart } = this.props
    this.context.onMapSymbolChange({ [symbolPart]: {...mapSymbol, renderer: e.target.value} })
  }

  handleSymbolFieldChange = e => {
    const {  mapSymbol, symbolPart } = this.props
    this.context.onMapSymbolChange({ [symbolPart]: {...mapSymbol, field: e.target.value} })
  }

  render () {
    const { mapSymbol, symbolPart } = this.props
    const shouldRenderValues = !!symbolParts[symbolPart]
    const symbolPartType = shouldRenderValues && symbolParts[symbolPart]?.type
    const renderersForSymbolPart = shouldRenderValues && renderers[symbolPartType]
    return (
      <table>
        <tbody>
          <tr>
            <td>{symbolPart}</td>
          </tr>
          <tr>
            <td>
              <select onChange={this.handleSymbolFieldChange} value={mapSymbol?.field}>
                <option value={null}>Not rendered</option>
                {Object.keys(filterListContents).map(k => (
                  <option key={k} value={k}>{filterListContents[k].label}</option>
                ))}
              </select>
              {mapSymbol?.field && (
                <select onChange={this.handleRendererChange} value={mapSymbol?.renderer}>
                  <option value={null}>Not rendered</option>
                  {renderersForSymbolPart && Object.keys(renderersForSymbolPart).map(k => (
                    <option key={k} value={k}>{renderersForSymbolPart[k].label}</option>
                  ))}
                </select>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    )
  }
}

export default FilterList
