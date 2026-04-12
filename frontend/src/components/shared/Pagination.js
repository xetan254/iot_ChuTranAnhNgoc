import React from 'react';

function Pagination({ page, onPageChange, totalPages = 1 }) {
  const safeTotalPages = Math.max(1, totalPages);
  const visibleCount = 5;
  const safePage = Math.min(Math.max(1, page), safeTotalPages);
  const canGoPrev = safePage > 1;
  const canGoNext = safePage < safeTotalPages;

  let startPage;
  let endPage;

  if (safePage <= 3) {
    startPage = 1;
    endPage = visibleCount;
  } else if (safePage >= safeTotalPages - 2) {
    endPage = safeTotalPages;
    startPage = safeTotalPages - (visibleCount - 1);
  } else {
    startPage = safePage - 2;
    endPage = safePage + 2;
  }

  const goToPage = (targetPage) => {
    const nextPage = Math.min(Math.max(1, targetPage), safeTotalPages);
    onPageChange(nextPage);
  };

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i += 1) {
    if (i <= safeTotalPages) {
      pageNumbers.push(i);
    }
  }

  return (
    <div className="pagination" style={{ marginTop: '15px' }}>
      {canGoPrev && (
        <button 
          className="page-btn" 
          onClick={() => goToPage(safePage - 1)}
        >
          <i className="fas fa-chevron-left"></i>
        </button>
      )}

      {pageNumbers.map((pageNumber) => (
        <button
          key={pageNumber}
          className={`page-btn ${pageNumber === safePage ? 'active' : ''}`}
          onClick={() => goToPage(pageNumber)}
        >
          {pageNumber}
        </button>
      ))}

      <button 
        className="page-btn" 
        disabled={!canGoNext}
        onClick={() => goToPage(safePage + 1)}
      >
        <i className="fas fa-chevron-right"></i>
      </button>
    </div>
  );
}

export default Pagination;
