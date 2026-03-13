import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  DocumentTextIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  BuildingOffice2Icon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  ArrowUpTrayIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import Card from '../../components/common/Card'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Button from '../../components/common/Button'
import { useAuth } from '../../contexts/AuthContext'
import { studentService } from '../../services/studentService'
import { enrollmentWorkflowService } from '../../services/enrollmentWorkflowService'
import toast from 'react-hot-toast'

const asArray = (payload) => {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []
  if (Array.isArray(payload.students)) return payload.students
  if (Array.isArray(payload.data)) return payload.data
  const firstArray = Object.values(payload).find((item) => Array.isArray(item))
  return firstArray || []
}

const normalizeValue = (value, fallback = 'Not available') => {
  if (value === null || value === undefined) return fallback
  const text = String(value).trim()
  return text ? text : fallback
}

const formatDate = (value) => {
  if (!value) return 'Not available'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return normalizeValue(value)
  return date.toLocaleDateString()
}

const resolveStatus = (enrollment) => {
  const raw = String(
    enrollment?.status ||
    enrollment?.enrollmentStatus ||
    enrollment?.state ||
    'ACTIVE'
  ).toUpperCase()

  if (raw.includes('PEND')) return { label: 'Pending', tone: 'amber' }
  if (raw.includes('SUSP') || raw.includes('HOLD')) return { label: 'On Hold', tone: 'red' }
  if (raw.includes('INAC') || raw.includes('DROP')) return { label: 'Inactive', tone: 'red' }
  return { label: 'Active', tone: 'green' }
}

