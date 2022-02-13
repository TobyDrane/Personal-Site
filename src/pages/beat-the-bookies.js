import React, { useState, useEffect } from 'react'
import { getUser, setUser } from '../services/auth'
import { Router } from '@reach/router'
import firebase from 'gatsby-plugin-firebase'
import Layout from '../components/Layout'
import PrivateRoute from '../components/PrivateRoute'
import Dashboard from '../../projects/beat-the-bookies/dashboard/dashboard-index'

const BeatTheBookies = () => {
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
      <Layout>
        <p>Loading</p>
      </Layout>
    )
  }

  return (
    <Layout showHeader={false}>
      <Router>
        <PrivateRoute
          path="/beat-the-bookies"
          component={Dashboard}
          authenticated={authenticated.authenticated}
        />
      </Router>
    </Layout>
  )
}

export default BeatTheBookies
