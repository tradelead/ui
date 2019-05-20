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
  const mockTrader = getMockTrader();

  const ctx = {
    auth: {
      login: () => {},
      register: () => {},
      logout: () => {},
    },
    trader: mockTrader,
    traderService: {
      subscribeToTopTraders({ limit }, callback) {
        const traders = new Array(limit).fill({
          trader: mockTrader,
          rank: 123,
          score: 1234,
        });

        // random delay to simulate network request
        setTimeout(() => callback(traders), 300);
      },
      async getTrader(username) {
        await sleep(200);

        if (username === 'testUsername') {
          const newMockTrader = Object.assign({}, mockTrader);
          newMockTrader.id = 'testUser';
          newMockTrader.username = 'testUsername';
          return newMockTrader;
        }

        if (username === 'tradername123') {
          return getMockTrader();
        }

        throw new Error(`Cannot find user '${username}'.`);
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
            <Route path="/trader/:username" component={TraderProfileScreen} />
            <Route path="/account" component={AccountScreen} />
          </div>
        </div>
      </Router>
    </AppContext.Provider>
  );
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getMockTrader() {
  return Object.assign(new EventEmitter(), {
    id: 'trader123',
    username: 'tradername123',
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
    async getExchangeKeys() {
      await sleep(200);
      return [
        {
          exchangeID: 'binance',
          exchangeLabel: 'Binance',
          tokenLast4: 'aEwq',
          secretLast4: 'PqnB',
        },
        {
          exchangeID: 'bittrex',
          exchangeLabel: 'Bittrex',
          tokenLast4: '24aq',
          secretLast4: '4elH',
        },
      ];
    },
    async addExchangeKey({ exchangeID, token, secret }) {
      await sleep(500);
      return {
        exchangeID,
        exchangeLabel: exchangeID.charAt(0).toUpperCase() + exchangeID.substr(1),
        tokenLast4: token.substr(-4),
        secretLast4: secret.substr(-4),
      };
    },
    async deleteExchangeKey() {
      await sleep(150);
    },
    async get(args) {
      const rsp = {};
      const keys = args.map(a => (typeof a === 'string' ? a : a.key));

      if (keys.includes('bio')) {
        rsp.bio = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sollicitudin nibh turpis gravida commodo. Proin viverra aliquam varius. Cras rutrum malesuada elit, non placerat purus efficitur ut. \n\n';
        rsp.bio += 'Aliquam elementum lorem vel tincidunt efficitur. Praesent tincidunt lobortis magna. Sed viverra nisl non ex laoreet, eu consequat dui mattis. Suspendisse mattis tristique cursus.';
      }

      if (keys.includes('website')) {
        rsp.website = 'http://example.com';
      }

      return rsp;
    },
    async update() {
      await sleep(200);
    },
    async upload(data, progressFn) {
      const msDuration = 1000;
      const iterations = msDuration / 16;
      for (let i = 1; i <= iterations; i += 1) {
        await sleep(16);
        progressFn((100 / iterations) * i);
      }

      return true;
    },
  });
}

export default App;
