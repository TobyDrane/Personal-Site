import React, { useState, useEffect, useMemo } from 'react'
import { navigate } from 'gatsby'
import firebase from 'gatsby-plugin-firebase'
import * as queryString from 'query-string'
import BlogEditor from './editor/BlogEditor'

const CreateBlog = ({ location }) => {
  const { pathname } = location
  const [isEditing, setIsEditing] = useState({})
  const [blogItems, setBlogItems] = useState([])
  const [firebaseErrorMessage, setFirebaseErrorMessage] = useState()

  useEffect(() => {
    // Initially onLoad we will fetch all the blog files
    // within our Firebase storage
    const storageRef = firebase.storage().ref('blogs')
    storageRef
      .listAll()
      .then(value => {
        setBlogItems(value.items)
      })
      .catch(error => {
        setFirebaseErrorMessage('Fetching existing blog items failed!')
      })
  }, [])

  useEffect(() => {
    console.log('STATE CHANGE: LOCATION')
    // We have two URL search parameters
    // ?edit=True - means we are editing a blog
    // &id='XXXXX' - the current ID of the blog we are editing
    const { edit, id } = queryString.parse(location.search)
    setIsEditing({ edit, id })
  }, [location])

  const createNewBlog = () => {
    const path = `${pathname}?edit=True`
    navigate(path)
  }

  const logout = async () => {
    const logOut = await firebase.auth().signOut()
    console.log(logOut)
  }

  // Now if we are editing the blog display the edit component
  if (isEditing.edit) {
    return <BlogEditor />
  }

  return (
    <div className="create-blog-wrapper">
      {firebaseErrorMessage ? (
        <p className="error-text">{firebaseErrorMessage}</p>
      ) : null}

      <div className="content">
        <div className="action-bar">
          <button className="create-new-button" onClick={createNewBlog}>
            Create Blog
          </button>
          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateBlog
