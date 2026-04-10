import React from 'react';

function SearchBox({ placeholder, value, onChange }) {
  return (
    <div className="search-box">
      <i className="fas fa-search" style={{ color: '#A09BC0' }}></i>
      <input 
        type="text" 
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default SearchBox;
