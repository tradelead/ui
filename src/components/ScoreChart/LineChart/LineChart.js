import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { AreaClosed, Line } from '@vx/shape';
import { curveMonotoneX } from '@vx/curve';
import { localPoint } from '@vx/event';
import { scaleTime, scaleLinear } from '@vx/scale';
import { extent, max, bisector } from 'd3-array';
import { timeFormat } from 'd3-time-format';

const LineChart = (props) => {
  const {
    data,
    width,
    height,
    margin,
  } = props;

  const [activePoint, setActivePoint] = useState({});
  const [activePointX, setActivePointX] = useState(-1);
  const [activePointY, setActivePointY] = useState(-1);

  const xSelector = d => new Date(d.time);
  const ySelector = d => d.value;

  const xMin = margin.left;
  const xMax = width - margin.right;

  const yMin = margin.bottom;
  const yMax = height - margin.top;

  const xScale = scaleTime({
    range: [xMin, xMax],
    domain: extent(data, xSelector),
  });

  const yScale = scaleLinear({
    range: [yMax, yMin],
    domain: [0, max(data, ySelector)],
    nice: true,
  });

  const chartMouseAndTouchHandler = end => (event) => {
    if (end) {
      setActivePoint({});
      setActivePointX(-1);
      setActivePointY(-1);
      return;
    }

    const { x } = localPoint(event);
    const xVal = xScale.invert(x);
    const xBisect = bisector(xSelector).left;
    const index = xBisect(data, xVal, 1);

    const d0 = data[index - 1];
    const d1 = data[index];
    const d1ClosestToVal = xVal - xSelector(d0) > xSelector(d1) - xVal;
    const d = d1 && d1ClosestToVal ? d1 : d0;

    setActivePoint(d);
    setActivePointX(xScale(xSelector(d)));
    setActivePointY(yScale(ySelector(d)));
  };

  return (
    <div className="score-line-chart">

      <svg width={width} height={height}>
        <rect x={0} y={0} width={width} height={height} fill="#32deaa" rx={14} />

        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.2} />
          </linearGradient>
        </defs>

        <AreaClosed
          data={data}
          x={d => xScale(xSelector(d))}
          y={d => yScale(ySelector(d))}
          yScale={yScale}
          strokeWidth={1}
          stroke="url(#gradient)"
          fill="url(#gradient)"
          curve={curveMonotoneX}
        />

        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="transparent"
          rx={14}
          onTouchStart={chartMouseAndTouchHandler()}
          onTouchMove={chartMouseAndTouchHandler()}
          onMouseMove={chartMouseAndTouchHandler()}
          onMouseLeave={chartMouseAndTouchHandler(true)}
        />
      </svg>
    </div>
  );
};

LineChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    time: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  })).isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  margin: PropTypes.shape({
    top: PropTypes.number,
    right: PropTypes.number,
    bottom: PropTypes.number,
    left: PropTypes.number,
  }),
};

LineChart.defaultProps = {
  margin: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
};

export default LineChart;
