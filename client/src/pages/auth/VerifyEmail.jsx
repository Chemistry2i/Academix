// Academix - Verify Email Page
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaGraduationCap, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { APP_NAME } from '../../config/constants';
import './Auth.css';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { verifyEmail } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setError('Invalid verification link');
        setIsLoading(false);
        return;
      }

      const result = await verifyEmail(token);

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.message || 'Verification failed. The link may have expired.');
      }

      setIsLoading(false);
    };

    verify();
  }, [token, verifyEmail]);

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

            {isLoading ? (
              <div className="loading-content">
                <div className="loading-icon-wrapper">
                  <FaSpinner className="spin" />
                </div>
                <h3 className="form-title">Verifying Email...</h3>
                <p className="form-subtitle">
                  Please wait while we verify your email address.
                </p>
              </div>
            ) : success ? (
              <div className="success-content">
                <div className="success-icon-wrapper">
                  <FaCheckCircle />
                </div>
                <h3 className="form-title">Email Verified!</h3>
                <p className="form-subtitle" style={{ marginBottom: '1.5rem' }}>
                  Your email has been successfully verified. You can now access all features of your account.
                </p>
                <Link to="/login" className="submit-btn btn btn-primary">
                  Sign In
                </Link>
              </div>
            ) : (
              <div className="error-content">
                <div className="error-icon-wrapper">
                  <FaTimesCircle />
                </div>
                <h3 className="form-title">Verification Failed</h3>
                <p className="form-subtitle" style={{ marginBottom: '1.5rem' }}>
                  {error}
                </p>
                <Link to="/login" className="submit-btn btn btn-primary">
                  Back to Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
