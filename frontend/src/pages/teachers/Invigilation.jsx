import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ClipboardDocumentListIcon, ClockIcon } from '@heroicons/react/24/outline'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import { useAuth } from '../../contexts/AuthContext'
import { classService } from '../../services/classService'
import subjectService from '../../services/subjectService'
import { examService } from '../../services/examService'
import { teacherPortalService } from '../../services/teacherPortalService'
import { useNavigate } from 'react-router-dom'

const normalizeArray = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []

  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key]
  }

  const firstArray = Object.values(payload).find((value) => Array.isArray(value))
  return firstArray || []
}

const buildInvigilationSchedule = ({ exams = [], assignedClasses = [] }) => {
  const assignedClassNames = assignedClasses
    .map((item) => String(item?.name || item?.className || '').trim().toLowerCase())
    .filter(Boolean)

  const today = new Date()

  return exams
    .map((exam) => {
      const examClasses = Array.isArray(exam?.targetClasses) ? exam.targetClasses : []
      const matchedClasses = examClasses.filter((className) => {
        return assignedClassNames.includes(String(className || '').trim().toLowerCase())
      })

      return {
        ...exam,
        matchedClasses,
        dutyCount: matchedClasses.length
      }
    })
    .filter((exam) => {
      const status = String(exam?.status || '').toUpperCase()
      if (status === 'CANCELLED' || status === 'COMPLETED') return false
      if (!exam.dutyCount) return false

      const endDate = exam?.endDate ? new Date(exam.endDate) : null
      if (!endDate || Number.isNaN(endDate.getTime())) return true
      return endDate >= new Date(today.toDateString())
    })
    .sort((left, right) => {
      const leftDate = left?.startDate ? new Date(left.startDate).getTime() : Number.MAX_SAFE_INTEGER
      const rightDate = right?.startDate ? new Date(right.startDate).getTime() : Number.MAX_SAFE_INTEGER
      return leftDate - rightDate
    })
}

const formatDateRange = (exam) => {
  const start = exam?.startDate ? new Date(exam.startDate) : null
  const end = exam?.endDate ? new Date(exam.endDate) : null

  if (start && !Number.isNaN(start.getTime()) && end && !Number.isNaN(end.getTime())) {
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
  }

  if (start && !Number.isNaN(start.getTime())) return start.toLocaleDateString()
  return 'Date to be announced'
}

const Invigilation = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [schedule, setSchedule] = useState([])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [classPayload, subjectPayload, examPayload] = await Promise.all([
          classService.getClasses().catch(() => []),
          subjectService.getAllSubjects().catch(() => []),
          examService.getAllExams().catch(() => [])
        ])

        const classes = normalizeArray(classPayload)
        const subjects = normalizeArray(subjectPayload, ['subjects', 'data'])
        const exams = normalizeArray(examPayload)

        const scope = await teacherPortalService.getTeacherContext(user, {
          classes,
          subjects
        })

        const duties = buildInvigilationSchedule({
          exams,
          assignedClasses: scope.assignedClasses || []
        })

        setSchedule(duties)
      } catch (error) {
        console.error('Failed to load invigilation schedule:', error)
        setSchedule([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invigilation Schedule</h1>
            <p className="text-sm text-gray-600 mt-1">Upcoming exam duties matched to your assigned classes.</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/teacher/attendance')}>
            <ClockIcon className="w-4 h-4 mr-2" />
            Take Attendance
          </Button>
        </div>
      </motion.div>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <ClipboardDocumentListIcon className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Exam Duties</h3>
        </div>

        <div className="space-y-3">
          {schedule.map((exam) => (
            <div key={exam.id || exam.code || exam.name} className="rounded-lg border border-gray-200 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{exam.name || exam.code || 'Exam'}</p>
                  <p className="text-xs text-gray-500">{exam.code || 'No code'} • {exam.type || 'Exam'} • {exam.level || 'Level'}</p>
                </div>
                <span className="rounded-full px-2 py-1 text-xs font-medium bg-primary-50 text-primary-700">
                  {exam.dutyCount} class{exam.dutyCount > 1 ? 'es' : ''}
                </span>
              </div>

              <div className="mt-2 text-sm text-gray-700">{formatDateRange(exam)}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {exam.matchedClasses.slice(0, 6).map((className) => (
                  <span key={`${exam.id}-${className}`} className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {className}
                  </span>
                ))}
                {exam.matchedClasses.length > 6 && (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                    +{exam.matchedClasses.length - 6} more
                  </span>
                )}
              </div>
            </div>
          ))}

          {!loading && !schedule.length && (
            <div className="rounded-lg border border-dashed border-gray-300 p-5 text-sm text-gray-500">
              No upcoming invigilation duties found for your classes.
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default Invigilation
