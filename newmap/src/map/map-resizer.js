import { Component } from 'react'

import withMap from './with-map'

/**
 * Listens to changes to showInfoPane state prop to imperatively trigger a map resize.
 */
class MapResizer extends Component {
  componentDidUpdate(prevProps) {
    if (prevProps.showInfoPane !== this.props.showInfoPane) {
      // Delay resizing to allow CSS transitions to complete.
      setTimeout(() => this.props.map.resize(), 250);
    }
  }

  render() {
    return null;
  }
}

export default withMap(MapResizer)
