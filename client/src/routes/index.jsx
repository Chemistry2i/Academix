// Academix - Application Routes Configuration
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout';
import ProtectedRoute, { PublicRoute } from '../components/auth/ProtectedRoute';
import { ROLES, MODULES } from '../config/roles';

// Auth Pages
import { Login, ForgotPassword } from '../pages/auth';

// Dashboard
import { Dashboard } from '../pages/dashboard';

// Error Pages
import { NotFound, Unauthorized } from '../pages/errors';

// Module Pages (Lazy loaded for better performance)
import { lazy, Suspense } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Lazy load module pages
const Students = lazy(() => import('../pages/students/Students'));
const StudentDetails = lazy(() => import('../pages/students/StudentDetails'));
const Staff = lazy(() => import('../pages/staff/Staff'));
const Classes = lazy(() => import('../pages/academics/Classes'));
const Subjects = lazy(() => import('../pages/academics/Subjects'));
const Attendance = lazy(() => import('../pages/academics/Attendance'));
const Exams = lazy(() => import('../pages/academics/Exams'));
const Results = lazy(() => import('../pages/academics/Results'));
const Timetable = lazy(() => import('../pages/academics/Timetable'));
const Fees = lazy(() => import('../pages/finance/Fees'));
const Payments = lazy(() => import('../pages/finance/Payments'));
const Library = lazy(() => import('../pages/support/Library'));
const Medical = lazy(() => import('../pages/support/Medical'));
const Inventory = lazy(() => import('../pages/support/Inventory'));
const Notices = lazy(() => import('../pages/communication/Notices'));
const Messages = lazy(() => import('../pages/communication/Messages'));
const Users = lazy(() => import('../pages/users/Users'));
const Settings = lazy(() => import('../pages/settings/Settings'));

// Suspense wrapper for lazy loaded components
const LazyLoad = ({ children }) => (
  <Suspense
    fallback={
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <LoadingSpinner size="lg" text="Loading module..." />
      </div>
    }
  >
    {children}
  </Suspense>
);

// Route definitions
const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <PublicRoute>
        <ForgotPassword />
      </PublicRoute>
    ),
  },

  // Protected routes with MainLayout
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      // Redirect root to dashboard
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },

      // Dashboard
      {
        path: 'dashboard',
        element: <Dashboard />,
      },

      // Student Management
      {
        path: 'students',
        element: (
          <ProtectedRoute requiredModule={MODULES.STUDENT_MANAGEMENT}>
            <LazyLoad><Students /></LazyLoad>
          </ProtectedRoute>
        ),
      },
      {
        path: 'students/:id',
        element: (
          <ProtectedRoute requiredModule={MODULES.STUDENT_MANAGEMENT}>
            <LazyLoad><StudentDetails /></LazyLoad>
          </ProtectedRoute>
        ),
      },

      // Staff Management
      {
        path: 'staff',
        element: (
          <ProtectedRoute requiredModule={MODULES.STAFF_MANAGEMENT}>
            <LazyLoad><Staff /></LazyLoad>
          </ProtectedRoute>
        ),
      },

      // Academic - Classes
      {
        path: 'academics/classes',
        element: (
          <ProtectedRoute requiredModule={MODULES.CLASS_MANAGEMENT}>
            <LazyLoad><Classes /></LazyLoad>
          </ProtectedRoute>
        ),
      },

      // Academic - Subjects
      {
        path: 'academics/subjects',
        element: (
          <ProtectedRoute requiredModule={MODULES.SUBJECT_MANAGEMENT}>
            <LazyLoad><Subjects /></LazyLoad>
          </ProtectedRoute>
        ),
      },

      // Attendance
      {
        path: 'attendance',
        element: (
          <ProtectedRoute requiredModule={MODULES.ATTENDANCE}>
            <LazyLoad><Attendance /></LazyLoad>
          </ProtectedRoute>
        ),
      },

      // Exams
      {
        path: 'exams',
        element: (
          <ProtectedRoute requiredModule={MODULES.EXAMS}>
            <LazyLoad><Exams /></LazyLoad>
          </ProtectedRoute>
        ),
      },

      // Results
      {
        path: 'results',
        element: (
          <ProtectedRoute requiredModule={MODULES.RESULTS}>
            <LazyLoad><Results /></LazyLoad>
          </ProtectedRoute>
        ),
      },

      // Timetable
      {
        path: 'academics/timetable',
        element: (
          <ProtectedRoute requiredModule={MODULES.TIMETABLE}>
            <LazyLoad><Timetable /></LazyLoad>
          </ProtectedRoute>
        ),
      },

      // Finance - Fees
      {
        path: 'finance/fees',
        element: (
          <ProtectedRoute requiredModule={MODULES.FEES}>
            <LazyLoad><Fees /></LazyLoad>
          </ProtectedRoute>
        ),
      },

      // Finance - Payments
      {
        path: 'finance/payments',
        element: (
          <ProtectedRoute requiredModule={MODULES.PAYMENTS}>
            <LazyLoad><Payments /></LazyLoad>
          </ProtectedRoute>
        ),
      },

      // Library
      {
        path: 'library',
        element: (
          <ProtectedRoute requiredModule={MODULES.LIBRARY}>
            <LazyLoad><Library /></LazyLoad>
          </ProtectedRoute>
        ),
      },

      // Medical
      {
        path: 'medical',
        element: (
          <ProtectedRoute requiredModule={MODULES.MEDICAL}>
            <LazyLoad><Medical /></LazyLoad>
          </ProtectedRoute>
        ),
      },

      // Inventory
      {
        path: 'inventory',
        element: (
          <ProtectedRoute requiredModule={MODULES.INVENTORY}>
            <LazyLoad><Inventory /></LazyLoad>
          </ProtectedRoute>
        ),
      },

      // Notices
      {
        path: 'notices',
        element: (
          <ProtectedRoute requiredModule={MODULES.NOTICES}>
            <LazyLoad><Notices /></LazyLoad>
          </ProtectedRoute>
        ),
      },

      // Messages
      {
        path: 'messages',
        element: (
          <ProtectedRoute requiredModule={MODULES.MESSAGING}>
            <LazyLoad><Messages /></LazyLoad>
          </ProtectedRoute>
        ),
      },

      // User Management
      {
        path: 'users',
        element: (
          <ProtectedRoute requiredModule={MODULES.USER_MANAGEMENT}>
            <LazyLoad><Users /></LazyLoad>
          </ProtectedRoute>
        ),
      },

      // Settings
      {
        path: 'settings/*',
        element: (
          <ProtectedRoute>
            <LazyLoad><Settings /></LazyLoad>
          </ProtectedRoute>
        ),
      },

      // Profile (accessible to all authenticated users)
      {
        path: 'profile',
        element: <LazyLoad><Settings /></LazyLoad>,
      },
    ],
  },

  // Error pages
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;
