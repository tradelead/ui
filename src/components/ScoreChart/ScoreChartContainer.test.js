import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import { ApolloProvider } from 'react-apollo-hooks';
import { BrowserRouter as Router } from 'react-router-dom';
import createMockClient from '../../testUtils/createMockClient';
import sleep from '../../utils/sleep';
import asyncMountWrapper from '../../testUtils/asyncMountWrapper';
import asyncUpdateWrapper from '../../testUtils/asyncUpdateWrapper';
import AppContext from '../../AppContext';
import { GET_SCORE_HISTORY, ScoreChartContainer } from './ScoreChartContainer';

jest.mock('./ScoreChart', () => (
  // eslint-disable-next-line func-names
  function MockScoreChart() {
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
            <ScoreChartContainer {...obj} />
          </ApolloProvider>
        </AppContext.Provider>
      </Router>
    ),
  };
}

let ctx;
let graphqlMocks;
const props = {
  userID: 'trader123',
  width: 600,
  height: 400,
};

beforeEach(() => {
  ctx = {
    user: {
      id: 'trader123',
      username: 'tradername',
    },
  };

  const query = GET_SCORE_HISTORY;

  graphqlMocks = [
    {
      request: {
        query,
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
            scores: [
              { __typename: 'Score', time: 100, score: 1 },
              { __typename: 'Score', time: 200, score: 2 },
              { __typename: 'Score', time: 300, score: 3 },
            ],
          },
        },
      },
    },
    {
      request: {
        query,
        variables: {
          id: 'trader123',
          duration: 7 * 24 * 60 * 60 * 1000,
          limit: 499,
        },
      },
      result: {
        data: {
          getTrader: {
            __typename: 'Trader',
            scores: [
              { __typename: 'Score', time: 200, score: 1 },
              { __typename: 'Score', time: 300, score: 2 },
              { __typename: 'Score', time: 400, score: 3 },
            ],
          },
        },
      },
    },
    {
      request: {
        query,
        variables: {
          id: 'trader123',
          duration: 24 * 60 * 60 * 1000,
          limit: 499,
        },
      },
      result: {
        data: {
          getTrader: {
            __typename: 'Trader',
            scores: [
              { __typename: 'Score', time: 300, score: 1 },
              { __typename: 'Score', time: 400, score: 2 },
              { __typename: 'Score', time: 500, score: 3 },
            ],
          },
        },
      },
    },
    {
      request: {
        query,
        variables: {
          id: 'trader123',
          groupBy: 'week',
          limit: 499,
        },
      },
      result: {
        data: {
          getTrader: {
            __typename: 'Trader',
            scores: [
              { __typename: 'Score', time: 400, score: 1 },
              { __typename: 'Score', time: 500, score: 2 },
              { __typename: 'Score', time: 600, score: 3 },
            ],
          },
        },
      },
    },
  ];
});

it('calls ScoreChart with scoreHistory for 30 days as default', async () => {
  const { component } = setup({ ctx, graphqlMocks, ...props });
  const wrapper = await asyncMountWrapper(component);

  expect(wrapper.find('MockScoreChart').prop('scoreHistory'))
    .toEqual(graphqlMocks[0].result.data.getTrader.scores);
});

it('calls ScoreChart with scoreHistory for 30 days', async () => {
  const { component } = setup({ ctx, graphqlMocks, ...props });
  const wrapper = await asyncMountWrapper(component);

  const setDuration = wrapper.find('MockScoreChart').prop('setDuration');
  setDuration(30);
  await asyncUpdateWrapper(wrapper);

  expect(wrapper.find('MockScoreChart').prop('scoreHistory'))
    .toEqual(graphqlMocks[0].result.data.getTrader.scores);
});

it('calls ScoreChart with scoreHistory for 7 days', async () => {
  const { component } = setup({ ctx, graphqlMocks, ...props });
  const wrapper = await asyncMountWrapper(component);

  const setDuration = wrapper.find('MockScoreChart').prop('setDuration');
  setDuration(7);
  await sleep(100);
  await asyncUpdateWrapper(wrapper);

  expect(wrapper.find('MockScoreChart').prop('scoreHistory'))
    .toEqual(graphqlMocks[1].result.data.getTrader.scores);
});

it('calls ScoreChart with scoreHistory for 1 day', async () => {
  const { component } = setup({ ctx, graphqlMocks, ...props });
  const wrapper = await asyncMountWrapper(component);

  const setDuration = wrapper.find('MockScoreChart').prop('setDuration');
  setDuration(1);
  await sleep(10);
  await asyncUpdateWrapper(wrapper);

  expect(wrapper.find('MockScoreChart').prop('scoreHistory'))
    .toEqual(graphqlMocks[2].result.data.getTrader.scores);
});

it('calls ScoreChart with scoreHistory for all time', async () => {
  const { component } = setup({ ctx, graphqlMocks, ...props });
  const wrapper = await asyncMountWrapper(component);

  await act(async () => {
    const setDuration = wrapper.find('MockScoreChart').prop('setDuration');
    setDuration(0);
  });

  await asyncUpdateWrapper(wrapper);

  expect(wrapper.find('MockScoreChart').prop('scoreHistory'))
    .toEqual(graphqlMocks[3].result.data.getTrader.scores);
}, 500);


it('calls ScoreChart with loading when query loading', async () => {
  const { component } = setup({ ctx, graphqlMocks: [], ...props });
  const wrapper = mount(component);

  expect(wrapper.find('MockScoreChart').prop('loading'))
    .toEqual(true);
  expect(wrapper.find('MockScoreChart').prop('scoreHistory'))
    .toEqual([]);
});

it('calls ScoreChart with error when query errors', async () => {
  graphqlMocks = [
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
        errors: [
          { message: 'example error' },
        ],
      },
    },
  ];
  const { component } = setup({
    ctx,
    graphqlMocks,
    ...props,
  });
  const wrapper = await asyncMountWrapper(component);
  await asyncUpdateWrapper(wrapper);

  expect(wrapper.find('MockScoreChart').prop('errors'))
    .toEqual(graphqlMocks[0].result.errors);
});

it('calls ScoreChart with width', async () => {
  const { component } = setup({ ctx, graphqlMocks: [], ...props });
  const wrapper = mount(component);

  expect(wrapper.find('MockScoreChart').prop('width'))
    .toEqual(props.width);
});

it('calls ScoreChart with height', async () => {
  const { component } = setup({ ctx, graphqlMocks: [], ...props });
  const wrapper = mount(component);

  expect(wrapper.find('MockScoreChart').prop('height'))
    .toEqual(props.height);
});
