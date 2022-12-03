import React, { useState } from 'react'
import {
  EditorState,
  RichUtils,
  convertFromRaw,
  convertToRaw,
  Modifier,
  getDefaultKeyBinding,
} from 'draft-js'
import { navigate } from 'gatsby'
import createKatexPlugin from 'draft-js-katex-plugin'
import CodeUtils from 'draft-js-code'
import PrismDecorator from 'draft-js-prism'
import Prism from 'prismjs'
import { convertToHTML } from 'draft-convert'
import katex from 'katex'
import { Button } from '@mantine/core'

import Toolbar from './Toolbar'
import PublishModal from '../PublishModal'

import 'draft-js/dist/Draft.css'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-c'
import 'prismjs/components/prism-cpp'

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
