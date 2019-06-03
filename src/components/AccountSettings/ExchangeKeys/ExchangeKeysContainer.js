import React, { useContext } from 'react';
import gql from 'graphql-tag';
import { useMutation, useQuery } from 'react-apollo-hooks';
import get from 'lodash.get';
import formatMutateError from '../../../utils/formatMutateError';
import AppContext from '../../../AppContext';
import ExchangeKeys from './ExchangeKeys';

export const GET_EXCHANGE_KEYS_AND_EXCHANGES = gql`
  query getExchangeKeysAndExchanges($id: ID) {
    exchangeKeys: getExchangeKeys(userID: $id) {
      exchangeID
      tokenLast4
      secretLast4
    }
    exchanges: getExchanges {
      exchangeID
      exchangeLabel
    }
  }
`;

export const ADD_EXCHANGE_KEY = gql`
  mutation addExchangeKey($input: AddExchangeKeyInput) {
    addExchangeKeys(input: $input) {
      exchangeID
      tokenLast4
      secretLast4
    }
  }
`;

export const DELETE_EXCHANGE_KEY = gql`
  mutation deleteExchangeKey($id: String, $exchangeID: String) {
    deleteExchangeKeys(userID: $id, exchangeID: $exchangeID)
  }
`;

const ExchangeKeysContainer = () => {
  const app = useContext(AppContext);
  const id = get(app, 'user.id');
  const userID = id;

  const {
    data: { exchangeKeys, exchanges },
    error,
    loading,
  } = useQuery(GET_EXCHANGE_KEYS_AND_EXCHANGES, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  });

  const exchangesMap = exchanges && exchanges.reduce((acc, { exchangeID, exchangeLabel }) => {
    acc[exchangeID] = exchangeLabel;
    return acc;
  }, {});

  const keys = exchangeKeys && exchangeKeys.map(exchangeKey => ({
    ...exchangeKey,
    exchangeLabel: exchangesMap[exchangeKey.exchangeID],
  }));

  const refetchExchangeKeys = () => [{ query: GET_EXCHANGE_KEYS_AND_EXCHANGES, variables: { id } }];
  const mutationOptions = {
    onError: () => {},
    refetchQueries: refetchExchangeKeys,
  };

  const addKey = useMutation(ADD_EXCHANGE_KEY, mutationOptions);
  const deleteKey = useMutation(DELETE_EXCHANGE_KEY, mutationOptions);

  return (
    <ExchangeKeys
      exchangeKeys={keys}
      exchanges={exchangesMap}
      errors={get(error, 'graphQLErrors')}
      loading={loading}
      addKey={input => formatMutateError(addKey({ variables: { input: { userID, ...input } } }))}
      deleteKey={input => formatMutateError(deleteKey({ variables: { id, ...input } }))}
    />
  );
};

export { ExchangeKeysContainer };
