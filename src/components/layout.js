import React from 'react';
import PropTypes from 'prop-types';
import CookieConsent from 'react-cookie-consent';

const Layout = ({ children }) => (
  <div className="site-layout">
    {children}
    <div className='footer'>
      <p>Made with {' '}
        <span>
          <img alt='love-heart' src='https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.7/assets/png/2764.png' />
        </span>
        {' '} by Toby Drane
      </p>
    </div>
    <CookieConsent
      location='bottom'
      buttonText='Thats fine!'
      style={{
        backgroundColor: '#fc504c',
      }}
      buttonStyle={{
        backgroundColor: '#FFF',
        color: '#fc504c',
      }}
      cookieName='TDConsentCookie'
    >
      This website uses cookies to enhance your experience.
    </CookieConsent>
  </div>
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout;
