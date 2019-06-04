import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloProviderHooks } from 'react-apollo-hooks';
import { BrowserRouter as Router } from 'react-router-dom';
import createMockClient from '../../../testUtils/createMockClient';
import sleep from '../../../utils/sleep';
import asyncMountWrapper from '../../../testUtils/asyncMountWrapper';
import asyncUpdateWrapper from '../../../testUtils/asyncUpdateWrapper';
import AppContext from '../../../AppContext';
import { UPDATE_PROFILE, GET_PROFILE, ProfileSettingsContainer } from './ProfileSettingsContainer';

jest.mock('./ProfileSettings', () => (
  // eslint-disable-next-line func-names
  function MockProfileSettings() {
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
            <ApolloProviderHooks client={client}>
              <ProfileSettingsContainer {...obj} />
            </ApolloProviderHooks>
          </ApolloProvider>
        </AppContext.Provider>
      </Router>
    ),
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
        query: GET_PROFILE,
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
              website: 'http://test.com',
              bio: 'This is my bio',
              profilePhoto: {
                __typename: 'Image',
                url: 'http://test.com/image.jpg',
              },
            },
          ],
        },
      },
    },
    {
      request: {
        query: UPDATE_PROFILE,
        variables: {
          id: 'trader123',
          input: {
            website: 'http://newurl.com',
            bio: 'testing bio',
          },
        },
      },
      result: {
        data: {
          updateUser: true,
        },
      },
    },
    {
      request: {
        query: GET_PROFILE,
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
              website: 'http://newurl.com',
              bio: 'testing bio',
              profilePhoto: {
                __typename: 'Image',
                url: 'http://test.com/image.jpg',
              },
            },
          ],
        },
      },
    },
  ];
});

it('calls ProfileSettings with user info', async () => {
  const { component } = setup({ ctx, graphqlMocks, ...props });
  const wrapper = await asyncMountWrapper(component);
  await sleep(10);
  await asyncUpdateWrapper(wrapper);

  expect(wrapper.find('MockProfileSettings').prop('profile').data)
    .toMatchObject({
      website: 'http://test.com',
      bio: 'This is my bio',
      profilePhoto: {
        url: 'http://test.com/image.jpg',
      },
    });
});

describe('ProfileSettings updateUser mutation', () => {
  it('passes errors when mutation fails', async () => {
    graphqlMocks = [{
      request: {
        query: UPDATE_PROFILE,
        variables: {
          id: 'trader123',
          input: {
            website: 'http://newurl.com',
            bio: 'testing bio',
          },
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

    const update = wrapper.find('MockProfileSettings').prop('update');

    act(() => {
      update({
        website: 'http://newurl.com',
        bio: 'testing bio',
      });
    });
    await sleep(0);
    await asyncUpdateWrapper(wrapper);

    expect(wrapper.find('MockProfileSettings').prop('updateRes').errors).toEqual([
      { message: 'test error' },
    ]);
  });

  it('updates bio after mutation', async () => {
    const { component } = setup({ ctx, graphqlMocks, ...props });
    const wrapper = await asyncMountWrapper(component);

    const update = wrapper.find('MockProfileSettings').prop('update');

    act(() => {
      update({
        website: 'http://newurl.com',
        bio: 'testing bio',
      });
    });

    await sleep(0);
    await asyncUpdateWrapper(wrapper);

    expect(wrapper.find('MockProfileSettings').prop('profile').data.bio)
      .toEqual('testing bio');
  });

  it('updates website after mutation', async () => {
    const { component } = setup({ ctx, graphqlMocks, ...props });
    const wrapper = await asyncMountWrapper(component);

    const update = wrapper.find('MockProfileSettings').prop('update');

    act(() => {
      update({
        website: 'http://newurl.com',
        bio: 'testing bio',
      });
    });

    await sleep(0);
    await asyncUpdateWrapper(wrapper);

    expect(wrapper.find('MockProfileSettings').prop('profile').data.website)
      .toEqual('http://newurl.com');
  });

  it('shows as loading during mutation', async () => {
    const { component } = setup({ ctx, graphqlMocks, ...props });
    const wrapper = await asyncMountWrapper(component);

    const update = wrapper.find('MockProfileSettings').prop('update');

    act(() => {
      update({
        website: 'http://newurl.com',
        bio: 'testing bio',
      });
    });
    wrapper.update();

    expect(wrapper.find('MockProfileSettings').prop('updateRes').loading)
      .toEqual(true);
  });
});

describe('ProfileSettings uploadProfilePhoto', () => {
  // write integration tests
});

it('calls ProfileSettings with loading when query loading', async () => {
  const { component } = setup({ ctx, graphqlMocks: [], ...props });
  const wrapper = mount(component);

  expect(wrapper.find('MockProfileSettings').prop('profile').loading)
    .toEqual(true);
  expect(wrapper.find('MockProfileSettings').prop('profile').data)
    .toEqual({});
});

it('calls ProfileSettings with error when query errors', async () => {
  graphqlMocks = [
    {
      request: {
        query: GET_PROFILE,
        variables: {
          id: 'trader123',
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
  await asyncUpdateWrapper(wrapper);

  expect(wrapper.find('MockProfileSettings').prop('profile').errors)
    .toEqual(graphqlMocks[0].result.errors);
});
