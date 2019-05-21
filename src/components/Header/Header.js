import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Header.css';
import { NavLink } from 'react-router-dom';
import LabeledBadge from './LabeledBadge/LabeledBadge';
import AccountMenu from './AccountMenu/AccountMenu';
import AppContext from '../../AppContext';

const Header = ({ closeMenu }) => {
  const app = useContext(AppContext);
  const score = useTraderScore(app.trader);
  const rank = useTraderRank(app.trader);

  return (
    <div className="header-inner">
      <div className="branding">
        <img src={`${process.env.PUBLIC_URL}/imgs/logo.svg`} alt="TradeLead" />
      </div>

      <ul className="navigation">
        <li><NavLink onClick={closeMenu} exact activeClassName="active" to="/">Performance</NavLink></li>
        <li><NavLink onClick={closeMenu} activeClassName="active" to="/leaders">Leaders</NavLink></li>
      </ul>

      {(score) ? <LabeledBadge className="score" label="Score" value={score} /> : ''}
      {(rank) ? <LabeledBadge className="rank" label="Rank" value={rank} /> : ''}

      <AccountMenu closeMenu={closeMenu} />
    </div>
  );
};

Header.propTypes = {
  closeMenu: PropTypes.func,
};

Header.defaultProps = {
  closeMenu: () => {},
};

function useTraderScore(trader) {
  const [score, setScore] = useState(null);

  useEffect(() => {
    if (trader.id) {
      return trader.subscribeToScore(newScore => setScore(newScore));
    }

    return () => {};
  }, [trader.id]);

  return score;
}

function useTraderRank(trader) {
  const [rank, setRank] = useState(null);

  useEffect(() => {
    if (trader.id) {
      return trader.subscribeToRank(newRank => setRank(newRank));
    }

    return () => {};
  }, [trader.id]);

  return rank;
}

export default Header;
