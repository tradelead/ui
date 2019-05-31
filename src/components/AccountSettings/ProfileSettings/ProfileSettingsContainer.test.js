import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import { MockedProvider } from 'react-apollo/test-utils';
import { BrowserRouter as Router } from 'react-router-dom';
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
  return {
    component: (
      <Router>
        <AppContext.Provider value={ctx}>
          <MockedProvider mocks={graphqlMocks} addTypename={false}>
            <ProfileSettingsContainer {...obj} />
          </MockedProvider>
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
              website: 'http://test.com',
              bio: 'This is my bio',
              profilePhoto: {
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
  ];
});

it('calls ProfileSettings with user info', async () => {
  const { component } = setup({ ctx, graphqlMocks, ...props });
  const wrapper = await asyncMountWrapper(component);

  expect(wrapper.find('MockProfileSettings').prop('profile').data)
    .toEqual({
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
    await sleep(50);
    await asyncUpdateWrapper(wrapper);

    expect(wrapper.find('MockProfileSettings').prop('updateRes').errors).toEqual([
      { message: 'test error' },
    ]);
  });

  it('mutation updates bio', async () => {
    const { component } = setup({ ctx, graphqlMocks, ...props });
    const wrapper = await asyncMountWrapper(component);

    const update = wrapper.find('MockProfileSettings').prop('update');

    act(() => {
      update({
        website: 'http://newurl.com',
        bio: 'testing bio',
      });

      graphqlMocks[0] = {
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
                website: 'http://newurl.com',
                bio: 'testing bio',
                profilePhoto: {
                  url: 'http://test.com/image.jpg',
                },
              },
            ],
          },
        },
      };
    });

    await sleep(50);
    await asyncUpdateWrapper(wrapper);

    expect(wrapper.find('MockProfileSettings').prop('profile').data.bio)
      .toEqual('testing bio');
  });

  it('mutation updates website', async () => {
    const { component } = setup({ ctx, graphqlMocks, ...props });
    const wrapper = await asyncMountWrapper(component);

    const update = wrapper.find('MockProfileSettings').prop('update');

    act(() => {
      update({
        website: 'http://newurl.com',
        bio: 'testing bio',
      });

      graphqlMocks[0] = {
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
                website: 'http://newurl.com',
                bio: 'testing bio',
                profilePhoto: {
                  url: 'http://test.com/image.jpg',
                },
              },
            ],
          },
        },
      };
    });

    await sleep(50);
    await asyncUpdateWrapper(wrapper);

    expect(wrapper.find('MockProfileSettings').prop('profile').data.website)
      .toEqual('http://newurl.com');
  });
});

describe('ProfileSettings uploadProfilePhoto', () => {

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
