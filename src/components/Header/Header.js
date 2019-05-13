import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LabeledBadge from './LabeledBadge/LabeledBadge';
import AccountMenu from './AccountMenu/AccountMenu';

const Header = () => {
  const [score, setScore] = useState(null);
  const [rank, setRank] = useState(null);

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

export default Header;
