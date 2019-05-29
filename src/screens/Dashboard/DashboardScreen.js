import React, { useContext, useRef } from 'react';
import './DashboardScreen.css';
import { ScoreChartContainer } from '../../components/ScoreChart/ScoreChartContainer';
import AppContext from '../../AppContext';
import useElSize from '../../hooks/useElSize';

const DashboardScreen = () => {
  const app = useContext(AppContext);
  const wrapEl = useRef({});
  const [width, height] = useElSize(wrapEl);

  return (
    <div className="dashboard-screen" ref={wrapEl}>
      <ScoreChartContainer userID={app.user.id} width={width} height={height} />
    </div>
  );
};

export default DashboardScreen;
