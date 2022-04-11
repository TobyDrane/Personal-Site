import React from 'react'
import { RichUtils } from 'draft-js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileImage } from '@fortawesome/free-regular-svg-icons'
import firebase from 'firebase'

import { getCurrentBlock, addNewBlock } from './utils'
import ToolbarButton from './ToolbarButton'

// Inline style controlling toolbar buttons
// Renders the toolbar button to handle the styling
// then on click changes the Draft-js inline styling to the relevant button
const InlineStyleControls = ({ editorState, onToggle }) => {
  // Types set by the toolbar
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
            onMouseDown={e => {
              e.preventDefault()
              onToggle(type.style)
            }}
            text={type.text}
            uniqueKey={`${type.style.toLowerCase()}-btn`}
          />
        </span>
      ))}
    </>
  )
}

// Block style controlling toolbar button
// Renders the toolbar button to handle new blocks
const BlockStyleControls = ({ editorState, onToggle }) => {
  // These correspond to the default Draft-js block render map
  // https://draftjs.org/docs/advanced-topics-custom-block-render-map/
  const BLOCK_TYPES = [
    { style: 'header-one', text: 'H1' },
    { style: 'header-two', text: 'H2' },
    { style: 'header-three', text: 'H3' },
    { style: 'blockquote', text: '" "' },
  ]
  const blockType = getCurrentBlock(editorState)
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

// Component to create the blog editor toolbar
// renders the inline and block buttons
// along with handling the logic to set these button properties
// back to the editor state
const Toolbar = ({ editorState, setEditorState, LatexInsertButton }) => {
  const fileUpload = event => {
    // The actual file object
    const file = event.target.files.item(0)
    // Validation of the file
    if (file.type.split('/')[0] !== 'image') {
      alert('INVALID IMAGE FILE')
      return
    }

    // TODO: Handle some async loading
    const storagePath = `blogs-content/${new Date().getTime()}-${file.name}`
    const storage = firebase.storage()
    const fileRef = storage.ref(storagePath)
    // Push item to storage, handle the following 3 events
    // current progress snapshot
    // error if upload failed
    // final completion then get download url
    // See - https://firebase.google.com/docs/storage/web/upload-files#full_example
    fileRef.put(file).on(
      'state_changed',
      snapshot => {
        console.log(snapshot)
      },
      error => {
        console.log(error)
      },
      () => {
        // Fetch download url
        fileRef.getDownloadURL().then(downloadURL => {
          // Push download url to the EditorState to render image
          setEditorState(
            addNewBlock(editorState, 'atomic:image', {
              src: downloadURL,
            })
          )
        })
      }
    )
  }

  return (
    <div className="toolbar">
      <InlineStyleControls
        editorState={editorState}
        onToggle={newInlineStyle => {
          const newState = RichUtils.toggleInlineStyle(
            editorState,
            newInlineStyle
          )
          setEditorState(newState)
        }}
      />
      <BlockStyleControls
        editorState={editorState}
        onToggle={newBlockType => {
          const newState = RichUtils.toggleBlockType(editorState, newBlockType)
          setEditorState(newState)
        }}
      />
      <span>
        <button className="button">
          <div className="image-upload">
            <label htmlFor="file-input">
              <FontAwesomeIcon icon={faFileImage} />
            </label>
            <input
              type="file"
              id="file-input"
              onChange={e => {
                fileUpload(e)
              }}
            />
          </div>
        </button>
      </span>
      <span>{<LatexInsertButton />}</span>
    </div>
  )
}

export default Toolbar
