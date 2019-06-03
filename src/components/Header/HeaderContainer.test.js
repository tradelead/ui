import React from 'react';
import { mount } from 'enzyme';
import { ApolloProvider } from 'react-apollo-hooks';
import { BrowserRouter as Router } from 'react-router-dom';
import createMockClient from '../../testUtils/createMockClient';
import sleep from '../../utils/sleep';
import AppContext from '../../AppContext';
import { GET_SCORE_RANK_PROFILEPHOTO, HeaderContainer } from './HeaderContainer';

jest.mock('./Header', () => (
  // eslint-disable-next-line func-names
  function MockHeader(props) {
    return <div {...props} />;
  }
));

function setup({ ctx, graphqlMocks, ...obj }) {
  const client = createMockClient(graphqlMocks);

  return {
    component: (
      <Router>
        <AppContext.Provider value={ctx}>
          <ApolloProvider client={client} addTypename={false}>
            <HeaderContainer {...obj} />
          </ApolloProvider>
        </AppContext.Provider>
      </Router>
    ),
  };
}

let ctx;
let graphqlMocks;

beforeEach(() => {
  ctx = {
    user: {
      id: 'trader123',
      username: 'tradername',
    },
  };

  graphqlMocks = [
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
              url: 'http://test.com',
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
  ];
});

it('calls header with user', () => {
  const { component } = setup({ ctx, graphqlMocks });
  const wrapper = mount(component);

  expect(wrapper.find('MockHeader').prop('user')).toEqual({
    id: 'trader123',
    username: 'tradername',
  });
});

it('calls header with not null user', () => {
  delete ctx.user;
  const { component } = setup({ ctx, graphqlMocks });
  const wrapper = mount(component);

  expect(wrapper.find('MockHeader').prop('user')).toEqual({});
});

it('calls header with query data', async () => {
  const { component } = setup({ ctx, graphqlMocks });
  const wrapper = mount(component);
  await sleep(0);
  wrapper.update();

  expect(wrapper.find('MockHeader').prop('rank'))
    .toEqual(12);
  expect(wrapper.find('MockHeader').prop('profilePhoto'))
    .toEqual('http://test.com');
  expect(wrapper.find('MockHeader').prop('score'))
    .toEqual(123);
});
