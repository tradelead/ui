import createMockClient from './testUtils/createMockClient';
import { GET_SCORE_RANK_PROFILEPHOTO } from './components/Header/HeaderContainer';
import { GET_SCORE_HISTORY } from './components/ScoreChart/ScoreChartContainer';
import { GET_TOP_TRADERS, GET_USERS } from './components/Leaderboard/LeaderboardContainer';
import { GET_PROFILE, UPDATE_PROFILE, } from './components/AccountSettings/ProfileSettings/ProfileSettingsContainer';
import { GET_EXCHANGE_KEYS_AND_EXCHANGES } from './components/AccountSettings/ExchangeKeys/ExchangeKeysContainer';
import { GET_TRADER_FROM_USERNAME } from './screens/TraderProfile/TraderProfileScreen';
import { GET_TRADER_INFO } from './components/TraderProfile/TraderInfoContainer';

const mockClient = createMockClient(getGraphQLMocks());

export default mockClient;

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
    id: 'trader1234',
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
          ids: ['trader1234'],
        },
      },
      result: {
        data: {
          getUsers: [
            {
              __typename: 'User',
              id: 'trader1234',
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
