// Academix - Unauthorized Page
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FaHome, FaLock } from 'react-icons/fa';

const Unauthorized = () => {
  return (
    <Container>
      <Row className="justify-content-center align-items-center min-vh-100 text-center">
        <Col md={6}>
          <FaLock size={80} className="text-danger mb-4" />
          <h1 className="display-1 fw-bold text-danger">403</h1>
          <h2 className="mb-3">Access Denied</h2>
          <p className="text-muted mb-4">
            You don't have permission to access this page. Please contact your
            administrator if you believe this is a mistake.
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

export default Unauthorized;
