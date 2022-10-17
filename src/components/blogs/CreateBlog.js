import React, { useState, useEffect } from 'react'
import { navigate, Link } from 'gatsby'
import firebase from 'gatsby-plugin-firebase'
import * as queryString from 'query-string'
import { Button, Anchor, Badge } from '@mantine/core'

import BlogEditor from './editor/BlogEditor'
import { firebaseFetchBlogs } from '../../utils'

// Used to display a single item within the blog list setting
// Function fires back the item upon an certain action happening (edit & delete)
const BlogListItem = ({ item, pathname, onDeleteClick }) => {
  console.log(item)
  const badgeText = item.private ? 'Draft' : 'Published'
  const badgeColor = item.private ? 'red' : 'dark'
  return (
    <div className='item' key={item.id}>
      <div className=''>
        <Anchor
          component={Link}
          to={`${pathname}?edit=True&id=${item.id}`}
          size='xl'
          variant='link'
          underline style={{ fontWeight: 'bold'}}
        >
          {item.title}
        </Anchor>
        <p>{item.description}</p>
        <Badge color={badgeColor} variant='light' size='sm'>{badgeText}</Badge> 
      </div>
      <div style={{ paddingRight: '20px', margin: 'auto 0px' }}>
        <Button color='red' size='xs' variant='outline' onClick={() => onDeleteClick(item)}>Delete</Button>
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

  console.log(blogItems)

  return (
    <div className="master-container">
      <div className="create-blog-wrapper" style={{ width: '100%' }}>
        {firebaseErrorMessage ? (
          <p className="error-text">{firebaseErrorMessage}</p>
        ) : null}

        <div className="content">
          <div className="action-bar">
            <Button onClick={createNewBlog} size="sm" color="dark">Create Blog</Button>
            <Button onClick={logout} size="sm" color="dark" variant='outline'>Logout</Button>
          </div>

          <div className="blog-list">
            {blogItems.map(item => (
              <BlogListItem
                key={item.id}
                pathname={pathname}
                item={item}
                onDeleteClick={onDeleteBlog}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateBlog
