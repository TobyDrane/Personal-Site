import React, { useState, useEffect } from 'react'
import firebase from 'gatsby-plugin-firebase'
import { navigate } from 'gatsby'
import * as queryString from 'query-string'
import { convertFromRaw, EditorState } from 'draft-js'
import createKatexPlugin from 'draft-js-katex-plugin'
import katex from 'katex'

import Layout from '../components/Layout'
import SEO from '../components/SEO'
import { firebaseFetchBlogs } from '../utils'

import 'draft-js/dist/Draft.css'
import BlogRenderer from '../components/blogs/BlogRenderer'

// TODO: Move this out into utils as this is common to the blog editor aswell
const katexPlugin = createKatexPlugin({
  katex,
})
const plugins = [katexPlugin]

const BlogGridItem = ({ item, pathname }) => {
  const date = new Date(item.date)
  const month = date.toLocaleString('default', { month: 'long' })
  const day = date.toLocaleString('default', { day: '2-digit' })
  return (
    <li
      className="blog-grid-item"
      onClick={() => navigate(`${pathname.replace(/\/$/, '')}?id=${item.id}`)}
    >
      <div>
        <h1>{item.title}</h1>
        <p>{item.description}</p>
        <span>{`${month} ${day}`}</span>
        <span>{` - ${item.wordCount} words`}</span>
      </div>
    </li>
  )
}

const Blogs = ({ location }) => {
  const { pathname } = location
  const [blogItems, setBlogItems] = useState([])
  const [blogItemsLoading, setBlogItemsLoading] = useState(true)
  const [isViewing, setIsViewing] = useState(false)
  const [viewingContent, setViewingContent] = useState({
    item: null,
    editorState: null,
  })
  const [firebaseErrorMessage, setFirebaseErrorMessage] = useState()

  useEffect(() => {
    // Initially onLoad we will fetch all the blog files within firebase storage
    // we deal with several async functions so wrap the entire logic in this top level
    // async which we require to do async with useEffect
    const firebaseFetch = async () => {
      const newData = await firebaseFetchBlogs(firebase, true)
      setBlogItems(newData)
      setBlogItemsLoading(false)
    }

    firebaseFetch()
  }, [])

  useEffect(() => {
    const { id } = queryString.parse(location.search)
    // If we have an id in the path we are viewing a blog
    if (id) {
      setIsViewing(true)
    }
  }, [location])

  useEffect(() => {
    if (!blogItemsLoading && isViewing) {
      const { id } = queryString.parse(location.search)
      if (id) {
        const item = blogItems.filter(n => n.id === `${id}`)[0]
        const editorState = EditorState.moveSelectionToEnd(
          EditorState.createWithContent(convertFromRaw(item.content.raw))
        )
        setViewingContent({ item, editorState })
      } else {
        setViewingContent({ item: null, editorState: null })
        setIsViewing(false)
      }
    }
  }, [location, blogItemsLoading, isViewing])

  if (isViewing && viewingContent.item && viewingContent.editorState) {
    return (
      <Layout>
        <SEO />
        <div className="blog-wrapper">
          <div className="content">
            <div className="meta-wrapper">
              <h1>{viewingContent.item.title}</h1>
            </div>
            <div className="draft-wrapper">
              <BlogRenderer
                editorState={viewingContent.editorState}
                readOnly={true}
                plugins={plugins}
                onChange={() => {}}
              />
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <SEO />
      <div className="blogs-body">
        <ol className="blogs-grid">
          {blogItems.map(item => (
            <BlogGridItem key={item.id} item={item} pathname={pathname} />
          ))}
        </ol>
      </div>
    </Layout>
  )
}

export default Blogs
