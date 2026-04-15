import { useState, useEffect } from 'react';

export const useData = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // Các state phục vụ tìm kiếm và lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [filterValue, setFilterValue] = useState('all'); // Lọc theo Loại (Nhiệt độ, Độ ẩm...)
    const [sensorFilter, setSensorFilter] = useState('all'); // Lọc theo Tên cảm biến

    // Các state phục vụ sắp xếp
    const [timeSort, setTimeSort] = useState('desc'); // Thời gian: Mới nhất (desc), Cũ nhất (asc)
    const [valueSort, setValueSort] = useState('none'); // Giá trị: none, asc (tăng), desc (giảm)
    
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const fetchData = async () => {
        setLoading(true);
        try {
            // Đưa tất cả biến lọc và sắp xếp vào URL để gửi xuống Backend
            let url = `http://localhost:5000/api/sensor-data?page=${page}&limit=10`;
            if (searchTerm) url += `&search=${searchTerm}`;
            if (filterValue !== 'all') url += `&type=${filterValue}`;
            if (sensorFilter !== 'all') url += `&sensorName=${sensorFilter}`;
            
            // Tham số sắp xếp
            url += `&timeSort=${timeSort}`;
            if (valueSort !== 'none') url += `&valueSort=${valueSort}`;

            const response = await fetch(url);
            const result = await response.json();
            
            setData(result.data || []);
            setTotalPages(result.totalPages || 1);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    // Khi bất kỳ filter/sort nào thay đổi, gọi lại API và reset về trang 1
    useEffect(() => {
        setPage(1); 
    }, [searchTerm, filterValue, sensorFilter, timeSort, valueSort]);

    // Lắng nghe sự thay đổi để fetch data
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchData();
        }, 300); // Thêm độ trễ 300ms để tránh gọi API liên tục khi gõ phím
        return () => clearTimeout(delayDebounce);
    }, [page, searchTerm, filterValue, sensorFilter, timeSort, valueSort]);

    const handleSort = (key) => {
        // Tương thích với chuẩn DataTable hiện tại
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return {
        data, loading, page, setPage, totalPages,
        searchTerm, setSearchTerm,
        filterValue, setFilterValue,
        sensorFilter, setSensorFilter,
        timeSort, setTimeSort,
        valueSort, setValueSort,
        sortConfig, handleSort
    };
};