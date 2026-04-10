import React from 'react';
import SearchBox from '../components/shared/SearchBox';
import FilterSelect from '../components/shared/FilterSelect';
import DataTable from '../components/shared/DataTable';
import Pagination from '../components/shared/Pagination';
import StatusBadge from '../components/shared/StatusBadge';
import { useData } from '../hooks/useData';
import { formatDate } from '../utils/dateUtils';

function Data() {
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
  } = useData();

  const columns = [
    { key: 'id', label: 'ID', render: (item) => `#${item.id}` },
    { key: 'sensor_name', label: 'Tên Cảm Biến', render: (item) => <strong>{item.sensor_name}</strong> },
    { key: 'type', label: 'Loại', render: (item) => <StatusBadge type={item.type} /> },
    {
      key: 'value', label: 'Giá Trị', render: (item) => (
        <strong style={{ fontSize: '16px', color: '#2D2185' }}>
          {item.value} {item.type === 'Nhiệt độ' ? '°C' : item.type === 'Độ ẩm' ? '%' : item.type === 'Ánh sáng' ? 'lux' : 'ppm'}
        </strong>
      )
    },
    { key: 'measured_at', label: 'Thời Gian Cập Nhật', render: (item) => formatDate(item.measured_at) },
  ];

  const typeOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'Nhiệt độ', label: 'Nhiệt độ' },
    { value: 'Độ ẩm', label: 'Độ ẩm' },
    { value: 'Ánh sáng', label: 'Ánh sáng' },
    { value: 'Không khí', label: 'Chất lượng KK' },
  ];

  return (
    <div className="card">
      <div className="filter-toolbar" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <SearchBox
          placeholder="Tìm theo ID, giá trị, thời gian..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
        <FilterSelect
          label="Bộ lọc"
          value={filterValue}
          onChange={setFilterValue}
          options={typeOptions}
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

export default Data;