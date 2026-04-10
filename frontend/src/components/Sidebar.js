import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar() {
  return (
    <aside className="sidebar">
      <NavLink to="/" className="logo">
        <i className="fas fa-home"></i> SmartHome
      </NavLink>
      <ul className="nav-menu">
        <li>
          {/* NavLink tự động thêm class "active" khi URL khớp */}
          <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>
            <i className="fas fa-th-large"></i> Bảng Điều Khiển
          </NavLink>
        </li>
        <li>
          <NavLink to="/data" className={({ isActive }) => isActive ? "active" : ""}>
            <i className="fas fa-database"></i> Dữ Liệu
          </NavLink>
        </li>
        <li>
          <NavLink to="/history" className={({ isActive }) => isActive ? "active" : ""}>
            <i className="fas fa-history"></i> Lịch Sử
          </NavLink>
        </li>
        <li>
          <NavLink to="/profile" className={({ isActive }) => isActive ? "active" : ""}>
            <i className="fas fa-user"></i> Hồ Sơ
          </NavLink>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;