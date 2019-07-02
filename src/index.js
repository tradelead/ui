import React from 'react';
import ReactDOM from 'react-dom';
import { RetryLink } from 'apollo-link-retry';
import { HttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { concat } from 'apollo-link';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { persistCache } from 'apollo-cache-persist';
import { ApolloClient } from 'apollo-client';
import { ApolloProvider as ApolloProviderHooks } from 'react-apollo-hooks';
import { ApolloProvider } from 'react-apollo';
import Keycloak from 'keycloak-js';
import mockClient from './mockData/mockClient';
import * as serviceWorker from './serviceWorker';
import App from './App';
import './index.css';
import mockAuth from './mockData/mockAuth';
import Auth from './core/Auth';

let auth;
if (process.env.REACT_APP_MOCK_AUTH) {
  auth = mockAuth;
} else {
  const keycloak = Keycloak({
    url: process.env.REACT_APP_AUTH_URL,
    realm: process.env.REACT_APP_AUTH_REALM,
    clientId: process.env.REACT_APP_AUTH_CLIENT_ID,
  });

  auth = new Auth({ keycloak });
}

let client;
let waitOnCache = Promise.resolve();
if (process.env.REACT_APP_MOCK_GRAPHQL) {
  client = mockClient;
} else {
  const retry = new RetryLink();
  const http = new HttpLink({ uri: process.env.REACT_APP_GRAPHQL_API });
  let link = concat(retry, http);

  const authLink = setContext(async (_, { headers }) => {
    let token = null;
    try {
      token = await auth.getAccessToken();
    } catch (e) {
      console.error('ERROR FETCHING ACCESS TOKEN: ', e);
    }

    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  link = authLink.concat(link);

  // Use an InMemoryCache, but keep it synced to localStorage
  const cache = new InMemoryCache();
  const storage = window.localStorage;
  waitOnCache = persistCache({ cache, storage });

  client = new ApolloClient({ cache, link });
}

waitOnCache.then(() => {
  ReactDOM.render((
    <ApolloProvider client={client}>
      <ApolloProviderHooks client={client}>
        <App auth={auth} />
      </ApolloProviderHooks>
    </ApolloProvider>
  ), document.getElementById('root'));
});

serviceWorker.register();
