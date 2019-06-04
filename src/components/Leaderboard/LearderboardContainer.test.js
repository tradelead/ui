import React from 'react';
import { mount } from 'enzyme';
import { ApolloProvider } from 'react-apollo-hooks';
import { BrowserRouter as Router } from 'react-router-dom';
import createMockClient from '../../testUtils/createMockClient';
import asyncMountWrapper from '../../testUtils/asyncMountWrapper';
import asyncUpdateWrapper from '../../testUtils/asyncUpdateWrapper';
import AppContext from '../../AppContext';
import { GET_TOP_TRADERS, GET_USERS, LeaderboardContainer } from './LeaderboardContainer';

jest.mock('./Leaderboard', () => (
  // eslint-disable-next-line func-names
  function MockLeaderboard() {
    return <div />;
  }
));

function setup({ ctx, graphqlMocks, ...obj }) {
  const client = createMockClient(graphqlMocks);
  return {
    component: (
      <Router>
        <AppContext.Provider value={ctx}>
          <ApolloProvider client={client}>
            <LeaderboardContainer {...obj} />
          </ApolloProvider>
        </AppContext.Provider>
      </Router>
    ),
  };
}

let ctx;
let graphqlMocks;
const props = {};

beforeEach(() => {
  ctx = {};

  graphqlMocks = [
    {
      request: {
        query: GET_TOP_TRADERS,
        variables: {
          limit: 15,
        },
      },
      result: {
        data: {
          allTimeTopTraders: [
            {
              __typename: 'Trader',
              id: 'test',
              rank: 1,
              scores: [{ __typename: 'Score', score: 1 }],
            },
          ],
          weeklyTopTraders: [
            {
              __typename: 'Trader',
              id: 'test2',
              rank: 2,
              scores: [{ __typename: 'Score', score: 2 }],
            },
          ],
          dailyTopTraders: [
            {
              __typename: 'Trader',
              id: 'test3',
              rank: 3,
              scores: [{ __typename: 'Score', score: 3 }],
            },
          ],
        },
      },
    },
    {
      request: {
        query: GET_USERS,
        variables: {
          ids: ['test', 'test2', 'test3'],
        },
      },
      result: {
        data: {
          getUsers: [
            {
              __typename: 'User',
              id: 'test',
              username: 'testname',
              profilePhoto: {
                __typename: 'Image',
                url: 'http://test.com/image.jpeg',
              },
            },
            {
              __typename: 'User',
              id: 'test2',
              username: 'testname',
              profilePhoto: {
                __typename: 'Image',
                url: 'http://test.com/image.jpeg',
              },
            },
            {
              __typename: 'User',
              id: 'test3',
              username: 'testname',
              profilePhoto: {
                __typename: 'Image',
                url: 'http://test.com/image.jpeg',
              },
            },
          ],
        },
      },
    },
  ];
});

it('passes all time top traders to Leaderboard', async () => {
  const { component } = setup({ ctx, graphqlMocks, ...props });
  const wrapper = await asyncMountWrapper(component);
  await asyncUpdateWrapper(wrapper);

  expect(wrapper.find('MockLeaderboard').prop('allTimeTopTraders'))
    .toMatchObject([{
      id: 'test',
      username: 'testname',
      profilePhoto: { url: 'http://test.com/image.jpeg' },
      rank: 1,
      score: 1,
    }]);
  expect(wrapper.find('MockLeaderboard').prop('loading'))
    .toEqual(false);
});

it('passes weekly top traders to Leaderboard', async () => {
  const { component } = setup({ ctx, graphqlMocks, ...props });
  const wrapper = await asyncMountWrapper(component);
  await asyncUpdateWrapper(wrapper);

  expect(wrapper.find('MockLeaderboard').prop('weeklyTopTraders'))
    .toMatchObject([{
      id: 'test2',
      username: 'testname',
      profilePhoto: { url: 'http://test.com/image.jpeg' },
      rank: 2,
      score: 2,
    }]);
  expect(wrapper.find('MockLeaderboard').prop('loading'))
    .toEqual(false);
});

it('passes daily top traders to Leaderboard', async () => {
  const { component } = setup({ ctx, graphqlMocks, ...props });
  const wrapper = await asyncMountWrapper(component);
  await asyncUpdateWrapper(wrapper);

  expect(wrapper.find('MockLeaderboard').prop('dailyTopTraders'))
    .toMatchObject([{
      id: 'test3',
      username: 'testname',
      profilePhoto: { url: 'http://test.com/image.jpeg' },
      rank: 3,
      score: 3,
    }]);
  expect(wrapper.find('MockLeaderboard').prop('loading'))
    .toEqual(false);
});

it('passes loading to Leaderboard', async () => {
  const { component } = setup({ ctx, graphqlMocks, ...props });
  const wrapper = mount(component);

  expect(wrapper.find('MockLeaderboard').prop('loading'))
    .toEqual(true);
  expect(wrapper.find('MockLeaderboard').prop('allTimeTopTraders'))
    .toEqual([]);
  expect(wrapper.find('MockLeaderboard').prop('weeklyTopTraders'))
    .toEqual([]);
  expect(wrapper.find('MockLeaderboard').prop('dailyTopTraders'))
    .toEqual([]);
});
