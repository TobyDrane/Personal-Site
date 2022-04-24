import React, { useState, useEffect } from 'react'
import firebase from 'gatsby-plugin-firebase'

import Layout from '../components/Layout'
import SEO from '../components/SEO'
import { firebaseFetchBlogs } from '../utils'

const Blogs = () => {
  const [blogItems, setBlogItems] = useState([])
  const [firebaseErrorMessage, setFirebaseErrorMessage] = useState()

  useEffect(() => {
    // Initially onLoad we will fetch all the blog files within firebase storage
    // we deal with several async functions so wrap the entire logic in this top level
    // async which we require to do async with useEffect
    const firebaseFetch = async () => {
      const newData = await firebaseFetchBlogs(firebase, true)
      setBlogItems(newData)
    }

    firebaseFetch()
  }, [])

  console.log(blogItems)

  return (
    <Layout>
      <SEO />
      <div className="master-container">
        <div className="blogs-body">Coming Soon...</div>
      </div>
    </Layout>
  )
}

export default Blogs
