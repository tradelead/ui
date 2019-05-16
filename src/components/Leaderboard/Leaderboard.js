import React, { useState, useEffect, useContext } from 'react';
import './Leaderboard.css';
import { ColumnsToTabs, ColumnTab } from '../ColumnsToTabs/ColumnsToTabs';
import LeaderDisplay from '../LeaderDisplay/LeaderDisplay';
import AppContext from '../../AppContext';

const Leaderboard = () => {
  const { traderScore } = useContext(AppContext);
  const [allTimeTopTraders, allTimeLoading] = useTopTraders({ traderScore, limit: 15 });
  const [weeklyTopTraders, weeklyLoading] = useTopTraders({ traderScore, period: 'week', limit: 15 });
  const [dailyTopTraders, dailyLoading] = useTopTraders({ traderScore, period: 'day', limit: 15 });

  return (
    <div className="leaderboard">
      <ColumnsToTabs tabBreakpoint={991}>
        <ColumnTab label="All Time">
          <LeaderDisplay traders={allTimeTopTraders} loading={allTimeLoading} />
        </ColumnTab>

        <ColumnTab label="Weekly">
          <LeaderDisplay traders={weeklyTopTraders} loading={weeklyLoading} />
        </ColumnTab>

        <ColumnTab label="Today">
          <LeaderDisplay traders={dailyTopTraders} loading={dailyLoading} />
        </ColumnTab>
      </ColumnsToTabs>
    </div>
  );
};

function useTopTraders({ traderScore, period, limit }) {
  const [topTraders, setTopTraders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => (traderScore.subscribeToTopTraders(
    { period, limit },
    (newTopTraders) => {
      setTopTraders(newTopTraders);
      setLoading(false);
    },
  )), [traderScore, period, limit]);

  return [topTraders, loading];
}

export default Leaderboard;
