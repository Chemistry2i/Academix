import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UserCircleIcon, PencilIcon, CameraIcon, CheckCircleIcon, AcademicCapIcon } from '@heroicons/react/24/outline'
import { useLocation } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import { useAuth } from '../contexts/AuthContext'
import { teacherPortalService } from '../services/teacherPortalService'
import { studentService } from '../services/studentService'
import { classService } from '../services/classService'
import subjectService from '../services/subjectService'

const Profile = () => {
  const { user } = useAuth()
  const location = useLocation()
  const isTeacherPortal = location.pathname.startsWith('/teacher')
  const isStudentPortal = location.pathname.startsWith('/student')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [teacherContext, setTeacherContext] = useState(null)
  const [studentContext, setStudentContext] = useState(null)

  const storageKey = `academix.profile.${user?.email || 'anonymous'}`

  const loadSaved = () => {
    try {
      const raw = localStorage.getItem(storageKey)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  }

  const saved = loadSaved()

  const [profile, setProfile] = useState({
    firstName: saved?.firstName || user?.firstName || (isTeacherPortal ? 'Teacher' : isStudentPortal ? 'Student' : 'Admin'),
    lastName: saved?.lastName || user?.lastName || (isTeacherPortal || isStudentPortal ? '' : 'User'),
    email: saved?.email || user?.email || (isTeacherPortal || isStudentPortal ? '' : 'admin@academix.com'),
    phone: saved?.phone || '+256 700 123 456',
    role: saved?.role || user?.role || (isTeacherPortal ? 'TEACHER' : isStudentPortal ? 'STUDENT' : 'ADMIN'),
    department: saved?.department || (isTeacherPortal ? '' : isStudentPortal ? '' : 'Administration'),
    joinDate: saved?.joinDate || '2024-01-15',
    bio: saved?.bio || (isTeacherPortal
      ? 'Dedicated educator committed to student growth and academic excellence.'
      : isStudentPortal
        ? 'Learner focused on consistent growth, discipline, and academic excellence.'
        : 'Experienced administrator dedicated to educational excellence and student success.')
  })

  useEffect(() => {
    if (!isTeacherPortal) return
    const loadTeacherContext = async () => {
      try {
        const [classPayload, subjectPayload] = await Promise.all([
          classService.getClasses().catch(() => []),
          subjectService.getAllSubjects().catch(() => [])
        ])
        const classList = teacherPortalService.normalizeArray(classPayload, ['classes', 'data'])
        const subjectList = teacherPortalService.normalizeArray(subjectPayload, ['subjects', 'data'])
        const scope = await teacherPortalService.getTeacherContext(user, { classes: classList, subjects: subjectList })
        setTeacherContext(scope)
        if (scope?.teacher && !loadSaved()) {
          setProfile(prev => ({
            ...prev,
            firstName: scope.teacher.firstName || prev.firstName,
            lastName: scope.teacher.lastName || prev.lastName,
            department: scope.teacher.department || scope.teacher.departmentName || prev.department
          }))
        }
      } catch { /* ignore */ }
    }
    loadTeacherContext()
  }, [isTeacherPortal, user])

  useEffect(() => {
    if (!isStudentPortal) return

    const loadStudentContext = async () => {
      try {
        const payload = await studentService.getStudents(true).catch(() => ({ students: [] }))
        const students = payload.students || payload.data || payload || []
        const student = students.find((item) => {
          return String(item.email || '').toLowerCase() === String(user?.email || '').toLowerCase()
        }) || null

        setStudentContext(student)

        if (student && !loadSaved()) {
          setProfile((prev) => ({
            ...prev,
            firstName: student.firstName || prev.firstName,
            lastName: student.lastName || prev.lastName,
            phone: student.phoneNumber || prev.phone,
            department: student.currentClass || student.schoolClass?.name || prev.department,
            role: 'STUDENT'
          }))
        }
      } catch {
        setStudentContext(null)
      }
    }

    loadStudentContext()
  }, [isStudentPortal, user])

  const handleSave = () => {
    setIsSaving(true)
    try { localStorage.setItem(storageKey, JSON.stringify(profile)) } catch { /* ignore */ }
    setTimeout(() => {
      setIsSaving(false)
      setIsEditing(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }, 300)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account information</p>
        </div>
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? 'outline' : 'primary'}
        >
          <PencilIcon className="w-4 h-4 mr-2" />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture & Basic Info */}
        <Card className="lg:col-span-1">
          <div className="p-6 text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCircleIcon className="w-20 h-20 text-primary-600" />
              </div>
              {isEditing && (
                <button className="absolute bottom-4 right-4 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors">
                  <CameraIcon className="w-4 h-4" />
                </button>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{profile.firstName} {profile.lastName}</h2>
            <p className="text-gray-600">{profile.role}</p>
            <p className="text-sm text-gray-500 mt-1">{isStudentPortal ? `Class: ${profile.department || 'Unassigned'}` : profile.department}</p>
          </div>
        </Card>

        {/* Profile Details */}
        <Card className="lg:col-span-2">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                    className="input-field"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded-lg">{profile.firstName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                    className="input-field"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded-lg">{profile.lastName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="input-field"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded-lg">{profile.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className="input-field"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded-lg">{profile.phone}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <p className="p-2 bg-gray-50 rounded-lg">{profile.role}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Join Date
                </label>
                <p className="p-2 bg-gray-50 rounded-lg">{profile.joinDate}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  className="input-field"
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded-lg">{profile.bio}</p>
              )}
            </div>
            
            {saveSuccess && (
              <div className="flex items-center gap-2 bg-green-50 text-green-800 text-sm border border-green-200 rounded-lg px-4 py-2 mt-4">
                <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                Profile saved successfully.
              </div>
            )}
            {isEditing && (
              <div className="flex space-x-3 mt-6">
                <Button className="bg-primary-600 hover:bg-primary-700" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving…' : 'Save Changes'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {isStudentPortal && (
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AcademicCapIcon className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Academic Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Student ID</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{studentContext?.studentId || 'Not assigned'}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Current Class</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{studentContext?.currentClass || studentContext?.schoolClass?.name || 'Not assigned'}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Stream</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{studentContext?.stream || 'Not set'}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Residence</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{studentContext?.residenceStatus === 'BOARDING' ? 'Boarding' : studentContext?.residenceStatus ? 'Day Scholar' : 'Not set'}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {isTeacherPortal && teacherContext && (
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AcademicCapIcon className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Teaching Assignment</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Classes</label>
                <div className="flex flex-wrap gap-2">
                  {teacherContext.assignedClassNames.length ? (
                    teacherContext.assignedClassNames.map(name => (
                      <span key={name} className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-medium text-blue-700">
                        {name}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">No classes assigned yet</span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teaching Subjects</label>
                <div className="flex flex-wrap gap-2">
                  {teacherContext.subjectNames.length ? (
                    teacherContext.subjectNames.map(name => (
                      <span key={name} className="rounded-full bg-purple-50 border border-purple-200 px-3 py-1 text-xs font-medium text-purple-700">
                        {name}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">No subjects linked yet</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </motion.div>
  )
}

export default Profile