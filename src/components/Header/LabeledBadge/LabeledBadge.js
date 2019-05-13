import React from 'react';
import PropTypes from 'prop-types';

const LabeledBadge = ({ label, value }) => (
  <div className="header-labeled-badge">
    <div className="label">{label}</div>
    <div className="value">{value}</div>
  </div>
);

LabeledBadge.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export default LabeledBadge;
