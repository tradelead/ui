import React from 'react';
import Container from 'react-bootstrap/Container';
import './LeaderboardScreen.css';
import { LeaderboardContainer as Leaderboard } from '../../components/Leaderboard/LeaderboardContainer';

const LeaderboardScreen = () => (
  <div className="leaderboard-screen">
    <Container>
      <Leaderboard />
    </Container>
  </div>
);

export default LeaderboardScreen;
