import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
// eslint-disable-next-line import/no-extraneous-dependencies
import { MockLink } from 'apollo-link-mock';

export default function createMockClient(mocks) {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new MockLink(mocks),
  });
}
