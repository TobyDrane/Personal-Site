import React, { useEffect, useState } from 'react'
import { navigate } from 'gatsby'
import firebase from 'gatsby-plugin-firebase'
import * as queryString from 'query-string'

import Layout from '../components/Layout'
import SEO from '../components/SEO'
import {
  firebaseFetchHTMLBlogs,
  firebaseFetchHTMLBlogUrl,
  firebaseFetchMetadataBlogs,
} from '../utils'

const BlogGridItem = ({ item, pathname }) => {
  const date = new Date(item.date)
  const month = date.toLocaleDateString('default', { month: 'long' })
  const day = date.toLocaleDateString('default', { day: '2-digit' })
  return (
    <li
      className="blog-grid-item"
      onClick={() => {
        navigate(`?blog=${item.file}`)
      }}
    >
      <div>
        <h1>{item.name}</h1>
        <p>{item.description}</p>
        <span>{`${month} ${day}`}</span>
        <span>{` - ${item.wordCount} words`}</span>
      </div>
    </li>
  )
}

const Blogs = ({ location }) => {
  const { pathname } = location
  const [blogs, setBlogs] = useState([])
  const [isViewingBlog, setIsViewingBlog] = useState(false)
  const [blogUrl, setBlogUrl] = useState()

  useEffect(() => {
    const firebaseFetch = async () => {
      let blogs = await firebaseFetchMetadataBlogs(firebase)
      blogs = blogs.filter(item => !item.published)
      setBlogs(blogs)
    }

    firebaseFetch()
  }, [])

  useEffect(() => {
    const { blog } = queryString.parse(location.search)

    const firebaseFetch = async () => {
      const blogs = await firebaseFetchMetadataBlogs(firebase)
      const url = await firebaseFetchHTMLBlogUrl(firebase, blog)

      setBlogs(blogs)
      setBlogUrl(url)
      setIsViewingBlog(blog)
    }

    if (blog) {
      firebaseFetch()
    }
  }, [location.search])

  if (isViewingBlog) {
    const currentBlog = blogs.filter(item => item.file === isViewingBlog)
    return (
      <Layout>
        <SEO />
        <div className="iframe-container" style={{}}>
          <div className="iframe-container-header">
            <h1>{currentBlog[0].name}</h1>
            <p>{currentBlog[0].description}</p>

            <p className="text-muted">
              {new Date(currentBlog[0].date).toDateString()}
            </p>
          </div>
          <iframe src={blogUrl} />
        </div>
      </Layout>
    )
  }

  if (!blogs.length) {
    return (
      <Layout>
        <SEO />
        <div className="master-container">
          <p>Coming Soon...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <SEO />
      <div className="blogs-body">
        <div className="blogs-grid">
          {blogs.map(item => (
            <BlogGridItem item={item} />
          ))}
        </div>
      </div>
    </Layout>
  )
}

export default Blogs
