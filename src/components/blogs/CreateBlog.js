import React, { useEffect, useState } from 'react'
import { navigate, Link } from 'gatsby'
import firebase from 'gatsby-plugin-firebase'
import * as queryString from 'query-string'
import { Button, Anchor, Badge } from '@mantine/core'

import {
  firebaseFetchHTMLBlogs,
  firebaseFetchMetadataBlogs,
  firebaseFetchHTMLBlogUrl,
} from '../../utils'

const BlogItem = ({
  name,
  filename,
  onClick,
  description,
  date,
  wordCount,
  published,
  tags,
}) => {
  return (
    <div className="item">
      <div>
        <Anchor
          size="xl"
          variant="link"
          onClick={() => onClick(filename)}
          style={{ fontWeight: 'bold' }}
          underline
        >
          {name}
        </Anchor>
        <p>{description}</p>
        <p style={{ fontWeight: 200, fontSize: '1rem' }}>
          {new Date(date).toDateString()} - {wordCount} words
        </p>
      </div>
      <div
        style={{
          paddingRight: '20px',
          margin: 'auto 0px',
          textAlign: 'right',
        }}
      >
        <Badge
          color={published ? 'red' : 'dark'}
          variant="light"
          size="md"
          style={{ marginRight: '5px' }}
        >
          {published ? 'Draft' : 'Published'}
        </Badge>
        <div>
          {tags.map(tag => (
            <Badge variant="light" size="md" style={{ marginRight: '5px' }}>
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

const CreateBlog = ({ location }) => {
  const { pathname } = location
  const [blogs, setBlogs] = useState([])
  const [isViewingBlog, setIsViewingBlog] = useState(false)
  const [blogUrl, setBlogUrl] = useState()

  useEffect(() => {
    const firebaseFetch = async () => {
      const blogs = await firebaseFetchMetadataBlogs(firebase)
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
  }, [location])

  if (isViewingBlog) {
    const currentBlog = blogs.filter(item => item.file === isViewingBlog)
    console.log(currentBlog)

    return (
      <div
        className="iframe-container"
        style={{ marginTop: '20px', height: 'calc(100% - 65px)' }}
      >
        <div className="iframe-container-header">
          <h1>{currentBlog[0].name}</h1>
          <p>{currentBlog[0].description}</p>

          <p className="text-muted">
            {new Date(currentBlog[0].date).toDateString()}
          </p>
        </div>
        <iframe src={blogUrl} />
      </div>
    )
  }

  return (
    <div className="master-container">
      <div className="create-blog-wrapper" style={{ width: '100%' }}>
        <div className="content">
          <div className="blog-list">
            {blogs.map(item => (
              <BlogItem
                key={item.name}
                name={item.name}
                filename={item.file}
                description={item.description}
                date={item.date}
                wordCount={item.wordCount}
                published={item.published}
                tags={item.tags || []}
                onClick={filename => {
                  navigate(`?blog=${filename}`)
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateBlog
