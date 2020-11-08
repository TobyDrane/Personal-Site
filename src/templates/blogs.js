import React from 'react';
import Img from 'gatsby-image/withIEPolyfill';
import { MDXProvider } from '@mdx-js/react';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import moment from 'moment';
import ShareBar from '../components/blogs/ShareBar';
import SEO from '../components/SEO';

import 'katex/dist/katex.min.css';

export default function ({ data, location }) {
  const { mdx } = data;
  const { title, heroImage, description, date } = mdx.frontmatter;
  return (
    <main className='blog-wrapper'>
      <SEO />
      <div className='header'>
        <div className='container'>
          <a href='/'>Home</a>
        </div>
      </div>
      <div className='blog-body'>
        <div className='blog-heading-container'>
          <p>{moment(date).format('MMMM Do YYYY')}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className='hero-image'>
          <ShareBar location={location} />
          <Img
            fluid={heroImage.childImageSharp.fluid}
            style={{
              width: '100%',
              maxHeight: '25em',
              margin: 'auto'
            }}
          />
        </div>
        <div className='container'>
          <div className='blog-content'>
            <MDXProvider>
              <MDXRenderer>{mdx.body}</MDXRenderer>
            </MDXProvider>
          </div>
        </div>
      </div>
    </main> 
  )
}

export const pageQuery = graphql`
  query($slug: String!) {
    mdx(fields: { slug: { eq: $slug } }) {
      id
      body
      tableOfContents
      frontmatter {
        title
        date
        type
        description
        heroImage {
          childImageSharp {
            fluid(maxWidth: 1000) {
              # Choose either the fragment including a small base64ed image, a traced placeholder SVG, or one without.
              ...GatsbyImageSharpFluid_noBase64
            }
          }
        }
      }
    }
  }
`