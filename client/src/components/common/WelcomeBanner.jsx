// Academix - Welcome Banner Component
import { Card } from 'react-bootstrap';
import './WelcomeBanner.css';

/**
 * WelcomeBanner - Displays a personalized welcome message with user info
 */
const WelcomeBanner = ({
  name,
  subtitle = null,
  greeting = 'Welcome',
  showAvatar = false,
  avatarUrl = null,
  className = '',
}) => {
  return (
    <Card className={`welcome-banner ${className}`}>
      <Card.Body className="py-4">
        <div className="d-flex align-items-center">
          {showAvatar && (
            <div className="welcome-avatar me-3">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="avatar-image" />
              ) : (
                <span className="avatar-placeholder">
                  {name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
          )}
          <div>
            <h2 className="welcome-title mb-1">
              {greeting}, {name || 'User'}! <span className="wave-emoji">👋</span>
            </h2>
            {subtitle && <p className="welcome-subtitle mb-0">{subtitle}</p>}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default WelcomeBanner;
