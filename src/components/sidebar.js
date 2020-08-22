import React from 'react';
import { graphql, StaticQuery } from 'gatsby';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faNewspaper, faFile } from '@fortawesome/free-regular-svg-icons';
import Img from 'gatsby-image/withIEPolyfill';

const Sidebar = () => {
  return (
    <StaticQuery
      query={
        graphql`
          {
            TOBY: file(relativePath: { eq: "toby-featured.jpg" }) {
              childImageSharp {
                fluid(maxWidth: 800) {
                  ...GatsbyImageSharpFluid_noBase64
                }
              }
            }
          }`
        }
        render={(data) => (
          <section className="sidebar">
            <div className="photo">
              <Img
                fluid={data.TOBY.childImageSharp.fluid}
                style={{
                  width: '8rem',
                  height: '8rem',
                }}
              />
            </div>
            <div className="actions">
              <ul>
                <li>
                  <div className="icon"><FontAwesomeIcon size='2x' icon={faUser} /></div>
                  <h2>About Me</h2>
                </li>
                <li>
                  <div className="icon"><FontAwesomeIcon size='2x' icon={faNewspaper} /></div>
                  <h2>Blog</h2>
                </li>
                <li>
                  <div className="icon"><FontAwesomeIcon size='2x' icon={faFile} /></div>
                  <h2>CV</h2>
                </li>
              </ul>
            </div>
          </section>
        )}
    />
  );
}

export default Sidebar;
