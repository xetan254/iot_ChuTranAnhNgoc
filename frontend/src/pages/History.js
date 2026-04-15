import React, { useState, useEffect } from 'react'; // Thêm useState, useEffect
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
    loading,
    page,
    setPage,
    totalPages,
    searchTerm,
    setSearchTerm,
    filterValue, // Giá trị filter status cũ
    setFilterValue,
    deviceFilter,
    setDeviceFilter,
    timeSort,
    setTimeSort,
    sortConfig,
    handleSort,
  } = useAction();

  // State lưu danh sách thiết bị để render dropdown
  const [devices, setDevices] = useState([]);

  // Gọi API lấy danh sách thiết bị khi load trang
  useEffect(() => {
    // Thay đổi URL theo đúng route API backend của bạn
    fetch('http://localhost:5000/api/devices') // Sửa port/domain nếu cần
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
            const options = data.map(device => ({
                value: device.name, 
                label: device.name
            }));
            setDevices([{ value: 'all', label: 'Tất cả thiết bị' }, ...options]);
        }
      })
      .catch(err => console.error("Lỗi lấy danh sách thiết bị:", err));
  }, []);

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

  const timeSortOptions = [
    { value: 'desc', label: 'Mới nhất trước' },
    { value: 'asc', label: 'Cũ nhất trước' }
  ];

  return (
    <div className="card">
      <div className="filter-toolbar" style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '15px', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <SearchBox 
          placeholder="Tìm theo ID, tên thiết bị..." 
          value={searchTerm} 
          onChange={setSearchTerm} 
        />
        
        <FilterSelect 
          label="Tên Thiết bị" 
          value={deviceFilter} 
          onChange={setDeviceFilter} 
          options={devices.length > 0 ? devices : [{ value: 'all', label: 'Đang tải...' }]} 
        />
        <FilterSelect 
          label="Trạng thái" 
          value={filterValue} 
          onChange={setFilterValue} 
          options={statusOptions} 
        />
        <FilterSelect
          label="Thời gian"
          value={timeSort}
          onChange={setTimeSort}
          options={timeSortOptions}
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
        totalPages={totalPages}
      />
    </div>
  );
}

export default History;