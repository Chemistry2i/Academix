// Academix - Sidebar Component
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Collapse, Badge } from 'react-bootstrap';
import {
  FaChevronDown,
  FaChevronRight,
  FaSignOutAlt,
  FaBars,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { getNavigationForRole } from '../../config/navigation';
import { hasModuleAccess, getRoleLabel } from '../../config/roles';
import { APP_NAME } from '../../config/constants';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState({});

  const checkModuleAccess = (module) => hasModuleAccess(user?.role, module);
  const navItems = getNavigationForRole(user?.role, checkModuleAccess);

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const renderNavItem = (item, index) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus[item.label];

    if (hasChildren) {
      return (
        <li key={index} className="nav-item">
          <div
            className={`nav-link d-flex align-items-center justify-content-between ${
              isOpen ? 'active' : ''
            }`}
            onClick={() => toggleMenu(item.label)}
            style={{ cursor: 'pointer' }}
          >
            <span className="d-flex align-items-center">
              <span className="nav-icon">{item.icon}</span>
              {!isCollapsed && <span className="nav-text">{item.label}</span>}
            </span>
            {!isCollapsed && (
              <span className="nav-arrow">
                {isOpen ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
              </span>
            )}
          </div>
          <Collapse in={isOpen && !isCollapsed}>
            <ul className="nav-submenu list-unstyled">
              {item.children.map((child, childIndex) => (
                <li key={childIndex}>
                  <NavLink
                    to={child.path}
                    className={({ isActive }) =>
                      `nav-link submenu-link ${isActive ? 'active' : ''}`
                    }
                  >
                    <span className="nav-icon">{child.icon}</span>
                    <span className="nav-text">{child.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </Collapse>
        </li>
      );
    }

    return (
      <li key={index} className="nav-item">
        <NavLink
          to={item.path}
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          {!isCollapsed && <span className="nav-text">{item.label}</span>}
        </NavLink>
      </li>
    );
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Logo Section */}
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">
            <img src="/academix-logo.svg" alt="Academix" onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.textContent = 'A'; }} />
          </div>
          {!isCollapsed && (
            <div className="logo-text-container">
              <span className="logo-text">{APP_NAME}</span>
              <span className="logo-subtitle">{getRoleLabel(user?.role)} Dashboard</span>
            </div>
          )}
        </div>
        <button className="toggle-btn d-lg-none" onClick={toggleSidebar}>
          <FaBars />
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <ul className="nav-list list-unstyled">
          {navItems.map((item, index) => renderNavItem(item, index))}
        </ul>
      </nav>

      {/* User Section with Profile */}
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="profile-avatar">
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user?.firstName} className="profile-image" />
            ) : (
              <span className="avatar-initial">
                {user?.firstName?.[0] || user?.name?.[0] || 'U'}
              </span>
            )}
          </div>
          {!isCollapsed && (
            <div className="profile-info">
              <span className="profile-name">
                {user?.firstName} {user?.lastName}
              </span>
              <Badge className="role-badge" bg="none">
                {getRoleLabel(user?.role) || user?.role?.replace('_', ' ')}
              </Badge>
            </div>
          )}
        </div>
        <button
          className="logout-btn"
          onClick={handleLogout}
          title="Logout"
        >
          <FaSignOutAlt />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
