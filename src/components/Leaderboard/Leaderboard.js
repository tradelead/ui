import React from 'react';
import PropTypes from 'prop-types';
import './Leaderboard.css';
import { ColumnsToTabs, ColumnTab } from '../ColumnsToTabs/ColumnsToTabs';
import LeaderDisplay from '../LeaderDisplay/LeaderDisplay';
import TopTradersPropType from '../../propTypes/TopTraders';

const Leaderboard = ({
  loading,
  allTimeTopTraders,
  weeklyTopTraders,
  dailyTopTraders,
}) => {
  return (
    <div className="leaderboard">
      <ColumnsToTabs tabBreakpoint={991}>
        <ColumnTab label="All Time">
          <LeaderDisplay traders={allTimeTopTraders} loading={loading} />
        </ColumnTab>

        <ColumnTab label="Weekly">
          <LeaderDisplay traders={weeklyTopTraders} loading={loading} />
        </ColumnTab>

        <ColumnTab label="Today">
          <LeaderDisplay traders={dailyTopTraders} loading={loading} />
        </ColumnTab>
      </ColumnsToTabs>
    </div>
  );
};

Leaderboard.propTypes = {
  loading: PropTypes.bool.isRequired,
  allTimeTopTraders: TopTradersPropType.isRequired,
  weeklyTopTraders: TopTradersPropType.isRequired,
  dailyTopTraders: TopTradersPropType.isRequired,
};

export default Leaderboard;