const StudentEnrollment = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [submittingRequest, setSubmittingRequest] = useState(false)
  const [student, setStudent] = useState(null)
  const [enrollment, setEnrollment] = useState(null)
  const [documents, setDocuments] = useState([])
  const [changeRequests, setChangeRequests] = useState([])
  const [requestForm, setRequestForm] = useState({
    requestType: 'CLASS_CHANGE',
    targetValue: '',
    requestedEffectiveDate: '',
    reason: ''
  })

  useEffect(() => {
    const loadEnrollment = async () => {
      setLoading(true)
      try {
        const studentsPayload = await studentService.getStudents(true).catch(() => ({ students: [] }))
        const students = asArray(studentsPayload)
        const foundStudent = students.find((item) => {
          return String(item?.email || '').toLowerCase() === String(user?.email || '').toLowerCase()
        }) || null

        setStudent(foundStudent)

        if (!foundStudent?.id) {
          setEnrollment(null)
          setDocuments([])
          setChangeRequests([])
          return
        }

        const enrollmentPayload = await studentService.getStudentEnrollment(foundStudent.id).catch(() => null)
        const resolvedEnrollment = enrollmentPayload?.data || enrollmentPayload || null
        setEnrollment(resolvedEnrollment)

        const [documentRows, requestRows] = await Promise.all([
          enrollmentWorkflowService.getEnrollmentDocuments(foundStudent.id, {
            student: foundStudent,
            enrollment: resolvedEnrollment
          }),
          enrollmentWorkflowService.getChangeRequests(foundStudent.id)
        ])

        setDocuments(documentRows)
        setChangeRequests(requestRows)
      } finally {
        setLoading(false)
      }
    }

    loadEnrollment()
  }, [user?.email])

  const submitChangeRequest = async (event) => {
    event.preventDefault()

    if (!student?.id) {
      toast.error('Student profile is not linked yet.')
      return
    }

    if (!requestForm.targetValue.trim() || !requestForm.reason.trim()) {
      toast.error('Please provide both the requested change and reason.')
      return
    }

    try {
      setSubmittingRequest(true)
      const created = await enrollmentWorkflowService.submitChangeRequest(student.id, requestForm)
      setChangeRequests((current) => [created, ...current])
      setRequestForm({
        requestType: requestForm.requestType,
        targetValue: '',
        requestedEffectiveDate: '',
        reason: ''
      })
      toast.success('Enrollment change request submitted')
    } catch (error) {
      console.error('Failed to submit enrollment change request:', error)
      toast.error('Could not submit request. Please try again.')
    } finally {
      setSubmittingRequest(false)
    }
  }

  const statusTone = (status) => {
    const value = String(status || '').toUpperCase()
    if (value.includes('APPROV')) return 'bg-green-50 text-green-700 border-green-200'
    if (value.includes('REJECT') || value.includes('DECLIN')) return 'bg-red-50 text-red-700 border-red-200'
    if (value.includes('REVIEW')) return 'bg-blue-50 text-blue-700 border-blue-200'
    return 'bg-amber-50 text-amber-700 border-amber-200'
  }

  const status = useMemo(() => resolveStatus(enrollment), [enrollment])

  const statusClass = status.tone === 'green'
    ? 'bg-green-50 text-green-700 border-green-200'
    : status.tone === 'amber'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-red-50 text-red-700 border-red-200'

  const enrollmentNumber =
    enrollment?.enrollmentNumber ||
    enrollment?.admissionNumber ||
    student?.studentId ||
    student?.studentNumber ||
    'Not available'

  const programName =
    enrollment?.program ||
    enrollment?.course ||
    enrollment?.curriculum ||
    student?.program ||
    'General Program'

  const className =
    enrollment?.className ||
    student?.currentClass ||
    student?.schoolClass?.name ||
    'Not assigned'

  const academicYear =
    enrollment?.academicYear ||
    enrollment?.year ||
    'Current Academic Year'

  const campus =
    enrollment?.campus ||
    enrollment?.school ||
    enrollment?.branch ||
    'Main Campus'

  const term =
    enrollment?.term ||
    enrollment?.semester ||
    'Current Term'

  const enrollmentDate =
    enrollment?.enrollmentDate ||
    enrollment?.admissionDate ||
    student?.createdAt ||
    student?.dateJoined

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
        <span className="ml-3 text-gray-600">Loading enrollment details...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Enrollment</h1>
            <p className="text-gray-600 mt-1">Review your enrollment status and admission details.</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusClass}`}>
            {status.label}
          </span>
        </div>
      </motion.div>

      {!student && (
        <Card>
          <div className="p-6 flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Student record not linked</h3>
              <p className="text-sm text-gray-600 mt-1">
                We could not map your account to a student profile yet. Contact admin to link your account email.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <div className="p-5">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
              <DocumentTextIcon className="w-4 h-4" />
              Enrollment Number
            </div>
            <p className="text-lg font-semibold text-gray-900">{normalizeValue(enrollmentNumber)}</p>
          </div>
        </Card>

        <Card>
          <div className="p-5">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
              <AcademicCapIcon className="w-4 h-4" />
              Program
            </div>
            <p className="text-lg font-semibold text-gray-900">{normalizeValue(programName)}</p>
          </div>
        </Card>

        <Card>
          <div className="p-5">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
              <CheckBadgeIcon className="w-4 h-4" />
              Class
            </div>
            <p className="text-lg font-semibold text-gray-900">{normalizeValue(className)}</p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Enrollment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <CalendarDaysIcon className="w-4 h-4" />
                Enrollment Date
              </div>
              <p className="font-medium text-gray-900">{formatDate(enrollmentDate)}</p>
            </div>

            <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
              <div className="text-gray-500 mb-1">Academic Year</div>
              <p className="font-medium text-gray-900">{normalizeValue(academicYear)}</p>
            </div>

            <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
              <div className="text-gray-500 mb-1">Term</div>
              <p className="font-medium text-gray-900">{normalizeValue(term)}</p>
            </div>

            <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <BuildingOffice2Icon className="w-4 h-4" />
                Campus
              </div>
              <p className="font-medium text-gray-900">{normalizeValue(campus)}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Enrollment Documents</h2>
              <span className="text-xs text-gray-500">{documents.length} items</span>
            </div>

            {documents.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                No enrollment documents found yet.
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-lg border border-gray-200 px-4 py-3 flex items-start justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {doc.uploadedAt ? `Updated ${formatDate(doc.uploadedAt)}` : 'No upload date'}
                      </p>
                      {doc.note && <p className="text-xs text-gray-500 mt-1">{doc.note}</p>}
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${statusTone(doc.status)}`}>
                      {String(doc.status || 'MISSING').replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 flex items-start gap-2">
              <ArrowUpTrayIcon className="w-4 h-4 text-gray-500 mt-0.5" />
              <p className="text-xs text-gray-600">
                Document upload is currently managed by admissions/admin. Use a change request below to ask for updates.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Enrollment Change Request</h2>
              <ClockIcon className="w-4 h-4 text-gray-500" />
            </div>

            <form className="space-y-3" onSubmit={submitChangeRequest}>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Request Type</label>
                <select
                  value={requestForm.requestType}
                  onChange={(event) => setRequestForm((current) => ({ ...current, requestType: event.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="CLASS_CHANGE">Class Change</option>
                  <option value="PROGRAM_CHANGE">Program Change</option>
                  <option value="SUBJECT_CHANGE">Subject Change</option>
                  <option value="CAMPUS_CHANGE">Campus Change</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Requested Change</label>
                <input
                  type="text"
                  value={requestForm.targetValue}
                  onChange={(event) => setRequestForm((current) => ({ ...current, targetValue: event.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="e.g. Move to S2 North"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Preferred Effective Date (Optional)</label>
                <input
                  type="date"
                  value={requestForm.requestedEffectiveDate}
                  onChange={(event) => setRequestForm((current) => ({ ...current, requestedEffectiveDate: event.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Reason</label>
                <textarea
                  value={requestForm.reason}
                  onChange={(event) => setRequestForm((current) => ({ ...current, reason: event.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Explain why this change is needed"
                />
              </div>

              <Button type="submit" disabled={submittingRequest || !student?.id}>
                {submittingRequest ? 'Submitting...' : 'Submit Request'}
              </Button>
            </form>

            <div className="pt-2 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Request History</h3>
              {!changeRequests.length ? (
                <p className="text-xs text-gray-500">No enrollment change requests submitted yet.</p>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {changeRequests.map((request) => (
                    <div key={request.id || request.requestId} className="rounded-lg border border-gray-200 px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900">
                          {String(request.requestType || 'REQUEST').replace('_', ' ')}
                        </p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusTone(request.status)}`}>
                          {String(request.status || 'PENDING').replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{request.targetValue || 'No target specified'}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{request.reason}</p>
                      <p className="text-xs text-gray-400 mt-1">Submitted {formatDate(request.createdAt || request.submittedAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default StudentEnrollment
