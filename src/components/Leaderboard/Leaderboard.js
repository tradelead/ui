import React from 'react';
import PropTypes from 'prop-types';
import Alert from 'react-bootstrap/Alert';
import './Leaderboard.css';
import { ColumnsToTabs, ColumnTab } from '../ColumnsToTabs/ColumnsToTabs';
import LeaderDisplay from '../LeaderDisplay/LeaderDisplay';
import TopTradersPropType from '../../propTypes/TopTraders';

const Leaderboard = ({
  loading,
  allTimeTopTraders,
  weeklyTopTraders,
  dailyTopTraders,
  errors,
}) => (
  <div className="leaderboard">
    <div className="errors">
      {errors && errors.map(error => (<Alert key={error.message} variant="danger">{error.message}</Alert>))}
    </div>

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

Leaderboard.propTypes = {
  loading: PropTypes.bool.isRequired,
  allTimeTopTraders: TopTradersPropType.isRequired,
  weeklyTopTraders: TopTradersPropType.isRequired,
  dailyTopTraders: TopTradersPropType.isRequired,
  errors: PropTypes.arrayOf(PropTypes.instanceOf(Error)),
};

Leaderboard.defaultProps = {
  errors: null,
};

export default Leaderboard;
