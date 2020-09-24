import React from 'react'
import { graphql } from 'gatsby';
import Img from 'gatsby-image/withIEPolyfill';

import SEO from '../components/SEO';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import FeatureBlogs from '../components/FeatureBlogs';

const Home = ({ data }) => {
  return (
    <Layout>
      <SEO />
      <main className="main">
        <Sidebar />
        <div className="home-content">
          <div className="hero">
            <div className="banner">
              <h1>Hello <img alt="waving hand" src="https://twemoji.maxcdn.com/2/svg/1f44b.svg"/> I'm Toby</h1>
              <h2>Current MSc Data Science & Machine Learning Student at UCL</h2>
              <p>Software Engineer, Machine Learning researcher from Cambridge.</p>
              <br />
              <p>I've worked as fullstack developer at some of Cambridge's most exciting startups. I have specialised in frontend design and cloud architectures. Please see my blogs about software engineering, research and everything in-between.</p>

              <div className="locations">
                <h2>Previously at: </h2>
                <Img
                  fluid={data.TXP.childImageSharp.fluid}
                  style={{
                    width: "4rem",
                    height: "4rem",
                    marginRight: "0.5rem",
                    zIndex: 1,
                  }}
                />
                <Img
                  fluid={data.CI.childImageSharp.fluid}
                  style={{
                    width: "3.6rem",
                    height: "3.6rem",
                    marginRight: "0.5rem",
                    zIndex: 1,
                  }}
                />
                <Img
                  fluid={data.EXESIOS.childImageSharp.fluid}
                  style={{
                    width: "6rem",
                    height: "4rem",
                    zIndex: 1,
                  }}
                />
              </div>

              <div className="hire-contact">
                <button
                  className="button-hire"
                  onClick={() => { window.location.href = "mailto:tobydrane@gmail.com" }}
                >
                  I'm Available. Hire Me
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
};

export const query = graphql`
  {
    CI: file(relativePath: { eq: "ci.png" }) {
      childImageSharp {
        fluid(maxWidth: 800) {
          # Choose either the fragment including a small base64ed image, a traced placeholder SVG, or one without.
          ...GatsbyImageSharpFluid_noBase64
        }
      }
    },
    TXP: file(relativePath: { eq: "techspert.jpeg" }) {
      childImageSharp {
        fluid(maxWidth: 800) {
          # Choose either the fragment including a small base64ed image, a traced placeholder SVG, or one without.
          ...GatsbyImageSharpFluid_noBase64
        }
      }
    },
    EXESIOS: file(relativePath: { eq: "exesios.jpeg" }) {
      childImageSharp {
        fluid(maxWidth: 800) {
          # Choose either the fragment including a small base64ed image, a traced placeholder SVG, or one without.
          ...GatsbyImageSharpFluid_noBase64
        }
      }
    },
    allMdx(sort: { order: DESC, fields: [frontmatter___date] }) {
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            title
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
    }
  }
`

export default Home;
