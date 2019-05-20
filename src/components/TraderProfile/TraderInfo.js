import React, { useState, useEffect } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import { FaDesktop } from 'react-icons/fa';
import TraderPropType from '../../propTypes/Trader';
import TraderImg from '../TraderImg/TraderImg';
import './TraderInfo.css';

const TraderInfo = ({ trader }) => {
  const [info, loading, error] = useTraderInfo(trader, ['bio', 'website']);

  const bioLines = info.bio ? info.bio.split('\n') : [];

  return (
    <div className="traderInfo">
      <div className="profilePhoto">
        <TraderImg trader={trader} size="thumbnail" />
      </div>

      <div className="username">
        {trader.username}
      </div>

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

      {error && (
        <Alert variant="danger">{error}</Alert>
      )}

      <div className="bio">
        {bioLines.map(line => (
          <span key={line}>
            {line}
            <br />
          </span>
        ))}
      </div>

      {info.website && (
        <a className="website" href={info.website}>
          <FaDesktop />
          {info.website}
        </a>
      )}
    </div>
  );
};

TraderInfo.propTypes = {
  trader: TraderPropType.isRequired,
};

function useTraderInfo(trader, args) {
  const [info, setInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setInfo(await trader.get(args));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [trader]);

  return [info, loading, error];
}

export default TraderInfo;
