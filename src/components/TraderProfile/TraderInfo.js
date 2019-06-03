import React from 'react';
import PropTypes from 'prop-types';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import { FaDesktop } from 'react-icons/fa';
import TraderImg from '../TraderImg/TraderImg';
import './TraderInfo.css';

const TraderInfo = ({ info, loading, errors }) => {
  const bioLines = info.bio ? info.bio.split('\n') : [];

  return (
    <div className="traderInfo">
      <div className="profilePhoto">
        <TraderImg src={info.profilePhoto && info.profilePhoto.url} alt={info.username} />
      </div>

      <div className="username">
        {info.username}
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

      {errors && errors.map(error => (
        <Alert key={error.message} variant="danger">{error.message}</Alert>
      ))}

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
  info: PropTypes.shape({
    username: PropTypes.string,
    website: PropTypes.string,
    bio: PropTypes.string,
    profilePhoto: PropTypes.shape({
      url: PropTypes.string,
    }),
  }).isRequired,
  loading: PropTypes.bool.isRequired,
  errors: PropTypes.arrayOf(PropTypes.shape({
    message: PropTypes.string,
  })),
};

TraderInfo.defaultProps = {
  errors: null,
};

export default TraderInfo;
