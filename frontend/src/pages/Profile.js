import React from 'react';

function Profile() {
  return (
    <div className="profile-grid">
      <div className="card">
        {/* Đường dẫn ảnh hướng về thư mục public/ của React */}
        <img src="profile.jpg" alt="Avatar" className="avatar" />
        <h2 className="profile-name">Chu Trần Anh Ngọc</h2>
        <p className="profile-desc">Công nghệ Đa phương tiện <br />B22DCPT189</p>
        <p cl></p>
      </div>

      <div className="card" style={{ textAlign: 'left' }}>
        <h3 style={{ color: '#2D2185', marginBottom: '20px', fontSize: '18px' }}>Liên Kết</h3>
        <div className="links-grid">
          <a href="#" className="link-item" target="_blank" rel="noreferrer noopener">
            <div className="link-icon" style={{ background: '#FF5A5A' }}><i className="fas fa-file-pdf"></i></div>
            <div><span className="link-text">Báo Cáo Đồ Án</span><span className="link-desc">Tải file PDF</span></div>
          </a>
          <a href="https://github.com/xetan254/iot_ChuTranAnhNgoc" className="link-item" target="_blank" rel="noreferrer noopener">
            <div className="link-icon" style={{ background: '#333' }}><i className="fab fa-github"></i></div>
            <div><span className="link-text">GitHub</span><span className="link-desc">Source Code</span></div>
          </a>
          <a href="#" className="link-item" target="_blank" rel="noreferrer noopener">
            <div className="link-icon" style={{ background: '#20C976' }}><i className="fas fa-code"></i></div>
            <div><span className="link-text">API Swagger</span><span className="link-desc">Tài liệu API</span></div>
          </a>
          <a href="https://www.figma.com/design/zjyGDNnslXnvvTMSNhE9K0/IOT?node-id=91-1794&t=bLwJHZoGJeBXWbOs-0" className="link-item" target="_blank" rel="noreferrer noopener">
            <div className="link-icon" style={{ background: '#A259FF' }}><i className="fab fa-figma"></i></div>
            <div><span className="link-text">Figma UI</span><span className="link-desc">Thiết kế giao diện</span></div>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Profile;