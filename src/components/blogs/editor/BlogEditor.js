import React, { useState, useEffect } from 'react'
import {
  Editor,
  EditorState,
  RichUtils,
  convertFromRaw,
  convertToRaw,
  DefaultDraftBlockRenderMap,
} from 'draft-js'
import { convertToHTML } from 'draft-convert'
import Immutable from 'immutable'
import PublishModal from '../PublishModal'

import 'draft-js/dist/Draft.css'

// Generic Toolbar Button HTML element
const ToolbarButton = ({ active, onMouseDown, text }) => {
  return (
    <button
      className={`button ${active ? 'active' : ''}`}
      onMouseDown={onMouseDown}
    >
      <p>{text}</p>
    </button>
  )
}

// Creates a new control for a Draft-js block
const BlockStyleControls = ({ editorState, onToggle }) => {
  // These correspond to the default Draft-js block render map
  // https://draftjs.org/docs/advanced-topics-custom-block-render-map/
  const BLOCK_TYPES = [
    { style: 'header-one', text: 'H1' },
    { style: 'header-two', text: 'H2' },
    { style: 'header-three', text: 'H3' },
    { style: 'blockquote', text: '" "' },
  ]

  const selection = editorState.getSelection()
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType()

  return (
    <>
      {BLOCK_TYPES.map(type => (
        <span key={`${type.style.toLowerCase()}-btn`}>
          <ToolbarButton
            active={type.style === blockType}
            text={type.text}
            onMouseDown={e => {
              e.preventDefault()
              onToggle(type.style)
            }}
          />
        </span>
      ))}
    </>
  )
}

// Controls to handle the inline styling of the draft js content
const InlineStyleControls = ({ editorState, onToggle }) => {
  const INLINE_TYPES = [
    { style: 'BOLD', text: 'B' },
    { style: 'ITALIC', text: 'I' },
    { style: 'UNDERLINE', text: 'U' },
  ]

  const currentStyle = editorState.getCurrentInlineStyle()

  return (
    <>
      {INLINE_TYPES.map(type => (
        <span key={`${type.style.toLowerCase()}-btn`}>
          <ToolbarButton
            active={currentStyle.has(type.style)}
            text={type.text}
            uniqueKey={`${type.style.toLowerCase()}-btn`}
            onMouseDown={e => {
              e.preventDefault()
              onToggle(type.style)
            }}
          />
        </span>
      ))}
    </>
  )
}

//
// The main blog editor component
// we create and handle the draft-js editor
//
const BlogEditor = ({ blogItem }) => {
  // If we have been passed a blog item we are then editing a blog
  // convert raw into a ContentState and then set EditorState given ContentState
  const [editorState, setEditorState] = useState(
    blogItem
      ? EditorState.createWithContent(convertFromRaw(blogItem.content.raw))
      : EditorState.createEmpty()
  )
  const [JSONContent, setJSONContent] = useState({})
  const [componentState, setComponentState] = useState({
    publishModalShown: false,
  })

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
  const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(
    blockRenderMap
  )

  const onPublishClick = e => {
    e.preventDefault()
    const content = editorState.getCurrentContent()
    const raw = convertToRaw(content)
    const htmlRaw = convertToHTML(content)

    setJSONContent({ raw, htmlRaw })
    setComponentState({ ...componentState, publishModalShown: true })
  }

  return (
    <div className="create-blog-wrapper">
      <div className="menu">
        <button className="button-publish" onClick={onPublishClick}>
          Publish
        </button>
      </div>
      <div className="content">
        <div className="toolbar">
          <InlineStyleControls
            editorState={editorState}
            onToggle={inlineStyle => {
              const newState = RichUtils.toggleInlineStyle(
                editorState,
                inlineStyle
              )
              setEditorState(newState)
            }}
          />
          <BlockStyleControls
            editorState={editorState}
            onToggle={blockType => {
              const newState = RichUtils.toggleBlockType(editorState, blockType)
              setEditorState(newState)
            }}
          />
        </div>
        <div className="draft-wrapper">
          <div className="blog-content">
            <Editor
              editorState={editorState}
              onChange={setEditorState}
              blockRenderMap={extendedBlockRenderMap}
              placeholder="Tell a new story..."
            />
          </div>
        </div>

        {componentState.publishModalShown ? (
          <PublishModal
            isShown={componentState.publishModalShown}
            onRequestClose={() =>
              setComponentState({ ...componentState, publishModalShown: false })
            }
            JSONContent={JSONContent}
          />
        ) : null}
      </div>
    </div>
  )
}

export default BlogEditor
