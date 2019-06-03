import React from 'react';
import { mount } from 'enzyme';
import { ApolloProvider } from 'react-apollo-hooks';
import asyncMountWrapper from '../../testUtils/asyncMountWrapper';
import asyncUpdateWrapper from '../../testUtils/asyncUpdateWrapper';
import createMockClient from '../../testUtils/createMockClient';

import {
  TraderInfoContainer,
  GET_TRADER_INFO,
} from './TraderInfoContainer';

jest.mock('./TraderInfo', () => (
  // eslint-disable-next-line func-names
  function MockTraderInfo() {
    return <div />;
  }
));

function setup({ graphqlMocks, ...props }) {
  const client = createMockClient(graphqlMocks);

  return {
    component: (
      <ApolloProvider client={client}>
        <TraderInfoContainer {...props} />
      </ApolloProvider>
    ),
    client,
  };
}

let graphqlMocks;
let props = {};

beforeEach(() => {
  props = {
    userID: 'trader123',
  };

  graphqlMocks = [
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
              profilePhoto: { __typename: 'Image', url: 'http://test.com/image.jpg' },
            },
          ],
        },
      },
    },
  ];
});

it('calls TraderInfo with user info', async () => {
  const { component } = setup({ graphqlMocks, ...props });
  const wrapper = await asyncMountWrapper(component);

  expect(wrapper.find('MockTraderInfo').prop('loading'))
    .toEqual(false);

  expect(wrapper.find('MockTraderInfo').prop('info').username)
    .toEqual('tradername');

  expect(wrapper.find('MockTraderInfo').prop('info').bio)
    .toEqual('test bio');

  expect(wrapper.find('MockTraderInfo').prop('info').website)
    .toEqual('http://test.com');

  expect(wrapper.find('MockTraderInfo').prop('info').profilePhoto)
    .toMatchObject({
      url: 'http://test.com/image.jpg',
    });
});

it('calls TraderInfo with loading while await query', async () => {
  const { component } = setup({ graphqlMocks, ...props });
  const wrapper = mount(component);

  expect(wrapper.find('MockTraderInfo').prop('loading'))
    .toEqual(true);

  await asyncUpdateWrapper(wrapper);
});
