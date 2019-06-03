import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import { ApolloProvider } from 'react-apollo-hooks';
import sleep from '../../../utils/sleep';
import asyncMountWrapper from '../../../testUtils/asyncMountWrapper';
import asyncUpdateWrapper from '../../../testUtils/asyncUpdateWrapper';
import createMockClient from '../../../testUtils/createMockClient';
import AppContext from '../../../AppContext';
import {
  ExchangeKeysContainer,
  GET_EXCHANGE_KEYS_AND_EXCHANGES,
  ADD_EXCHANGE_KEY,
  DELETE_EXCHANGE_KEY,
} from './ExchangeKeysContainer';

jest.mock('./ExchangeKeys', () => (
  // eslint-disable-next-line func-names
  function MockExchangeKeys() {
    return <div />;
  }
));

function setup({ ctx, graphqlMocks, ...props }) {
  const client = createMockClient(graphqlMocks);

  return {
    component: (
      <AppContext.Provider value={ctx}>
        <ApolloProvider client={client}>
          <ExchangeKeysContainer {...props} />
        </ApolloProvider>
      </AppContext.Provider>
    ),
    client,
  };
}

let ctx;
let graphqlMocks;
const props = {};

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
            {
              __typename: 'ExchangeKey',
              exchangeID: 'coinbase',
              tokenLast4: 'oken',
              secretLast4: 'cret',
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
        query: ADD_EXCHANGE_KEY,
        variables: {
          input: {
            userID: 'trader123',
            exchangeID: 'coinbase',
            token: 'token',
            secret: 'secret',
            __typename: 'AddExchangeKeyInput',
          },
        },
      },
      result: {
        data: {
          addExchangeKeys: {
            __typename: 'ExchangeKey',
            exchangeID: 'binance',
            tokenLast4: 'oken',
            secretLast4: 'cret',
          },
        },
      },
    },
    {
      request: {
        query: DELETE_EXCHANGE_KEY,
        variables: {
          id: 'trader123',
          exchangeID: 'coinbase',
        },
      },
      result: {
        data: {
          deleteExchangeKeys: true,
        },
      },
    },
  ];
});

it('calls ExchangeKeys with exchangeKeys data', async () => {
  const { component } = setup({ ctx, graphqlMocks, ...props });
  const wrapper = await asyncMountWrapper(component);

  expect(wrapper.find('MockExchangeKeys').prop('exchangeKeys'))
    .toEqual([
      {
        __typename: 'ExchangeKey',
        exchangeID: 'binance',
        exchangeLabel: 'Binance',
        tokenLast4: 'aEwq',
        secretLast4: 'PqnB',
      },
      {
        __typename: 'ExchangeKey',
        exchangeID: 'bittrex',
        exchangeLabel: 'Bittrex',
        tokenLast4: '24aq',
        secretLast4: '4elH',
      },
    ]);
});

it('calls ExchangeKeys with exchanges data', async () => {
  const { component } = setup({ ctx, graphqlMocks, ...props });
  const wrapper = await asyncMountWrapper(component);

  expect(wrapper.find('MockExchangeKeys').prop('exchanges'))
    .toEqual({
      binance: 'Binance',
      bittrex: 'Bittrex',
      coinbase: 'Coinbase',
    });
});

it('calls ExchangeKeys with loading while awaiting query', async () => {
  const { component } = setup({ ctx, graphqlMocks, ...props });
  const wrapper = mount(component);

  expect(wrapper.find('MockExchangeKeys').prop('loading'))
    .toEqual(true);

  // prevent act error
  await act(async () => {
    await sleep(0);
  });
});

it('calls ExchangeKeys with fetch errors', async () => {
  graphqlMocks = [{
    request: {
      query: GET_EXCHANGE_KEYS_AND_EXCHANGES,
      variables: {
        id: 'trader123',
      },
    },
    result: {
      errors: [
        { message: 'test error' },
      ],
    },
  }];

  const { component } = setup({ ctx, graphqlMocks, ...props });
  const wrapper = await asyncMountWrapper(component);

  expect(wrapper.find('MockExchangeKeys').prop('errors'))
    .toEqual([
      { message: 'test error' },
    ]);
});

