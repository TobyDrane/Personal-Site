import React from 'react';
import PropTypes from 'prop-types';

const Layout = ({ children }) => (
  <div className="site-layout">
    {children}
  </div>
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout;
