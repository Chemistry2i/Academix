// Academix - Login Page
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Form, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGraduationCap } from 'react-icons/fa';
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

  const from = location.state?.from?.pathname;

  const onSubmit = async (data) => {
    setIsLoading(true);
    clearError();

    const result = await login(data);

    if (result.success) {
      // Use dashboard URL based on user type, or fallback to 'from' location
      const redirectPath = result.dashboardUrl || from || '/dashboard';
      
      // Log successful login with user type for debugging
      console.log(`Login successful: ${result.userType} user redirecting to ${redirectPath}`);
      
      navigate(redirectPath, { replace: true });
    } else {
      // Handle specific error types
      if (result.message?.includes('verify your email')) {
        // Email verification required - provide helpful message
        console.warn('Login blocked: Email verification required');
        // The error message will be displayed by the auth context
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="auth-page">
      {/* Animated Background Elements */}
      <div className="auth-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      <div className="auth-container">
        {/* Left Panel - Branding (Hidden on mobile) */}
        <div className="auth-brand-panel">
          <div className="brand-content">
            <div className="brand-icon">
              <FaGraduationCap />
            </div>
            <h1 className="brand-title">{APP_NAME}</h1>
            <p className="brand-tagline">
              Empowering Education Through Technology
            </p>
            <div className="brand-features">
              <div className="feature-item">
                <div className="feature-dot"></div>
                <span>Streamlined Student Management</span>
              </div>
              <div className="feature-item">
                <div className="feature-dot"></div>
                <span>Real-time Academic Tracking</span>
              </div>
              <div className="feature-item">
                <div className="feature-dot"></div>
                <span>Secure & Reliable Platform</span>
              </div>
            </div>
          </div>
          <div className="brand-footer">
            <p>Trusted by schools across Uganda</p>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="auth-form-panel">
          <div className="auth-form-wrapper">
            {/* Mobile Logo */}
            <div className="mobile-brand">
              <div className="auth-logo">
                <FaGraduationCap />
              </div>
              <h2 className="auth-title">{APP_NAME}</h2>
            </div>

            <div className="form-header">
              <h3 className="form-title">Welcome Back!</h3>
              <p className="form-subtitle">Sign in to continue to your dashboard</p>
            </div>

            {error && (
              <Alert variant="danger" dismissible onClose={clearError} className="auth-alert">
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit(onSubmit)} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <FaEnvelope />
                  </span>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className={`form-input ${errors.email ? 'is-invalid' : ''}`}
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
                  <span className="error-message">{errors.email.message}</span>
                )}
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label className="form-label">Password</label>
                  <Link to="/forgot-password" className="forgot-link">
                    Forgot Password?
                  </Link>
                </div>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <FaLock />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className={`form-input ${errors.password ? 'is-invalid' : ''}`}
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
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-message">{errors.password.message}</span>
                )}
              </div>

              <div className="form-group remember-group">
                <label className="checkbox-wrapper">
                  <input type="checkbox" {...register('rememberMe')} />
                  <span className="checkmark"></span>
                  <span className="checkbox-label">Remember me</span>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="submit-btn"
                isLoading={isLoading}
              >
                Sign In
              </Button>
            </Form>

            <div className="form-footer">
              <p>
                Need help accessing your account?{' '}
                <Link to="/contact" className="contact-link">
                  Contact your school admin
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
