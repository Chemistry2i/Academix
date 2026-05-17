import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth, getHomePathForUser } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { PublicRoute } from './components/auth/PublicRoute'
import LoadingSpinner from './components/common/LoadingSpinner'

// Import pages
import LoginPage from './pages/auth/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'
import ChangePasswordPage from './pages/auth/ChangePasswordPage'
import Dashboard from './pages/Dashboard'
import StudentDashboard from './pages/students/Dashboard'
import TeacherDashboard from './pages/teachers/Dashboard'
import StudentCourses from './pages/students/Courses'
import StudentAssignments from './pages/students/Assignments'
import StudentEnrollment from './pages/students/Enrollment'
import TeacherClasses from './pages/teachers/Classes'
import TeacherSubjects from './pages/teachers/Subjects'
import TeacherNotes from './pages/teachers/Notes'
import TeacherResources from './pages/teachers/Resources'
import TeacherInvigilation from './pages/teachers/Invigilation'
import Students from './pages/students/Students'
import Teachers from './pages/teachers/Teachers'
import Courses from './pages/courses/Courses'
import Results from './pages/results/Results'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

// Import new admin pages
import Timetable from './pages/Timetable'
import Attendance from './pages/Attendance'
import Exams from './pages/Exams'
import Finance from './pages/Finance'
import Library from './pages/Library'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import Reports from './pages/Reports'
import Assignments from './pages/Assignments'
import Gradebook from './pages/Gradebook'
import Events from './pages/Events'
import Staff from './pages/Staff'
import Departments from './pages/Departments'
import Messages from './pages/Messages'
import Announcements from './pages/Announcements'
import ParentPortal from './pages/ParentPortal'
import Inventory from './pages/Inventory'
import Admissions from './pages/Admissions'
import HealthRecords from './pages/HealthRecords'
import Disciplinary from './pages/Disciplinary'
import Classes from './pages/Classes'
import Subjects from './pages/Subjects'
import Rooms from './pages/Rooms'

// Import layouts
import Layout from './components/layout/Layout'
import StudentLayout from './components/layout/StudentLayout'
import TeacherLayout from './components/layout/TeacherLayout'

function App() {
  const RootRedirect = () => {
    const { isAuthenticated, isLoading, user } = useAuth()

    if (isLoading) {
      return <LoadingSpinner />
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />
    }

    return <Navigate to={getHomePathForUser(user)} replace />
  }

  return (
    <AuthProvider>
      <Routes>
        {/* Auth routes - accessible at any time for development */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
        <Route path="/verify-email" element={<PublicRoute><VerifyEmailPage /></PublicRoute>} />
        
        {/* Student routes */}
        <Route path="/student" element={<ProtectedRoute roles={['STUDENT']}><StudentLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="enrollment" element={<StudentEnrollment />} />
          <Route path="grades" element={<Navigate to="/student/results" replace />} />
          <Route path="assignments" element={<StudentAssignments />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="results" element={<Results />} />
          <Route path="library" element={<Library />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* Teacher routes */}
        <Route path="/teacher" element={<ProtectedRoute roles={['TEACHER', 'CLASS_TEACHER', 'HEAD_TEACHER', 'DIRECTOR_OF_STUDIES', 'ADMIN']}><TeacherLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/teacher/dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="classes" element={<TeacherClasses />} />
          <Route path="subjects" element={<TeacherSubjects />} />
          <Route path="students" element={<Students />} />
          <Route path="gradebook" element={<Gradebook />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="notes" element={<TeacherNotes />} />
          <Route path="resources" element={<TeacherResources />} />
          <Route path="invigilation" element={<TeacherInvigilation />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="exams" element={<Exams />} />
          <Route path="reports" element={<Reports />} />
          <Route path="library" element={<Library />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
        </Route>
        
        {/* Admin routes */}
        <Route path="/admin" element={<ProtectedRoute roles={['ADMIN', 'HEAD_TEACHER', 'DIRECTOR_OF_STUDIES']}><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="staff" element={<Staff />} />
          <Route path="admissions" element={<Admissions />} />
          <Route path="courses" element={<Courses />} />
          <Route path="classes" element={<Classes />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="departments" element={<Departments />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="results" element={<Results />} />
          <Route path="reports" element={<Reports />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="events" element={<Events />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="exams" element={<Exams />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
        </Route>

        {/* Default route - redirect to admin dashboard */}
        <Route path="/" element={<RootRedirect />} />
        
        {/* Legacy dashboard route - redirect to admin */}
        <Route path="/dashboard" element={<RootRedirect />} />
        
        {/* 404 page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            fontFamily: 'Inter, system-ui, sans-serif'
          },
          success: {
            style: {
              background: '#10B981',
            },
          },
          error: {
            style: {
              background: '#F87171',
            },
          },
        }}
      />
    </AuthProvider>
  )
}

export default App