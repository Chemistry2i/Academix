import React, { useEffect, useMemo, useState } from 'react'
import { ChartBarIcon, AcademicCapIcon, TrophyIcon, BookOpenIcon } from '@heroicons/react/24/outline'
import { useLocation } from 'react-router-dom'
import Card from '../../components/common/Card'
import StatCard from '../../components/common/StatCard'
import DataTable from '../../components/common/DataTable'
import { resultsService } from '../../services/resultsService'
import { classService } from '../../services/classService'
import { studentService } from '../../services/studentService'
import { courseService } from '../../services/courseService'
import subjectService from '../../services/subjectService'
import { useAuth } from '../../contexts/AuthContext'
import { getGradeBadgeClasses } from '../../utils/grading'

const TERMS = ['Term 1', 'Term 2', 'Term 3']

const normalizeArray = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []
  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key]
  }
  const firstArray = Object.values(payload).find((value) => Array.isArray(value))
  return firstArray || []
}

const Results = () => {
  const location = useLocation()
  const { user } = useAuth()
  const isStudentView = location.pathname.startsWith('/student')

  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [selectedTerm, setSelectedTerm] = useState('')
  const [subjectSummaries, setSubjectSummaries] = useState([])
  const [courseSummaries, setCourseSummaries] = useState([])
  const [allResults, setAllResults] = useState([])
  const [transcript, setTranscript] = useState({ results: [], summary: {}, subjectSummaries: [], courseSummary: [] })
  const [loading, setLoading] = useState(true)

  const selectedStudent = useMemo(() => {
    if (!students.length) return null
    return students.find((student) => String(student.email || '').toLowerCase() === String(user?.email || '').toLowerCase()) || students[0]
  }, [students, user?.email])

  useEffect(() => {
    const loadBaseData = async () => {
      setLoading(true)
      try {
        const [classData, subjectData, studentData, courseData] = await Promise.all([
          classService.getClasses().catch(() => []),
          subjectService.getAllSubjects().catch(() => []),
          studentService.getStudents(true).catch(() => ({ students: [] })),
          courseService.getCourses().catch(() => [])
        ])

        setClasses(normalizeArray(classData, ['classes', 'data']))
        setSubjects(normalizeArray(subjectData, ['subjects', 'data']))
        setStudents(normalizeArray(studentData, ['students', 'data']))
        setCourses(normalizeArray(courseData, ['courses', 'data']))
      } finally {
        setLoading(false)
      }
    }

    loadBaseData()
  }, [])

  useEffect(() => {
    if (isStudentView) return

    const loadManagementSummary = async () => {
      const filters = {
        classId: selectedClassId || undefined,
        subjectId: selectedSubjectId || undefined,
        term: selectedTerm || undefined
      }

      const [subjectsData, coursesData, resultsData] = await Promise.all([
        resultsService.getSubjectSummaries({ filters }),
        resultsService.getCourseSummaries({ filters, courses }),
        resultsService.getResults(filters)
      ])

      setSubjectSummaries(subjectsData)
      setCourseSummaries(coursesData)
      setAllResults(resultsData)
    }

    loadManagementSummary()
  }, [isStudentView, selectedClassId, selectedSubjectId, selectedTerm, courses])

  useEffect(() => {
    if (!isStudentView || !selectedStudent) return

    const loadTranscript = async () => {
      const studentTranscript = await resultsService.getStudentTranscript({ studentId: selectedStudent.id, courses })
      setTranscript(studentTranscript)
    }

    loadTranscript()
  }, [isStudentView, selectedStudent, courses])

  const managementStats = useMemo(() => {
    const count = allResults.length
    const average = count ? Number((allResults.reduce((sum, result) => sum + Number(result.percentage || 0), 0) / count).toFixed(2)) : 0
    const passRate = count ? Number(((allResults.filter((result) => result.passed).length / count) * 100).toFixed(2)) : 0
    const topPerformers = allResults.filter((result) => Number(result.percentage || 0) >= 80).length

    return [
      { title: 'Result Entries', value: count, icon: ChartBarIcon, color: 'blue' },
      { title: 'Average Score', value: `${average}%`, icon: AcademicCapIcon, color: 'green' },
      { title: 'Pass Rate', value: `${passRate}%`, icon: TrophyIcon, color: 'purple' },
      { title: 'Top Performers', value: topPerformers, icon: BookOpenIcon, color: 'yellow' }
    ]
  }, [allResults])

  const studentStats = useMemo(() => {
    const summary = transcript.summary || {}
    return [
      { title: 'Average Score', value: `${summary.averagePercentage || 0}%`, icon: AcademicCapIcon, color: 'blue' },
      { title: 'Pass Rate', value: `${summary.passRate || 0}%`, icon: TrophyIcon, color: 'green' },
      { title: 'Subjects Graded', value: transcript.subjectSummaries?.length || 0, icon: BookOpenIcon, color: 'purple' },
      { title: 'Assessments', value: transcript.results?.length || 0, icon: ChartBarIcon, color: 'yellow' }
    ]
  }, [transcript])

  const subjectColumns = [
    { key: 'subjectName', header: 'Subject', sortable: true },
    { key: 'className', header: 'Class', sortable: true },
    { key: 'assessmentCount', header: 'Assessments', sortable: true },
    { key: 'averagePercentage', header: 'Average %', sortable: true },
    { key: 'passRate', header: 'Pass Rate', sortable: true },
    { key: 'highestScore', header: 'Highest %', sortable: true }
  ]

  const courseColumns = [
    { key: 'courseName', header: 'Course', sortable: true },
    { key: 'subjectsCovered', header: 'Subjects', sortable: true },
    { key: 'resultCount', header: 'Results', sortable: true },
    { key: 'averagePercentage', header: 'Average %', sortable: true },
    { key: 'passRate', header: 'Pass Rate', sortable: true }
  ]

  const resultColumns = [
    {
      key: 'studentName',
      header: 'Student',
      render: (_, row) => (
        <div>
          <div className="font-medium text-gray-900">{row.studentName}</div>
          <div className="text-xs text-gray-500">{row.studentIdentifier}</div>
        </div>
      )
    },
    { key: 'subjectName', header: 'Subject', sortable: true },
    { key: 'assessmentTitle', header: 'Assessment', sortable: true },
    {
      key: 'rawScore',
      header: 'Score',
      sortable: true,
      render: (_, row) => `${row.rawScore}/${row.maxScore}`
    },
    { key: 'percentage', header: 'Percentage', sortable: true },
    {
      key: 'grade',
      header: 'Grade',
      sortable: true,
      render: (value) => <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeBadgeClasses(value)}`}>{value}</span>
    },
    { key: 'term', header: 'Term', sortable: true }
  ]

  const transcriptColumns = [
    { key: 'subjectName', header: 'Subject', sortable: true },
    { key: 'assessmentCount', header: 'Assessments', sortable: true },
    { key: 'averagePercentage', header: 'Average %', sortable: true },
    {
      key: 'bestGrade',
      header: 'Best Grade',
      sortable: true,
      render: (value) => <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeBadgeClasses(value)}`}>{value}</span>
    },
    { key: 'points', header: 'Points', sortable: true }
  ]

  if (loading) {
    return <div className="text-sm text-gray-500">Loading results...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Academic Results</h1>
        <p className="text-gray-600 mt-1">
          {isStudentView
            ? `Performance summary${selectedStudent ? ` for ${[selectedStudent.firstName, selectedStudent.lastName].filter(Boolean).join(' ')}` : ''}`
            : 'View subject results, grade trends, and course-level aggregates'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {(isStudentView ? studentStats : managementStats).map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {!isStudentView && (
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">All classes</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>{item.name || item.className}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select value={selectedSubjectId} onChange={(event) => setSelectedSubjectId(event.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">All subjects</option>
                {subjects.map((item) => (
                  <option key={item.id} value={item.id}>{item.name || item.subjectName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
              <select value={selectedTerm} onChange={(event) => setSelectedTerm(event.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">All terms</option>
                {TERMS.map((term) => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      )}

      {isStudentView ? (
        <>
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Transcript</h3>
            <DataTable data={transcript.subjectSummaries || []} columns={transcriptColumns} searchable pagination pageSize={8} />
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Aggregates</h3>
            <DataTable data={transcript.courseSummary || []} columns={courseColumns} searchable pagination pageSize={6} />
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Results</h3>
            <DataTable data={transcript.results || []} columns={resultColumns} searchable pagination pageSize={10} />
          </Card>
        </>
      ) : (
        <>
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Summaries</h3>
            <DataTable data={subjectSummaries} columns={subjectColumns} searchable pagination pageSize={8} />
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Aggregates</h3>
            <DataTable data={courseSummaries} columns={courseColumns} searchable pagination pageSize={8} />
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Result Entries</h3>
            <DataTable data={allResults} columns={resultColumns} searchable pagination pageSize={10} />
          </Card>
        </>
      )}
    </div>
  )
}

export default Results