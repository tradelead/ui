import React, { useState } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { push as Menu } from 'react-burger-menu';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloProviderHooks } from 'react-apollo-hooks';
import createMockClient from './testUtils/createMockClient';
import sleep from './utils/sleep';
import DashboardScreen from './screens/Dashboard/DashboardScreen';
import LeaderboardScreen from './screens/Leaderboard/LeaderboardScreen';
import {
  GET_TRADER_FROM_USERNAME,
  TraderProfileScreen,
} from './screens/TraderProfile/TraderProfileScreen';
import AccountScreen from './screens/Account/AccountScreen';
import Header from './components/Header/Header';
import AppContext from './AppContext';
import { GET_SCORE_RANK_PROFILEPHOTO, HeaderContainer } from './components/Header/HeaderContainer';
import { GET_SCORE_HISTORY } from './components/ScoreChart/ScoreChartContainer';
import { GET_TOP_TRADERS, GET_USERS } from './components/Leaderboard/LeaderboardContainer';
import { GET_PROFILE, UPDATE_PROFILE } from './components/AccountSettings/ProfileSettings/ProfileSettingsContainer';
import { GET_EXCHANGE_KEYS_AND_EXCHANGES } from './components/AccountSettings/ExchangeKeys/ExchangeKeysContainer';
import { GET_TRADER_INFO } from './components/TraderProfile/TraderInfoContainer';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => { setMenuOpen(false); };
  const mockTrader = getMockTrader();

  const ctx = {
    closeMenu,
    user: {
      id: 'trader123',
      username: 'tradername123',
    },
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

  const mockClient = createMockClient(getGraphQLMocks());

  return (
    <AppContext.Provider value={ctx}>
      <Router>
        <ApolloProvider client={mockClient}>
          <ApolloProviderHooks client={mockClient}>
            <div id="App" className="App">
              <Menu
                right
                pageWrapId="page-wrap"
                outerContainerId="App"
                isOpen={menuOpen}
                onStateChange={state => setMenuOpen(state.isOpen)}
              >
                <Header />
              </Menu>

              <div id="page-wrap">
                <div className="header">
                  <HeaderContainer />
                </div>
                <Route path="/" exact component={DashboardScreen} />
                <Route path="/leaders" component={LeaderboardScreen} />
                <Route path="/trader/:username" component={TraderProfileScreen} />
                <Route path="/account" component={AccountScreen} />
              </div>
            </div>
          </ApolloProviderHooks>
        </ApolloProvider>
      </Router>
    </AppContext.Provider>
  );
}

