import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import AppContext from '../../AppContext';
import TraderProfile from '../../components/TraderProfile/TraderProfile';
import './TraderProfileScreen.css';

const TraderProfileScreen = ({ match }) => {
  const { traderService } = useContext(AppContext);

  const [trader, setTrader] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setTrader(await traderService.getTrader(match.params.username));
      } catch (e) {
        setError(e.message);
      }
    })();
  });

  return (
    <div className="traderProfileScreen">

      {trader.id && !error && (
        <TraderProfile trader={trader} />
      )}

      {!trader.id && !error && (
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

      {error && (
        <Alert variant="danger" className="error">{error}</Alert>
      )}
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

export default TraderProfileScreen;
