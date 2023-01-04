import React from 'react'
import { graphql, StaticQuery } from 'gatsby'
import SEO from '../components/SEO'
import Layout from '../components/Layout'

const About = () => {
  return (
    <StaticQuery
      query={graphql`
        {
          pdf: file(name: { eq: "toby_cv2" }) {
            publicURL
          }
        }
      `}
      render={data => (
        <Layout>
          <SEO />
          <div className="master-container">
            <div className="about-body">
              <p>
                I hold a Distinction in a MSc Data Science & Machine Learning
                from University College London (UCL). Alongside a First Class
                Honours in a BSc Computer Science. Across both degrees (6
                modules) I achieved &gt; 95% overall in programming fundamentals
                and Deep Learning AI.
              </p>
              <br />
              <p>
                The last 6 months of my MSc was spent at a large speciality
                insurance company in the City of London where I researched the
                use of Bayesian Networks and Bayesian Machine Learning to
                predict the severity of claims on energy and cyber speciality
                insurance contracts. The project was successful in exploring how
                Bayesian statistics can aid the prediction within these markets
                and achieved an AUC of {'>'} 0.7.
              </p>
              <br />
              <p>
                Currently I work as a data engineer producing the internal data
                platform and infrastructure for a small high performing
                skunkworks data science team.
              </p>
              <br />
              <p>
                My curriculum vitae can be {<a href="/cv/">found here.</a>}{' '}
              </p>
            </div>
          </div>
        </Layout>
      )}
    />
  )
}

export default About
