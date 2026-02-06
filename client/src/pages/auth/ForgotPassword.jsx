// Academix - Forgot Password Page
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { FaEnvelope, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common';
import { APP_NAME } from '../../config/constants';
import './Auth.css';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    const result = await forgotPassword(data.email);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="auth-page">
        <Container>
          <Row className="justify-content-center align-items-center min-vh-100">
            <Col xs={12} sm={10} md={8} lg={5} xl={4}>
              <Card className="auth-card text-center">
                <Card.Body className="p-5">
                  <div className="success-icon mb-4">
                    <FaCheckCircle size={60} className="text-success" />
                  </div>
                  <h4 className="mb-3">Check Your Email</h4>
                  <p className="text-muted mb-4">
                    We've sent a password reset link to your email address.
                    Please check your inbox and follow the instructions.
                  </p>
                  <Link to="/login" className="btn btn-primary">
                    Back to Login
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col xs={12} sm={10} md={8} lg={5} xl={4}>
            <div className="text-center mb-4">
              <div className="auth-logo">
                <span>A</span>
              </div>
              <h1 className="auth-title">{APP_NAME}</h1>
            </div>

            <Card className="auth-card">
              <Card.Body className="p-4">
                <Link to="/login" className="d-flex align-items-center mb-4 text-muted">
                  <FaArrowLeft className="me-2" />
                  Back to Login
                </Link>

                <h4 className="mb-2">Forgot Password?</h4>
                <p className="text-muted mb-4">
                  Enter your email address and we'll send you a link to reset
                  your password.
                </p>

                {error && (
                  <Alert variant="danger" dismissible onClose={() => setError('')}>
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit(onSubmit)}>
                  <Form.Group className="mb-4">
                    <Form.Label>Email Address</Form.Label>
                    <div className="input-icon-wrapper">
                      <FaEnvelope className="input-icon" />
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        className="input-with-icon"
                        isInvalid={!!errors.email}
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
                          },
                        })}
                      />
                    </div>
                    {errors.email && (
                      <Form.Text className="text-danger">
                        {errors.email.message}
                      </Form.Text>
                    )}
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100"
                    isLoading={isLoading}
                  >
                    Send Reset Link
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ForgotPassword;
