import React from 'react';
import Layout from '../components/layout';
import Sidebar from '../components/sidebar';

const About = () => {
  return (
    <Layout>
      <main className="main">
        <Sidebar />
        <div className="home-content">
          <div className="hero">
            <div className="banner">
              <h1>About Me</h1>
              <p>
                I am currently based in Cambridge, studying at University College London for my MSc in Data Science and Machine Learning.
                I have previously graduated from the University of Keele with a first class honors in BSc Computer Science.
              </p>
              <br />
              <p>
                For the last three years I have taken several fullstack engineering roles and startups around Cambridge.
                I was at Cambridge Intelligence for sequential summers working with on a JS SDK, built within Node.
                Second summer worked on porting the JS SDK to a React component, deployed onto a K8S cluster.
              </p>
              <br />
              <p>
                Other commerical works include a fullstack (Angular & Serverless Lambdas) application used in house for a deep search tech platform.
                Working as a machine learning researcher at a marketing company, to see if it is possible to use AI to build place brands.
              </p>
              <br />
              <p>
                I am now researching deep reinforcement learning and multi agent systems at UCL and, their use cases within finance and behaviour analytics.
              </p>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  )
}

export default About;