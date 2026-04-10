import { useState, useEffect } from 'react';

/**
 * Shared base hook for managing table state (pagination, search, sort).
 * This ensures that the common frontend logic is consistent across pages.
 */
export function useDataTableBase({ 
  initialSort = { key: 'id', direction: 'desc' }, 
  limit = 10,
  filterFn, // Custom filter logic
  fetchFn   // Custom fetch logic (API call)
}) {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [sortConfig, setSortConfig] = useState(initialSort);

  // Re-fetch when page changes
  useEffect(() => {
    loadData(page);
  }, [page]);

  const loadData = async (currentPage) => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * limit;
      const data = await fetchFn(offset, limit);
      setDataList(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = dataList.filter((item) => filterFn(item, searchTerm, filterValue));

  const sortedData = [...filteredData].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  return {
    data: sortedData,
    rawData: dataList, // for detecting if more data is available
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
  };
}
