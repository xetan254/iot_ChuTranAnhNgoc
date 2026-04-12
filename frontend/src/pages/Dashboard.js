import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

function Dashboard() {
  const [devices, setDevices] = useState({ ac: false, light: false, air: false });
  const [loadingDevices, setLoadingDevices] = useState({ ac: false, light: false, air: false });
  const [latestData, setLatestData] = useState({ temp: '--', humidity: '--', light: '--', air: '--' });
  const [activeChartTab, setActiveChartTab] = useState('temp');
  const [chartDataState, setChartDataState] = useState({
    temp: { labels: [], data: [] },
    humidity: { labels: [], data: [] },
    light: { labels: [], data: [] },
    air: { labels: [], data: [] }
  });

  useEffect(() => {
    const fetchInitialStatus = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/device-status');
        const statusMap = { ac: false, light: false, air: false };
        
        res.data.forEach(item => {
          const isON = (item.action && item.action.toUpperCase() === 'ON') || 
                       (item.status && item.status.toUpperCase() === 'ON');
          
          if (String(item.device_id) === '1') statusMap.ac = isON;
          if (String(item.device_id) === '2') statusMap.light = isON;
          if (String(item.device_id) === '3') statusMap.air = isON;
        });
        setDevices(statusMap);
      } catch (e) { console.error("Lỗi đồng bộ trạng thái:", e); }
    };

    const fetchRealtimeData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/chart-data');
        const data = response.data; 

        const tempData = data.filter(item => item.type.toLowerCase() === 'nhiệt độ');
        const humData = data.filter(item => item.type.toLowerCase() === 'độ ẩm');
        const lightData = data.filter(item => item.type.toLowerCase() === 'ánh sáng');
        const airData = data.filter(item => item.type.toLowerCase() === 'không khí');

        setChartDataState({
          temp: { labels: tempData.map(i => i.time), data: tempData.map(i => i.value) },
          humidity: { labels: humData.map(i => i.time), data: humData.map(i => i.value) },
          light: { labels: lightData.map(i => i.time), data: lightData.map(i => i.value) },
          air: { labels: airData.map(i => i.time), data: airData.map(i => i.value) }
        });

        setLatestData({
          temp: tempData.length > 0 ? tempData[tempData.length - 1].value : '--',
          humidity: humData.length > 0 ? humData[humData.length - 1].value : '--',
          light: lightData.length > 0 ? lightData[lightData.length - 1].value : '--',
          air: airData.length > 0 ? airData[airData.length - 1].value : '--'
        });
      } catch (error) { console.error("Lỗi realtime:", error); }
    };

    fetchInitialStatus(); 
    fetchRealtimeData();
    const interval = setInterval(fetchRealtimeData, 2000);
    return () => clearInterval(interval);
  }, []);

  const toggleDevice = async (deviceKey) => {
    if (loadingDevices[deviceKey]) return; 

    const oldState = devices[deviceKey]; 
    const newState = !oldState;
    const actionStr = newState ? 'ON' : 'OFF';

    let deviceId, deviceCode;
    if (deviceKey === 'ac') { deviceId = 1; deviceCode = 'LED_1'; }
    else if (deviceKey === 'light') { deviceId = 2; deviceCode = 'LED_2'; }
    else if (deviceKey === 'air') { deviceId = 3; deviceCode = 'LED_3'; }

    // Chuyển nút sang trạng thái mới & bật loading spinner lập tức
    setDevices({ ...devices, [deviceKey]: newState });
    setLoadingDevices({ ...loadingDevices, [deviceKey]: true });

    try {
      // 1. Gửi lệnh điều khiển (BỎ AWAIT để không bị kẹt nếu backend treo 1 phút)
      // Thêm timeout 5s để ngắt request nếu nó treo quá lâu
      axios.post('http://localhost:5000/api/control', {
        deviceId: deviceId, deviceCode: deviceCode, action: actionStr
      }, { timeout: 5000 }).catch(err => console.log("Lỗi POST lệnh:", err));

      // 2. Polling kiểm tra database liên tục tối đa 10 giây
      let statusChanged = false;
      const maxRetries = 10; 
      const delayMs = 1000;  

      for (let i = 0; i < maxRetries; i++) {
        await new Promise(resolve => setTimeout(resolve, delayMs));

        const res = await axios.get('http://localhost:5000/api/device-status');
        const targetDevice = res.data.find(item => String(item.device_id) === String(deviceId));
        
        if (targetDevice) {
          const dbIsOn = (targetDevice.action && targetDevice.action.toUpperCase() === 'ON') || 
                         (targetDevice.status && targetDevice.status.toUpperCase() === 'ON');
          
          if (dbIsOn === newState) {
            statusChanged = true;
            break; 
          }
        }
      }

      // Hết 10s, kiểm tra xem trạng thái đã đổi thành công chưa
      if (statusChanged) {
        setLoadingDevices(prev => ({ ...prev, [deviceKey]: false }));
      } else {
        throw new Error("TIMEOUT_10S"); // Chủ động ném lỗi nếu quá 10s không đổi
      }

   } catch (error) {
      // 3. XỬ LÝ LỖI HOẶC QUÁ 10S: TRUY VẤN LẠI DB ĐỂ LẤY TRẠNG THÁI MỚI NHẤT
      try {
        const res = await axios.get('http://localhost:5000/api/device-status');
        const targetDevice = res.data.find(item => String(item.device_id) === String(deviceId));
        
        let latestDbState = oldState; // Mặc định về trạng thái ban đầu
        if (targetDevice) {
          // Lấy chính xác trạng thái mới nhất đang lưu trong Database (chỉ ON hoặc OFF)
          latestDbState = (targetDevice.action && targetDevice.action.toUpperCase() === 'ON') || 
                          (targetDevice.status && targetDevice.status.toUpperCase() === 'ON');
        }
        
        // Cập nhật giao diện theo trạng thái thực tế của DB
        setDevices(prev => ({ ...prev, [deviceKey]: latestDbState })); 
      } catch (dbError) {
        // Nếu API sập không lấy được thì đành lùi về oldState
        setDevices(prev => ({ ...prev, [deviceKey]: oldState })); 
      }

      // Tắt loading
      setLoadingDevices(prev => ({ ...prev, [deviceKey]: false }));
      
      // SỬ DỤNG SETTIMEOUT ĐỂ DELAY ALERT, GIÚP GIAO DIỆN CẬP NHẬT TRƯỚC
      setTimeout(() => {
        if (error.message === "TIMEOUT_10S") {
          alert("⚠️ Lệnh thất bại: Không nhận được phản hồi sau 10s. Thiết bị đã trở về trạng thái hiện tại.");
        } else {
          alert("❌ Lỗi kết nối đến máy chủ.");
        }
      }, 400); // Trễ 100ms là đủ để React render lại UI
    }
  };

  const chartConfigs = {
    temp: { label: 'Nhiệt độ (°C)', borderColor: '#FF5A5A', backgroundColor: 'rgba(255, 90, 90, 0.15)' },
    humidity: { label: 'Độ ẩm (%)', borderColor: '#4A90E2', backgroundColor: 'rgba(74, 144, 226, 0.15)' },
    light: { label: 'Ánh sáng (lux)', borderColor: '#FFAA00', backgroundColor: 'rgba(255, 170, 0, 0.15)' },
    air: { label: 'Chất lượng KK (ppm)', borderColor: '#20C976', backgroundColor: 'rgba(32, 201, 118, 0.15)' }
  };

  const currentConfig = chartConfigs[activeChartTab];
  const currentData = chartDataState[activeChartTab];

  const chartData = {
    labels: currentData.labels.length > 0 ? currentData.labels : ['Chưa có dữ liệu'],
    datasets: [{
      label: currentConfig.label,
      data: currentData.data.length > 0 ? currentData.data : [0],
      borderColor: currentConfig.borderColor, backgroundColor: currentConfig.backgroundColor,
      borderWidth: 3, pointBackgroundColor: '#fff', pointBorderColor: currentConfig.borderColor, 
      pointBorderWidth: 2, pointRadius: 4, fill: true, tension: 0.4
    }]
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    scales: { y: { beginAtZero: false, grid: { borderDash: [5, 5], color: '#E5E7EB' } }, x: { grid: { display: false } } },
    plugins: { legend: { display: false }, animation: { duration: 0 } }
  };

  return (
    <div>
      <div className="top-cards">
        <div className="sensor-card">
          <div className="icon-box" style={{ background: '#FFE8E8', color: '#FF5A5A' }}><i className="fas fa-temperature-high"></i></div>
          <div className="sensor-info"><div className="sensor-label">Nhiệt Độ</div><div className="sensor-value">{latestData.temp}<span>°C</span></div></div>
        </div>
        <div className="sensor-card">
          <div className="icon-box" style={{ background: '#E8F1FF', color: '#4A90E2' }}><i className="fas fa-tint"></i></div>
          <div className="sensor-info"><div className="sensor-label">Độ Ẩm</div><div className="sensor-value">{latestData.humidity}<span>%</span></div></div>
        </div>
        <div className="sensor-card">
          <div className="icon-box" style={{ background: '#FFF4E5', color: '#FFAA00' }}><i className="fas fa-sun"></i></div>
          <div className="sensor-info"><div className="sensor-label">Ánh Sáng</div><div className="sensor-value">{latestData.light}<span>lux</span></div></div>
        </div>
        <div className="sensor-card">
          <div className="icon-box" style={{ background: '#E8F8F0', color: '#20C976' }}><i className="fas fa-wind"></i></div>
          <div className="sensor-info"><div className="sensor-label">Chất Lượng KK</div><div className="sensor-value">{latestData.air}<span>ppm</span></div></div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="chart-header">
            <div><h3 className="card-title">Biểu đồ</h3><span style={{ fontSize: '13px', color: '#888' }}>Cập nhật mỗi 2 giây</span></div>
            <div className="chart-tabs">
              <button className={`chart-tab ${activeChartTab === 'temp' ? 'active' : ''}`} onClick={() => setActiveChartTab('temp')}>Nhiệt độ</button>
              <button className={`chart-tab ${activeChartTab === 'humidity' ? 'active' : ''}`} onClick={() => setActiveChartTab('humidity')}>Độ ẩm</button>
              <button className={`chart-tab ${activeChartTab === 'light' ? 'active' : ''}`} onClick={() => setActiveChartTab('light')}>Ánh sáng</button>
              <button className={`chart-tab ${activeChartTab === 'air' ? 'active' : ''}`} onClick={() => setActiveChartTab('air')}>Không khí</button>
            </div>
          </div>
          <div className="chart-container"><Line data={chartData} options={chartOptions} /></div>
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '25px' }}>Thiết Bị Của Tôi</h3>
          <div className="device-list">
            
            {/* THIẾT BỊ ĐIỀU HÒA */}
            <div className={`device-item ${devices.ac && !loadingDevices.ac ? 'active-ac' : ''}`}>
              <div className="device-info">
                <div className="device-icon-wrapper"><i className="fas fa-fan"></i></div>
                <div>
                  <div className="device-name">Điều Hòa</div>
                  <div className="device-status" style={{ color: loadingDevices.ac ? '#FFAA00' : (devices.ac ? '#20C976' : '#888') }}>
                    {loadingDevices.ac ? 'Đang xử lý...' : (devices.ac ? 'Đang hoạt động' : 'Đang tắt')}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {loadingDevices.ac && <i className="fas fa-spinner fa-spin" style={{ color: '#FFAA00', fontSize: '18px' }}></i>}
                <label className="toggle-switch" style={{ opacity: loadingDevices.ac ? 0.5 : 1, cursor: loadingDevices.ac ? 'not-allowed' : 'pointer' }}>
                  <input type="checkbox" checked={devices.ac} onChange={() => toggleDevice('ac')} disabled={loadingDevices.ac} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            {/* THIẾT BỊ ĐÈN */}
            <div className={`device-item ${devices.light && !loadingDevices.light ? 'active-light' : ''}`}>
              <div className="device-info">
                <div className="device-icon-wrapper"><i className="fas fa-lightbulb"></i></div>
                <div>
                  <div className="device-name">Hệ Thống Đèn</div>
                  <div className="device-status" style={{ color: loadingDevices.light ? '#FFAA00' : (devices.light ? '#20C976' : '#888') }}>
                    {loadingDevices.light ? 'Đang xử lý...' : (devices.light ? 'Đang hoạt động' : 'Đang tắt')}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {loadingDevices.light && <i className="fas fa-spinner fa-spin" style={{ color: '#FFAA00', fontSize: '18px' }}></i>}
                <label className="toggle-switch" style={{ opacity: loadingDevices.light ? 0.5 : 1, cursor: loadingDevices.light ? 'not-allowed' : 'pointer' }}>
                  <input type="checkbox" checked={devices.light} onChange={() => toggleDevice('light')} disabled={loadingDevices.light} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            {/* THIẾT BỊ LỌC KHÍ */}
            <div className={`device-item ${devices.air && !loadingDevices.air ? 'active-air' : ''}`}>
              <div className="device-info">
                <div className="device-icon-wrapper"><i className="fas fa-wind"></i></div>
                <div>
                  <div className="device-name">Máy Lọc Khí</div>
                  <div className="device-status" style={{ color: loadingDevices.air ? '#FFAA00' : (devices.air ? '#20C976' : '#888') }}>
                    {loadingDevices.air ? 'Đang xử lý...' : (devices.air ? 'Đang hoạt động' : 'Đang tắt')}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {loadingDevices.air && <i className="fas fa-spinner fa-spin" style={{ color: '#FFAA00', fontSize: '18px' }}></i>}
                <label className="toggle-switch" style={{ opacity: loadingDevices.air ? 0.5 : 1, cursor: loadingDevices.air ? 'not-allowed' : 'pointer' }}>
                  <input type="checkbox" checked={devices.air} onChange={() => toggleDevice('air')} disabled={loadingDevices.air} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;