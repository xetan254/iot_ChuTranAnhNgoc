import React from 'react';

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontWeight: 'bold', color: '#6B7280' }}>{label}:</span>
      <select 
        className="filter-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E5E7EB' }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default FilterSelect;
