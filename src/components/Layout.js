import React from 'react'
import PropTypes from 'prop-types'
import CookieConsent from 'react-cookie-consent'
import Header from './Header'

const Layout = ({ showHeader = true, children }) => (
  <div className="master-layout">
    {showHeader ? <Header /> : null}
    {children}
    <div className="footer">
      <p>Made by Toby Drane - All Content Own</p>
    </div>
    <CookieConsent
      location="bottom"
      buttonText="Thats fine!"
      style={{
        backgroundColor: '#fc504c',
      }}
      buttonStyle={{
        backgroundColor: '#FFF',
        color: '#fc504c',
      }}
      cookieName="TDConsentCookie"
    >
      This website uses cookies to enhance your experience.
    </CookieConsent>
  </div>
)

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
