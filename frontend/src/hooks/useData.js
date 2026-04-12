import axios from 'axios';
import { useDataTableBase } from './useDataTableBase';
import { formatDate } from '../utils/dateUtils';

export function useData() {
  const fetchFn = async (offset, limit) => {
    const response = await axios.get(`http://localhost:5000/api/sensor-data?limit=${limit}&offset=${offset}`);
    const payload = response.data;

    if (Array.isArray(payload)) {
      return {
        data: payload,
        totalPages: payload.length < limit ? Math.max(1, Math.floor(offset / limit) + 1) : Math.floor(offset / limit) + 2
      };
    }

    return {
      data: payload.data || [],
      totalPages: payload.totalPages || 1
    };
  };

  const filterFn = (item, searchTerm, typeFilter) => {
    // 1. Filter by Data Type
    const matchType = typeFilter === 'all' || item.type.toLowerCase() === typeFilter.toLowerCase();
    
    // 2. Filter by Keyword
    const term = searchTerm.toLowerCase();
    const matchSearch = searchTerm === '' || (
      String(item.id).includes(term) ||
      item.sensor_name.toLowerCase().includes(term) ||
      item.type.toLowerCase().includes(term) ||
      String(item.value).includes(term) ||
      formatDate(item.measured_at).toLowerCase().includes(term)
    );

    return matchType && matchSearch;
  };

  return useDataTableBase({ 
    initialSort: { key: 'measured_at', direction: 'desc' }, 
    fetchFn, 
    filterFn 
  });
}
