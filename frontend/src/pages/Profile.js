import React from 'react';

function Profile() {
  return (
    <div className="profile-grid">
      {/* THẺ THÔNG TIN NGƯỜI DÙNG */}
      <div className="card">
        {/* Đổi đường dẫn ảnh thành profile.png */}
        <img src={`${process.env.PUBLIC_URL}/profile.jpg`} alt="Avatar" className="avatar" />
        <h2 className="profile-name">Chu Trần Anh Ngọc</h2>
        <p className="profile-desc">Công nghệ Đa phương tiện <br />B22DCPT189</p>
        
        {/* Thêm phần thông tin liên hệ (SĐT & Email) */}
        <div style={{ marginTop: '20px', textAlign: "center ", display: 'inline-block' }}>
          <p style={{ margin: '8px 0', fontSize: '15px', color: '#444' }}>
            <i className="fas fa-phone-alt" style={{ width: '25px', color: '#2D2185' }}></i> 
            0399917084
          </p>
          <p style={{ margin: '8px 0', fontSize: '15px', color: '#444' }}>
            <i className="fas fa-envelope" style={{ width: '25px', color: '#2D2185' }}></i> 
            NgocCTA.B22PT189@stu.ptit.edu.vn
          </p>
        </div>
      </div>

      {/* THẺ LIÊN KẾT */}
      <div className="card" style={{ textAlign: 'left' }}>
        <h3 style={{ color: '#2D2185', marginBottom: '20px', fontSize: '18px' }}>Liên Kết</h3>
        <div className="links-grid">
          <a href="https://docs.google.com/document/d/1ao5kQoXQeABa9M9knYnkb7PZ6Q1Sz5ANLSvfumKy7Ak/edit?usp=sharing" className="link-item" target="_blank" rel="noreferrer noopener">
            <div className="link-icon" style={{ background: '#FF5A5A' }}><i className="fas fa-file-pdf"></i></div>
            <div><span className="link-text">Báo Cáo</span><span className="link-desc">Google Docs</span></div>
          </a>
          <a href="https://github.com/xetan254/iot_ChuTranAnhNgoc" className="link-item" target="_blank" rel="noreferrer noopener">
            <div className="link-icon" style={{ background: '#333' }}><i className="fab fa-github"></i></div>
            <div><span className="link-text">GitHub</span><span className="link-desc">Source Code</span></div>
          </a>
          <a href="https://xetan254.github.io/iot-api-docs/" className="link-item" target="_blank" rel="noreferrer noopener">
            <div className="link-icon" style={{ background: '#20C976' }}><i className="fas fa-code"></i></div>
            <div><span className="link-text">API Swagger</span><span className="link-desc">API docs</span></div>
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