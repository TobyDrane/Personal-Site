import React from 'react';
import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  FacebookIcon,
  LinkedinIcon,
  TwitterIcon,
} from 'react-share'

const iconHeight = 30;

export default ({ location }) => (
  <div className='share'>
    <p>Share</p>
    <div className='share-icon'>
      <FacebookShareButton url={location.href} className='grow'>
        <FacebookIcon round style={{ height: iconHeight }} />
      </FacebookShareButton>
    </div>
    <div className='share-icon'>
      <LinkedinShareButton url={location.href} className='grow'>
        <LinkedinIcon round style={{ height: iconHeight }} />
      </LinkedinShareButton>
    </div>
    <div className='share-icon'>
      <TwitterShareButton url={location.href} className='grow'>
        <TwitterIcon round style={{ height: iconHeight }} />
      </TwitterShareButton>
    </div>
  </div>
);
