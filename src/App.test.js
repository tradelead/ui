import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider as ApolloProviderHooks } from 'react-apollo-hooks';
import { ApolloProvider } from 'react-apollo';
import App from './App';
import auth from './mockData/mockAuth';
import client from './mockData/mockClient';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render((
    <ApolloProvider client={client}>
      <ApolloProviderHooks client={client}>
        <App auth={auth} />
      </ApolloProviderHooks>
    </ApolloProvider>
  ), div);
  ReactDOM.unmountComponentAtNode(div);
});
