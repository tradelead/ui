import React from 'react';
import Container from 'react-bootstrap/Container';
import './LeaderboardScreen.css';
import Leaderboard from '../../components/Leaderboard/Leaderboard';

const LeaderboardScreen = () => (
  <div className="leaderboard-screen">
    <Container>
      <Leaderboard />
    </Container>
  </div>
);

export default LeaderboardScreen;
