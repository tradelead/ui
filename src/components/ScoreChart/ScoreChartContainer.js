import React, { useState } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo-hooks';
import get from 'lodash.get';
import ScoreChart from './ScoreChart';

export const GET_SCORE_HISTORY = gql`
  query getScoreHistory($id: ID!, $limit: Int!, $groupBy: String, $duration: Long) {
    getTrader(id: $id) {
      scores(input: {
        duration: $duration
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

  variables.limit = 99;

  if (duration === 0) {
    variables.groupBy = 'week';
  } else if (duration > 7) {
    variables.groupBy = 'day';
    variables.duration = duration * 24 * 60 * 60 * 1000;
  } else if (duration <= 7) {
    variables.duration = duration * 24 * 60 * 60 * 1000;
  }

  const { data, loading, error } = useQuery(GET_SCORE_HISTORY, {
    variables,
    skip: !userID,
    pollInterval: 60000,
  });

  const errors = get(error, 'graphQLErrors') || [];
  if (errors && errors.length === 0 && error) {
    errors.push(error);
  }

  return (
    <ScoreChart
      scoreHistory={get(data, 'getTrader.scores') || []}
      loading={loading}
      errors={errors}
      setDuration={setDuration}
      height={height}
      width={width}
    />
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
