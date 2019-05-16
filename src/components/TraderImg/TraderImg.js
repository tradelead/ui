import React from 'react';
import PropTypes from 'prop-types';
import TraderPropType from '../../propTypes/Trader';
import useTraderImg from '../../hooks/useTraderImg';

const TraderImg = ({ trader, size }) => {
  const profileThumbnail = useTraderImg(trader, size);

  return <img src={profileThumbnail} alt={`${trader.username}`} />;
};

TraderImg.propTypes = {
  trader: TraderPropType.isRequired,
  size: PropTypes.string.isRequired,
};

export default TraderImg;
