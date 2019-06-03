import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo-hooks';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import TraderProfile from '../../components/TraderProfile/TraderProfile';
import './TraderProfileScreen.css';

export const GET_TRADER_FROM_USERNAME = gql`
  query getTraderFromUsername($username: String) {
    trader: getUserByUsername(username: $username) {
      id
    }
  }
`;

const TraderProfileScreen = ({ match }) => {
  const { data: { trader }, loading, error } = useQuery(GET_TRADER_FROM_USERNAME, {
    variables: {
      username: match.params.username,
    },
  });
  console.log(trader);
  const id = trader && trader.id;
  const errors = error && error.graphQLErrors;

  return (
    <div className="traderProfileScreen">

      {id && !error && (
        <TraderProfile userID={id} />
      )}

      {loading && (
        <div className="loading">
          <Spinner
            className="loader"
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
          />
          <span className="sr-only">Loading...</span>
        </div>
      )}

      {errors && errors.map(e => (
        <Alert key={e.message} variant="danger" className="error">{e.message}</Alert>
      ))}
    </div>
  );
};

TraderProfileScreen.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      username: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export { TraderProfileScreen };
