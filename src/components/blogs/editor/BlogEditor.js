import React, { useState, useEffect } from 'react'
import {
  EditorState,
  RichUtils,
  convertFromRaw,
  convertToRaw,
  DefaultDraftBlockRenderMap,
  EditorBlock,
} from 'draft-js'
import Editor from '@draft-js-plugins/editor'
import { convertToHTML } from 'draft-convert'
import Immutable from 'immutable'
import createKatexPlugin from 'draft-js-katex-plugin'
import katex from 'katex'

import { CustomForwardImageBlockComponent } from './utils'
import Toolbar from './Toolbar'
import PublishModal from '../PublishModal'

import 'draft-js/dist/Draft.css'

// Create the setup to allow for latex level math
const katexPlugin = createKatexPlugin({
  katex,
  theme: {
    insertButton: 'button latex-insert-button',
  },
})
const { InsertButton } = katexPlugin
const plugins = [katexPlugin]

//
// The main blog editor component
// we create and handle the draft-js editor
//
const BlogEditor = ({ blogItem }) => {
  console.log(blogItem)

  // If we have been passed a blog item we are then editing a blog
  // convert raw into a ContentState and then set EditorState given ContentState
  const [editorState, setEditorState] = useState(
    blogItem
      ? EditorState.moveSelectionToEnd(
          EditorState.createWithContent(convertFromRaw(blogItem.content.raw))
        )
      : EditorState.createEmpty()
  )
  const [JSONContent, setJSONContent] = useState({})
  const [componentState, setComponentState] = useState({
    publishModalShown: false,
  })

  const editorRef = React.useRef(null)
  useEffect(() => {
    editorRef.current.focus()
  }, [])

  // We handle how we render the blocks, i.e. we can make H6 use a <h2> tag
  // draft-js default's paragraphs and anything else to a div
  // but our blog css styles only likes <p> so we force them to <p>
  const blockRenderMap = Immutable.Map({
    paragraph: { element: 'p' },
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
            setEditorState,
            editorState,
          },
        }
    }
  }

  const onPublishClick = e => {
    e.preventDefault()
    const content = editorState.getCurrentContent()
    const raw = convertToRaw(content)
    // const htmlRaw = convertToHTML(content)

    setJSONContent({ raw })
    setComponentState({ ...componentState, publishModalShown: true })
  }

  const focusEditor = () => editorRef.current.focus()

  const html = convertToHTML({
    blockToHTML: block => {
      // console.log(block)
      if (block.type === 'atomic:image') {
        return <img src={block.data.src} alt={block.text} />
      }
    },
  })(editorState.getCurrentContent())

  console.log(convertToRaw(editorState.getCurrentContent()))
  console.log('HTML', html)

  return (
    <div className="create-blog-wrapper">
      <div className="menu">
        <button className="ui-button-dark" onClick={onPublishClick}>
          Publish
        </button>
      </div>
      <div className="content">
        <Toolbar
          editorState={editorState}
          setEditorState={setEditorState}
          LatexInsertButton={InsertButton}
        />
        <div className="draft-wrapper">
          <div className="blog-content" onClick={() => focusEditor()}>
            <Editor
              // EditorState is the top-level state object for the editor, it is an
              // immutable record that represents the entire state of a Draft editor
              editorState={editorState}
              // The function to executed by the editor when edits and selection
              // changes occur
              onChange={setEditorState}
              // Map of block rendering configurations. Each block type maps to an element
              // tag and an optional element wrapper.
              blockRenderMap={extendedBlockRenderMap}
              // Function to define custom block rendering. This allows for higher-level
              // components to define custom React rendering for ContetnBlock objects
              blockRendererFn={customBlockRendererFn}
              placeholder="Tell a new story..."
              // Whether spellcheck is turned on. Note for OSX Safari this also enables
              // autocorrect
              spellCheck={true}
              ref={editorRef}
              plugins={plugins}
              readOnly={false}
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
            blogItem={blogItem}
          />
        ) : null}
      </div>
    </div>
  )
}

export default BlogEditor
