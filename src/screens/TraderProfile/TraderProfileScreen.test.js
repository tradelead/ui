import React from 'react';
import { ApolloProvider } from 'react-apollo-hooks';
import asyncMountWrapper from '../../testUtils/asyncMountWrapper';
import createMockClient from '../../testUtils/createMockClient';
import { GET_TRADER_FROM_USERNAME, TraderProfileScreen } from './TraderProfileScreen';

jest.mock('../../components/TraderProfile/TraderProfile', () => (
  // eslint-disable-next-line func-names
  function MockTraderProfile() {
    return <div />;
  }
));

function setup(args, mocks) {
  const mockClient = createMockClient(mocks);
  return <ApolloProvider client={mockClient}><TraderProfileScreen {...args} /></ApolloProvider>;
}

let props = {};
let graphQLMocks = [];
beforeEach(() => {
  props = { match: { params: { username: 'test' } } };

  graphQLMocks = [
    {
      request: {
        query: GET_TRADER_FROM_USERNAME,
        variables: {
          username: 'test',
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
  ];
});

it('calls TraderProfile with userID from query', async () => {
  const component = setup(props, graphQLMocks);
  const wrapper = await asyncMountWrapper(component);

  expect(wrapper.find('MockTraderProfile').prop('userID')).toEqual('trader123');
});

it('displays error from query', async () => {
  graphQLMocks = [
    {
      request: {
        query: GET_TRADER_FROM_USERNAME,
        variables: {
          username: 'test',
        },
      },
      result: {
        errors: [
          { message: 'Test Error 1' },
          { message: 'Test Error 2' },
        ],
      },
    },
  ];

  const component = setup(props, graphQLMocks);
  const wrapper = await asyncMountWrapper(component);

  expect(wrapper.find('Alert').at(0)).toHaveText('Test Error 1');
  expect(wrapper.find('Alert').at(1)).toHaveText('Test Error 2');
});
