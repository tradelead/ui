import React, { useContext } from 'react';
import gql from 'graphql-tag';
import { withApollo } from 'react-apollo';
import { useQuery, useMutation } from 'react-apollo-hooks';
import get from 'lodash.get';
import axios from 'axios';
import AppContext from '../../../AppContext';
import useAsyncAction from '../../../hooks/useAsyncAction';
import ProfileSettings from './ProfileSettings';

export const GET_PROFILE = gql`
  query getProfile($id: ID!) {
    getUsers(ids: [$id]) {
      bio
      website
      profilePhoto(size: thumbnail) {
        url
      }
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation updateProfile($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input)
  }
`;

export const SIGN_UPLOAD = gql`
  mutation signUpload($id: ID!, $key: String!) {
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
  console.log(signedUpload, file.type, file);

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
    const { data } = await client.mutate({
      mutation: SIGN_UPLOAD,
      variables: { id, key },
    });
    return data.signUpload;
  };

  const app = useContext(AppContext);
  const id = get(app, 'user.id');

  const profileRes = useQuery(GET_PROFILE, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  });

  const updateUser = useMutation(UPDATE_PROFILE, {
    onError: () => {
    },
    refetchQueries: () => [{ query: GET_PROFILE, variables: { id } }],
  });

  const [dispatchUpdateUser, ...updateUserRes] = useAsyncAction(updateUser);
  const updateRes = {
    data: updateUserRes[0],
    loading: updateUserRes[1],
    error: updateUserRes[2],
  };

  let profileErrors = get(profileRes.error, 'graphQLErrors');
  if (profileErrors && profileErrors.length === 0 && profileRes.error) {
    profileErrors = [profileRes.error];
  }

  return (
    <ProfileSettings
      profile={{
        data: get(profileRes.data, 'getUsers[0]') || {},
        loading: profileRes.loading,
        errors: profileErrors,
      }}
      update={input => dispatchUpdateUser({ variables: { id, input } })}
      updateRes={{
        loading: updateRes.loading,
        errors: updateRes.error && updateRes.error.graphQLErrors,
      }}
      uploadProfilePhoto={({ file, progressFn }) => upload({
        id,
        key: 'profilePhoto',
        file,
        progressFn,
        signUpload,
      })}
    />
  );
});

export { ProfileSettingsContainer };
