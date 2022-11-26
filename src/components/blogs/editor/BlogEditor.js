import React, { useState, useEffect } from 'react'
import {
  EditorState,
  RichUtils,
  convertFromRaw,
  convertToRaw,
  DefaultDraftBlockRenderMap,
  Modifier,
  getDefaultKeyBinding,
} from 'draft-js'
import { navigate } from 'gatsby'
import Editor from '@draft-js-plugins/editor'
import createKatexPlugin from 'draft-js-katex-plugin'
import CodeUtils from 'draft-js-code'
import PrismDecorator from 'draft-js-prism'
import Prism from 'prismjs'
import { convertToHTML } from 'draft-convert'
import Immutable from 'immutable'
import katex from 'katex'
import { Button } from '@mantine/core'

import { CustomForwardImageBlockComponent } from './utils'
import Toolbar from './Toolbar'
import PublishModal from '../PublishModal'

import 'draft-js/dist/Draft.css'
import BlogRenderer from '../BlogRenderer'

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

  // We handle how we render the blocks, i.e. we can make H6 use a <h2> tag
  // draft-js default's paragraphs and anything else to a div
  // but our blog css styles only likes <p> so we force them to <p>
  const blockRenderMap = Immutable.Map({
    paragraph: { element: 'p' },
    unstyled: { element: 'div', aliasedElements: ['p'] },
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

  const handleKeyCommand = command => {
    let newState
    if (CodeUtils.hasSelectionInBlock(editorState)) {
      newState = CodeUtils.handleKeyCommand(editorState, command)
    }

    if (!newState) {
      newState = RichUtils.handleKeyCommand(editorState, command)
    }

    if (newState) {
      onChange(newState)
      return 'handled'
    }

    return 'not-handled'
  }

  const keyBindingFn = e => {
    if (!CodeUtils.hasSelectionInBlock(editorState)) {
      return getDefaultKeyBinding(e)
    }
    const command = CodeUtils.getKeyBinding(e)
    return command || getDefaultKeyBinding(e)
  }

  const handleReturn = e => {
    e.preventDefault()
    if (!CodeUtils.hasSelectionInBlock(editorState)) {
      return 'not-handled'
    }
    onChange(CodeUtils.handleReturn(e, editorState))
    return 'handled'
  }

  const handleTab = e => {
    e.preventDefault()
    console.log('tab called')
    if (!CodeUtils.hasSelectionInBlock(editorState)) {
      return 'not-handled'
    }
    onChange(CodeUtils.onTab(e, editorState))
    return 'handled'
  }

  const onPublishClick = e => {
    e.preventDefault()
    const content = editorState.getCurrentContent()
    const raw = convertToRaw(content)
    // const htmlRaw = convertToHTML(content)

    setJSONContent({ raw })
    setComponentState({ ...componentState, publishModalShown: true })
  }

  const html = convertToHTML({
    blockToHTML: block => {
      // console.log(block)
      if (block.type === 'atomic:image') {
        return <img src={block.data.src} alt={block.text} />
      }
    },
  })(editorState.getCurrentContent())

  const getBlockStyle = block => {
    switch (block.getType()) {
      case 'code-block':
        return 'language-'
      default:
        return null
    }
  }

  const onChange = newState => {
    const decorator = new PrismDecorator({
      prism: Prism,
      defaultSyntax: 'javascript',
    })
    setEditorState(EditorState.set(newState, { decorator }))
  }

  const onInlineStyleToggle = inlineStyle => {
    onChange(RichUtils.toggleInlineStyle(editorState, inlineStyle))
  }

  const onBlockStyleToggle = blockType => {
    if (
      blockType === 'code-block' &&
      CodeUtils.hasSelectionInBlock(editorState)
    ) {
      const content = editorState.getCurrentContent()
      const selection = editorState.getSelection()
      const split = Modifier.splitBlock(content, selection)
      onChange(EditorState.push(editorState, split, 'split-block'), blockType)
    } else {
      onChange(RichUtils.toggleBlockType(editorState, blockType))
    }
  }

  // console.log(convertToRaw(editorState.getCurrentContent()))
  // console.log('HTML', html)

  return (
    <div className="blog-wrapper">
      <div className="menu">
        <Button
          color="dark"
          size="xs"
          variant="outline"
          onClick={() => {
            navigate('/create-blog')
          }}
        >
          Home
        </Button>
        <Button color="dark" size="xs" onClick={onPublishClick}>
          Publish
        </Button>
      </div>
      <div className="content">
        <Toolbar
          editorState={editorState}
          updateEditorState={onChange}
          onInlineStyleToggle={onInlineStyleToggle}
          onBlockStyleToggle={onBlockStyleToggle}
          LatexInsertButton={InsertButton}
        />
        <div className="draft-wrapper">
          <BlogRenderer
            editorState={editorState}
            readOnly={false}
            plugins={plugins}
            onChange={onChange}
            blockRenderMap={blockRenderMap}
            keyBindingFn={keyBindingFn}
            handleReturn={handleReturn}
            onTab={handleTab}
            handleKeyCommand={handleKeyCommand}
          />
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

// <div className="blog-content" onClick={() => focusEditor()}>
//   <Editor
//     // EditorState is the top-level state object for the editor, it is an
//     // immutable record that represents the entire state of a Draft editor
//     editorState={editorState}
//     // The function to executed by the editor when edits and selection
//     // changes occur
//     onChange={onChange}
//     // Map of block rendering configurations. Each block type maps to an element
//     // tag and an optional element wrapper.
//     blockRenderMap={extendedBlockRenderMap}
//     // Function to define custom block rendering. This allows for higher-level
//     // components to define custom React rendering for ContetnBlock objects
//     blockRendererFn={customBlockRendererFn}
//     // Function that allows to define class names to apply to the given
//     // block when it is rendered.
//     blockStyleFn={getBlockStyle}
//     // Allow for custom key binding logic, used to handle the custom
//     // key binding for the Prism code editor
//     keyBindingFn={keyBindingFn}
//     // Custom return function to stop Draft creating a split block when
//     // editing code, instead add a new line to the code block
//     handleReturn={handleReturn}
//     // Custom tab function to allow for indenting of code when editing
//     onTab={handleTab}
//     handleKeyCommand={handleKeyCommand}
//     placeholder="Tell a new story..."
//     // Whether spellcheck is turned on. Note for OSX Safari this also enables
//     // autocorrect
//     spellCheck={true}
//     ref={editorRef}
//     plugins={plugins}
//     readOnly={false}
//   />
// </div>
