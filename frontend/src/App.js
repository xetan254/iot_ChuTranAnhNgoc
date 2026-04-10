import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Data from './pages/Data';
import History from './pages/History';
import Profile from './pages/Profile';

import '@fortawesome/fontawesome-free/css/all.min.css'; 

function App() {
  return (
    <Router>
      {/* Đã bổ sung width: '100%' vào style */}
      <div style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>
        <Sidebar />
        <main className="main-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/data" element={<Data />} />
            <Route path="/history" element={<History />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;