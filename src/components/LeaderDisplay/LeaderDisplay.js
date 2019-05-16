import React from 'react';
import PropTypes from 'prop-types';
import Spinner from 'react-bootstrap/Spinner';
import TraderPropType from '../../propTypes/Trader';
import TraderImg from '../TraderImg/TraderImg';
import './LeaderDisplay.css';

const LeaderDisplay = ({ traders, loading }) => {
  return (
    <div className="leader-display">
      {loading && (
        <Spinner size="sm" animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
      )}

      <div className="leaders-header">
        <div className="header-data trader">Trader</div>
        <div className="header-data rank">Rank</div>
        <div className="header-data score">Score</div>
      </div>

      {traders && traders.map(({ trader, score, rank }) => (
        <div className="leader">
          <div className="row-data trader">
            <TraderImg trader={trader} size="thumbnail" className="profilePhoto" />
            <div className={`username ${trader.username.length > 15 && 'long'}`}>{trader.username}</div>
          </div>
          <div className="row-data rank">{rank}</div>
          <div className="row-data score">{score}</div>
        </div>
      ))}
    </div>
  );
};

LeaderDisplay.propTypes = {
  traders: PropTypes.arrayOf(TraderPropType).isRequired,
  loading: PropTypes.bool,
};

LeaderDisplay.defaultProps = {
  loading: false,
};

export default LeaderDisplay;
