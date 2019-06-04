import React, { useContext } from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo-hooks';
import get from 'lodash.get';
import Header from './Header';
import AppContext from '../../AppContext';

export const GET_SCORE_RANK_PROFILEPHOTO = gql`
  query getScoreRankProfilePhoto($id: ID) {
    getUsers(ids: [$id]) {
      profilePhoto(size: "thumbnail") {
        url
      }
    }
    getTrader(id: $id) {
      rank
      scores(input: {
        limit: 1
      }) {
        score
      }
    }
  }
`;

export function HeaderContainer() {
  const app = useContext(AppContext);
  const user = app.user || {};
  console.log(app.user);
  const { data } = useQuery(GET_SCORE_RANK_PROFILEPHOTO, {
    variables: {
      id: user.id,
    },
    skip: !user.id,
    pollInterval: 5000,
  });

  return (
    <Header
      user={user}
      score={get(data, 'getTrader.scores[0].score')}
      rank={get(data, 'getTrader.rank')}
      profilePhoto={get(data, 'getUsers[0].profilePhoto.url')}
    />
  );
}
