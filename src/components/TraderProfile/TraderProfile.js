import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import useElSize from '../../hooks/useElSize';
import { ScoreChartContainer as ScoreChart } from '../ScoreChart/ScoreChartContainer';
import { TraderInfoContainer as TraderInfo } from './TraderInfoContainer';
import './TraderProfile.css';

const TraderProfile = ({ userID }) => {
  const chartWrapEl = useRef({});
  const [chartWidth, chartHeight] = useElSize(chartWrapEl);

  return (
    <div className="trader-profile">
      <Container fluid>
        <Row>
          <Col lg className="traderInfoWrap">
            <TraderInfo userID={userID} />
          </Col>

          <Col lg className="traderScoreWrap">
            <div className="traderScoreWrapInner" ref={chartWrapEl}>
              <ScoreChart userID={userID} width={chartWidth} height={chartHeight} />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

TraderProfile.propTypes = {
  userID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default TraderProfile;
