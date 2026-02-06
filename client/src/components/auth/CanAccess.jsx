// Academix - Permission based component rendering
import { useAuth } from '../../context/AuthContext';
import { hasModuleAccess, hasPermission, canAccess } from '../../config/roles';

/**
 * CanAccess - Conditionally render children based on permissions
 * 
 * @param {ReactNode} children - Content to render if authorized
 * @param {string[]} roles - Allowed roles
 * @param {string} module - Required module access
 * @param {string} permission - Required permission
 * @param {ReactNode} fallback - Content to render if not authorized
 */
const CanAccess = ({
  children,
  roles = [],
  module = null,
  permission = null,
  fallback = null,
}) => {
  const { user } = useAuth();

  if (!user) {
    return fallback;
  }

  // Check role
  if (roles.length > 0 && !roles.includes(user.role)) {
    return fallback;
  }

  // Check module access
  if (module && !hasModuleAccess(user.role, module)) {
    return fallback;
  }

  // Check permission
  if (permission && !hasPermission(user.role, permission)) {
    return fallback;
  }

  // Check both module and permission
  if (module && permission && !canAccess(user.role, module, permission)) {
    return fallback;
  }

  return children;
};

/**
 * usePermissions - Hook for checking permissions
 */
export const usePermissions = () => {
  const { user } = useAuth();

  const checkRole = (allowedRoles) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  const checkModule = (module) => {
    if (!user) return false;
    return hasModuleAccess(user.role, module);
  };

  const checkPermission = (permission) => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };

  const checkAccess = (module, permission) => {
    if (!user) return false;
    return canAccess(user.role, module, permission);
  };

  return {
    userRole: user?.role,
    checkRole,
    checkModule,
    checkPermission,
    checkAccess,
  };
};

export default CanAccess;
