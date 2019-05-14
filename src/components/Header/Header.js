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
        <li><Link to="/leaders">Leaders</Link></li>
      </ul>

      {(score) ? <LabeledBadge className="score" label="Score" value={score} /> : ''}
      {(rank) ? <LabeledBadge className="rank" label="Rank" value={rank} /> : ''}

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

    const scoreUpdates = () => trader.addListener('newScore', newScore => setScore(newScore));

    if (trader.id) {
      getScore();
      const listener = scoreUpdates();
      return () => listener.remove();
    }

    return () => {};
  }, [trader.id]);

  return score;
}

function useTraderRank(trader) {
  const [rank, setRank] = useState(null);

  useEffect(() => {
    const getRank = async () => {
      setRank(await trader.getRank());
    };

    const rankUpdates = () => trader.addListener('newRank', newRank => setRank(newRank));

    if (trader.id) {
      getRank();
      const listener = rankUpdates();
      return () => listener.remove();
    }

    return () => {};
  }, [trader.id]);

  return rank;
}

export default Header;
