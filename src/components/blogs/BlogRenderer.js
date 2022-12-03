import React, { useEffect, useRef } from 'react'
import Editor from '@draft-js-plugins/editor'
import Immutable from 'immutable'
import { DefaultDraftBlockRenderMap } from 'draft-js'

import { CustomForwardImageBlockComponent } from './editor/utils'

const BlogRenderer = ({ editorState, readOnly, plugins, ...props }) => {
  const editorRef = React.useRef(null)
  useEffect(() => {
    editorRef.current.focus()
  }, [])

  // We handle how we render the blocks, i.e. we can make H6 use a <h2> tag
  // draft-js default's paragraphs and anything else to a div
  // but our blog css styles only likes <p> so we force them to <p>
  const blockRenderMap = Immutable.Map({
    paragraph: {
      element: 'p',
    },
    unstyled: {
      element: 'div',
    },
  })
  // We don't want to overwrite the whole draft-js render block map
  // but just to extend it to contain our new values
  // See https://draftjs.org/docs/advanced-topics-custom-block-render-map/
  const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(
    blockRenderMap
  )

  // Custom block renderer function, used for our internal special blocks
  const customBlockRendererFn = contentBlock => {
    const type = contentBlock.getType()
    switch (type) {
      case 'atomic:image':
        return {
          component: CustomForwardImageBlockComponent,
          editable: false,
          props: {
            editorState,
          },
        }
    }
  }

  const getBlockStyle = block => {
    switch (block.getType()) {
      case 'code-block':
        const syntax = block.getData().get('syntax')
        if (syntax) {
          return `language-${syntax}`
        }
        return null
      default:
        return null
    }
  }

  const focusEditor = () => editorRef.current.focus()
  const spellCheck = !readOnly
  return (
    <div className="blog-rendered" onClick={() => focusEditor()}>
      <Editor
        // Map of block rendering configurations. Each block type maps to an element
        // tag and an optional element wrapper.
        blockRenderMap={extendedBlockRenderMap}
        // Function to define custom block rendering. This allows for higher-level
        // components to define custom React rendering for ContetnBlock objects
        blockRendererFn={customBlockRendererFn}
        // Function that allows to define class names to apply to the given
        // block when it is rendered.
        blockStyleFn={getBlockStyle}
        editorState={editorState}
        placeholder="Tell a new story..."
        readOnly={readOnly}
        spellCheck={spellCheck}
        ref={editorRef}
        plugins={plugins}
        {...props}
      />
    </div>
  )
}

export default BlogRenderer
