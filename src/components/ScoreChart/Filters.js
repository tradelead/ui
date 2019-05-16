import React, { useState } from 'react';
import PropTypes from 'prop-types';

const Filters = ({ onSelect, filters }) => {
  const [activeFilter, setActiveFilter] = useState(null);
  console.log(activeFilter);
  return (
    <div className="chart-filters-wrap">
      {filters.map(filter => (
        <button
          type="button"
          key={filter.label}
          className={`${filter.label} ${(!activeFilter && filter.default) || (activeFilter && activeFilter.label === filter.label) ? 'active' : ''}`}
          onClick={() => { onSelect(filter.value); setActiveFilter(filter); }}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

Filters.propTypes = {
  onSelect: PropTypes.func.isRequired,
  filters: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]).isRequired,
    default: PropTypes.bool,
  })).isRequired,
};

export default Filters;
