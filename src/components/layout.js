import React from 'react';
import PropTypes from 'prop-types';

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
  </div>
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout;
