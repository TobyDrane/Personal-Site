import React, { useEffect } from 'react'
import Layout from '../components/Layout'
import SEO from '../components/SEO'

import sanityClient from '../services/sanity'

const Blogs = () => {
  useEffect(() => {
    sanityClient
      .fetch(
        `
        *[_type == "post"]{
          title,
          slug,
          description,
          published,
          mainImage{
            asset->{
            _id,
            url
          }
        }
      }
    `
      )
      .then(data => {
        console.log(data)
      })
      .catch(error => {
        console.log(error)
      })
  }, [])

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
