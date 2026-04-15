import React, { useState, useEffect } from 'react';
import SearchBox from '../components/shared/SearchBox';
import FilterSelect from '../components/shared/FilterSelect';
import DataTable from '../components/shared/DataTable';
import Pagination from '../components/shared/Pagination';
import StatusBadge from '../components/shared/StatusBadge';
import { useData } from '../hooks/useData';
import { formatDate } from '../utils/dateUtils';

function Data() {
  const {
    data, loading, page, setPage, totalPages,
    searchTerm, setSearchTerm,
    filterValue, setFilterValue,
    sensorFilter, setSensorFilter,
    timeSort, setTimeSort,
    valueSort, setValueSort,
    sortConfig, handleSort,
  } = useData();

  const [sensors, setSensors] = useState([]);

  // Gọi API lấy danh sách Tên Cảm Biến
  useEffect(() => {
    fetch('http://localhost:5000/api/sensors')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
            const options = data.map(sensor => ({
                value: sensor.name, 
                label: sensor.name
            }));
            setSensors([{ value: 'all', label: 'Tất cả cảm biến' }, ...options]);
        }
      })
      .catch(err => console.error("Lỗi lấy danh sách sensor:", err));
  }, []);

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

  // Options cho các Dropdown
  const typeOptions = [
    { value: 'all', label: 'Tất cả loại' },
    { value: 'Nhiệt độ', label: 'Nhiệt độ' },
    { value: 'Độ ẩm', label: 'Độ ẩm' },
    { value: 'Ánh sáng', label: 'Ánh sáng' },
    { value: 'Không khí', label: 'Chất lượng KK' },
  ];

  const timeSortOptions = [
    { value: 'desc', label: 'Mới nhất trước' },
    { value: 'asc', label: 'Cũ nhất trước' }
  ];

  const valueSortOptions = [
    { value: 'none', label: 'Không sắp xếp giá trị' },
    { value: 'asc', label: 'Giá trị tăng dần' },
    { value: 'desc', label: 'Giá trị giảm dần' }
  ];

  return (
    <div className="card">
      {/* Thanh công cụ tìm kiếm và lọc */}
      <div className="filter-toolbar" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
        
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
          <SearchBox placeholder="Tìm theo ID, giá trị..." value={searchTerm} onChange={setSearchTerm} />
          <FilterSelect 
            label="Tên Cảm Biến" 
            value={sensorFilter} 
            onChange={setSensorFilter} 
            options={sensors.length > 0 ? sensors : [{ value: 'all', label: 'Đang tải...' }]} 
          />
          <FilterSelect label="Loại giá trị" value={filterValue} onChange={setFilterValue} options={typeOptions} />
           <FilterSelect label="Thời gian" value={timeSort} onChange={setTimeSort} options={timeSortOptions} />
          <FilterSelect label="Giá trị" value={valueSort} onChange={setValueSort} options={valueSortOptions} />
        
        </div>

      </div>

      <DataTable columns={columns} data={data} loading={loading} sortConfig={sortConfig} onSort={handleSort} />
      <Pagination page={page} onPageChange={setPage} totalPages={totalPages} />
    </div>
  );
}

export default Data;