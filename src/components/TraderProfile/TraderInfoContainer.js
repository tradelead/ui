import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo-hooks';
import get from 'lodash.get';
import TraderInfo from './TraderInfo';

export const GET_TRADER_INFO = gql`
  query getTraderInfo($id: ID) {
    getUsers(ids: [$id]) {
      username
      bio
      website
      profilePhoto(size: "thumbnail") {
        url
      }
    }
  }
`;

const TraderInfoContainer = ({ userID }) => {
  const {
    data,
    error,
    loading,
  } = useQuery(GET_TRADER_INFO, {
    variables: { id: userID },
    skip: !userID,
    fetchPolicy: 'cache-and-network',
  });

  return (
    <TraderInfo
      info={get(data, 'getUsers[0]') || {}}
      errors={get(error, 'graphQLErrors')}
      loading={loading}
    />
  );
};

TraderInfoContainer.propTypes = {
  userID: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export { TraderInfoContainer };
