import React from 'react';
import { mount } from 'enzyme';
import { MockedProvider } from 'react-apollo/test-utils';
import { BrowserRouter as Router } from 'react-router-dom';
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
  return {
    component: (
      <Router>
        <AppContext.Provider value={ctx}>
          <MockedProvider mocks={graphqlMocks} addTypename={false}>
            <HeaderContainer {...obj} />
          </MockedProvider>
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
            profilePhoto: {
              url: 'http://test.com',
            },
          }],
          getTrader: {
            rank: 12,
            scores: [{
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

  console.log(wrapper.debug(), wrapper.find('MockHeader').props());
  expect(wrapper.find('MockHeader').prop('rank'))
    .toEqual(12);
  expect(wrapper.find('MockHeader').prop('profilePhoto'))
    .toEqual('http://test.com');
  expect(wrapper.find('MockHeader').prop('score'))
    .toEqual(123);
});
