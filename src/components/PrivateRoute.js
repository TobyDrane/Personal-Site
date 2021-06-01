import React from 'react';
import { navigate } from 'gatsby';

const PrivateRoute = ({
  component: Component,
  authenticated,
  location,
  ...rest
}) => {
  if (!authenticated && location.pathname !== `/login`) {
    navigate("/login")
    return null
  }

  return <Component location={location} {...rest} />
}
export default PrivateRoute