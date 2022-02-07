import { Component } from 'react'

import withMap from './with-map'

/**
 * Listens to changes to showInfoPane state prop to imperatively trigger a map resize.
 */
class MapResizer extends Component {
  componentDidUpdate(prevProps) {
    if (prevProps.showInfoPane !== this.props.showInfoPane) {
      this.props.map.resize();
    }
  }

  render() {
    return null;
  }
}

export default withMap(MapResizer)
