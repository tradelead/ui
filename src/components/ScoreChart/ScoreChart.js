import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Filters from './Filters';
import LabeledBadge from './LabeledBadge';
import LineChart from './LineChart/LineChart';

const ScoreChart = ({ trader }) => {
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
      <Filters
        onSelect={setDurationFilter}
        filters={[
          { label: 'Today', value: 1 },
          { label: 'Week', value: 7 },
          { label: 'Month', value: 30 },
          { label: 'All', value: 0 },
        ]}
      />

      <LabeledBadge className="growth" label="Growth" value={growth} />
      <LabeledBadge className="daily-avg" label="Daily Avg" value={dailyAvg} />

      <LineChart data={chartData} />
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

ScoreChart.propTypes = {
  trader: PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    subscribeToScoreHistory: PropTypes.func,
  }).isRequired,
};

export default ScoreChart;
