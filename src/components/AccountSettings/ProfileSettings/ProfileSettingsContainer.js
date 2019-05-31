import React, { useContext } from 'react';
import gql from 'graphql-tag';
import { Query, Mutation } from 'react-apollo';
import get from 'lodash.get';
import AppContext from '../../../AppContext';
import ProfileSettings from './ProfileSettings';

export const GET_PROFILE = gql`
  query getProfile($id: ID) {
    getUsers(ids: [$id]) {
      bio
      website
      profilePhoto(size: "thumbnail") {
        url
      }
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation updateProfile($id: ID, $input: UpdateUserInput) {
    updateUser(id: $id, input: $input)
  }
`;

export function ProfileSettingsContainer() {
  const app = useContext(AppContext);
  const id = get(app, 'user.id');
  return (
    <Query
      query={GET_PROFILE}
      variables={{ id }}
      skip={!id}
      fetchPolicy="cache-and-network"
    >
      {profileRes => (
        <Mutation
          mutation={UPDATE_PROFILE}
          onError={() => {}}
          refetchQueries={() => [{ query: GET_PROFILE, variables: { id } }]}
        >
          {(updateUser, updateUserRes) => {
            console.log(updateUserRes.error && updateUserRes.error.graphQLErrors);
            return (
              <ProfileSettings
                profile={{
                  data: get(profileRes.data, 'getUsers[0]') || {},
                  loading: profileRes.loading,
                  errors: get(profileRes.error, 'graphQLErrors'),
                }}
                update={input => updateUser({ variables: { id, input } })}
                updateRes={{
                  loading: updateUserRes.loading,
                  errors: updateUserRes.error && updateUserRes.error.graphQLErrors,
                }}
              />
            );
          }}
        </Mutation>
      )}
    </Query>
  );
}
