import React from 'react'

export const Levels = ({ levels }) =>
  (levels && levels > 0)
    ? Array(levels).fill(true).map((e, i) => <span className='diagram-line' key={i} />)
    : null
