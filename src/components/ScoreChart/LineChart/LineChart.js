import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './LineChart.css';
import { AreaClosed, Line, LinePath } from '@vx/shape';
import { curveMonotoneX } from '@vx/curve';
import { localPoint } from '@vx/event';
import { scaleTime, scaleLinear } from '@vx/scale';
import { AxisRight, AxisBottom } from '@vx/axis';
import { withTooltip, Tooltip } from '@vx/tooltip';
import {
  extent,
  max,
  min,
  bisector,
} from 'd3-array';
import { timeFormat } from 'd3-time-format';
import moize from 'moize';
import { Motion, spring } from 'react-motion';
import findPathYatX from '../../../utils/findPathYatX';

const LinePathMem = moize.reactSimple(LinePath);
const AreaClosedMem = moize.reactSimple(AreaClosed);
const AxisRightMem = moize.reactSimple(AxisRight);
const AxisBottomMem = moize.reactSimple(AxisBottom);

const LineChart = (props) => {
  const {
    data,
    width,
    height,
    marginTop,
    showTooltip, // eslint-disable-line
    hideTooltip, // eslint-disable-line
    tooltipData, // eslint-disable-line
    tooltipLeft, // eslint-disable-line
  } = props;
  const [pathRef, setPathRef] = useState(null);

  const activePoint = tooltipData;
  const activePointX = tooltipLeft;

  const xSelector = d => new Date(d.time);
  const ySelector = d => d.value;

  const marginRight = 50;

  const xMin = 0;
  const xMax = width - marginRight;

  const yMin = 0;
  const yMax = height;

  const xScale = useXScale({
    data,
    xSelector,
    xMax,
  });

  const yScale = useYScale({
    data,
    ySelector,
    yMax,
    marginTop,
  });

  const chartMouseAndTouchHandler = end => (event) => {
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

    if (!d0) { return; }

    const d1ClosestToVal = d1 && xVal - xSelector(d0) > xSelector(d1) - xVal;
    const d = d1ClosestToVal ? d1 : d0;

    showTooltip({
      tooltipData: d,
      tooltipLeft: xScale(xSelector(d)),
      tooltipTop: yScale(ySelector(d)),
    });
  };

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
          innerRef={setPathRef}
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

        {pathRef && activePoint && (
          <Motion
            defaultStyle={{ opacity: 0, x: activePointX }}
            style={{
              opacity: spring(activePoint ? 1 : 0),
              x: spring(activePointX),
            }}
          >
            {(style) => {
              const y = findPathYatX(style.x, pathRef);
              return (
                <g className="crosshairs">
                  <Line
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

                  <Line
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
          onTouchStart={chartMouseAndTouchHandler()}
          onTouchMove={chartMouseAndTouchHandler()}
          onMouseMove={chartMouseAndTouchHandler()}
          onMouseLeave={chartMouseAndTouchHandler(true)}
        />
      </svg>

      {pathRef && activePoint && (
        <Motion
          defaultStyle={{ opacity: 0, x: activePointX }}
          style={{
            opacity: spring(activePoint ? 1 : 0),
            x: spring(activePointX),
          }}
        >
          {(style) => {
            const y = findPathYatX(style.x, pathRef);
            return (
              <div className="chart-tooltips">
                <Tooltip
                  className="x-axis-tooltip"
                  top={height}
                  left={style.x}
                >
                  {timeFormat('%b %d @ %I %p')(xSelector(activePoint))}
                </Tooltip>

                <Tooltip
                  className="y-axis-tooltip"
                  top={y}
                  left={width}
                >
                  {ySelector(activePoint)}
                </Tooltip>
              </div>
            );
          }}
        </Motion>
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

function useXScale({ data, xSelector, xMax }) {
  const [xScale, setXScale] = useState(null);
  useEffect(() => {
    const xScaleFn = scaleTime({
      range: [0, xMax],
      domain: extent(data, xSelector),
    });
    setXScale(() => xScaleFn);
  }, [data]);

  return xScale;
}

function useYScale({
  data,
  ySelector,
  yMax,
  marginTop,
}) {
  const [yScale, setYScale] = useState(null);
  useEffect(() => {
    const yMinValue = min(data, ySelector);
    const yMaxValue = max(data, ySelector);
    const yMinValuePadded = yMinValue - ((yMaxValue - yMinValue) * 0.2);
    const yMaxValuePadded = yMaxValue + (yMaxValue * (marginTop / 100));

    const yScaleFn = scaleLinear({
      range: [yMax, 0],
      domain: [yMinValuePadded, yMaxValuePadded],
      nice: true,
    });

    setYScale(() => yScaleFn);
  }, [data]);

  return yScale;
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
