// Academix - Reset Password Page
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaCheckCircle, FaGraduationCap } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common';
import { APP_NAME } from '../../config/constants';
import './Auth.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { resetPassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    const result = await resetPassword(token, data.password);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.message || 'Failed to reset password. Please try again.');
    }

    setIsLoading(false);
  };

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>

        <div className="auth-container">
          <div className="auth-brand-panel">
            <div className="brand-content">
              <div className="brand-icon">
                <FaGraduationCap />
              </div>
              <h1 className="brand-title">{APP_NAME}</h1>
              <p className="brand-tagline">
                Empowering Education Through Technology
              </p>
            </div>
          </div>

          <div className="auth-form-panel">
            <div className="auth-form-wrapper">
              <div className="mobile-brand">
                <div className="auth-logo">
                  <FaGraduationCap />
                </div>
                <h2 className="auth-title">{APP_NAME}</h2>
              </div>

              <div className="error-content">
                <div className="error-icon-wrapper">
                  <FaLock />
                </div>
                <h3 className="form-title">Invalid Reset Link</h3>
                <p className="form-subtitle" style={{ marginBottom: '1.5rem' }}>
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
                <Link to="/forgot-password" className="submit-btn btn btn-primary">
                  Request New Link
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>

        <div className="auth-container">
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

          <div className="auth-form-panel">
            <div className="auth-form-wrapper">
              <div className="mobile-brand">
                <div className="auth-logo">
                  <FaGraduationCap />
                </div>
                <h2 className="auth-title">{APP_NAME}</h2>
              </div>

              <div className="success-content">
                <div className="success-icon-wrapper">
                  <FaCheckCircle />
                </div>
                <h3 className="form-title">Password Reset Successfully!</h3>
                <p className="form-subtitle" style={{ marginBottom: '1.5rem' }}>
                  Your password has been updated. You can now sign in with your new password.
                </p>
                <Link to="/login" className="submit-btn btn btn-primary">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      <div className="auth-container">
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

        <div className="auth-form-panel">
          <div className="auth-form-wrapper">
            <div className="mobile-brand">
              <div className="auth-logo">
                <FaGraduationCap />
              </div>
              <h2 className="auth-title">{APP_NAME}</h2>
            </div>

            <Link to="/login" className="back-link">
              <FaArrowLeft />
              Back to Login
            </Link>

            <div className="form-header">
              <h3 className="form-title">Reset Password</h3>
              <p className="form-subtitle">
                Enter your new password below
              </p>
            </div>

            {error && (
              <Alert variant="danger" dismissible onClose={() => setError('')} className="auth-alert">
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <FaLock />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    className={`form-input ${errors.password ? 'is-invalid' : ''}`}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters',
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: 'Password must contain uppercase, lowercase, and number',
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

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <FaLock />
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    className={`form-input ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) =>
                        value === password || 'Passwords do not match',
                    })}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="error-message">{errors.confirmPassword.message}</span>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                className="submit-btn"
                isLoading={isLoading}
              >
                Reset Password
              </Button>
            </form>

            <div className="form-footer">
              <p>
                Remember your password?{' '}
                <Link to="/login" className="contact-link">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
