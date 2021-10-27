import React, { useState, useEffect, useRef } from 'react'
import { navigate } from 'gatsby'
import moment from 'moment'
import firebase from 'firebase'
import { v4 as uuidv4 } from 'uuid'
import Modal from '../ui/Modal'

// Modal Body
const Body = ({ inputs, onInputsChange }) => {
  const { title, description } = inputs
  return (
    <div className="form">
      <div className="inputs">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          value={title}
          onChange={e => onInputsChange({ ...inputs, title: e.target.value })}
        />
      </div>

      <div className="inputs">
        <label htmlFor="description">Description</label>
        <input
          id="description"
          value={description}
          onChange={e =>
            onInputsChange({ ...inputs, description: e.target.value })
          }
        />
      </div>
    </div>
  )
}

// Modal Footer
const Footer = ({ onDraftClick, onPublishClick }) => {
  return (
    <div className="buttons">
      <button onClick={onDraftClick}>Save Draft</button>
      <button onClick={onPublishClick}>Publish</button>
    </div>
  )
}

// Some blog schema constants, ideally we should allow these to be custom
// but... that's in the future, constants work for now
const schemaConstants = {
  type: 'blog',
}

const PublishModal = ({ isShown, onRequestClose, JSONContent }) => {
  // Data from the modal body form
  const [bodyInputs, setBodyInputs] = useState({ title: '', description: '' })
  // The blog schema is the full JSON we will push to firebase
  // NOTE: It is to be updated based on whether we publish as draft or not
  const [blogSchema, setBlogSchema] = useState({
    ...schemaConstants,
    date: moment().format('YYYY-MM-DD'),
    content: JSONContent,
    id: uuidv4(),
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

  // NOTE: The private key
  const onDraftClick = () =>
    setBlogSchema({ ...blogSchema, ...bodyInputs, private: true })

  // Same as above, but we omit the private key
  const onPublishClick = () =>
    setBlogSchema({ ...blogSchema, ...bodyInputs, private: false })

  const fetchAllBlogs = () => {
    const storage = firebase.storage()
    const blogs = storage.ref('blogs/')
    blogs
      .listAll()
      .then(files => console.log(files))
      .catch(error => console.error(error))
  }

  // Perform the pushing JSON to firebase storage
  const pushToFirebase = () => {
    const storage = firebase.storage()
    const blogFile = storage.ref(
      `blogs/${blogSchema.date}-${blogSchema.title}.json`
    )

    // Push to storage
    blogFile
      .putString(JSON.stringify(blogSchema))
      .then(a => {
        navigate('/create-blog')
        // fetchAllBlogs()
      })
      .catch(reason => console.error(reason))
  }

  return (
    <Modal
      customClassName="publish-modal"
      isShown={isShown}
      onRequestClose={onRequestClose}
      header="Publish Blog"
      modalBody={<Body inputs={bodyInputs} onInputsChange={setBodyInputs} />}
      modalFooter={
        <Footer onDraftClick={onDraftClick} onPublishClick={onPublishClick} />
      }
    />
  )
}

export default PublishModal
