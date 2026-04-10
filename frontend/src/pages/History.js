import React from 'react';
import SearchBox from '../components/shared/SearchBox';
import FilterSelect from '../components/shared/FilterSelect';
import DataTable from '../components/shared/DataTable';
import Pagination from '../components/shared/Pagination';
import StatusBadge from '../components/shared/StatusBadge';
import { useAction } from '../hooks/useAction';
import { formatDate } from '../utils/dateUtils';

function History() {
  const {
    data,
    rawData,
    loading,
    page,
    setPage,
    searchTerm,
    setSearchTerm,
    filterValue,
    setFilterValue,
    sortConfig,
    handleSort,
    limit
  } = useAction();

  const columns = [
    { key: 'id', label: 'ID', render: (item) => `#${item.id}` },
    { key: 'device_name', label: 'Tên Thiết Bị', render: (item) => <strong>{item.device_name}</strong> },
    { key: 'action', label: 'Hành Động', render: (item) => (item.action || '').toUpperCase() },
    { key: 'status', label: 'Trạng Thái Thực Tế', render: (item) => <StatusBadge type={item.status} /> },
    { key: 'interacted_at', label: 'Thời Gian', render: (item) => (
      <span style={{ color: '#888' }}>{formatDate(item.interacted_at)}</span>
    )},
  ];

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'on', label: 'Bật (ON)' },
    { value: 'off', label: 'Tắt (OFF)' },
    { value: 'waiting', label: 'Đang xử lý (Waiting)' },
    { value: 'failed', label: 'Thất bại (Failed)' },
  ];

  return (
    <div className="card">
      <div className="filter-toolbar" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <SearchBox 
          placeholder="Tìm theo ID, tên thiết bị..." 
          value={searchTerm} 
          onChange={setSearchTerm} 
        />
        <FilterSelect 
          label="Lọc trạng thái" 
          value={filterValue} 
          onChange={setFilterValue} 
          options={statusOptions} 
        />
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        loading={loading} 
        sortConfig={sortConfig} 
        onSort={handleSort} 
      />

      <Pagination 
        page={page} 
        onPageChange={setPage} 
        hasMore={rawData.length >= limit} 
      />
    </div>
  );
}

export default History;