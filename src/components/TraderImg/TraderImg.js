import React from 'react';
import PropTypes from 'prop-types';

const TraderImg = ({ src, alt }) => {
  const defaultProfileThumbnail = `${process.env.PUBLIC_URL}/imgs/default-profile-thumbnail.png`;
  const profileThumbnail = src || defaultProfileThumbnail;
  return <img src={profileThumbnail} alt={alt} />;
};

TraderImg.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
};

TraderImg.defaultProps = {
  src: '',
  alt: '',
};

export default TraderImg;
