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
                and achieved an AUC of {'>'} 0.7 (please see my final thesis
                writeup for further reading).
              </p>
              <br />
              <p>
                I have been lucky enough to spend a couple of years in various
                commercial companies, including a deep search tech startup and
                as a machine learning researcher at a marketing company to see
                if it was possible to use AI and Machine Learning to build place
                brands.{' '}
              </p>
              <br />
              <p>
                Currently I spend my time as a data engineer and data scientist
                producing predictive models and production data data pipelines.
                I enjoy exploring the use of statistical models in scenarios
                from election modelling to Bitcoin prediction.{' '}
              </p>
              <br />
              <p>
                Please do get in touch for commercial opportunities, consultancy
                or even just a coffee within London. My curriculum vitae can be{' '}
                {<a href="/cv/">found here.</a>}{' '}
              </p>
            </div>
          </div>
        </Layout>
      )}
    />
  )
}

export default About
