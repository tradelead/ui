import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import DashboardScreen from './screens/Dashboard/DashboardScreen';
import LeaderboardScreen from './screens/Leaderboard/LeaderboardScreen';
import TraderProfileScreen from './screens/TraderProfile/TraderProfileScreen';
import AccountScreen from './screens/Account/AccountScreen';
import Header from './components/Header/Header';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />

        <Route path="/" exact component={DashboardScreen} />
        <Route path="/leaderboard" component={LeaderboardScreen} />
        <Route path="/trader/:id" component={TraderProfileScreen} />
        <Route path="/account" component={AccountScreen} />
      </div>
    </Router>
  );
}

export default App;
