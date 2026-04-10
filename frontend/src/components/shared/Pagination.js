import React from 'react';

function Pagination({ page, onPageChange, hasMore }) {
  return (
    <div className="pagination" style={{ marginTop: '15px' }}>
      <button 
        className="page-btn" 
        disabled={page === 1} 
        onClick={() => onPageChange(page - 1)}
      >
        <i className="fas fa-chevron-left"></i>
      </button>
      <button className="page-btn active">{page}</button>
      <button 
        className="page-btn" 
        disabled={!hasMore} 
        onClick={() => onPageChange(page + 1)}
      >
        <i className="fas fa-chevron-right"></i>
      </button>
    </div>
  );
}

export default Pagination;
