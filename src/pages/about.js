import React from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import Sidebar from '../components/Sidebar';

const About = () => {
  return (
    <Layout>
      <SEO />
      <main className="main">
        <Sidebar />
        <div className="home-content">
          <div className="hero">
            <div className="banner">
              <h1>About Me</h1>
              <p>
                For my final year project at University College London I am researching low volume ML models for an insurtech firm
                Ki-Insurance.
              </p>
              <br />
              <p>
                I am currently based in Cambridge, studying at University College London for my MSc in Data Science and Machine Learning.
                I have hold a first class honors in BSc Computer Science.
              </p>
              <br />
              <p>
                For the last three years I have taken several fullstack engineering roles and startups around Cambridge. Working on
                everything from frontend web development to automated cloud deployments.
              </p>
              <br />
              <p>
                Other commercial work includes developing an search application used in house for a deep search tech platform.
                Working as a machine learning researcher at a marketing company, to see if it is possible to use AI to build place brands.
              </p>
              <br />
            </div>
          </div>
        </div>
      </main>
    </Layout>
  )
}

export default About;