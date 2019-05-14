import React from 'react';
import PropTypes from 'prop-types';

const LabeledBadge = ({ label, value, className }) => (
  <div className={`score-chart-labeled-badge ${className}`}>
    <div className="label">{label}</div>
    <div className="value">{value}</div>
  </div>
);

LabeledBadge.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
};

LabeledBadge.defaultProps = {
  className: '',
};


export default LabeledBadge;
