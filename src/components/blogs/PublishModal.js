import React, { useState, useEffect, useRef } from 'react'
import moment from 'moment'
import { navigate } from 'gatsby'
import { Modal, Stack, Button, TextInput } from '@mantine/core'
import { v4 as uuidv4 } from 'uuid'
import firebase from 'firebase'

// Some blog schema constants, ideally we should allow these to be custom
// but... that's in the future, constants work for now
const schemaConstants = {
  type: 'blog',
}

const PublishModal = ({ isShown, onRequestClose, JSONContent, blogItem }) => {
  // If we have a current blog item, this means we are editing a previously created blog
  // We need to set all the default values within the publish modal to these defaults
  const title = blogItem ? blogItem.title : ''
  const description = blogItem ? blogItem.description : ''
  const date = blogItem ? blogItem.date : moment().format('YYYY-MM-DD')
  const id = blogItem ? blogItem.id : uuidv4()

  // Data from the modal body form
  const [bodyInputs, setBodyInputs] = useState({
    title,
    description,
  })

  // The blog schema is the full JSON we will push to firebase
  // NOTE: It is to be updated based on whether we publish as draft or not
  const [blogSchema, setBlogSchema] = useState({
    ...schemaConstants,
    date,
    content: JSONContent,
    id,
  })

  // Required to handle the blog state change for pushing to firebase
  // when we first mount
  const isMounted = useRef(false)

  useEffect(() => {
    if (isMounted.current) {
      pushToFirebase()
    } else {
      isMounted.current = true
    }
  }, [blogSchema])

  // Perform the pushing JSON to firebase storage
  const pushToFirebase = () => {
    const storage = firebase.storage()
    const blogFile = storage.ref(`blogs/${blogSchema.id}.json`)
    // const blogFile = storage.ref(
    //  `blogs/${blogSchema.date}-${blogSchema.title}.json`
    //)

    // Push to storage
    blogFile
      .putString(JSON.stringify(blogSchema))
      .then(a => {
        navigate('/create-blog')
        // fetchAllBlogs()
      })
      .catch(reason => console.error(reason))
  }

  // NOTE: The private key
  const onDraftClick = () =>
    setBlogSchema({
      ...blogSchema,
      ...bodyInputs,
      private: true,
    })

  // Same as above, but we omit the private key
  const onPublishClick = () =>
    setBlogSchema({
      ...blogSchema,
      ...bodyInputs,
      private: false,
    })

  return (
    <Modal opened={isShown} onClose={onRequestClose} title="Publish Blog">
      <Stack>
        <TextInput
          label="Title"
          placeholder="Blog title..."
          size="sm"
          value={bodyInputs.title}
          onChange={e =>
            setBodyInputs({
              ...bodyInputs,
              title: e.target.value,
            })
          }
          required
        />
        <TextInput
          label="Description"
          placeholder="Blog description..."
          size="sm"
          value={bodyInputs.description}
          onChange={e =>
            setBodyInputs({
              ...bodyInputs,
              description: e.target.value,
            })
          }
          required
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Button
            variant="outline"
            size="xs"
            color="dark"
            onClick={onDraftClick}
          >
            Save Draft
          </Button>
          <Button size="xs" color="dark" onClick={onPublishClick}>
            Publish
          </Button>
        </div>
      </Stack>
    </Modal>
  )
}

export default PublishModal
