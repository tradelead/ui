import React, { useContext, useRef } from 'react';
import './DashboardScreen.css';
import ScoreChart from '../../components/ScoreChart/ScoreChart';
import AppContext from '../../AppContext';
import useElSize from '../../hooks/useElSize';

const DashboardScreen = () => {
  const app = useContext(AppContext);
  const wrapEl = useRef({});
  const [width, height] = useElSize(wrapEl);

  return (
    <div className="dashboard-screen" ref={wrapEl}>
      <ScoreChart trader={app.trader} width={width} height={height} />
    </div>
  );
};

export default DashboardScreen;
