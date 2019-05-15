import React, { useContext, useEffect, useState } from 'react';
import './DashboardScreen.css';
import ScoreChart from '../../components/ScoreChart/ScoreChart';
import AppContext from '../../AppContext';

const DashboardScreen = () => {
  const app = useContext(AppContext);
  const [wrapEl, setWrapEl] = useState(null);
  const height = useElHeight(wrapEl);
  const width = useWindowWidth();

  return (
    <div className="dashboard-screen" ref={el => setWrapEl(el)}>
      <ScoreChart trader={app.trader} height={height} width={width} />
    </div>
  );
};

function useWindowWidth() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const setWidthToWindow = () => setWidth(window.innerWidth);
    setWidthToWindow();
    window.addEventListener('resize', setWidthToWindow);
    return () => window.removeEventListener('resize', setWidthToWindow);
  }, []);

  return width;
}

function useElHeight(el) {
  const [height, setHeight] = useState(0);
  console.log(el);
  useEffect(() => {
    if (el) {
      console.log(el.clientHeight);
      const setHeightToEl = () => setHeight(el.clientHeight);
      setHeightToEl();
      window.addEventListener('resize', setHeightToEl);
      return () => window.removeEventListener('resize', setHeightToEl);
    }

    return () => {};
  }, [el]);

  return height;
}

export default DashboardScreen;
