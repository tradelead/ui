import React from 'react';
import PropTypes from 'prop-types';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import { timeFormat } from 'd3-time-format';
import './ScoreChart.css';
import Filters from './Filters';
import LabeledBadge from './LabeledBadge';
import LineChart from './LineChart/LineChart';

const ScoreChart = ({
  scoreHistory,
  loading,
  errors,
  setDuration,
  width,
  height,
}) => {
  const firstScore = (scoreHistory.length > 0) ? scoreHistory[0] : {};
  const lastScore = (scoreHistory.length > 0) ? scoreHistory[scoreHistory.length - 1] : {};
  const growthRatio = (lastScore.score / firstScore.score);
  const growthPercent = ((growthRatio - 1) * 100).toFixed(1);
  const growth = scoreHistory.length > 0 ? `${growthPercent}%` : '...';

  let historyDayDuration = (lastScore.time - firstScore.time) / (24 * 60 * 60 * 1000);
  historyDayDuration = (historyDayDuration > 1) ? historyDayDuration : 1;
  const dailyAvgValid = growthRatio > 0 && historyDayDuration > 0;
  const dailyAvgPercent = (dailyAvgValid) ? (growthPercent / historyDayDuration).toFixed(1) : 0;
  const dailyAvg = growthRatio && historyDayDuration ? `${dailyAvgPercent}%` : '...';

  const chartData = scoreHistory.map(item => Object.assign({}, {
    time: item.time,
    date: new Date(item.time),
    dateFormatted: timeFormat('%b %d @ %I %p')(new Date(item.time)),
    value: item.score,
  }));

  return (
    <div className="score-chart">
      <div className="errors">
        {errors && errors.map(error => (<Alert key={error.message} variant="danger">{error.message}</Alert>))}
      </div>

      {loading && (
        <Spinner size="sm" animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
      )}

      <div className="chart-controls">
        <Filters
          onSelect={setDuration}
          filters={[
            { label: 'Today', value: 1 },
            { label: 'Week', value: 7 },
            { label: 'Month', value: 30, default: true },
            { label: 'All', value: 0 },
          ]}
        />

        <div className="labeled-badges">
          <LabeledBadge className="growth" label="Growth" value={growth} />
          <LabeledBadge className="daily-avg" label="Daily Avg" value={dailyAvg} />
        </div>
      </div>

      <LineChart
        data={chartData}
        height={height}
        width={width}
        marginTop={determineMarginTop({ width, height })}
      />
    </div>
  );
};

function determineMarginTop({ width }) {
  if (width < 1200) {
    return 15;
  }

  return 5;
}

ScoreChart.propTypes = {
  scoreHistory: PropTypes.arrayOf(PropTypes.shape({
    time: PropTypes.number.isRequired,
    score: PropTypes.number.isRequired,
  })).isRequired,
  loading: PropTypes.bool.isRequired,
  setDuration: PropTypes.func.isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
};

export default ScoreChart;
