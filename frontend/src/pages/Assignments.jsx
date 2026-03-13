import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PencilSquareIcon,
  PlusIcon,
  DocumentTextIcon,
  ClockIcon,
  EyeIcon,
  TrashIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import DataTable from '../components/common/DataTable'
import StatCard from '../components/common/StatCard'
import { assignmentService } from '../services/assignmentService'
import { classService } from '../services/classService'
import { studentService } from '../services/studentService'
import subjectService from '../services/subjectService'
import { useAuth } from '../contexts/AuthContext'
import { teacherPortalService } from '../services/teacherPortalService'
import toast from 'react-hot-toast'
import { useLocation } from 'react-router-dom'

const INITIAL_FORM = {
  id: '',
  title: '',
  subjectId: '',
  subjectName: '',
  classId: '',
  className: '',
  type: 'HOMEWORK',
  description: '',
  instructions: '',
  dueDate: '',
  dueTime: '23:59',
  totalPoints: 100,
  allowLateSubmissions: false,
  status: 'DRAFT'
}

const ASSIGNMENT_TYPES = ['HOMEWORK', 'PROJECT', 'QUIZ', 'ESSAY', 'LAB']

const normalizeArray = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []

  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key]
  }

  const firstArray = Object.values(payload).find((value) => Array.isArray(value))
  return firstArray || []
}

