import React from 'react'
import { EditorState, Modifier } from 'draft-js'
import CodeUtils from 'draft-js-code'
import {
  IconUnderline,
  IconItalic,
  IconBold,
  IconPhoto,
  IconCode,
} from '@tabler/icons'
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

  const onChange = val => {
    const newContent = Modifier.mergeBlockData(contentState, selection, {
      syntax: val,
    })

    updateEditorState(
      EditorState.push(editorState, newContent, 'change-block-data')
    )
  }
  if (!currentSyntax) {
    onChange('javascript')
  }
  return (
    <Select
      data={['css', 'javascript', 'python', 'cpp']}
      value={currentSyntax}
      onChange={val => onChange(val)}
      variant="unstyled"
    />
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
          <Button
            variant="subtle"
            size="xs"
            color={getColor('code-block')}
            onMouseDown={e => {
              e.preventDefault()
              return onBlockChange('code-block')
            }}
          >
            <IconCode size={20} />
          </Button>
        </Button.Group>
      </span>
      <span>{<LatexInsertButton />}</span>
      <span>
        <SyntaxBlock
          editorState={editorState}
          updateEditorState={updateEditorState}
        />
      </span>
    </div>
  )
}

export default Toolbar
