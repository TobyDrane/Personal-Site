import React from 'react'

const ToolbarButton = ({ active, onMouseDown, text }) => (
  <button
    className={`button ${active ? 'active' : ''}`}
    onMouseDown={onMouseDown}
  >
    <p>{text}</p>
  </button>
)

export default ToolbarButton
