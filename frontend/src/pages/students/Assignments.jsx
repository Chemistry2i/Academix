import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Card from '../../components/common/Card'
import DataTable from '../../components/common/DataTable'
import Button from '../../components/common/Button'
import {
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowUpTrayIcon,
  ChatBubbleLeftEllipsisIcon
} from '@heroicons/react/24/outline'
import { assignmentService } from '../../services/assignmentService'
import { studentService } from '../../services/studentService'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const StudentAssignments = () => {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [studentContext, setStudentContext] = useState(null)
  const [loading, setLoading] = useState(true)

  const resolveStudentContext = async () => {
    const studentsPayload = await studentService.getStudents(true).catch(() => ({ students: [] }))
    const students = studentsPayload.students || studentsPayload || []
    const matched = students.find((student) => {
      return String(student.email || '').toLowerCase() === String(user?.email || '').toLowerCase()
    })

    return {
      studentId: matched?.id || '',
      studentEmail: user?.email || matched?.email || '',
      studentName: matched
        ? [matched.firstName, matched.otherNames, matched.lastName].filter(Boolean).join(' ')
        : `${user?.firstName || 'Student'} ${user?.lastName || ''}`.trim(),
      classId: matched?.schoolClass?.id || matched?.classId || '',
      className: matched?.schoolClass?.name || matched?.currentClass || ''
    }
  }

  const loadAssignments = async (context = studentContext) => {
    setLoading(true)
    try {
      const data = await assignmentService.getPublishedAssignments({
        studentContext: context || undefined,
        classId: context?.classId || undefined,
        className: context?.className || undefined
      })
      setAssignments(data)
    } catch (error) {
      console.error('Failed to load student assignments:', error)
      toast.error('Failed to load assignments')
      setAssignments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const initialize = async () => {
      const context = await resolveStudentContext()
      setStudentContext(context)
      await loadAssignments(context)
    }

    initialize()
  }, [user?.email])

  const getStatusBadge = (status) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Submitted
          </span>
        )
      case 'reviewed':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            <ChatBubbleLeftEllipsisIcon className="w-3 h-3 mr-1" />
            Reviewed
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-3 h-3 mr-1" />
            Pending
          </span>
        )
      case 'overdue':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            <ExclamationCircleIcon className="w-3 h-3 mr-1" />
            Overdue
          </span>
        )
      default:
        return null
    }
  }

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    }
    return <div className={`w-3 h-3 rounded-full ${colors[priority]}`}></div>
  }

  const columns = [
    { 
      key: 'priority', 
      header: 'Priority', 
      render: (value) => getPriorityBadge(value)
    },
    {
      key: 'title',
      header: 'Assignment',
      sortable: true,
      render: (_, row) => (
        <div>
          <div className="font-medium text-gray-900">{row.title}</div>
          <div className="text-xs text-gray-500">{row.description}</div>
        </div>
      )
    },
    { key: 'subjectName', header: 'Course', sortable: true },
    { key: 'type', header: 'Type', sortable: true },
    { 
      key: 'dueDate', 
      header: 'Due Date', 
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {new Date(value).toLocaleDateString()}
          </div>
          <div className="text-xs text-gray-500">{row.dueTime}</div>
        </div>
      )
    },
    { key: 'totalPoints', header: 'Points', sortable: true },
    { 
      key: 'submissionStatus', 
      header: 'Status', 
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'feedback',
      header: 'Teacher Feedback',
      render: (_, row) => (
        <div className="max-w-xs">
          {row.feedback ? (
            <>
              <div className="text-sm text-gray-700 line-clamp-2">{row.feedback}</div>
              {row.score !== null && row.score !== undefined && (
                <div className="text-xs text-blue-700 mt-1">Score: {row.score}/{row.totalPoints}</div>
              )}
            </>
          ) : (
            <span className="text-xs text-gray-400">Awaiting review</span>
          )}
        </div>
      )
    },
    { 
      key: 'actions',
      header: 'Action',
      sortable: false,
      render: (_, row) => (
        row.submissionStatus === 'submitted' || row.submissionStatus === 'reviewed' ? (
          <Button size="sm" variant="outline" onClick={() => handleUndoSubmission(row.id)}>
            Undo Submission
          </Button>
        ) : (
          <Button size="sm" onClick={() => handleSubmit(row.id)}>
            <ArrowUpTrayIcon className="w-4 h-4 mr-1" />
            Mark Submitted
          </Button>
        )
      )
    }
  ]

  const sortedAssignments = useMemo(() => {
    return [...assignments].sort((left, right) => {
      const leftDate = new Date(`${left.dueDate}T${left.dueTime || '23:59'}`).getTime()
      const rightDate = new Date(`${right.dueDate}T${right.dueTime || '23:59'}`).getTime()
      return leftDate - rightDate
    })
  }, [assignments])

  const pendingCount = assignments.filter((assignment) => assignment.submissionStatus === 'pending').length
  const submittedCount = assignments.filter((assignment) => assignment.submissionStatus === 'submitted').length

  const handleSubmit = async (assignmentId) => {
    await assignmentService.submitAssignment(assignmentId, { studentContext })
    await loadAssignments(studentContext)
    toast.success('Assignment marked as submitted.')
  }

  const handleUndoSubmission = async (assignmentId) => {
    await assignmentService.undoSubmission(assignmentId, studentContext)
    await loadAssignments(studentContext)
    toast.success('Submission removed.')
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
            <p className="text-gray-600 mt-1">
              Track your assignments, deadlines, and submissions
            </p>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{submittedCount}</div>
              <div className="text-sm text-gray-500">Submitted</div>
            </div>
          </div>
        </div>

        <Card>
          <DataTable
            data={sortedAssignments}
            columns={columns}
            searchable
            pagination
            pageSize={8}
          />
          {!loading && assignments.length === 0 && (
            <div className="mt-4 text-sm text-gray-500">No published assignments yet. Once a teacher publishes one, it will appear here.</div>
          )}
        </Card>
      </motion.div>
    </div>
  )
}

export default StudentAssignments