// Academix - Stat Card Component for Dashboards
import { Card } from 'react-bootstrap';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

/**
 * StatCard - Dashboard statistics card
 */
const StatCard = ({
  title,
  value,
  icon,
  variant = 'primary',
  trend = null,
  trendValue = null,
  subtitle = null,
  onClick = null,
}) => {
  const variantColors = {
    primary: { bg: '#e7f1ff', icon: '#0d6efd', text: '#0d6efd' },
    success: { bg: '#d1e7dd', icon: '#198754', text: '#198754' },
    warning: { bg: '#fff3cd', icon: '#ffc107', text: '#856404' },
    danger: { bg: '#f8d7da', icon: '#dc3545', text: '#dc3545' },
    info: { bg: '#cff4fc', icon: '#0dcaf0', text: '#055160' },
    secondary: { bg: '#e2e3e5', icon: '#6c757d', text: '#6c757d' },
  };

  const colors = variantColors[variant] || variantColors.primary;

  return (
    <Card
      className="h-100 border-0 shadow-sm"
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <p className="text-muted mb-1 small text-uppercase fw-semibold">{title}</p>
            <h3 className="mb-0 fw-bold">{value}</h3>
            {subtitle && <small className="text-muted">{subtitle}</small>}
            {trend !== null && (
              <div className="mt-2">
                <span
                  className={`small fw-semibold ${
                    trend === 'up' ? 'text-success' : 'text-danger'
                  }`}
                >
                  {trend === 'up' ? (
                    <FaArrowUp className="me-1" />
                  ) : (
                    <FaArrowDown className="me-1" />
                  )}
                  {trendValue}
                </span>
                <span className="text-muted small ms-1">vs last month</span>
              </div>
            )}
          </div>
          <div
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: '48px',
              height: '48px',
              backgroundColor: colors.bg,
              color: colors.icon,
            }}
          >
            {icon}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default StatCard;
