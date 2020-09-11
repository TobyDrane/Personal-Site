import React from 'react';
import Img from 'gatsby-image/withIEPolyfill';

const FeatureBlogs = ({ allMdx }) => {
  const { edges } = allMdx;
  return (
    <>
      {edges.map((edge, index) => {
        const { node } = edge;
        const { frontmatter } = node;
        return (
          <div key={`blog-card-${index}`} className='blog-card' onClick={() => {
            window.location = node.fields.slug
          }}>
            <Img
              fluid={frontmatter.heroImage.childImageSharp.fluid}
              style={{
                width: '100%'
              }}
            />
            <div className='container'>
              <div className='title'>
                <h1>{frontmatter.title}</h1>
                <p>{frontmatter.description}</p>
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}

export default FeatureBlogs;
