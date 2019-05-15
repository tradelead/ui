import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { EventEmitter } from 'fbemitter';
import DashboardScreen from './screens/Dashboard/DashboardScreen';
import LeaderboardScreen from './screens/Leaderboard/LeaderboardScreen';
import TraderProfileScreen from './screens/TraderProfile/TraderProfileScreen';
import AccountScreen from './screens/Account/AccountScreen';
import Header from './components/Header/Header';
import AppContext from './AppContext';

function App() {
  const ctx = {
    auth: {
      login: () => console.log('login'),
      register: () => console.log('register'),
      logout: () => console.log('logout'),
    },
    trader: Object.assign(new EventEmitter(), {
      id: 'trader123',
      get: async (key, args) => console.log('get', key, args),
      async getScore() {
        return 123;
      },
      async getRank() {
        return 12;
      },
      subscribeToScoreHistory(opts, callback) {
        const DAY_SEC = 24 * 60 * 60 * 1000;

        callback([
          { time: Date.now() - DAY_SEC * 3, score: 100 },
          { time: Date.now() - DAY_SEC * 2.5, score: 115 },
          { time: Date.now() - DAY_SEC * 2, score: 125 },
          { time: Date.now() - DAY_SEC * 1.5, score: 105 },
          { time: Date.now() - DAY_SEC * 1.1, score: 150 },
          { time: Date.now() - DAY_SEC, score: 140 },
        ]);
      },
    }),
  };

  return (
    <AppContext.Provider value={ctx}>
      <Router>
        <div className="App">
          <Header />

          <Route path="/" exact component={DashboardScreen} />
          <Route path="/leaders" component={LeaderboardScreen} />
          <Route path="/trader/:id" component={TraderProfileScreen} />
          <Route path="/account" component={AccountScreen} />
        </div>
      </Router>
    </AppContext.Provider>
  );
}

export default App;
