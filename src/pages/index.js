import React, { useEffect, useState } from 'react'
import { graphql } from 'gatsby'
import Img from 'gatsby-image/withIEPolyfill'
import firebase from 'gatsby-plugin-firebase'

import SEO from '../components/SEO'
import Layout from '../components/Layout'
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

  console.log(blogItems)

  return (
    <Layout>
      <SEO />
      <div className="master-container">
        <div className="home-container">
          <div className="hello">Toby Drane</div>
          <div className="body">
            <p>
              I work as a Data Scientist and Data Engineer in London, having
              previously studied a MSc in Data Science & Machine Learning from
              UCL.
            </p>
            <br></br>
            <p>
              I have interests around supervised and statistical based machine
              learning systems and the theoretical mathematics that underpin AI.
              Although my interests fall into many various realms outside AI
              such as political theory, strategy and campaigns and finance.
            </p>
            <br></br>
            <p>
              I blog about a wide ranging variety of topics, all of which are
              recorded <a href="blogs">here</a>.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export const query = graphql`
  {
    TOBY: file(relativePath: { eq: "toby-featured.jpg" }) {
      childImageSharp {
        fluid(maxWidth: 800) {
          ...GatsbyImageSharpFluid_noBase64
        }
      }
    }
  }
`

export default Home
