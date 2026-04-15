import { useState, useEffect } from 'react';
import axios from 'axios';

export function useAction() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Khai báo các state quản lý bộ lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('all'); // Dropdown Trạng thái
  const [deviceFilter, setDeviceFilter] = useState('all'); // Dropdown Tên thiết bị
  const [timeSort, setTimeSort] = useState('desc'); // Mặc định mới nhất trước

  const [sortConfig, setSortConfig] = useState({ key: 'interacted_at', direction: 'desc' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const limit = 10;
      const offset = (page - 1) * limit;

      // Xây dựng URL động với các tham số lọc gửi xuống Backend
      let url = `http://localhost:5000/api/action-history?limit=${limit}&offset=${offset}`;
      
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (filterValue !== 'all') url += `&status=${encodeURIComponent(filterValue)}`;
      
      // Mã hóa thiết bị tiếng Việt (VD: "Máy lọc không khí") trước khi gửi
      if (deviceFilter !== 'all') url += `&deviceName=${encodeURIComponent(deviceFilter)}`;
      url += `&timeSort=${encodeURIComponent(timeSort)}`;

      const response = await axios.get(url);
      const payload = response.data;

      // Xử lý dữ liệu trả về
      if (payload.data) {
        setData(payload.data);
        setTotalPages(payload.totalPages || 1);
      } else if (Array.isArray(payload)) {
        setData(payload);
        setTotalPages(payload.length < limit ? 1 : Math.floor(offset / limit) + 2);
      }
    } catch (error) {
      console.error('Lỗi khi fetch action history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reset về trang 1 nếu người dùng thay đổi bất kỳ bộ lọc nào
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterValue, deviceFilter, timeSort]);

  // Tự động gọi API mỗi khi bộ lọc, trang, hoặc search thay đổi
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchData();
    }, 300); // Tránh spam API khi đang gõ search
    return () => clearTimeout(delay);
  }, [page, searchTerm, filterValue, deviceFilter, timeSort]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Trả về toàn bộ state cho giao diện History.js
  return {
    data, loading, page, setPage, totalPages,
    searchTerm, setSearchTerm,
    filterValue, setFilterValue,
    deviceFilter, setDeviceFilter,
    timeSort, setTimeSort,
    sortConfig, handleSort
  };
}