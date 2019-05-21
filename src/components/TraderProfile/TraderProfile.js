import React, { useRef } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import TraderPropType from '../../propTypes/Trader';
import useElSize from '../../hooks/useElSize';
import ScoreChart from '../ScoreChart/ScoreChart';
import TraderInfo from './TraderInfo';
import './TraderProfile.css';

const TraderProfile = ({ trader }) => {
  const chartWrapEl = useRef({});
  const [chartWidth, chartHeight] = useElSize(chartWrapEl);
  console.log(chartWidth, chartHeight);

  return (
    <div className="trader-profile">
      <Container fluid>
        <Row>
          <Col lg className="traderInfoWrap">
            <TraderInfo trader={trader} />
          </Col>

          <Col lg className="traderScoreWrap">
            <div className="traderScoreWrapInner" ref={chartWrapEl}>
              <ScoreChart trader={trader} width={chartWidth} height={chartHeight} />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

TraderProfile.propTypes = {
  trader: TraderPropType.isRequired,
};

export default TraderProfile;
