import React, { useState, useEffect } from 'react'
import { navigate } from 'gatsby'
import firebase from 'gatsby-plugin-firebase'
import * as queryString from 'query-string'
import BlogEditor from './editor/BlogEditor'
import { firebaseFetchBlogs } from '../../utils'

const BlogListItem = ({ item, onEditClick, onDeleteClick }) => {
  return (
    <div className="item" key={item.id}>
      <div className="item-content">
        <p>{item.title}</p>
        <p>{item.private}</p>
      </div>
      <div className="item-actions">
        <button onClick={() => onEditClick(item)}>Edit</button>
        <button onClick={() => onDeleteClick(item)}>Delete</button>
      </div>
    </div>
  )
}

const CreateBlog = ({ location }) => {
  const { pathname } = location
  const [isEditing, setIsEditing] = useState({})
  const [blogItems, setBlogItems] = useState([])
  const [firebaseErrorMessage, setFirebaseErrorMessage] = useState()

  useEffect(() => {
    // Initially onLoad we will fetch all the blog files
    // within our Firebase storage
    // we deal with several async functions so wrap the entire logic in this top level
    // async which we require to do async within useEffect
    const firebaseFetch = async () => {
      const newData = await firebaseFetchBlogs(firebase)
      setBlogItems(newData)
    }

    firebaseFetch()
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
  }

  const onEditBlog = item => {
    const { id } = item
    const path = `${pathname}?edit=True&id=${id}`
    navigate(path)
  }

  const onDeleteBlog = async item => {
    const storage = firebase.storage()
    const path = item.reference.location.path_
    if (path) {
      const itemRef = storage.ref(path)
      const deleted = await itemRef.delete()

      // Instead of a re-fetch we can just filter out by the id
      // of the blog we have just destroyed
      const newBlogItems = blogItems.filter(value => {
        return value.id !== item.id
      })
      setBlogItems(newBlogItems)
    }
  }

  // Now if we are editing the blog display the edit component
  if (isEditing.edit) {
    // Now check if we have an id which means we are editing
    if (isEditing.id) {
      // Fetch item with this id and pass to the editor
      const blogItem = blogItems.filter(value => value.id == isEditing.id)
      return <BlogEditor blogItem={blogItem[0]} />
    }
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

        <div className="blog-list">
          {blogItems.map(item => (
            <BlogListItem
              key={item.id}
              item={item}
              onDeleteClick={onDeleteBlog}
              onEditClick={onEditBlog}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default CreateBlog
