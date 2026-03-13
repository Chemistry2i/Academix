import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon,
  ChartBarIcon,
  AcademicCapIcon,
  TrophyIcon,
  ClipboardDocumentListIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import StatCard from '../components/common/StatCard'
import { classService } from '../services/classService'
import { studentService } from '../services/studentService'
import subjectService from '../services/subjectService'
import { courseService } from '../services/courseService'
import { resultsService } from '../services/resultsService'
import { teacherPortalService } from '../services/teacherPortalService'
import { calculateGrade, getGradeBadgeClasses, summarizeGrades } from '../utils/grading'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { useLocation } from 'react-router-dom'

const TERMS = ['Term 1', 'Term 2', 'Term 3']
const ASSESSMENT_TYPES = ['TEST', 'QUIZ', 'ASSIGNMENT', 'MIDTERM', 'EXAM', 'COURSEWORK']

const normalizeArray = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []
  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key]
  }
  const firstArray = Object.values(payload).find((value) => Array.isArray(value))
  return firstArray || []
}

const INITIAL_ASSESSMENT_FORM = {
  title: '',
  type: 'TEST',
  classId: '',
  subjectId: '',
  term: 'Term 1',
  academicYear: String(new Date().getFullYear()),
  maxScore: 100,
  weight: 100,
  date: new Date().toISOString().slice(0, 10)
}

