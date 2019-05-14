import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LabeledBadge from './LabeledBadge/LabeledBadge';
import AccountMenu from './AccountMenu/AccountMenu';
import AppContext from '../../AppContext';

const Header = () => {
  const app = useContext(AppContext);
  const score = useTraderScore(app.trader);
  const rank = useTraderRank(app.trader);

  return (
    <div className="header">
      <div className="branding">
        <img src={`${process.env.PUBLIC_URL}/logo.svg`} alt="TradeLead" />
      </div>

      <ul className="navigation">
        <li><Link to="/">Performance</Link></li>
        <li><Link to="/leaderboard">Leaderboard</Link></li>
      </ul>

      {(score) ? <LabeledBadge label="Score" value={score} /> : ''}
      {(rank) ? <LabeledBadge label="Rank" value={rank} /> : ''}

      <AccountMenu />
    </div>
  );
};

function useTraderScore(trader) {
  const [score, setScore] = useState(null);

  useEffect(() => {
    const getScore = async () => {
      setScore(await trader.getScore());
    };

    getScore();
  });

  return score;
}

function useTraderRank(trader) {
  const [rank, setRank] = useState(null);

  useEffect(() => {
    const getRank = async () => {
      setRank(await trader.getRank());
    };

    getRank();
  });

  return rank;
}

export default Header;