const formatDateTime = (date, time) => {
  if (!date) return 'Not set'
  const value = new Date(`${date}T${time || '23:59'}`)
  if (Number.isNaN(value.getTime())) return date
  return value.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStateBadge = (state) => {
  const styles = {
    active: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    draft: 'bg-yellow-100 text-yellow-800',
    closed: 'bg-gray-100 text-gray-700'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[state] || styles.closed}`}>
      {state?.charAt(0).toUpperCase() + state?.slice(1)}
    </span>
  )
}

const Assignments = () => {
  const { user } = useAuth()
  const location = useLocation()
  const isTeacherPortal = location.pathname.startsWith('/teacher')
  const [filter, setFilter] = useState('all')
  const [assignments, setAssignments] = useState([])
  const [stats, setStats] = useState({
    totalAssignments: 0,
    activeAssignments: 0,
    draftAssignments: 0,
    overdueAssignments: 0,
    publishedAssignments: 0,
    averagePoints: 0
  })
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [reviewAssignment, setReviewAssignment] = useState(null)
  const [reviewRows, setReviewRows] = useState([])
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [teacherScope, setTeacherScope] = useState(null)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [reviewSavingKey, setReviewSavingKey] = useState('')

  const visibleClasses = useMemo(() => {
    return isTeacherPortal ? teacherScope?.assignedClasses || [] : classes
  }, [classes, isTeacherPortal, teacherScope])

  const visibleSubjects = useMemo(() => {
    return isTeacherPortal ? teacherPortalService.filterSubjectsByScope(subjects, teacherScope || {}) : subjects
  }, [isTeacherPortal, subjects, teacherScope])

  const buildAssignmentStats = (items) => {
    const totalAssignments = items.length
    const activeAssignments = items.filter((assignment) => assignment.state === 'active').length
    const draftAssignments = items.filter((assignment) => assignment.state === 'draft').length
    const overdueAssignments = items.filter((assignment) => assignment.state === 'overdue').length
    const publishedAssignments = items.filter((assignment) => assignment.status === 'PUBLISHED').length
    const totalPoints = items.reduce((sum, assignment) => sum + Number(assignment.totalPoints || 0), 0)

    return {
      totalAssignments,
      activeAssignments,
      draftAssignments,
      overdueAssignments,
      publishedAssignments,
      averagePoints: totalAssignments ? Math.round(totalPoints / totalAssignments) : 0
    }
  }

  const loadAssignments = async (scope = teacherScope) => {
    try {
      const assignmentData = await assignmentService.getAssignments()
      const scopedAssignments = isTeacherPortal
        ? teacherPortalService.filterAssignmentsByScope(assignmentData, scope || {})
        : assignmentData

      setAssignments(scopedAssignments)
      setStats(buildAssignmentStats(scopedAssignments))
    } catch (error) {
      console.error('Failed to load assignments:', error)
      toast.error('Failed to load assignments')
    }
  }

  const getExpectedClassCount = (assignment) => {
    const classId = String(assignment?.classId || '')
    const className = String(assignment?.className || '').toLowerCase()
    return students.filter((student) => {
      const studentClassId = String(student?.schoolClass?.id || student?.classId || '')
      const studentClassName = String(student?.schoolClass?.name || student?.currentClass || '').toLowerCase()
      return (classId && studentClassId && classId === studentClassId) || (className && studentClassName && className === studentClassName)
    }).length
  }

  const loadReviewRows = async (assignment) => {
    const [submissions, summary] = await Promise.all([
      assignmentService.getAssignmentSubmissions(assignment.id),
      assignmentService.getAssignmentReviewSummary(assignment.id, { expectedCount: getExpectedClassCount(assignment) })
    ])

    setReviewRows(submissions)
    setReviewAssignment({ ...assignment, reviewSummary: summary })
  }

  useEffect(() => {
    const loadPageData = async () => {
      setLoading(true)
      try {
        const [classData, subjectData, studentData] = await Promise.all([
          classService.getClasses().catch(() => []),
          subjectService.getAllSubjects().catch(() => []),
          studentService.getStudents(true).catch(() => ({ students: [] }))
        ])

        const normalizedClasses = normalizeArray(classData, ['classes', 'data'])
        const normalizedSubjects = normalizeArray(subjectData, ['subjects', 'data'])
        const normalizedStudents = normalizeArray(studentData, ['students', 'data'])

        setClasses(normalizedClasses)
        setSubjects(normalizedSubjects)
        setStudents(normalizedStudents)

        if (isTeacherPortal) {
          const scope = await teacherPortalService.getTeacherContext(user, {
            classes: normalizedClasses,
            subjects: normalizedSubjects
          })
          setTeacherScope(scope)
          await loadAssignments(scope)
        } else {
          await loadAssignments()
        }
      } finally {
        setLoading(false)
      }
    }

    loadPageData()
  }, [isTeacherPortal, user])

  const filteredAssignments = useMemo(() => {
    if (filter === 'all') return assignments
    return assignments.filter((assignment) => assignment.state === filter)
  }, [assignments, filter])

  const resetForm = () => {
    setFormData(INITIAL_FORM)
    setSelectedAssignment(null)
  }

  const openCreateModal = (type = 'HOMEWORK') => {
    setSelectedAssignment(null)
    setFormData({
      ...INITIAL_FORM,
      type,
      classId: visibleClasses.length === 1 ? String(visibleClasses[0].id || '') : '',
      className: visibleClasses.length === 1 ? (visibleClasses[0].name || visibleClasses[0].className || '') : '',
      subjectId: visibleSubjects.length === 1 ? String(visibleSubjects[0].id || '') : '',
      subjectName: visibleSubjects.length === 1 ? (visibleSubjects[0].name || visibleSubjects[0].subjectName || '') : ''
    })
    setIsModalOpen(true)
  }

  const openEditModal = (assignment) => {
    setSelectedAssignment(assignment)
    setFormData({
      ...INITIAL_FORM,
      ...assignment
    })
    setIsModalOpen(true)
  }

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target
    const nextValue = type === 'checkbox' ? checked : value

    setFormData((current) => {
      const updated = { ...current, [name]: nextValue }

      if (name === 'classId') {
        const classMatch = visibleClasses.find((item) => String(item.id) === String(value))
        updated.className = classMatch?.name || classMatch?.className || ''
      }

      if (name === 'subjectId') {
        const subjectMatch = visibleSubjects.find((item) => String(item.id) === String(value))
        updated.subjectName = subjectMatch?.name || subjectMatch?.subjectName || ''
      }

      return updated
    })
  }

  const validateForm = () => {
    if (!formData.title.trim()) return 'Assignment title is required.'
    if (!formData.className.trim()) return 'Select a class.'
    if (!formData.subjectName.trim()) return 'Select a subject.'
    if (!formData.description.trim()) return 'Add a short description.'
    if (!formData.dueDate) return 'Choose a due date.'
    if (!formData.totalPoints || Number(formData.totalPoints) <= 0) return 'Points must be greater than zero.'
    return null
  }

  const handleSaveAssignment = async (statusOverride = null) => {
    const validationMessage = validateForm()
    if (validationMessage) {
      toast.error(validationMessage)
      return
    }

    setSaving(true)
    try {
      await assignmentService.saveAssignment({
        ...formData,
        status: statusOverride || formData.status,
        createdBy: `${user?.firstName || 'Staff'} ${user?.lastName || ''}`.trim(),
        createdByEmail: user?.email || ''
      })

      await loadAssignments()
      setIsModalOpen(false)
      resetForm()
      toast.success(statusOverride === 'PUBLISHED' ? 'Assignment created and published.' : 'Assignment saved.')
    } catch (error) {
      console.error('Failed to save assignment:', error)
      toast.error('Could not save assignment.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAssignment = async (assignment) => {
    const confirmed = window.confirm(`Delete assignment "${assignment.title}"?`)
    if (!confirmed) return

    await assignmentService.deleteAssignment(assignment.id)
    await loadAssignments()
    toast.success('Assignment deleted.')
  }

  const handlePublishAssignment = async (assignment) => {
    await assignmentService.publishAssignment(assignment.id)
    await loadAssignments()
    toast.success('Assignment published.')
  }

  const handleCloseAssignment = async (assignment) => {
    await assignmentService.closeAssignment(assignment.id)
    await loadAssignments()
    toast.success('Assignment closed.')
  }

  const handleOpenReviewModal = async (assignment) => {
    await loadReviewRows(assignment)
    setIsReviewOpen(true)
  }

  const handleReviewFieldChange = (studentKey, field, value) => {
    setReviewRows((current) => current.map((row) => {
      if (row.studentKey !== studentKey) return row
      return { ...row, [field]: value }
    }))
  }

  const handleSaveReview = async (studentKey) => {
    if (!reviewAssignment) return
    const row = reviewRows.find((item) => item.studentKey === studentKey)
    if (!row) return

    setReviewSavingKey(studentKey)
    try {
      await assignmentService.reviewSubmission(reviewAssignment.id, studentKey, {
        score: row.score,
        feedback: row.feedback,
        reviewedBy: `${user?.firstName || 'Teacher'} ${user?.lastName || ''}`.trim()
      })

      await loadReviewRows(reviewAssignment)
      await loadAssignments()
      toast.success(`Saved feedback for ${row.studentName || 'student'}.`)
    } catch (error) {
      console.error('Failed to save assignment review:', error)
      toast.error('Could not save review.')
    } finally {
      setReviewSavingKey('')
    }
  }

  const statsCards = [
    { title: 'Total Assignments', value: stats.totalAssignments, change: `${stats.publishedAssignments} published`, icon: DocumentTextIcon, color: 'blue' },
    { title: 'Active Assignments', value: stats.activeAssignments, change: `${stats.overdueAssignments} overdue`, icon: ClockIcon, color: 'green' },
    { title: 'Draft Assignments', value: stats.draftAssignments, change: 'Awaiting publish', icon: PencilSquareIcon, color: 'yellow' },
    { title: 'Average Points', value: stats.averagePoints, change: 'Per assignment', icon: DocumentTextIcon, color: 'purple' }
  ]

  const columns = [
    {
      key: 'title',
      header: 'Assignment Title',
      render: (_, assignment) => (
        <div>
          <div className="font-medium text-gray-900">{assignment.title}</div>
          <div className="text-xs text-gray-500">{assignment.description}</div>
        </div>
      )
    },
    { key: 'subjectName', header: 'Subject', sortable: true },
    { key: 'className', header: 'Class', sortable: true },
    { key: 'type', header: 'Type', sortable: true },
    {
      key: 'submissionsCount',
      header: 'Submissions',
      sortable: true,
      render: (_, assignment) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{assignment.submissionsCount || 0}</div>
          <div className="text-xs text-gray-500">{assignment.pendingReviewCount || 0} pending review</div>
        </div>
      )
    },
    {
      key: 'dueDate',
      header: 'Due',
      sortable: true,
      render: (_, assignment) => formatDateTime(assignment.dueDate, assignment.dueTime)
    },
    {
      key: 'totalPoints',
      header: 'Points',
      sortable: true,
      render: (value) => `${value || 0}`
    },
    {
      key: 'status',
      header: 'Status',
      render: (_, assignment) => getStateBadge(assignment.state)
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, assignment) => (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => { setSelectedAssignment(assignment); setIsDetailsOpen(true) }}>
            <EyeIcon className="w-4 h-4 mr-1" />
            View
          </Button>
          {isTeacherPortal && assignment.status !== 'DRAFT' && (
            <Button size="sm" variant="secondary" onClick={() => handleOpenReviewModal(assignment)}>
              <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
              Review
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => openEditModal(assignment)}>
            <PencilSquareIcon className="w-4 h-4 mr-1" />
            Edit
          </Button>
          {assignment.status === 'DRAFT' ? (
            <Button size="sm" onClick={() => handlePublishAssignment(assignment)}>
              <PaperAirplaneIcon className="w-4 h-4 mr-1" />
              Publish
            </Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => handleCloseAssignment(assignment)}>
              Close
            </Button>
          )}
          <Button size="sm" variant="danger" onClick={() => handleDeleteAssignment(assignment)}>
            <TrashIcon className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600">
            {isTeacherPortal
              ? 'Create, publish, and track assignments only for your classes and subjects.'
              : 'Create, publish, and track assignments from one place.'}
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => openCreateModal()}>
          <PlusIcon className="h-5 w-5" />
          Create Assignment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openCreateModal('HOMEWORK')}
            className="p-4 border border-gray-200 rounded-lg text-left hover:border-primary-300 transition-colors"
          >
            <DocumentTextIcon className="h-8 w-8 text-primary-600 mb-2" />
            <p className="font-medium text-gray-900">Create Homework</p>
            <p className="text-sm text-gray-600">Daily work, reading, or practice questions.</p>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openCreateModal('PROJECT')}
            className="p-4 border border-gray-200 rounded-lg text-left hover:border-primary-300 transition-colors"
          >
            <PencilSquareIcon className="h-8 w-8 text-primary-600 mb-2" />
            <p className="font-medium text-gray-900">Create Project</p>
            <p className="text-sm text-gray-600">Longer work with instructions and grading points.</p>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openCreateModal('QUIZ')}
            className="p-4 border border-gray-200 rounded-lg text-left hover:border-primary-300 transition-colors"
          >
            <ClockIcon className="h-8 w-8 text-primary-600 mb-2" />
            <p className="font-medium text-gray-900">Quick Quiz</p>
            <p className="text-sm text-gray-600">Fast assignment with short turnaround.</p>
          </motion.button>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">All Assignments</h3>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="overdue">Overdue</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <DataTable
          data={filteredAssignments}
          columns={columns}
          searchable
          pagination
          pageSize={8}
        />

        {!loading && assignments.length === 0 && (
          <div className="mt-4 text-sm text-gray-500">No assignments yet. Create the first assignment from the button above.</div>
        )}
      </Card>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedAssignment ? 'Edit Assignment' : 'Create Assignment'}
                  </h2>
                  <p className="text-sm text-gray-500">Assignments created here are persisted in the frontend and shown to students.</p>
                </div>
                <button
                  onClick={() => { setIsModalOpen(false); resetForm() }}
                  className="text-gray-400 hover:text-gray-700"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input name="title" value={formData.title} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select name="type" value={formData.type} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                      {ASSIGNMENT_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    <select name="classId" value={formData.classId} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                      <option value="">Select class</option>
                      {visibleClasses.map((item) => (
                        <option key={item.id} value={item.id}>{item.name || item.className}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select name="subjectId" value={formData.subjectId} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                      <option value="">Select subject</option>
                      {visibleSubjects.map((item) => (
                        <option key={item.id} value={item.id}>{item.name || item.subjectName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Time</label>
                    <input type="time" name="dueTime" value={formData.dueTime} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Points</label>
                    <input type="number" min="1" name="totalPoints" value={formData.totalPoints} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                  <textarea name="instructions" rows="4" value={formData.instructions} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="What should the student submit, format, marking notes, references..." />
                </div>

                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" name="allowLateSubmissions" checked={formData.allowLateSubmissions} onChange={handleInputChange} />
                  Allow late submissions
                </label>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex flex-wrap gap-3 justify-end">
                <Button variant="outline" onClick={() => { setIsModalOpen(false); resetForm() }}>
                  Cancel
                </Button>
                <Button variant="secondary" isLoading={saving} onClick={() => handleSaveAssignment('DRAFT')}>
                  Save Draft
                </Button>
                <Button isLoading={saving} onClick={() => handleSaveAssignment('PUBLISHED')}>
                  Save & Publish
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isReviewOpen && reviewAssignment && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Review Submissions</h2>
                  <p className="text-sm text-gray-500">{reviewAssignment.title} • {reviewAssignment.className}</p>
                </div>
                <button onClick={() => setIsReviewOpen(false)} className="text-gray-400 hover:text-gray-700">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Submitted</p>
                  <p className="font-semibold text-gray-900">{reviewAssignment.reviewSummary?.submittedCount || 0}</p>
                </div>
                <div>
                  <p className="text-gray-500">Reviewed</p>
                  <p className="font-semibold text-gray-900">{reviewAssignment.reviewSummary?.reviewedCount || 0}</p>
                </div>
                <div>
                  <p className="text-gray-500">Pending Review</p>
                  <p className="font-semibold text-amber-700">{reviewAssignment.reviewSummary?.pendingReviewCount || 0}</p>
                </div>
                <div>
                  <p className="text-gray-500">Missing Submissions</p>
                  <p className="font-semibold text-red-700">{reviewAssignment.reviewSummary?.missingSubmissionCount || 0}</p>
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                {reviewRows.map((row) => (
                  <div key={row.studentKey} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{row.studentName || 'Student'}</p>
                        <p className="text-xs text-gray-500">
                          Submitted {row.submittedAt ? new Date(row.submittedAt).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${row.status === 'reviewed' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {row.status === 'reviewed' ? <CheckBadgeIcon className="w-3 h-3 mr-1" /> : null}
                        {row.status === 'reviewed' ? 'Reviewed' : 'Pending review'}
                      </span>
                    </div>

                    {row.notes && (
                      <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Submission note</p>
                        <p className="whitespace-pre-wrap">{row.notes}</p>
                      </div>
                    )}

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                        <input
                          type="number"
                          min="0"
                          max={reviewAssignment.totalPoints || 100}
                          value={row.score ?? ''}
                          onChange={(event) => handleReviewFieldChange(row.studentKey, 'score', event.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
                        <textarea
                          rows="2"
                          value={row.feedback || ''}
                          onChange={(event) => handleReviewFieldChange(row.studentKey, 'feedback', event.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          placeholder="Add specific comments for the learner"
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <Button
                        size="sm"
                        isLoading={reviewSavingKey === row.studentKey}
                        onClick={() => handleSaveReview(row.studentKey)}
                      >
                        Save Feedback
                      </Button>
                    </div>
                  </div>
                ))}

                {!reviewRows.length && (
                  <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
                    No student submissions yet for this assignment.
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDetailsOpen && selectedAssignment && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedAssignment.title}</h2>
                  <p className="text-sm text-gray-500">{selectedAssignment.subjectName} • {selectedAssignment.className}</p>
                </div>
                <button onClick={() => setIsDetailsOpen(false)} className="text-gray-400 hover:text-gray-700">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-sm text-gray-700">
                <div className="flex flex-wrap gap-3">
                  {getStateBadge(selectedAssignment.state)}
                  <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">{selectedAssignment.type}</span>
                  <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">{selectedAssignment.totalPoints} points</span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Due</p>
                  <p>{formatDateTime(selectedAssignment.dueDate, selectedAssignment.dueTime)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Description</p>
                  <p>{selectedAssignment.description}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Instructions</p>
                  <p className="whitespace-pre-wrap">{selectedAssignment.instructions || 'No extra instructions provided.'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Created By</p>
                  <p>{selectedAssignment.createdBy || 'Staff'}</p>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Assignments