import React, { useState } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { EventEmitter } from 'fbemitter';
import { push as Menu } from 'react-burger-menu';
import DashboardScreen from './screens/Dashboard/DashboardScreen';
import LeaderboardScreen from './screens/Leaderboard/LeaderboardScreen';
import TraderProfileScreen from './screens/TraderProfile/TraderProfileScreen';
import AccountScreen from './screens/Account/AccountScreen';
import Header from './components/Header/Header';
import AppContext from './AppContext';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => { setMenuOpen(false); };

  const sleep = async ms => new Promise(resolve => setTimeout(resolve, ms));
  const mockTrader = Object.assign(new EventEmitter(), {
    id: 'trader123',
    username: 'tradername123',
    get: async () => ({}),
    async getScore() {
      await sleep(150); // random delay to simulate network request
      return 123;
    },
    async getRank() {
      await sleep(150); // random delay to simulate network request
      return 12;
    },
    subscribeToScoreHistory(opts, callback) {
      const DAY_SEC = 24 * 60 * 60 * 1000;
      const scoreHistory = [
        { time: Date.now() - DAY_SEC * 3, score: 100 },
        { time: Date.now() - DAY_SEC * 2.5, score: 115 },
        { time: Date.now() - DAY_SEC * 2.49, score: 110 },
        { time: Date.now() - DAY_SEC * 2, score: 125 },
        { time: Date.now() - DAY_SEC * 1.5, score: 105 },
        { time: Date.now() - DAY_SEC * 1.1, score: 150 },
        { time: Date.now() - DAY_SEC, score: 140 },
      ];

      // random delay to simulate network request
      setTimeout(() => callback(scoreHistory), 280);
    },
  });

  const ctx = {
    auth: {
      login: () => {},
      register: () => {},
      logout: () => {},
    },
    trader: mockTrader,
    traderScore: {
      subscribeToTopTraders({ limit }, callback) {
        const traders = new Array(limit).fill({
          trader: mockTrader,
          rank: 123,
          score: 1234,
        });

        // random delay to simulate network request
        setTimeout(() => callback(traders), 300);
      },
    },
  };

  return (
    <AppContext.Provider value={ctx}>
      <Router>
        <div id="App" className="App">
          <Menu
            right
            pageWrapId="page-wrap"
            outerContainerId="App"
            isOpen={menuOpen}
            onStateChange={state => setMenuOpen(state.isOpen)}
          >
            <Header closeMenu={closeMenu} />
          </Menu>

          <div id="page-wrap">
            <div className="header">
              <Header />
            </div>
            <Route path="/" exact component={DashboardScreen} />
            <Route path="/leaders" component={LeaderboardScreen} />
            <Route path="/trader/:id" component={TraderProfileScreen} />
            <Route path="/account" component={AccountScreen} />
          </div>
        </div>
      </Router>
    </AppContext.Provider>
  );
}

export default App;
