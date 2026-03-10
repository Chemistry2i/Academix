import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { PublicRoute } from './components/auth/PublicRoute'

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
import TeacherClasses from './pages/teachers/Classes'
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

// Import layouts
import Layout from './components/layout/Layout'
import StudentLayout from './components/layout/StudentLayout'
import TeacherLayout from './components/layout/TeacherLayout'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Auth routes - accessible at any time for development */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        
        {/* Student routes - Open Access for Development */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="grades" element={<Results />} />
          <Route path="assignments" element={<StudentAssignments />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="results" element={<Results />} />
          <Route path="library" element={<Library />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
        </Route>

        {/* Teacher routes - Open Access */}
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<Navigate to="/teacher/dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="classes" element={<TeacherClasses />} />
          <Route path="students" element={<Students />} />
          <Route path="gradebook" element={<Gradebook />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="exams" element={<Exams />} />
          <Route path="reports" element={<Reports />} />
          <Route path="library" element={<Library />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
        </Route>
        
        {/* Admin routes - Open Access */}
        <Route path="/admin" element={<Layout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="staff" element={<Staff />} />
          <Route path="admissions" element={<Admissions />} />
          <Route path="courses" element={<Courses />} />
          <Route path="classes" element={<Classes />} />
          <Route path="subjects" element={<Subjects />} />
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
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        
        {/* Legacy dashboard route - redirect to admin */}
        <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        
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