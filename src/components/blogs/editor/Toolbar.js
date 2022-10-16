import React from 'react'
import { EditorState, Modifier } from 'draft-js'
import CodeUtils from 'draft-js-code'
import { IconUnderline, IconItalic, IconBold, IconPhoto } from '@tabler/icons'
import { Select, Button, FileButton } from '@mantine/core'
import firebase from 'firebase'

import { getCurrentBlock, addNewBlock } from './utils'
import ToolbarButton from './ToolbarButton'

const getSyntax = block => {
  if (block.getData) {
    return block.getData().get('syntax')
  }
  return null
}

// Custom inline style block for code creation
const SyntaxBlock = props => {
  const { editorState, updateEditorState } = props
  if (!CodeUtils.hasSelectionInBlock(editorState)) return ''

  const selection = editorState.getSelection()
  const contentState = editorState.getCurrentContent()
  const startKey = selection.getStartKey()
  const currentBlock = contentState.getBlockForKey(startKey)
  const currentSyntax = getSyntax(currentBlock)

  const onChange = e => {
    const newContent = Modifier.mergeBlockData(contentState, selection, {
      syntax: e.target.value,
    })

    updateEditorState(
      EditorState.push(editorState, newContent, 'change-block-data')
    )
  }
  if (!currentSyntax) {
    onChange({ target: { value: 'javascript' } })
  }
  return (
    <select value={currentSyntax} onChange={onChange}>
      <option value="css">CSS</option>
      <option value="javascript">Javascript</option>
      <option value="python">Python</option>
    </select>
  )
}

// Inline style controlling toolbar buttons
// Renders the toolbar button to handle the styling
// then on click changes the Draft-js inline styling to the relevant button
const InlineStyleControls = ({ editorState, onToggle, updateEditorState }) => {
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
      <SyntaxBlock
        editorState={editorState}
        updateEditorState={updateEditorState}
      />
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
    { style: 'code-block', text: '</>' },
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
const Toolbar = ({
  editorState,
  updateEditorState,
  onInlineStyleToggle,
  onBlockStyleToggle,
  LatexInsertButton,
}) => {
  const currentStyle = editorState.getCurrentInlineStyle()
  const currentBlock = getCurrentBlock(editorState)

  const fileUpload = event => {
    // The actual file object
    const file = event
    if (file) {
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
            updateEditorState(
              addNewBlock(editorState, 'atomic:image', {
                src: downloadURL,
              })
            )
          })
        }
      )
    }
  }

  const onBlockChange = value => {
    onBlockStyleToggle(value)
  }

  const onInlineChange = value => {
    onInlineStyleToggle(value)
  }

  const getColor = type => {
    if (currentStyle.has(type)) {
      return 'dark'
    }
    return 'gray'
  }

  return (
    <div className="toolbar">
      <span>
        <Select
          size="sm"
          data={[
            { value: 'unstyled', label: 'Paragraph' },
            { value: 'header-one', label: 'H1' },
            { value: 'header-two', label: 'H2' },
            { value: 'header-three', label: 'H3' },
            { value: 'header-four', label: 'H4' },
          ]}
          defaultValue={currentBlock.type}
          value={currentBlock.type}
          variant="unstyled"
          onChange={onBlockChange}
        />
      </span>
      <span>
        <Button.Group>
          <Button
            variant="subtle"
            color={getColor('BOLD')}
            size="xs"
            onMouseDown={e => {
              e.preventDefault()
              return onInlineChange('BOLD')
            }}
          >
            <IconBold size={20} />
          </Button>
          <Button
            variant="subtle"
            color={getColor('ITALIC')}
            size="xs"
            onMouseDown={e => {
              e.preventDefault()
              return onInlineChange('ITALIC')
            }}
          >
            <IconItalic size={20} />
          </Button>
          <Button
            variant="subtle"
            color={getColor('UNDERLINE')}
            size="xs"
            onMouseDown={e => {
              e.preventDefault()
              return onInlineChange('UNDERLINE')
            }}
          >
            <IconUnderline size={20} />
          </Button>
          <FileButton
            variant="subtle"
            color="gray"
            size="xs"
            onChange={e => {
              fileUpload(e)
            }}
          >
            {props => (
              <Button {...props}>
                <IconPhoto size={20} />
              </Button>
            )}
          </FileButton>
        </Button.Group>
      </span>
      <span>{<LatexInsertButton />}</span>
    </div>
  )
}

export default Toolbar
