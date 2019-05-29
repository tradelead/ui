import React, { useState } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import get from 'lodash.get';
import ScoreChart from './ScoreChart';

export const GET_SCORE_HISTORY = gql`
  query getScoreHistory($id: ID, $groupBy: String, $startTime: Long, $limit: Int) {
    getTrader(id: $id) {
      scores(input: {
        startTime: $startTime
        groupBy: $groupBy
        limit: $limit
      }) {
        score
        time
      }
    }
  }
`;

function ScoreChartContainer({ userID, height, width }) {
  const [duration, setDuration] = useState(30);
  const variables = {
    id: userID,
  };

  variables.limit = 499;

  if (duration === 0) {
    variables.groupBy = 'week';
  } else if (duration > 7) {
    variables.groupBy = 'day';
    variables.duration = duration * 24 * 60 * 60 * 1000;
  } else if (duration <= 7) {
    variables.duration = duration * 24 * 60 * 60 * 1000;
  }

  return (
    <Query
      query={GET_SCORE_HISTORY}
      variables={variables}
      skip={!userID}
      pollInterval={60000}
    >
      {({ loading, data, error }) => (
        <ScoreChart
          scoreHistory={get(data, 'getTrader.scores') || []}
          loading={loading}
          errors={get(error, 'graphQLErrors')}
          setDuration={setDuration}
          height={height}
          width={width}
        />
      )}
    </Query>
  );
}

ScoreChartContainer.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  userID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

ScoreChartContainer.defaultProps = {
  width: 600,
  height: 600,
  userID: '',
};

export { ScoreChartContainer };
