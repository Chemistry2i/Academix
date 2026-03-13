import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpenIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import Card from '../../components/common/Card'
import StatCard from '../../components/common/StatCard'
import DataTable from '../../components/common/DataTable'
import { classService } from '../../services/classService'
import subjectService from '../../services/subjectService'
import { assignmentService } from '../../services/assignmentService'
import { resultsService } from '../../services/resultsService'
import { teacherPortalService } from '../../services/teacherPortalService'
import { useAuth } from '../../contexts/AuthContext'

const normalizeArray = (payload, keys = []) => teacherPortalService.normalizeArray(payload, keys)

const Subjects = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [teacherScope, setTeacherScope] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [subjectRows, setSubjectRows] = useState([])

  useEffect(() => {
    const loadPageData = async () => {
      setLoading(true)
      try {
        const [classPayload, subjectPayload, assignmentData, assessmentData, resultsData] = await Promise.all([
          classService.getClasses().catch(() => []),
          subjectService.getAllSubjects().catch(() => []),
          assignmentService.getAssignments().catch(() => []),
          resultsService.getAssessments().catch(() => []),
          resultsService.getResults().catch(() => [])
        ])

        const classList = normalizeArray(classPayload, ['classes', 'data'])
        const subjectList = normalizeArray(subjectPayload, ['subjects', 'data'])
        const scope = await teacherPortalService.getTeacherContext(user, {
          classes: classList,
          subjects: subjectList
        })

        const scopedAssignments = teacherPortalService.filterAssignmentsByScope(assignmentData, scope)
        const scopedAssessments = teacherPortalService.filterAssessmentsByScope(assessmentData, scope)
        const scopedResults = teacherPortalService.filterResultsByScope(resultsData, scope)
        const scopedSubjectSummaries = await resultsService.getSubjectSummaries({
          filters: {
            classId: undefined,
            subjectId: undefined,
            term: undefined
          }
        })

        const filteredSummaries = scopedSubjectSummaries.filter((summary) => {
          return scope.subjectIds?.includes(String(summary.subjectId || '')) ||
            scope.subjectNames?.some((name) => String(name).trim().toLowerCase() === String(summary.subjectName || '').trim().toLowerCase())
        })

        const subjectCardsSource = scope.availableSubjects.length
          ? scope.availableSubjects
          : scope.subjectNames.map((name, index) => ({ id: `teacher-subject-${index}`, name }))

        const rows = subjectCardsSource.map((subject) => {
          const subjectName = subject.name || subject.subjectName || 'Subject'
          const subjectId = String(subject.id || subject.subjectId || '')
          const linkedClasses = scope.assignedClasses.filter((item) => {
            const classSubject = item.subject || item.subjectName || item.mainSubject || ''
            const classSubjectId = String(item.subjectId || item.subject?.id || '')
            return (subjectId && classSubjectId && subjectId === classSubjectId) ||
              String(classSubject).trim().toLowerCase() === subjectName.trim().toLowerCase()
          })

          const summary = filteredSummaries.find((item) => {
            return (subjectId && String(item.subjectId || '') === subjectId) ||
              String(item.subjectName || '').trim().toLowerCase() === subjectName.trim().toLowerCase()
          })

          const subjectAssignments = scopedAssignments.filter((item) => {
            return (subjectId && String(item.subjectId || '') === subjectId) ||
              String(item.subjectName || '').trim().toLowerCase() === subjectName.trim().toLowerCase()
          })

          const subjectAssessments = scopedAssessments.filter((item) => {
            return (subjectId && String(item.subjectId || '') === subjectId) ||
              String(item.subjectName || '').trim().toLowerCase() === subjectName.trim().toLowerCase()
          })

          return {
            id: subjectId || subjectName,
            subjectName,
            code: subject.code || subject.subjectCode || 'N/A',
            classes: linkedClasses.map((item) => item.name || item.className).filter(Boolean),
            assessmentCount: subjectAssessments.length,
            assignmentCount: subjectAssignments.length,
            activeAssignments: subjectAssignments.filter((item) => item.state === 'active').length,
            averagePercentage: summary?.averagePercentage || 0,
            passRate: summary?.passRate || 0,
            resultCount: summary?.resultCount || scopedResults.filter((item) => String(item.subjectId || '') === subjectId).length
          }
        })

        setTeacherScope(scope)
        setAssignments(scopedAssignments)
        setSubjectRows(rows)
      } finally {
        setLoading(false)
      }
    }

    loadPageData()
  }, [user])

  const stats = useMemo(() => {
    const linkedClasses = new Set(subjectRows.flatMap((row) => row.classes)).size
    const totalAssessments = subjectRows.reduce((sum, row) => sum + row.assessmentCount, 0)
    const activeAssignments = assignments.filter((item) => item.state === 'active').length

    return {
      totalSubjects: subjectRows.length,
      linkedClasses,
      totalAssessments,
      activeAssignments
    }
  }, [assignments, subjectRows])

  const columns = [
    {
      key: 'subjectName',
      header: 'Subject',
      render: (_, row) => (
        <div>
          <div className="font-medium text-gray-900">{row.subjectName}</div>
          <div className="text-xs text-gray-500">{row.code}</div>
        </div>
      )
    },
    {
      key: 'classes',
      header: 'Classes',
      render: (value) => (
        <div className="flex flex-wrap gap-1.5">
          {value.length ? value.map((item) => (
            <span key={item} className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
              {item}
            </span>
          )) : <span className="text-sm text-gray-400">Not linked</span>}
        </div>
      )
    },
    { key: 'assessmentCount', header: 'Assessments', sortable: true },
    { key: 'assignmentCount', header: 'Assignments', sortable: true },
    {
      key: 'averagePercentage',
      header: 'Average',
      sortable: true,
      render: (value) => `${Number(value || 0).toFixed(1)}%`
    },
    {
      key: 'passRate',
      header: 'Pass Rate',
      sortable: true,
      render: (value) => `${Number(value || 0).toFixed(1)}%`
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex gap-1.5">
          <button
            onClick={() => navigate('/teacher/gradebook', { state: { subjectName: row.subjectName, subjectId: row.id } })}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border border-purple-200 rounded text-purple-700 hover:bg-purple-50 transition-colors"
            title="Create Assessment"
          >
            <ClipboardDocumentListIcon className="w-3.5 h-3.5" />
            Assessment
          </button>
          <button
            onClick={() => navigate('/teacher/assignments', { state: { subjectName: row.subjectName, subjectId: row.id } })}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border border-blue-200 rounded text-blue-700 hover:bg-blue-50 transition-colors"
            title="Create Assignment"
          >
            <DocumentTextIcon className="w-3.5 h-3.5" />
            Assignment
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Subjects</h1>
          <p className="text-gray-600">
            {teacherScope?.teacher?.firstName
              ? `${teacherScope.teacher.firstName}'s assigned teaching subjects and live performance.`
              : 'Subjects currently assigned to your teaching load.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Subjects" value={loading ? '...' : stats.totalSubjects} icon={BookOpenIcon} color="blue" />
        <StatCard title="Linked Classes" value={loading ? '...' : stats.linkedClasses} icon={UserGroupIcon} color="green" />
        <StatCard title="Assessments" value={loading ? '...' : stats.totalAssessments} icon={ClipboardDocumentListIcon} color="purple" />
        <StatCard title="Active Assignments" value={loading ? '...' : stats.activeAssignments} icon={DocumentTextIcon} color="yellow" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Subject Overview</h3>
            <p className="text-sm text-gray-500">Performance, classes, and workload by subject.</p>
          </div>

          <DataTable
            data={subjectRows}
            columns={columns}
            searchable
            sortable
            pagination
            pageSize={6}
          />
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-primary-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Teaching Focus</h3>
              <p className="text-sm text-gray-500">Quick subject workload snapshot.</p>
            </div>
          </div>

          <div className="space-y-3">
            {subjectRows.slice(0, 5).map((row, index) => (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-900">{row.subjectName}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {row.classes.length ? row.classes.join(', ') : 'No linked classes yet'}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-gray-700">
                    {row.assessmentCount} assessments
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                  <span>{row.activeAssignments} active assignments</span>
                  <span>{Number(row.averagePercentage || 0).toFixed(1)}% average</span>
                </div>
              </motion.div>
            ))}

            {!loading && !subjectRows.length && (
              <div className="rounded-xl border border-dashed border-gray-300 p-6 text-sm text-gray-500">
                No subject assignments were found for this teacher yet.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Subjects