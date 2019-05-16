import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './ScoreChart.css';
import Filters from './Filters';
import LabeledBadge from './LabeledBadge';
import LineChart from './LineChart/LineChart';

const ScoreChart = ({ trader, width, height }) => {
  const [durationFilter, setDurationFilter] = useState(30);

  const scoreHistory = useTraderScoreHistory({ trader, duration: durationFilter });
  const firstScore = (scoreHistory.length > 0) ? scoreHistory[0] : {};
  const lastScore = (scoreHistory.length > 0) ? scoreHistory[scoreHistory.length - 1] : {};
  const growthRatio = (lastScore.score / firstScore.score);
  const growthPercent = ((growthRatio - 1) * 100).toFixed(1);
  const growth = `${growthPercent}%`;

  let historyDayDuration = (lastScore.time - firstScore.time) / (24 * 60 * 60 * 1000);
  historyDayDuration = (historyDayDuration > 1) ? historyDayDuration : 1;
  const dailyAvgValid = growthRatio > 0 && historyDayDuration > 0;
  const dailyAvgPercent = (dailyAvgValid) ? (growthPercent / historyDayDuration).toFixed(1) : 0;
  const dailyAvg = `${dailyAvgPercent}%`;

  const chartData = scoreHistory.map(item => Object.assign({}, {
    time: item.time,
    value: item.score,
  }));

  return (
    <div className="score-chart">
      <div className="chart-controls">
        <Filters
          onSelect={setDurationFilter}
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

function useTraderScoreHistory({ trader, duration }) {
  const [scoreHistory, setScoreHistory] = useState([]);
  useEffect(() => {
    if (trader.id) {
      return trader.subscribeToScoreHistory(
        { duration },
        newScoreHistory => setScoreHistory(newScoreHistory),
      );
    }

    return () => {};
  }, [trader.id, duration]);

  return scoreHistory;
}

function determineMarginTop({ width, height }) {
  console.log(width, height, width < 1200, height < 500);
  if (width < 1200) {
    console.log('margin-top: 12');
    return 15;
  }

  console.log('margin-top: 5');
  return 5;
}

ScoreChart.propTypes = {
  trader: PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    subscribeToScoreHistory: PropTypes.func,
  }).isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
};

export default ScoreChart;