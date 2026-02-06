// Academix - 404 Not Found Page
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
  return (
    <Container>
      <Row className="justify-content-center align-items-center min-vh-100 text-center">
        <Col md={6}>
          <FaExclamationTriangle size={80} className="text-warning mb-4" />
          <h1 className="display-1 fw-bold text-primary">404</h1>
          <h2 className="mb-3">Page Not Found</h2>
          <p className="text-muted mb-4">
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </p>
          <Button as={Link} to="/dashboard" variant="primary">
            <FaHome className="me-2" />
            Back to Dashboard
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;