function getGraphQLMocks() {
  const DAY_SEC = 24 * 60 * 60 * 1000;
  const scores = [
    { __typename: 'Score', time: Date.now() - DAY_SEC * 3, score: 100 },
    { __typename: 'Score', time: Date.now() - DAY_SEC * 2.5, score: 115 },
    { __typename: 'Score', time: Date.now() - DAY_SEC * 2.49, score: 110 },
    { __typename: 'Score', time: Date.now() - DAY_SEC * 2, score: 125 },
    { __typename: 'Score', time: Date.now() - DAY_SEC * 1.5, score: 105 },
    { __typename: 'Score', time: Date.now() - DAY_SEC * 1.1, score: 150 },
    { __typename: 'Score', time: Date.now() - DAY_SEC, score: 140 },
  ];

  const mockTopTraders = new Array(15).fill({
    __typename: 'Trader',
    id: 'trader123',
    rank: 123,
    scores: [{ __typename: 'Score', score: 1234 }],
  });

  return [
    {
      request: {
        query: GET_SCORE_RANK_PROFILEPHOTO,
        variables: {
          id: 'trader123',
        },
      },
      result: {
        data: {
          getUsers: [{
            __typename: 'User',
            profilePhoto: {
              __typename: 'Image',
              url: '',
            },
          }],
          getTrader: {
            __typename: 'Trader',
            rank: 12,
            scores: [{
              __typename: 'Score',
              score: 123,
            }],
          },
        },
      },
    },
    {
      request: {
        query: GET_SCORE_HISTORY,
        variables: {
          id: 'trader123',
          groupBy: 'day',
          duration: 30 * 24 * 60 * 60 * 1000,
          limit: 499,
        },
      },
      result: {
        data: {
          getTrader: {
            __typename: 'Trader',
            scores,
          },
        },
      },
    },
    {
      request: {
        query: GET_TOP_TRADERS,
        variables: {
          limit: 15,
        },
      },
      result: {
        data: {
          allTimeTopTraders: mockTopTraders,
          weeklyTopTraders: mockTopTraders,
          dailyTopTraders: mockTopTraders,
        },
      },
    },
    {
      request: {
        query: GET_USERS,
        variables: {
          ids: ['trader123'],
        },
      },
      result: {
        data: {
          getUsers: [
            {
              __typename: 'User',
              id: 'trader123',
              username: 'tradername123',
              profilePhoto: { __typename: 'Image', url: '' },
            },
          ],
        },
      },
    },
    {
      request: {
        query: GET_PROFILE,
        variables: {
          id: 'trader123',
        },
      },
      result: {
        data: {
          getUsers: [
            {
              __typename: 'User',
              username: 'tradername123',
              website: 'http://test.com',
              bio: 'testing bio',
            },
          ],
        },
      },
    },
    {
      request: {
        query: UPDATE_PROFILE,
        variables: {
          id: 'trader123',
          input: {
            website: 'http://newurl.com',
            bio: 'testing bio',
          },
        },
      },
      result: {
        data: {
          updateUser: true,
        },
      },
    },
    {
      request: {
        query: GET_PROFILE,
        variables: {
          id: 'trader123',
        },
      },
      result: {
        data: {
          getUsers: [
            {
              __typename: 'User',
              username: 'tradername123',
              website: 'http://newurl.com',
              bio: 'testing bio',
            },
          ],
        },
      },
    },
    {
      request: {
        query: GET_EXCHANGE_KEYS_AND_EXCHANGES,
        variables: {
          id: 'trader123',
        },
      },
      result: {
        data: {
          exchangeKeys: [
            {
              __typename: 'ExchangeKey',
              exchangeID: 'binance',
              tokenLast4: 'aEwq',
              secretLast4: 'PqnB',
            },
            {
              __typename: 'ExchangeKey',
              exchangeID: 'bittrex',
              tokenLast4: '24aq',
              secretLast4: '4elH',
            },
          ],
          exchanges: [
            { __typename: 'Exchange', exchangeID: 'binance', exchangeLabel: 'Binance' },
            { __typename: 'Exchange', exchangeID: 'bittrex', exchangeLabel: 'Bittrex' },
            { __typename: 'Exchange', exchangeID: 'coinbase', exchangeLabel: 'Coinbase' },
          ],
        },
      },
    },
    {
      request: {
        query: GET_TRADER_FROM_USERNAME,
        variables: {
          username: 'tradername123',
        },
      },
      result: {
        data: {
          trader: {
            __typename: 'User',
            id: 'trader123',
          },
        },
      },
    },
    {
      request: {
        query: GET_TRADER_INFO,
        variables: {
          id: 'trader123',
        },
      },
      result: {
        data: {
          getUsers: [
            {
              __typename: 'User',
              username: 'tradername',
              bio: 'test bio',
              website: 'http://test.com',
              profilePhoto: { __typename: 'Image', url: '' },
            },
          ],
        },
      },
    },
  ];
}

function getMockTrader() {
  return {
    id: 'trader123',
    username: 'tradername123',
    observe(args, callback) {
      (async () => {
        const DAY_SEC = 24 * 60 * 60 * 1000;
        const scores = [
          { time: Date.now() - DAY_SEC * 3, score: 100 },
          { time: Date.now() - DAY_SEC * 2.5, score: 115 },
          { time: Date.now() - DAY_SEC * 2.49, score: 110 },
          { time: Date.now() - DAY_SEC * 2, score: 125 },
          { time: Date.now() - DAY_SEC * 1.5, score: 105 },
          { time: Date.now() - DAY_SEC * 1.1, score: 150 },
          { time: Date.now() - DAY_SEC, score: 140 },
        ];

        const rsp = {};
        const keys = args.map(a => (typeof a === 'string' ? a : a.key));

        if (keys.includes('scores')) {
          rsp.scores = scores;
        }

        callback({ scores }, true, null);
        await sleep(200);

        if (keys.includes('score')) {
          rsp.score = 123;
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
