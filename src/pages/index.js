import React, { useEffect, useState } from 'react'
import { graphql } from 'gatsby'
import Img from 'gatsby-image/withIEPolyfill'
import firebase from 'gatsby-plugin-firebase'

import SEO from '../components/SEO'
import Layout from '../components/Layout'
import Sidebar from '../components/Sidebar'
import FeatureBlogs from '../components/FeatureBlogs'
import { firebaseFetchBlogs } from '../utils'

const Home = ({ data }) => {
  const [blogItems, setBlogItems] = useState([])

  useEffect(() => {
    // onLoad we fetch all the blog files within Firebase storage
    const firebaseFetch = async () => {
      const newData = await firebaseFetchBlogs(firebase)
      setBlogItems(newData)
    }

    firebaseFetch()
  }, [])

  return (
    <Layout>
      <SEO />
      <main className="main">
        <Sidebar />
        <div className="home-content">
          <div className="hero">
            <div className="banner">
              <h1>
                Hello{' '}
                <img
                  alt="waving hand"
                  src="https://twemoji.maxcdn.com/2/svg/1f44b.svg"
                />{' '}
                I'm Toby
              </h1>
              <h2>
                Current MSc Data Science & Machine Learning Student at UCL
              </h2>
              <p>
                Software Engineer, Machine Learning researcher from Cambridge.
              </p>
              <br />

              <p>
                I have interests around supervised and statistical based machine
                learning models. I have an interest in the theoretical
                mathematics that underpin AI fundamentals. I have previously
                worked as a software engineer across a fullstack, with many
                different languages. Please see my blogs below about general
                software engineer, machine learning and everything else between.
              </p>

              <div className="locations">
                <h2>Previously at: </h2>
                <Img
                  fluid={data.TXP.childImageSharp.fluid}
                  style={{
                    width: '4rem',
                    height: '4rem',
                    marginRight: '0.5rem',
                    zIndex: 1,
                  }}
                />
                <Img
                  fluid={data.CI.childImageSharp.fluid}
                  style={{
                    width: '3.6rem',
                    height: '3.6rem',
                    marginRight: '0.5rem',
                    zIndex: 1,
                  }}
                />
                <Img
                  fluid={data.EXESIOS.childImageSharp.fluid}
                  style={{
                    width: '6rem',
                    height: '4rem',
                    zIndex: 1,
                  }}
                />
              </div>

              <div className="hire-contact">
                <button
                  className="button-hire"
                  onClick={() => {
                    window.location.href = 'mailto:tobydrane@gmail.com'
                  }}
                >
                  Contact Me.
                </button>
              </div>
            </div>
          </div>

          <div className="hero-blogs">
            <h2>Recent Blogs</h2>
            <div className="wrapper">
              <FeatureBlogs allMdx={data.allMdx} />
            </div>
          </div>
        </div>
      </main>
    </Layout>
  )
}

export const query = graphql`
  {
    CI: file(relativePath: { eq: "ci.png" }) {
      childImageSharp {
        fluid(maxWidth: 800) {
          # Choose either the fragment including a small base64ed image, a traced placeholder SVG, or one without.
          ...GatsbyImageSharpFluid_noBase64
        }
      }
    }
    TXP: file(relativePath: { eq: "techspert.jpeg" }) {
      childImageSharp {
        fluid(maxWidth: 800) {
          # Choose either the fragment including a small base64ed image, a traced placeholder SVG, or one without.
          ...GatsbyImageSharpFluid_noBase64
        }
      }
    }
    EXESIOS: file(relativePath: { eq: "exesios.jpeg" }) {
      childImageSharp {
        fluid(maxWidth: 800) {
          # Choose either the fragment including a small base64ed image, a traced placeholder SVG, or one without.
          ...GatsbyImageSharpFluid_noBase64
        }
      }
    }
    allMdx(sort: { order: DESC, fields: [frontmatter___date] }) {
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            title
            description
            private
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
    }
  }
`

export default Home