const Gradebook = () => {
  const { user } = useAuth()
  const location = useLocation()
  const isTeacherPortal = location.pathname.startsWith('/teacher')
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [assessments, setAssessments] = useState([])
  const [teacherScope, setTeacherScope] = useState(null)
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [selectedTerm, setSelectedTerm] = useState('')
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('')
  const [scoreEntries, setScoreEntries] = useState([])
  const [stats, setStats] = useState({ totalAssessments: 0, gradedEntries: 0, classAverage: 0, passRate: 0 })
  const [showAssessmentModal, setShowAssessmentModal] = useState(false)
  const [assessmentForm, setAssessmentForm] = useState(INITIAL_ASSESSMENT_FORM)
  const [loading, setLoading] = useState(true)
  const [savingResults, setSavingResults] = useState(false)

  const availableClasses = useMemo(() => {
    return isTeacherPortal ? teacherScope?.assignedClasses || [] : classes
  }, [classes, isTeacherPortal, teacherScope])

  const availableSubjects = useMemo(() => {
    return isTeacherPortal ? teacherPortalService.filterSubjectsByScope(subjects, teacherScope || {}) : subjects
  }, [isTeacherPortal, subjects, teacherScope])

  const availableStudents = useMemo(() => {
    return isTeacherPortal ? teacherPortalService.filterStudentsByScope(students, teacherScope || {}) : students
  }, [isTeacherPortal, students, teacherScope])

  const selectedAssessment = useMemo(
    () => assessments.find((item) => item.id === selectedAssessmentId) || null,
    [assessments, selectedAssessmentId]
  )
  const selectedClass = useMemo(
    () => availableClasses.find((item) => String(item.id) === String(selectedClassId || selectedAssessment?.classId || '')) || null,
    [availableClasses, selectedClassId, selectedAssessment]
  )
  const selectedSubject = useMemo(
    () => availableSubjects.find((item) => String(item.id) === String(selectedSubjectId || selectedAssessment?.subjectId || '')) || null,
    [availableSubjects, selectedSubjectId, selectedAssessment]
  )

  const currentLevel = useMemo(() => {
    const formLevel = Number(selectedClass?.formLevel || 0)
    return formLevel >= 5 ? 'A_LEVEL' : 'O_LEVEL'
  }, [selectedClass])

  const currentScheme = useMemo(() => resultsService.getGradingScheme(currentLevel), [currentLevel])

  const loadPageData = async () => {
    setLoading(true)
    try {
      const [classData, subjectData, studentData, courseData] = await Promise.all([
        classService.getClasses().catch(() => []),
        subjectService.getAllSubjects().catch(() => []),
        studentService.getStudents(true).catch(() => ({ students: [] })),
        courseService.getCourses().catch(() => [])
      ])

      const normalizedClasses = normalizeArray(classData, ['classes', 'data'])
      const normalizedSubjects = normalizeArray(subjectData, ['subjects', 'data'])

      setClasses(normalizedClasses)
      setSubjects(normalizedSubjects)
      setStudents(normalizeArray(studentData, ['students', 'data']))
      setCourses(normalizeArray(courseData, ['courses', 'data']))

      if (isTeacherPortal) {
        const scope = await teacherPortalService.getTeacherContext(user, {
          classes: normalizedClasses,
          subjects: normalizedSubjects
        })
        setTeacherScope(scope)
      }
    } finally {
      setLoading(false)
    }
  }

  const loadAssessmentData = async () => {
    const filterClassId = selectedClassId || undefined
    const filterSubjectId = selectedSubjectId || undefined
    const filterTerm = selectedTerm || undefined

    const [assessmentData, resultData] = await Promise.all([
      resultsService.getAssessments({ classId: filterClassId, subjectId: filterSubjectId, term: filterTerm }),
      resultsService.getResults({ classId: filterClassId, subjectId: filterSubjectId, term: filterTerm })
    ])

    const scopedAssessments = isTeacherPortal
      ? teacherPortalService.filterAssessmentsByScope(assessmentData, teacherScope || {})
      : assessmentData
    const scopedResults = isTeacherPortal
      ? teacherPortalService.filterResultsByScope(resultData, teacherScope || {})
      : resultData
    const summary = summarizeGrades(scopedResults)

    setAssessments(scopedAssessments)
    setStats({
      totalAssessments: scopedAssessments.length,
      gradedEntries: scopedResults.length,
      classAverage: summary.averagePercentage,
      passRate: summary.passRate
    })

    if (selectedAssessmentId && !scopedAssessments.some((item) => item.id === selectedAssessmentId)) {
      setSelectedAssessmentId('')
    }
  }

  useEffect(() => {
    loadPageData()
  }, [isTeacherPortal, user])

  useEffect(() => {
    loadAssessmentData()
  }, [selectedClassId, selectedSubjectId, selectedTerm, isTeacherPortal, teacherScope])

  useEffect(() => {
    if (selectedClassId && !availableClasses.some((item) => String(item.id) === String(selectedClassId))) {
      setSelectedClassId('')
    }
  }, [availableClasses, selectedClassId])

  useEffect(() => {
    if (selectedSubjectId && !availableSubjects.some((item) => String(item.id) === String(selectedSubjectId))) {
      setSelectedSubjectId('')
    }
  }, [availableSubjects, selectedSubjectId])

  useEffect(() => {
    const buildScoreSheet = async () => {
      if (!selectedAssessment || !selectedClass) {
        setScoreEntries([])
        return
      }

      const roster = resultsService.buildRoster({
        students: availableStudents,
        classItem: { id: selectedClass.id, name: selectedClass.name || selectedClass.className, courseId: selectedClass.course?.id || selectedClass.courseId, courseName: selectedClass.course?.name || selectedClass.courseName },
        classes,
        courses
      })

      const savedResults = await resultsService.getAssessmentResults(selectedAssessment.id)

      const merged = roster.map((student) => {
        const saved = savedResults.find((item) => String(item.studentId) === String(student.studentId))
        const rawScore = saved?.rawScore ?? ''
        const calculated = rawScore === ''
          ? { percentage: 0, grade: '-', points: 0, remark: '' }
          : calculateGrade({ rawScore, maxScore: selectedAssessment.maxScore, gradingScheme: currentScheme })

        return {
          ...student,
          rawScore,
          ...calculated
        }
      })

      setScoreEntries(merged)
    }

    buildScoreSheet()
  }, [selectedAssessmentId, availableStudents, selectedClass, classes, courses, selectedAssessment, currentScheme])

  const statsCards = [
    { title: 'Assessments', value: stats.totalAssessments, change: `${selectedTerm} view`, icon: ClipboardDocumentListIcon, color: 'blue' },
    { title: 'Grades Entered', value: stats.gradedEntries, change: 'Stored results', icon: AcademicCapIcon, color: 'green' },
    { title: 'Class Average', value: `${stats.classAverage}%`, change: 'Auto-calculated', icon: ChartBarIcon, color: 'purple' },
    { title: 'Pass Rate', value: `${stats.passRate}%`, change: 'Based on grading scheme', icon: TrophyIcon, color: 'yellow' }
  ]

  const handleCreateAssessment = async () => {
    if (!assessmentForm.title.trim()) {
      toast.error('Assessment title is required.')
      return
    }
    if (!assessmentForm.classId || !assessmentForm.subjectId) {
      toast.error('Select both class and subject.')
      return
    }

    const classItem = availableClasses.find((item) => String(item.id) === String(assessmentForm.classId))
    const subjectItem = availableSubjects.find((item) => String(item.id) === String(assessmentForm.subjectId))
    const linkedCourse = courses.find((course) => String(course.id) === String(classItem?.course?.id || classItem?.courseId)) || null

    const assessment = await resultsService.saveAssessment({
      ...assessmentForm,
      className: classItem?.name || classItem?.className || '',
      subjectName: subjectItem?.name || subjectItem?.subjectName || '',
      level: Number(classItem?.formLevel || 0) >= 5 ? 'A_LEVEL' : 'O_LEVEL',
      courseId: linkedCourse?.id || '',
      courseName: linkedCourse?.name || classItem?.courseName || '',
      createdBy: `${user?.firstName || 'Teacher'} ${user?.lastName || ''}`.trim()
    })

    setSelectedClassId(String(assessment.classId))
    setSelectedSubjectId(String(assessment.subjectId))
    setSelectedTerm(assessment.term)
    setSelectedAssessmentId(assessment.id)
    setAssessmentForm(INITIAL_ASSESSMENT_FORM)
    setShowAssessmentModal(false)
    await loadAssessmentData()
    toast.success('Assessment created.')
  }

  const handleDeleteAssessment = async (assessmentId) => {
    const confirmed = window.confirm('Delete this assessment and all entered results?')
    if (!confirmed) return
    await resultsService.deleteAssessment(assessmentId)
    if (selectedAssessmentId === assessmentId) {
      setSelectedAssessmentId('')
    }
    await loadAssessmentData()
    toast.success('Assessment deleted.')
  }

  const handleScoreChange = (studentId, value) => {
    setScoreEntries((current) => current.map((entry) => {
      if (String(entry.studentId) !== String(studentId)) return entry
      const nextRaw = value === '' ? '' : Number(value)
      if (nextRaw === '') {
        return { ...entry, rawScore: '', percentage: 0, grade: '-', points: 0, remark: '' }
      }
      const calculated = calculateGrade({ rawScore: nextRaw, maxScore: selectedAssessment?.maxScore || 100, gradingScheme: currentScheme })
      return { ...entry, rawScore: nextRaw, ...calculated }
    }))
  }

  const handleSaveResults = async () => {
    if (!selectedAssessment) {
      toast.error('Select an assessment first.')
      return
    }
    setSavingResults(true)
    try {
      await resultsService.saveAssessmentResults({
        assessment: selectedAssessment,
        entries: scoreEntries,
        gradingScheme: currentScheme
      })
      await loadAssessmentData()
      toast.success('Results saved successfully.')
    } catch (error) {
      console.error('Failed to save results:', error)
      toast.error('Failed to save results.')
    } finally {
      setSavingResults(false)
    }
  }

  const enteredCount = scoreEntries.filter((entry) => entry.rawScore !== '').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gradebook</h1>
          <p className="text-gray-600">
            {isTeacherPortal
              ? 'Create assessments and enter marks only for your assigned classes and subjects.'
              : 'Create assessments, enter marks, and apply one grading scheme consistently.'}
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setShowAssessmentModal(true)}>
          <PlusIcon className="h-5 w-5" />
          New Assessment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">All classes</option>
              {availableClasses.map((item) => (
                <option key={item.id} value={item.id}>{item.name || item.className}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select value={selectedSubjectId} onChange={(event) => setSelectedSubjectId(event.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">All subjects</option>
              {availableSubjects.map((item) => (
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assessment</label>
              <select
                value={selectedAssessmentId}
                onChange={(event) => {
                  const nextAssessment = assessments.find((item) => item.id === event.target.value)
                  setSelectedAssessmentId(event.target.value)
                  if (nextAssessment) {
                    setSelectedClassId(String(nextAssessment.classId || ''))
                    setSelectedSubjectId(String(nextAssessment.subjectId || ''))
                    setSelectedTerm(nextAssessment.term || '')
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
              <option value="">Select assessment</option>
              {assessments.map((item) => (
                <option key={item.id} value={item.id}>{item.title} • {item.className} • {item.subjectName}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Mark Entry</h3>
              <p className="text-sm text-gray-500">
                {selectedAssessment
                  ? `${selectedAssessment.title} • ${selectedAssessment.subjectName} • ${selectedAssessment.className}`
                  : 'Select an assessment to enter student scores.'}
              </p>
            </div>
            <div className="text-sm text-gray-500">Entered: {enteredCount}/{scoreEntries.length}</div>
          </div>

          {selectedAssessment ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remark</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {scoreEntries.map((entry) => (
                    <tr key={entry.studentId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{entry.studentName}</div>
                        <div className="text-xs text-gray-500">{entry.studentIdentifier}</div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          max={selectedAssessment.maxScore}
                          value={entry.rawScore}
                          onChange={(event) => handleScoreChange(entry.studentId, event.target.value)}
                          className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                        <span className="text-xs text-gray-500 ml-2">/ {selectedAssessment.maxScore}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{entry.rawScore === '' ? '-' : `${entry.percentage}%`}</td>
                      <td className="px-4 py-3">
                        {entry.rawScore === '' ? (
                          <span className="text-sm text-gray-400">-</span>
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeBadgeClasses(entry.grade)}`}>
                            {entry.grade}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{entry.remark || '-'}</td>
                    </tr>
                  ))}
                  {!scoreEntries.length && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500">No students found in this class.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-gray-500">Choose an assessment to begin mark entry.</div>
          )}

          <div className="mt-4 flex justify-end">
            <Button onClick={handleSaveResults} isLoading={savingResults} disabled={!selectedAssessment || !scoreEntries.length}>
              Save Results
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Assessments</h3>
              <p className="text-sm text-gray-500">Current filtered list</p>
            </div>
          </div>
          <div className="space-y-3 max-h-[540px] overflow-y-auto">
            {assessments.map((assessment) => (
              <div key={assessment.id} className={`border rounded-xl p-4 ${assessment.id === selectedAssessmentId ? 'border-primary-400 bg-primary-50' : 'border-gray-200'}`}>
                <button className="text-left w-full" onClick={() => setSelectedAssessmentId(assessment.id)}>
                  <div className="font-medium text-gray-900">{assessment.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{assessment.className} • {assessment.subjectName}</div>
                  <div className="text-xs text-gray-500 mt-1">{assessment.term} • {assessment.date} • {assessment.maxScore} marks</div>
                </button>
                <div className="mt-3 flex justify-end">
                  <Button size="sm" variant="danger" onClick={() => handleDeleteAssessment(assessment.id)}>
                    <TrashIcon className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {!assessments.length && (
              <div className="text-sm text-gray-500">No assessments found for the selected filters.</div>
            )}
          </div>
        </Card>
      </div>

      <AnimatePresence>
        {showAssessmentModal && (
          <motion.div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl" initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.96 }}>
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">New Assessment</h2>
                  <p className="text-sm text-gray-500">Assessments stay mapped to one subject and one class.</p>
                </div>
                <button onClick={() => setShowAssessmentModal(false)} className="text-gray-400 hover:text-gray-700">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input value={assessmentForm.title} onChange={(event) => setAssessmentForm((current) => ({ ...current, title: event.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select value={assessmentForm.classId} onChange={(event) => setAssessmentForm((current) => ({ ...current, classId: event.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                    <option value="">Select class</option>
                    {availableClasses.map((item) => (
                      <option key={item.id} value={item.id}>{item.name || item.className}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select value={assessmentForm.subjectId} onChange={(event) => setAssessmentForm((current) => ({ ...current, subjectId: event.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                    <option value="">Select subject</option>
                    {availableSubjects.map((item) => (
                      <option key={item.id} value={item.id}>{item.name || item.subjectName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={assessmentForm.type} onChange={(event) => setAssessmentForm((current) => ({ ...current, type: event.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                    {ASSESSMENT_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                  <select value={assessmentForm.term} onChange={(event) => setAssessmentForm((current) => ({ ...current, term: event.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                    {TERMS.map((term) => (
                      <option key={term} value={term}>{term}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                  <input value={assessmentForm.academicYear} onChange={(event) => setAssessmentForm((current) => ({ ...current, academicYear: event.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Score</label>
                  <input type="number" min="1" value={assessmentForm.maxScore} onChange={(event) => setAssessmentForm((current) => ({ ...current, maxScore: Number(event.target.value) }))} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (%)</label>
                  <input type="number" min="1" max="100" value={assessmentForm.weight} onChange={(event) => setAssessmentForm((current) => ({ ...current, weight: Number(event.target.value) }))} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={assessmentForm.date} onChange={(event) => setAssessmentForm((current) => ({ ...current, date: event.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowAssessmentModal(false)}>Cancel</Button>
                <Button onClick={handleCreateAssessment}>Create Assessment</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Gradebook