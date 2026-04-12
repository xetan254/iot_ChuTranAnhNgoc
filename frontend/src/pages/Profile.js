import React from 'react';

function Pagination({ page, onPageChange, totalPages = 1 }) {
    const safeTotalPages = Math.max(1, Number(totalPages) || 1);
    const currentPage = Math.min(Math.max(1, Number(page) || 1), safeTotalPages);

    function getPages() {
        const delta = 2; 
        const range = [];
        const left = Math.max(1, currentPage - delta);
        const right = Math.min(safeTotalPages, currentPage + delta);

        for (let i = left; i <= right; i++) {
            range.push(i);
        }

        if (left > 2) range.unshift('...');
        if (left > 1) range.unshift(1);

        if (right < safeTotalPages - 1) range.push('...');
        if (right < safeTotalPages) range.push(safeTotalPages);

        return range;
    }

    return (
        <div 
            className="pagination" 
            style={{ 
                marginTop: '20px', 
                marginBottom: '20px',
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                gap: '8px',              
                flexWrap: 'wrap'         
            }}
        >
            {/* Nút Previous */}
            <button
                className="page-btn"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{ 
                    opacity: currentPage === 1 ? 0.4 : 1, 
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold' // In đậm icon/nút lùi
                }}
            >
                <i className="fas fa-chevron-left"></i>
            </button>

            {/* Render các trang và dấu ... */}
            {getPages().map((p, i) =>
                p === '...' ? (
                    <span 
                        key={`ellipsis-${i}`} 
                        className="page-btn" 
                        style={{ 
                            background: 'transparent', 
                            border: 'none', 
                            color: '#888',
                            pointerEvents: 'none',
                            padding: '8px 4px',
                            fontWeight: 'bold' // In đậm dấu 3 chấm
                        }}
                    >
                        ...
                    </span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={`page-btn ${p === currentPage ? 'active' : ''}`}
                        style={{ fontWeight: 'bold' }} // In đậm các số trang
                    >
                        {p}
                    </button>
                )
            )}

            {/* Nút Next */}
            <button
                className="page-btn"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === safeTotalPages}
                style={{ 
                    opacity: currentPage === safeTotalPages ? 0.4 : 1, 
                    cursor: currentPage === safeTotalPages ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold' // In đậm icon/nút tiến
                }}
            >
                <i className="fas fa-chevron-right"></i>
            </button>
        </div>
    );
}

export default Pagination;