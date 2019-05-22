import React from 'react';
import PropTypes from 'prop-types';
import TraderPropType from '../../propTypes/Trader';
import useTraderInfo from '../../hooks/useTraderInfo';

const TraderImg = ({ trader, size }) => {
  const [info] = useTraderInfo(trader, [{ key: 'profilePhoto', size }]);
  const defaultProfileThumbnail = `${process.env.PUBLIC_URL}/imgs/default-profile-thumbnail.png`;
  const profileThumbnail = info.profileThumbnail || defaultProfileThumbnail;
  return <img src={profileThumbnail} alt={`${trader.username}`} />;
};

TraderImg.propTypes = {
  trader: TraderPropType.isRequired,
  size: PropTypes.string.isRequired,
};

export default TraderImg;
