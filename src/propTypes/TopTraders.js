import PropTypes from 'prop-types';

const TopTradersPropTypes = PropTypes.arrayOf(PropTypes.shape({
  id: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  profilePhoto: PropTypes.shape({
    url: PropTypes.string,
  }).isRequired,
  rank: PropTypes.number.isRequired,
  score: PropTypes.number.isRequired,
}));

export default TopTradersPropTypes;
