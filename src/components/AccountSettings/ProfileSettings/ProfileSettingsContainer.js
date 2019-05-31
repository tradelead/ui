import React, { useContext } from 'react';
import gql from 'graphql-tag';
import { Query, Mutation, withApollo } from 'react-apollo';
import get from 'lodash.get';
import axios from 'axios';
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

export const SIGN_UPLOAD = gql`
  mutation signUpload($id: ID, $key: String) {
    signUpload(userID: $id, key: $key) {
      url
      fields
    }
  }
`;

async function upload({
  id,
  key,
  file,
  signUpload,
  progressFn,
}) {
  const signedUpload = await signUpload({ id, key });

  const form = new FormData();

  Object.keys(signedUpload.fields).forEach((property) => {
    form.append(property, signedUpload.fields[property]);
  });

  form.append('Content-Type', file.type);
  form.append('file', file);

  await axios.post(signedUpload.url, form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (e) => {
      const p = Math.trunc(Math.round((e.loaded * 100) / e.total));
      progressFn(p);
    },
  });
}

const ProfileSettingsContainer = withApollo(({ client }) => {
  const signUpload = async ({ id, key }) => {
    const { data } = await client.query({
      query: SIGN_UPLOAD,
      variables: { id, key },
    });
    return data.signUpload;
  };

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
          {(updateUser, updateUserRes) => (
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
              uploadProfilePhoto={({ file, progressFn }) => upload({
                id,
                key: 'profilePhoto',
                file,
                progressFn,
                signUpload,
              })}
            />
          )}
        </Mutation>
      )}
    </Query>
  );
});

export { ProfileSettingsContainer };
