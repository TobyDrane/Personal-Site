import React from 'react'
import { graphql, StaticQuery } from 'gatsby'
import Layout from '../components/Layout'
import SEO from '../components/SEO'

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
              I hold a first class honours in a BSc Computer Science and most
              recently a MSc in Data Science & Machine Learning from University
              College London (UCL).
              <br />
              <br />
              I have been lucky enough to spend a couple of years in various
              commercial companies, including a deep search tech startup and as
              a machine learning researcher at a marketing company to see if it
              was possible to use AI and Machine Learning to build place brands.
              <br />
              <br />
              The last 6 months of my MSc was spent at a large speciality
              insurance company in the City of London where I researched the use
              of Bayesian Networks and Bayesian Machine Learning to predict the
              severity of claims on energy and cyber speciality insurance
              contracts. The project was successful in exploring how Bayesian
              statistics can aid the prediction within these markets and
              achieved an AUC of {'>'} 0.7 (please see my final thesis writeup
              for further reading).
              <br />
              <br />
              Currently I spend my time as a data engineer and data scientist
              producing predictive models and production data data pipelines. I
              enjoy exploring the use of statistical models in scenarios from
              election modelling to Bitcoin prediction.
              <br />
              <br />
              Please do get in touch for commercial opportunities, consultancy
              or even just a coffee within London. My curriculum vitae can be{' '}
              <a href="" onClick={() => window.open(data.pdf.publicURL)}>
                found here.
              </a>
            </div>
          </div>
        </Layout>
      )}
    />
  )
}

export default About
