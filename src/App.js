import React, { useState } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { push as Menu } from 'react-burger-menu';
import sleep from './utils/sleep';
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
    async getExchanges() {
      return {
        binance: 'Binance',
        bittrex: 'Bittrex',
      };
    },
    traderService: {
      observeTopTraders({ limit }, callback) {
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

function getMockTrader() {
  return {
    id: 'trader123',
    username: 'tradername123',
    observe(args, callback) {
      (async () => {
        // callback(rsp, loading, error);
        callback({}, true, null);
        await sleep(200);

        const rsp = {};
        const keys = args.map(a => (typeof a === 'string' ? a : a.key));

        if (keys.includes('score')) {
          rsp.score = 123;
        }

        if (keys.includes('scores')) {
          const DAY_SEC = 24 * 60 * 60 * 1000;
          rsp.scores = [
            { time: Date.now() - DAY_SEC * 3, score: 100 },
            { time: Date.now() - DAY_SEC * 2.5, score: 115 },
            { time: Date.now() - DAY_SEC * 2.49, score: 110 },
            { time: Date.now() - DAY_SEC * 2, score: 125 },
            { time: Date.now() - DAY_SEC * 1.5, score: 105 },
            { time: Date.now() - DAY_SEC * 1.1, score: 150 },
            { time: Date.now() - DAY_SEC, score: 140 },
          ];
        }

        if (keys.includes('rank')) {
          rsp.rank = 12;
        }

        if (keys.includes('bio')) {
          rsp.bio = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sollicitudin nibh turpis gravida commodo.';
        }

        if (keys.includes('website')) {
          rsp.website = 'http://example.com';
        }

        if (keys.includes('exchangeKeys')) {
          rsp.exchangeKeys = [
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
        }

        callback(rsp, null, null);
      })();
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
  };
}

export default App;
