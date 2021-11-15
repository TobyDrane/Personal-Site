import React from 'react'
import { graphql, StaticQuery } from 'gatsby'
import { useLocation } from '@reach/router'
import Img from 'gatsby-image/withIEPolyfill'

const MenuItem = ({ hrefPath, locationPath, value }) => (
  <a
    className={`${locationPath === hrefPath ? 'active' : ''}`}
    onClick={() => (window.location = hrefPath)}
  >
    {value}
  </a>
)

const Header = () => {
  const location = useLocation()
  const { pathname } = location

  return (
    <StaticQuery
      query={graphql`
        {
          TOBY: file(relativePath: { eq: "toby-featured.jpg" }) {
            childImageSharp {
              fluid(maxWidth: 800) {
                ...GatsbyImageSharpFluid_noBase64
              }
            }
          }
          pdf: file(name: { eq: "toby_cv2" }) {
            publicURL
          }
        }
      `}
      render={data => (
        <div className="header">
          <div className="logo">
            <Img
              fluid={data.TOBY.childImageSharp.fluid}
              style={{ width: '65px', height: '65px' }}
              fadeIn={false}
            />
          </div>
          <div className="menu">
            <MenuItem hrefPath="/" locationPath={pathname} value="Home" />
            <MenuItem
              hrefPath="/about/"
              locationPath={pathname}
              value="About"
            />
            <MenuItem
              hrefPath="/blogs/"
              locationPath={pathname}
              value="Blogs"
            />
            <MenuItem
              hrefPath="mailto:tobydrane@gmail.com"
              locationPath={pathname}
              value="Contact"
            />
          </div>
        </div>
      )}
    />
  )
}

export default Header
