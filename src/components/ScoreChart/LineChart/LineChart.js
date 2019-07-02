import React, { useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import './LineChart.css';
import { AreaClosed, Line, LinePath } from '@vx/shape';
import { curveMonotoneX } from '@vx/curve';
import { localPoint } from '@vx/event';
import { scaleTime, scaleLinear } from '@vx/scale';
import { AxisRight, AxisBottom } from '@vx/axis';
import { withTooltip } from '@vx/tooltip';
import throttle from 'lodash.throttle';

import {
  extent,
  max,
  min,
  bisector,
} from 'd3-array';
import moize from 'moize';
import { Motion, spring } from 'react-motion';
import findPathYatX from '../../../utils/findPathYatX';

const LineMem = moize.reactSimple(Line);
const LinePathMem = moize.reactSimple(LinePath);
const AreaClosedMem = moize.reactSimple(AreaClosed);
const AxisRightMem = moize.reactSimple(AxisRight);
const AxisBottomMem = moize.reactSimple(AxisBottom);

const xSelector = d => d.date;
const ySelector = d => d.value;


const LineChart = (props) => {
  const {
    data,
    width,
    height,
    marginTop,
    showTooltip, // eslint-disable-line
    tooltipData, // eslint-disable-line
    tooltipLeft, // eslint-disable-line
  } = props;
  const pathRef = useRef({});

  const activePoint = tooltipData;
  const activePointX = tooltipLeft;

  const marginRight = 50;

  const xMin = 0;
  const xMax = width - marginRight;

  const yMin = 0;
  const yMax = height;

  const xScale = useXScale({
    data,
    xMax,
  });

  const yScale = useYScale({
    data,
    yMax,
    marginTop,
  });

  const interactiveMoveHandler = useChartMouseAndTouchHandler({
    end: false,
    showTooltip,
    xScale,
    data,
  });

  if (!xScale || !yScale) { return (<div className="score-line-chart" />); }

  return (
    <div className="score-line-chart">
      <svg width={width} height={height}>
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1d72f8" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#5502ff" stopOpacity={0.03} />
          </linearGradient>

          <filter id="blur-filter" x="-2" y="-2" width="200" height="200">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" />
          </filter>
        </defs>

        <AreaClosedMem
          data={data}
          x={d => xScale(xSelector(d))}
          y={d => yScale(ySelector(d))}
          yScale={yScale}
          strokeWidth={1}
          stroke="url(#gradient)"
          fill="url(#gradient)"
          curve={curveMonotoneX}
        />

        <LinePathMem
          data={data}
          x={d => xScale(xSelector(d))}
          y={d => yScale(ySelector(d))}
          curve={curveMonotoneX}
          strokeWidth={4}
          stroke="#1d72f8"
          style={{ filter: 'url(#blur-filter)', opacity: 0.7 }}
        />

        <LinePathMem
          data={data}
          x={d => xScale(xSelector(d))}
          y={d => yScale(ySelector(d))}
          curve={curveMonotoneX}
          strokeWidth={2}
          stroke="#1d72f8"
          innerRef={pathRef}
        />

        <g className="x-axis-legend-wrap">
          <AxisBottomMem
            axisClassName="x-axis-legend"
            tickClassName="x-axis-tick"
            axisLineClassName="x-axis-line"
            top={height}
            left={xMin}
            scale={xScale}
            hideZero
            numTicks={numTicksForWidth(width)}
            tickComponent={({ formattedValue, ...tickProps }) => (
              <text {...tickProps}>{formattedValue}</text>
            )}
          />
        </g>

        <g className="y-axis-legend-wrap">
          <AxisRightMem
            axisClassName="y-axis-legend"
            tickClassName="y-axis-tick"
            axisLineClassName="y-axis-line"
            top={yMin}
            left={xMax}
            scale={yScale}
            hideZero
            numTicks={numTicksForHeight(height)}
            tickComponent={({ formattedValue, ...tickProps }) => (
              <text {...tickProps}>{formattedValue}</text>
            )}
          />
        </g>

        {pathRef.current && activePoint && (
          <Motion
            defaultStyle={{ opacity: 0, x: activePointX }}
            style={{
              opacity: spring(activePoint ? 1 : 0),
              x: spring(activePointX),
            }}
          >
            {(style) => {
              const y = findPathYatX(style.x, pathRef.current);
              return (
                <g className="crosshairs">
                  <LineMem
                    className="y-axis"
                    from={{ x: style.x, y: yMin }}
                    to={{ x: style.x, y: yMax }}
                    fillOpacity={style.opacity}
                    strokeOpacity={style.opacity}
                    stroke="rgba(92, 119, 235, 0.500)"
                    strokeWidth={1}
                    style={{ pointerEvents: 'none' }}
                    strokeDasharray="2,2"
                  />

                  <LineMem
                    className="x-axis"
                    from={{ x: xMin, y }}
                    to={{ x: xMax, y }}
                    fillOpacity={style.opacity}
                    strokeOpacity={style.opacity}
                    stroke="rgba(92, 119, 235, 0.300)"
                    strokeWidth={1}
                    style={{ pointerEvents: 'none' }}
                    strokeDasharray="2,2"
                  />

                  <circle
                    cx={style.x}
                    cy={y}
                    fillOpacity={style.opacity}
                    strokeOpacity={style.opacity}
                    r={4}
                    fill="rgba(92, 119, 235, 1.000)"
                    stroke="white"
                    strokeWidth={2}
                    style={{ pointerEvents: 'none' }}
                  />
                </g>
              );
            }}
          </Motion>
        )}

        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="transparent"
          onTouchStart={interactiveMoveHandler}
          onTouchMove={interactiveMoveHandler}
          onMouseMove={interactiveMoveHandler}
          onMouseLeave={interactiveMoveHandler}
        />
      </svg>

      {pathRef.current && activePoint && (
        <div className="chart-tooltips">
          <div className="date">{activePoint.dateFormatted}</div>
          <div className="score">{ySelector(activePoint)}</div>
        </div>
      )}
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
  marginTop: PropTypes.number,
};

LineChart.defaultProps = {
  marginTop: 10,
};

function useXScale({ data, xMax }) {
  return useMemo(() => scaleTime({
    range: [0, xMax],
    domain: extent(data, xSelector),
  }), [data, xMax]);
}

function useYScale({
  data,
  yMax,
  marginTop,
}) {
  return useMemo(() => {
    const yMinValue = min(data, ySelector);
    const yMaxValue = max(data, ySelector);
    const yMinValuePadded = yMinValue - ((yMaxValue - yMinValue) * 0.2);
    const yMaxValuePadded = yMaxValue + (yMaxValue * (marginTop / 100));

    return scaleLinear({
      range: [yMax, 0],
      domain: [yMinValuePadded, yMaxValuePadded],
      nice: true,
    });
  }, [data, yMax, marginTop]);
}

function useChartMouseAndTouchHandler({
  end,
  hideTooltip,
  showTooltip,
  xScale,
  data,
}) {
  const chartMouseAndTouchHandler = throttle((event) => {
    if (end) {
      hideTooltip();
      return;
    }

    const { x } = localPoint(event);
    const xVal = xScale.invert(x);

    const xBisect = bisector(xSelector).left;
    const index = xBisect(data, xVal, 1);

    const d0 = data[index - 1];
    const d1 = data[index];

    if (!d0) {
      return;
    }

    const d1ClosestToVal = d1 && xVal - xSelector(d0) > xSelector(d1) - xVal;
    const d = d1ClosestToVal ? d1 : d0;

    showTooltip({
      tooltipData: d,
      tooltipLeft: xScale(xSelector(d)),
      tooltipTop: 0,
    });
  }, 100);

  const eventHandler = (e) => {
    e.persist();
    chartMouseAndTouchHandler(e);
  };

  return useMemo(() => eventHandler, [data]); // eslint-disable-line react-hooks/exhaustive-deps
}

function numTicksForHeight(height) {
  if (height <= 300) return 3;
  if (height <= 600) return 5;
  return 8;
}

function numTicksForWidth(width) {
  if (width <= 300) return 3;
  if (width <= 1200) return 5;
  return 8;
}

export default withTooltip(LineChart);
