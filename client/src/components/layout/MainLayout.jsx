// Academix - Main Layout Component
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './MainLayout.css';

const MainLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  const toggleSidebar = () => {
    // On mobile, toggle visibility
    if (window.innerWidth < 992) {
      setSidebarMobileOpen(!sidebarMobileOpen);
    } else {
      // On desktop, toggle collapse
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Mobile Overlay */}
      {sidebarMobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        className={sidebarMobileOpen ? 'show' : ''}
      />

      {/* Main Content */}
      <div className="main-wrapper">
        <Header toggleSidebar={toggleSidebar} />

        <main className="main-content">
          <div className="content-wrapper">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <div className="d-flex justify-content-between align-items-center">
            <span>&copy; 2026 Academix. All rights reserved.</span>
            <span className="text-muted">
              School Management System for Ugandan Secondary Schools
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
