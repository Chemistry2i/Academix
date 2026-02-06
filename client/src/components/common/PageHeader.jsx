// Academix - Page Header Component
import { Row, Col, Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * PageHeader - Consistent page header with title, breadcrumbs, and actions
 */
const PageHeader = ({
  title,
  subtitle = null,
  breadcrumbs = [],
  actions = null,
  icon = null,
}) => {
  return (
    <div className="page-header mb-4">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumb className="mb-2">
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/dashboard' }}>
            Home
          </Breadcrumb.Item>
          {breadcrumbs.map((crumb, index) => (
            <Breadcrumb.Item
              key={index}
              active={index === breadcrumbs.length - 1}
              linkAs={crumb.path ? Link : undefined}
              linkProps={crumb.path ? { to: crumb.path } : undefined}
            >
              {crumb.label}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      )}

      {/* Title and Actions */}
      <Row className="align-items-center">
        <Col>
          <div className="d-flex align-items-center">
            {icon && (
              <div
                className="me-3 rounded d-flex align-items-center justify-content-center bg-primary bg-opacity-10"
                style={{ width: '48px', height: '48px' }}
              >
                <span className="text-primary fs-4">{icon}</span>
              </div>
            )}
            <div>
              <h1 className="h3 mb-0 fw-bold">{title}</h1>
              {subtitle && <p className="text-muted mb-0 mt-1">{subtitle}</p>}
            </div>
          </div>
        </Col>
        {actions && (
          <Col xs="auto" className="d-flex gap-2">
            {actions}
          </Col>
        )}
      </Row>
    </div>
  );
};

export default PageHeader;
