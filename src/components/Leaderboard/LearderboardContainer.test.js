import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import { MockedProvider } from 'react-apollo/test-utils';
import { BrowserRouter as Router } from 'react-router-dom';
import sleep from '../../utils/sleep';
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
  return {
    component: (
      <Router>
        <AppContext.Provider value={ctx}>
          <MockedProvider mocks={graphqlMocks} addTypename={false}>
            <LeaderboardContainer {...obj} />
          </MockedProvider>
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

  const query = GET_TOP_TRADERS;

  graphqlMocks = [
    {
      request: {
        query,
        variables: {
          limit: 15,
        },
      },
      result: {
        data: {
          allTimeTopTraders: [
            { id: 'test', rank: 1, scores: [{ score: 1 }] },
          ],
          weeklyTopTraders: [
            { id: 'test', rank: 2, scores: [{ score: 2 }] },
          ],
          dailyTopTraders: [
            { id: 'test', rank: 3, scores: [{ score: 3 }] },
          ],
        },
      },
    },
    {
      request: {
        query: GET_USERS,
        variables: {
          ids: ['test'],
        },
      },
      result: {
        data: {
          getUsers: [
            { id: 'test', username: 'testname', profilePhoto: { url: 'http://test.com/image.jpeg' } },
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
    .toEqual([{
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
    .toEqual([{
      id: 'test',
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
    .toEqual([{
      id: 'test',
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
