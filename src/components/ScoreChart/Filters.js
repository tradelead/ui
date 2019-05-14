import React from 'react';
import PropTypes from 'prop-types';

const Filters = ({ onSelect, filters }) => (
  <div className="chart-filters-wrap">
    {filters.map(filter => (
      <button key={filter.label} className={filter.label} type="button" onClick={() => onSelect(filter.value)}>
        {filter.label}
      </button>
    ))}
  </div>
);

Filters.propTypes = {
  onSelect: PropTypes.func.isRequired,
  filters: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]).isRequired,
  })).isRequired,
};

export default Filters;
