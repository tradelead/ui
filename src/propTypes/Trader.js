import PropTypes from 'prop-types';

export default PropTypes.shape({
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  username: PropTypes.string,
  get: PropTypes.func,
  observeScoreHistory: PropTypes.func,
  observeTopTraders: PropTypes.func,
});
