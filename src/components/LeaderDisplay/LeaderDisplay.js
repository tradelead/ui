import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner';
import get from 'lodash.get';
import TopTradersPropType from '../../propTypes/TopTraders';
import TraderImg from '../TraderImg/TraderImg';
import './LeaderDisplay.css';

const LeaderDisplay = ({ traders, loading }) => (
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

    {traders && traders.map(({
      username,
      profilePhoto,
      score,
      rank,
    }) => (
      <div className="leader">
        <div className="row-data trader">
          <Link to={`/trader/${username}`}>
            <TraderImg src={get(profilePhoto, 'url')} alt={username} />
            <div className={`username ${username && username.length > 15 && 'long'}`}>{username}</div>
          </Link>
        </div>
        <div className="row-data rank">{rank}</div>
        <div className="row-data score">{score}</div>
      </div>
    ))}
  </div>
);

LeaderDisplay.propTypes = {
  traders: TopTradersPropType.isRequired,
  loading: PropTypes.bool,
};

LeaderDisplay.defaultProps = {
  loading: false,
};

export default LeaderDisplay;
