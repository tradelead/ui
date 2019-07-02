import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo-hooks';
import get from 'lodash.get';
import union from 'lodash.union';
import Leaderboard from './Leaderboard';

export const GET_TOP_TRADERS = gql`  
  query getLeaderboard($limit: Int!) {
    allTimeTopTraders: getTopTraders(limit: $limit) {
      id
      rank
      scores(input: {
        limit: 1
      }) {
        score
      }
    }
    weeklyTopTraders: getTopTraders(period: "week", limit: $limit) {
      id
      rank
      scores(input: {
        period: "week"
        limit: 1
      }) {
        score
      }
    }
    dailyTopTraders: getTopTraders(period: "day", limit: $limit) {
      id
      rank
      scores(input: {
        period: "day"
        limit: 1
      }) {
        score
      }
    }
  }
`;

export const GET_USERS = gql`
  query getUsersInfo($ids: [ID!]!) {
    getUsers(ids: $ids) {
      id
      username
      profilePhoto(size: thumbnail) {
        url
      }
    }
  }
`;

export function LeaderboardContainer() {
  const getUserIDs = ({ data }) => {
    const allTimeTopTraders = get(data, 'allTimeTopTraders') || [];
    const allTimeTopTradersIDs = allTimeTopTraders.map(trader => trader.id);

    const weeklyTopTraders = get(data, 'weeklyTopTraders') || [];
    const weeklyTopTradersIDs = weeklyTopTraders.map(trader => trader.id);

    const dailyTopTraders = get(data, 'dailyTopTraders') || [];
    const dailyTopTradersIDs = dailyTopTraders.map(trader => trader.id);

    return union(allTimeTopTradersIDs, weeklyTopTradersIDs, dailyTopTradersIDs);
  };

  const reduceTopTraders = (topTraders, usersInfo) => {
    const usersInfoMap = usersInfo.reduce((acc, userInfo) => {
      acc[userInfo.id] = userInfo;
      return acc;
    }, {});

    return topTraders.map((trader) => {
      const userInfo = usersInfoMap[trader.id] || {};
      const { rank } = trader;
      const score = get(trader, 'scores[0].score');
      return {
        ...userInfo,
        rank,
        score,
      };
    });
  };

  const tradersRes = useQuery(GET_TOP_TRADERS, {
    variables: { limit: 15 },
    pollInterval: 5000,
  });

  const usersRes = useQuery(GET_USERS, {
    variables: { ids: getUserIDs(tradersRes) },
    fetchPolicy: 'cache-and-network',
  });

  const usersInfo = get(usersRes, 'data.getUsers') || [];

  console.log(tradersRes.data);
  const allTimeTopTraders = reduceTopTraders(
    get(tradersRes, 'data.allTimeTopTraders') || [],
    usersInfo,
  );

  const weeklyTopTraders = reduceTopTraders(
    get(tradersRes, 'data.weeklyTopTraders') || [],
    usersInfo,
  );

  const dailyTopTraders = reduceTopTraders(
    get(tradersRes, 'data.dailyTopTraders') || [],
    usersInfo,
  );

  const errors = get(tradersRes.error, 'graphQLErrors') || [];
  if (errors && errors.length === 0 && tradersRes.error) {
    errors.push(tradersRes.error);
  }

  if (get(usersRes.error, 'graphQLErrors') && get(usersRes.error, 'graphQLErrors').length > 0) {
    errors.push(...get(usersRes.error, 'graphQLErrors'));
  } else if (errors && errors.length === 0 && usersRes.error) {
    errors.push(usersRes.error);
  }

  return (
    <Leaderboard
      allTimeTopTraders={allTimeTopTraders}
      weeklyTopTraders={weeklyTopTraders}
      dailyTopTraders={dailyTopTraders}
      loading={tradersRes.loading || usersRes.loading}
      errors={errors}
    />
  );
}
