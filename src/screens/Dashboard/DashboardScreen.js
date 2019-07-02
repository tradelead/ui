import React, { useContext, useRef } from 'react';
import { Redirect } from 'react-router-dom';
import './DashboardScreen.css';
import { ScoreChartContainer } from '../../components/ScoreChart/ScoreChartContainer';
import AppContext from '../../AppContext';
import useElSize from '../../hooks/useElSize';
import useNoUserRedirect from '../../hooks/useNoUserRedirect';

const DashboardScreen = () => {
  const app = useContext(AppContext);
  const wrapEl = useRef({});
  const [width, height] = useElSize(wrapEl);

  const redirect = useNoUserRedirect();
  if (redirect) {
    return <Redirect to="/leaders" />;
  }

  return (
    <div className="dashboard-screen" ref={wrapEl}>
      <ScoreChartContainer userID={app.user.id} width={width} height={height} />
    </div>
  );
};

export default DashboardScreen;
