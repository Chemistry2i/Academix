// Academix - Login Page
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common';
import { APP_NAME } from '../../config/constants';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const from = location.state?.from?.pathname || '/dashboard';

  const onSubmit = async (data) => {
    setIsLoading(true);
    clearError();

    const result = await login(data);

    if (result.success) {
      navigate(from, { replace: true });
    }

    setIsLoading(false);
  };

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
              <p className="auth-subtitle">
                School Management System for Ugandan Secondary Schools
              </p>
            </div>

            <Card className="auth-card">
              <Card.Body className="p-4">
                <h4 className="text-center mb-4">Welcome Back!</h4>

                {error && (
                  <Alert variant="danger" dismissible onClose={clearError}>
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit(onSubmit)}>
                  <Form.Group className="mb-3">
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

                  <Form.Group className="mb-3">
                    <div className="d-flex justify-content-between">
                      <Form.Label>Password</Form.Label>
                      <Link to="/forgot-password" className="small text-primary">
                        Forgot Password?
                      </Link>
                    </div>
                    <div className="input-icon-wrapper">
                      <FaLock className="input-icon" />
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        className="input-with-icon"
                        isInvalid={!!errors.password}
                        {...register('password', {
                          required: 'Password is required',
                          minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters',
                          },
                        })}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {errors.password && (
                      <Form.Text className="text-danger">
                        {errors.password.message}
                      </Form.Text>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Check
                      type="checkbox"
                      label="Remember me"
                      {...register('rememberMe')}
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100"
                    isLoading={isLoading}
                  >
                    Sign In
                  </Button>
                </Form>
              </Card.Body>
            </Card>

            <p className="text-center mt-4 text-muted">
              Don't have an account?{' '}
              <Link to="/contact" className="text-primary">
                Contact your school admin
              </Link>
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
