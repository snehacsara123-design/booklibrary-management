import React from 'react';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="app-shell">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <div className="app-body">
        <Sidebar admin open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
        <main className="main-content"><Outlet /></main>
      </div>
    </div>
  );
}
