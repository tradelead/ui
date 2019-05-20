import React, { useState, useEffect, useContext } from 'react';
import './Leaderboard.css';
import { ColumnsToTabs, ColumnTab } from '../ColumnsToTabs/ColumnsToTabs';
import LeaderDisplay from '../LeaderDisplay/LeaderDisplay';
import AppContext from '../../AppContext';

const Leaderboard = () => {
  const { traderService } = useContext(AppContext);
  const [allTimeTopTraders, allTimeLoading] = useTopTraders({ traderService, limit: 15 });
  const [weeklyTopTraders, weeklyLoading] = useTopTraders({ traderService, period: 'week', limit: 15 });
  const [dailyTopTraders, dailyLoading] = useTopTraders({ traderService, period: 'day', limit: 15 });

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

function useTopTraders({ traderService, period, limit }) {
  const [topTraders, setTopTraders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => (traderService.subscribeToTopTraders(
    { period, limit },
    (newTopTraders) => {
      setTopTraders(newTopTraders);
      setLoading(false);
    },
  )), [traderService, period, limit]);

  return [topTraders, loading];
}

export default Leaderboard;
