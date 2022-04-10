import React from 'react'
import { EditorState, EditorBlock } from 'draft-js'

// Gets the current block type based on the current editor state selection
export const getCurrentBlock = editorState => {
  const selectionState = editorState.getSelection()
  const contentState = editorState.getCurrentContent()
  const block = contentState.getBlockForKey(selectionState.getStartKey())
  return block
}

// Adds a new custom block type to the current editor state
export const addNewBlock = (editorState, newType, initialData) => {
  const selectionState = editorState.getSelection()
  if (!selectionState.isCollapsed()) {
    return editorState
  }

  const contentState = editorState.getCurrentContent()
  const key = selectionState.getStartKey()
  const blockMap = contentState.getBlockMap()
  const currentBlock = getCurrentBlock(editorState)
  if (!currentBlock) {
    return editorState
  }

  if (currentBlock.getLength() === 0) {
    // If the current block type is the same as the new block just return
    if (currentBlock.getType() === newType) {
      return editorState
    }

    // Merge the new block onto the current block
    const newBlock = currentBlock.merge({
      type: newType,
      data: initialData,
    })

    // Create a new editor content state based on new merged blocks
    const newContentState = contentState.merge({
      blockMap: blockMap.set(key, newBlock),
      selectionAfter: selectionState,
    })

    // Push new content state back to the edit state
    return EditorState.push(editorState, newContentState, 'change-block-type')
  }
  return editorState
}

export const CustomForwardImageBlockComponent = React.forwardRef(
  (props, ref) => {
    const { block, blockProps } = props
    const { editorState } = blockProps
    const data = block.getData()
    const src = data.get('src')
    if (src !== null) {
      return (
        <div>
          <div>
            <img
              style={{
                width: '50%',
                display: 'block',
                marginRight: 'auto',
                marginLeft: 'auto',
              }}
              role="presentation"
              src={src}
            />
          </div>
        </div>
      )
    }

    return <EditorBlock {...props} />
  }
)
