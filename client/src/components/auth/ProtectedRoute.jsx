// Academix - Protected Route Component with RBAC
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hasModuleAccess, hasPermission } from '../../config/roles';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * ProtectedRoute - Wrapper for routes that require authentication and/or specific permissions
 * 
 * @param {ReactNode} children - Child components to render
 * @param {string[]} allowedRoles - Array of roles that can access this route
 * @param {string} requiredModule - Module that user must have access to
 * @param {string} requiredPermission - Permission that user must have
 * @param {string} redirectPath - Path to redirect if unauthorized
 */
const ProtectedRoute = ({
  children,
  allowedRoles = [],
  requiredModule = null,
  requiredPermission = null,
  redirectPath = '/login',
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Check role access
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check module access
  if (requiredModule && !hasModuleAccess(user.role, requiredModule)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check permission
  if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

/**
 * PublicRoute - Wrapper for routes that should redirect authenticated users
 */
export const PublicRoute = ({ children, redirectPath = '/dashboard' }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
