import React from 'react';

/**
 * StatusBadge component maps status/type labels to specific CSS classes or inline styles.
 */
function StatusBadge({ type, label, customValue }) {
  const normalizedType = type ? type.toLowerCase() : '';
  
  // Logic for Sensor Types (from Data.js)
  if (type === 'Nhiệt độ' || type === 'Không Khí') {
    return <span className="badge b-temp">{label || type}</span>;
  }
  if (type === 'Độ ẩm' || type === 'Ánh sáng') {
    return <span className="badge b-hum">{label || type}</span>;
  }

  // Logic for Action Statuses (from History.js)
  const status = normalizedType;
  const style = {
    backgroundColor: status === 'waiting' ? '#FFF4E5' : ((status === 'failed' || status === 'lỗi') ? '#FFE8E8' : (status === 'on' ? 'rgba(32, 201, 118, 0.15)' : '#F3F4F6')),
    color: status === 'waiting' ? '#FFAA00' : ((status === 'failed' || status === 'lỗi') ? '#FF5A5A' : (status === 'on' ? '#20C976' : '#6B7280')),
    border: status === 'waiting' ? '1px solid #FFE0B2' : ((status === 'failed' || status === 'lỗi') ? '1px solid #FFCDD2' : 'none'),
    padding: '6px 14px', borderRadius: '20px', fontWeight: 'bold', fontSize: '13px', display: 'inline-block', minWidth: '70px', textAlign: 'center'
  };

  const displayText = status === 'waiting' ? 'Đang chờ' : 
                    (status === 'failed' || status === 'lỗi') ? 'Thất bại' : 
                    (status === 'on' ? 'Bật' : (status === 'off' ? 'Tắt' : label || type));

  return (
    <span className="status-badge-custom" style={style}>
      {displayText}
    </span>
  );
}

export default StatusBadge;
