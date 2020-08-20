import React from 'react'
import { graphql } from 'gatsby';
import Img from 'gatsby-image/withIEPolyfill';

import Layout from '../components/layout';

const Home = ({ data }) => {
  console.log(data);
  return (
    <Layout>
      <main className="main">
        <div className="sidenav">
          <p>Sidebar</p>
        </div>
        <div className="home-content">
          <div className="banner">
            <h1>Hello <img alt="waving hand" src="https://twemoji.maxcdn.com/2/svg/1f44b.svg"/> I'm Toby</h1>
            <h2>Current MSc Data Science & Machine Learning Student at UCL</h2>
            <p>I'm a fullstack software developer, machine learning researcher and entrepreneur from Cambridge.</p>
          
            <div className="locations">
              <h2>Previously at: </h2>
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
                fluid={data.TXP.childImageSharp.fluid}
                style={{
                  width: "4rem",
                  height: "4rem",
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
    }
  }
`

export default Home;
