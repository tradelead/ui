import React, { useContext, useEffect, useState } from 'react';
import './DashboardScreen.css';
import ScoreChart from '../../components/ScoreChart/ScoreChart';
import AppContext from '../../AppContext';

const DashboardScreen = () => {
  const app = useContext(AppContext);
  const [wrapEl, setWrapEl] = useState(null);
  const { width, height } = useElSize(wrapEl);

  return (
    <div className="dashboard-screen" ref={el => setWrapEl(el)}>
      <ScoreChart trader={app.trader} width={width} height={height} />
    </div>
  );
};

function useElSize(el) {
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (el) {
      const setSizeToEl = () => { setWidth(el.clientWidth); setHeight(el.clientHeight); };
      setSizeToEl();
      window.addEventListener('resize', setSizeToEl);
      return () => window.removeEventListener('resize', setSizeToEl);
    }

    return () => {};
  }, [el]);

  return { width, height };
}

export default DashboardScreen;
