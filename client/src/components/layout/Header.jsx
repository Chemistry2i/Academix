// Academix - Header Component
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Navbar,
  Nav,
  NavDropdown,
  Badge,
  Form,
  InputGroup,
} from 'react-bootstrap';
import {
  FaBars,
  FaBell,
  FaEnvelope,
  FaSearch,
  FaCog,
  FaUser,
  FaSignOutAlt,
  FaQuestionCircle,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { getRoleLabel } from '../../config/roles';
import './Header.css';

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const [notifications] = useState([
    { id: 1, title: 'New student registered', time: '5 min ago', read: false },
    { id: 2, title: 'Fee payment received', time: '1 hour ago', read: false },
    { id: 3, title: 'Exam results published', time: '2 hours ago', read: true },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="app-header">
      <Navbar expand="lg" className="h-100 px-3 px-lg-4">
        {/* Left Section */}
        <div className="d-flex align-items-center">
          <button className="btn btn-link sidebar-toggle me-3" onClick={toggleSidebar}>
            <FaBars size={18} />
          </button>

          {/* Search */}
          <div className="header-search d-none d-md-block">
            <InputGroup>
              <InputGroup.Text className="bg-light border-0">
                <FaSearch className="text-muted" size={14} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search students, staff, classes..."
                className="border-0 bg-light"
                style={{ width: '280px' }}
              />
            </InputGroup>
          </div>
        </div>

        {/* Right Section */}
        <Nav className="ms-auto d-flex align-items-center gap-2">
          {/* Messages */}
          <NavDropdown
            title={
              <div className="nav-icon-wrapper">
                <FaEnvelope size={18} />
                <Badge bg="primary" className="notification-badge">
                  3
                </Badge>
              </div>
            }
            align="end"
            className="nav-icon-dropdown"
          >
            <NavDropdown.Header>Messages</NavDropdown.Header>
            <NavDropdown.Item>
              <div className="message-item">
                <div className="message-avatar">JD</div>
                <div className="message-content">
                  <span className="message-sender">John Doe</span>
                  <p className="message-text">Hello, I wanted to ask about...</p>
                </div>
              </div>
            </NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item as={Link} to="/messages" className="text-center text-primary">
              View All Messages
            </NavDropdown.Item>
          </NavDropdown>

          {/* Notifications */}
          <NavDropdown
            title={
              <div className="nav-icon-wrapper">
                <FaBell size={18} />
                {unreadCount > 0 && (
                  <Badge bg="danger" className="notification-badge">
                    {unreadCount}
                  </Badge>
                )}
              </div>
            }
            align="end"
            className="nav-icon-dropdown"
          >
            <NavDropdown.Header>
              Notifications
              {unreadCount > 0 && (
                <Badge bg="primary" className="ms-2">
                  {unreadCount} new
                </Badge>
              )}
            </NavDropdown.Header>
            {notifications.map((notification) => (
              <NavDropdown.Item
                key={notification.id}
                className={notification.read ? '' : 'unread'}
              >
                <div className="notification-item">
                  <span className="notification-title">{notification.title}</span>
                  <small className="notification-time text-muted">
                    {notification.time}
                  </small>
                </div>
              </NavDropdown.Item>
            ))}
            <NavDropdown.Divider />
            <NavDropdown.Item as={Link} to="/notifications" className="text-center text-primary">
              View All Notifications
            </NavDropdown.Item>
          </NavDropdown>

          {/* User Menu */}
          <NavDropdown
            title={
              <div className="user-dropdown-toggle d-flex align-items-center">
                <div className="user-avatar-sm">
                  {user?.firstName?.[0] || user?.name?.[0] || 'U'}
                </div>
                <div className="user-info-header d-none d-lg-block">
                  <span className="user-name-header">
                    {user?.firstName || user?.name}
                  </span>
                  <span className="user-role-header">
                    {getRoleLabel(user?.role)}
                  </span>
                </div>
              </div>
            }
            align="end"
            className="user-dropdown"
          >
            <div className="dropdown-user-info px-3 py-2">
              <strong>{user?.firstName} {user?.lastName}</strong>
              <p className="text-muted mb-0 small">{user?.email}</p>
            </div>
            <NavDropdown.Divider />
            <NavDropdown.Item as={Link} to="/profile">
              <FaUser className="me-2" /> My Profile
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/settings">
              <FaCog className="me-2" /> Settings
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/help">
              <FaQuestionCircle className="me-2" /> Help & Support
            </NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={logout} className="text-danger">
              <FaSignOutAlt className="me-2" /> Logout
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Navbar>
    </header>
  );
};

export default Header;
