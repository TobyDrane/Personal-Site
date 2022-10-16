import React, { useState, useEffect } from 'react'
import { Router } from '@reach/router'
import firebase from 'gatsby-plugin-firebase'

import Layout from '../components/Layout'
import { default as CreateBlogComponent } from '../components/blogs/CreateBlog'
import PrivateRoute from '../components/PrivateRoute'
import { getUser, setUser } from '../services/auth'

const CreateBlog = () => {
  const [authenticated, setAuthenticated] = useState({
    authenticated: false,
    isInitializing: true,
    user: getUser(),
  })

  useEffect(() => {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        setUser(user)
        setAuthenticated({
          authenticated: true,
          isInitializing: false,
          user: getUser(),
        })
      } else {
        setAuthenticated({
          authenticated: false,
          isInitializing: false,
          user: {},
        })
      }
    })
  }, [setAuthenticated])

  if (authenticated.isInitializing) {
    return (
      <Layout showHeader={false}>
        <p>Loading</p>
      </Layout>
    )
  }

  return (
    <Layout showHeader={false}>
      <Router>
        <PrivateRoute
          path="/create-blog"
          component={CreateBlogComponent}
          authenticated={authenticated.authenticated}
        />
      </Router>
    </Layout>
  )
}

export default CreateBlog