describe('ExchangeKeys addKey', () => {
  it('refetches exchangeKeys', async () => {
    const { component } = setup({ ctx, graphqlMocks, ...props });
    const wrapper = await asyncMountWrapper(component);

    const addKey = wrapper.find('MockExchangeKeys').prop('addKey');

    await act(async () => {
      await addKey({
        exchangeID: 'coinbase',
        token: 'token',
        secret: 'secret',
        __typename: 'AddExchangeKeyInput',
      });
      await sleep(0);
    });

    await asyncUpdateWrapper(wrapper);

    expect(wrapper.find('MockExchangeKeys').prop('exchangeKeys'))
      .toEqual([
        {
          __typename: 'ExchangeKey',
          exchangeID: 'binance',
          exchangeLabel: 'Binance',
          tokenLast4: 'aEwq',
          secretLast4: 'PqnB',
        },
        {
          __typename: 'ExchangeKey',
          exchangeID: 'bittrex',
          exchangeLabel: 'Bittrex',
          tokenLast4: '24aq',
          secretLast4: '4elH',
        },
        {
          __typename: 'ExchangeKey',
          exchangeID: 'coinbase',
          exchangeLabel: 'Coinbase',
          tokenLast4: 'oken',
          secretLast4: 'cret',
        },
      ]);
  });

  it('throws errors from query', async () => {
    graphqlMocks = [
      {
        request: {
          query: ADD_EXCHANGE_KEY,
          variables: {
            input: {
              userID: 'trader123',
              exchangeID: 'coinbase',
              token: 'token',
              secret: 'secret',
              __typename: 'AddExchangeKeyInput',
            },
          },
        },
        result: {
          errors: [
            { message: 'example error' },
          ],
        },
      },
    ];

    const { component } = setup({ ctx, graphqlMocks, ...props });
    const wrapper = await asyncMountWrapper(component);

    const addKey = wrapper.find('MockExchangeKeys').prop('addKey');

    let error = {};
    try {
      await addKey({
        exchangeID: 'coinbase',
        token: 'token',
        secret: 'secret',
        __typename: 'AddExchangeKeyInput',
      });
    } catch (e) {
      error = e;
    }

    expect(error.errors).toEqual([
      { message: 'example error' },
    ]);
  });
});

describe('ExchangeKeys deleteKey', () => {
  it('refetches exchangeKeys', async () => {
    const { component } = setup({ ctx, graphqlMocks, ...props });
    const wrapper = mount(component);

    const deleteKey = wrapper.find('MockExchangeKeys').prop('deleteKey');

    await act(async () => {
      await deleteKey({
        exchangeID: 'coinbase',
      });

      await sleep(0);
    });

    await asyncUpdateWrapper(wrapper);

    expect(wrapper.find('MockExchangeKeys').prop('exchangeKeys'))
      .toEqual([
        {
          __typename: 'ExchangeKey',
          exchangeID: 'binance',
          exchangeLabel: 'Binance',
          tokenLast4: 'aEwq',
          secretLast4: 'PqnB',
        },
        {
          __typename: 'ExchangeKey',
          exchangeID: 'bittrex',
          exchangeLabel: 'Bittrex',
          tokenLast4: '24aq',
          secretLast4: '4elH',
        },
        {
          __typename: 'ExchangeKey',
          exchangeID: 'coinbase',
          exchangeLabel: 'Coinbase',
          tokenLast4: 'oken',
          secretLast4: 'cret',
        },
      ]);
  });

  it('throws errors from query', async () => {
    graphqlMocks = [
      {
        request: {
          query: DELETE_EXCHANGE_KEY,
          variables: {
            id: 'trader123',
            exchangeID: 'coinbase',
          },
        },
        result: {
          errors: [
            { message: 'example error' },
          ],
        },
      },
    ];

    const { component } = setup({ ctx, graphqlMocks, ...props });
    const wrapper = await asyncMountWrapper(component);

    const deleteKey = wrapper.find('MockExchangeKeys').prop('deleteKey');

    let error = {};
    try {
      await deleteKey({
        exchangeID: 'coinbase',
      });
    } catch (e) {
      error = e;
    }

    await asyncUpdateWrapper(wrapper);

    expect(error.errors)
      .toEqual([
        { message: 'example error' },
      ]);
  });
});
