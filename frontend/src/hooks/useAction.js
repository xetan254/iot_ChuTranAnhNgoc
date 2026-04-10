import axios from 'axios';
import { useDataTableBase } from './useDataTableBase';
import { formatDate } from '../utils/dateUtils';

export function useAction() {
  const fetchFn = async (offset, limit) => {
    const response = await axios.get(`http://localhost:5000/api/action-history?limit=${limit}&offset=${offset}`);
    return response.data;
  };

  const filterFn = (item, searchTerm, statusFilter) => {
    const dbStatus = item.status ? item.status.toLowerCase() : '';
    
    // 1. Status Filter
    let matchStatus = false;
    if (statusFilter === 'all') matchStatus = true;
    else if (statusFilter === 'failed' && (dbStatus === 'failed' || dbStatus === 'lỗi')) matchStatus = true;
    else if (dbStatus === statusFilter) matchStatus = true;

    // 2. Search Keywords
    const term = searchTerm.toLowerCase();
    const matchSearch = searchTerm === '' || (
      String(item.id).includes(term) ||
      item.device_name.toLowerCase().includes(term) ||
      item.action.toLowerCase().includes(term) ||
      dbStatus.includes(term) ||
      formatDate(item.interacted_at).toLowerCase().includes(term)
    );

    return matchStatus && matchSearch;
  };

  return useDataTableBase({ 
    initialSort: { key: 'interacted_at', direction: 'desc' }, 
    fetchFn, 
    filterFn 
  });
}
