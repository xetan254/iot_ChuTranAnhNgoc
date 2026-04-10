import React from 'react';

const renderSortIcon = (columnKey, sortConfig) => {
  if (sortConfig.key !== columnKey) {
    return <i className="fas fa-sort" style={{ color: '#ccc', marginLeft: '5px' }}></i>;
  }
  return sortConfig.direction === 'asc' 
    ? <i className="fas fa-sort-up" style={{ color: '#2D2185', marginLeft: '5px' }}></i>
    : <i className="fas fa-sort-down" style={{ color: '#2D2185', marginLeft: '5px' }}></i>;
};

function DataTable({ columns, data, items, loading, sortConfig, onSort, emptyMessage = "Không tìm thấy kết quả phù hợp" }) {
  // `data` or `items` can be used for the actual rendered list. 
  // Let's use `data` for consistency.
  
  return (
    <div className="table-responsive" style={{ maxHeight: '450px', overflowY: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ position: 'sticky', top: 0, backgroundColor: '#F8F9FA', zIndex: 1 }}>
          <tr>
            {columns.map((col) => (
              <th 
                key={col.key} 
                onClick={col.sortable !== false ? () => onSort(col.key) : undefined} 
                style={{ cursor: col.sortable !== false ? 'pointer' : 'default', padding: '12px' }}
              >
                {col.label} {col.sortable !== false && renderSortIcon(col.key, sortConfig)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length} style={{textAlign: 'center', padding: '20px'}}>Đang tải dữ liệu...</td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan={columns.length} style={{textAlign: 'center', padding: '20px'}}>{emptyMessage}</td></tr>
          ) : (
            data.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                {columns.map((col) => (
                  <td key={col.key} style={{ padding: col.padding || '12px', ...col.style }}>
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
