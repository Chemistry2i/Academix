import apiClient from './apiClient'
import { classService } from './classService'
import subjectService from './subjectService'
import { calculateGrade, getDefaultGradingScheme, summarizeGrades } from '../utils/grading'

const RESULTS_BASE_URL = '/results'
const ASSESSMENTS_STORAGE_KEY = 'academix.assessments.v1'
const RESULTS_STORAGE_KEY = 'academix.results.v1'
const GRADING_SCHEMES_STORAGE_KEY = 'academix.gradingSchemes.v1'

let classCache = null
let subjectCache = null

const normalizeArray = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []

  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key]
  }

  const firstArray = Object.values(payload).find((value) => Array.isArray(value))
  return firstArray || []
}

const getClasses = async () => {
  if (!classCache) {
    classCache = classService.getClasses().catch(() => [])
  }

  return classCache
}

const getSubjects = async () => {
  if (!subjectCache) {
    subjectCache = subjectService.getAllSubjects().catch(() => [])
  }

  return subjectCache
}

const resolveClassName = async (classId) => {
  if (!classId) return ''

  const classList = normalizeArray(await getClasses(), ['classes', 'data'])
  const matchedClass = classList.find((item) => String(item.id) === String(classId))
  return matchedClass?.name || matchedClass?.className || String(classId)
}

const resolveSubjectFilter = async (subjectId) => {
  if (!subjectId) return { subjectId: '', subjectCode: '', subjectName: '' }

  const subjectList = normalizeArray(await getSubjects(), ['subjects', 'data'])
  const matchedSubject = subjectList.find((item) => String(item.id) === String(subjectId))

  return {
    subjectId: String(matchedSubject?.id || subjectId),
    subjectCode: matchedSubject?.code || matchedSubject?.subjectCode || '',
    subjectName: matchedSubject?.name || matchedSubject?.subjectName || matchedSubject?.code || ''
  }
}

const matchesClass = (result, classFilter, classId) => {
  if (!classFilter) return true

  return String(result.className || '').trim().toLowerCase() === String(classFilter || '').trim().toLowerCase() ||
    String(result.className || '').trim().toLowerCase() === String(classId || '').trim().toLowerCase() ||
    String(result.classId || '').trim().toLowerCase() === String(classId || '').trim().toLowerCase()
}

const matchesSubject = (result, subjectFilter, subjectId) => {
  if (!subjectFilter) return true

  const subjectName = String(subjectFilter.subjectName || '').trim().toLowerCase()
  const subjectCode = String(subjectFilter.subjectCode || '').trim().toLowerCase()
  const subjectIdString = String(subjectId || '').trim().toLowerCase()
  const resultSubjectCode = String(result.subjectCode || '').trim().toLowerCase()
  const resultSubjectName = String(result.subjectName || '').trim().toLowerCase()
  const resultSubjectId = String(result.subjectId || '').trim().toLowerCase()

  return resultSubjectCode === subjectCode ||
    resultSubjectName === subjectName ||
    resultSubjectId === subjectIdString ||
    resultSubjectCode === subjectIdString
}

const readJson = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (error) {
    console.error(`Failed to read ${key}:`, error)
    return fallback
  }
}

const writeJson = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Failed to write ${key}:`, error)
  }
}

const createId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`

const normalizeString = (value) => String(value || '').trim().toLowerCase()

const getClassIdentity = (student) => {
  return {
    id: student.schoolClass?.id || student.classId || student.currentClass || '',
    name: student.schoolClass?.name || student.className || student.currentClass || ''
  }
}

const matchesStudentToClass = (student, selectedClass) => {
  if (!selectedClass) return true
  const studentClass = getClassIdentity(student)
  if (!selectedClass.id && !selectedClass.name) return true

  return String(studentClass.id) === String(selectedClass.id) ||
    normalizeString(studentClass.name) === normalizeString(selectedClass.name)
}

const getCourseForContext = ({ classItem, student, courses = [] }) => {
  const directCourseId = classItem?.course?.id || classItem?.courseId || student?.courseId || ''
  const directCourseName = classItem?.course?.name || classItem?.courseName || student?.combination || ''

  if (directCourseId) {
    return courses.find((course) => String(course.id) === String(directCourseId)) || null
  }

  if (directCourseName) {
    return courses.find((course) => {
      return normalizeString(course.name) === normalizeString(directCourseName) ||
        normalizeString(course.code) === normalizeString(directCourseName)
    }) || null
  }

  return null
}

class ResultsService {
  getStoredAssessments() {
    return readJson(ASSESSMENTS_STORAGE_KEY, [])
  }

  setStoredAssessments(assessments) {
    writeJson(ASSESSMENTS_STORAGE_KEY, assessments)
  }

  getStoredResults() {
    return readJson(RESULTS_STORAGE_KEY, [])
  }

  setStoredResults(results) {
    writeJson(RESULTS_STORAGE_KEY, results)
  }

  getGradingSchemes() {
    const stored = readJson(GRADING_SCHEMES_STORAGE_KEY, null)
    if (stored && Object.keys(stored).length) {
      return stored
    }

    const defaults = {
      O_LEVEL: getDefaultGradingScheme('O_LEVEL'),
      A_LEVEL: getDefaultGradingScheme('A_LEVEL')
    }
    writeJson(GRADING_SCHEMES_STORAGE_KEY, defaults)
    return defaults
  }

  getGradingScheme(level = 'O_LEVEL') {
    return this.getGradingSchemes()[level] || getDefaultGradingScheme(level)
  }

  saveGradingScheme(level, scheme) {
    const schemes = this.getGradingSchemes()
    schemes[level] = scheme
    writeJson(GRADING_SCHEMES_STORAGE_KEY, schemes)
    return schemes[level]
  }

  async getAssessments(filters = {}) {
    const assessments = this.getStoredAssessments()
    return assessments.filter((assessment) => {
      if (filters.classId && String(assessment.classId) !== String(filters.classId)) return false
      if (filters.subjectId && String(assessment.subjectId) !== String(filters.subjectId)) return false
      if (filters.term && assessment.term !== filters.term) return false
      if (filters.academicYear && assessment.academicYear !== filters.academicYear) return false
      return true
    }).sort((left, right) => new Date(right.date || 0) - new Date(left.date || 0))
  }

  async saveAssessment(payload) {
    const assessments = this.getStoredAssessments()
    const now = new Date().toISOString()
    const record = {
      id: payload.id || createId('ASM'),
      title: payload.title?.trim() || '',
      type: payload.type || 'TEST',
      subjectId: payload.subjectId || '',
      subjectName: payload.subjectName?.trim() || '',
      classId: payload.classId || '',
      className: payload.className?.trim() || '',
      term: payload.term || 'Term 1',
      academicYear: payload.academicYear || String(new Date().getFullYear()),
      maxScore: Number(payload.maxScore || 100),
      weight: Number(payload.weight || 100),
      date: payload.date || new Date().toISOString().slice(0, 10),
      level: payload.level || 'O_LEVEL',
      courseId: payload.courseId || '',
      courseName: payload.courseName || '',
      createdBy: payload.createdBy || 'Teacher',
      createdAt: payload.createdAt || now,
      updatedAt: now
    }

    const index = assessments.findIndex((assessment) => assessment.id === record.id)
    if (index >= 0) {
      assessments[index] = { ...assessments[index], ...record, createdAt: assessments[index].createdAt || record.createdAt }
    } else {
      assessments.unshift(record)
    }

    this.setStoredAssessments(assessments)
    return record
  }

  async deleteAssessment(id) {
    const assessments = this.getStoredAssessments().filter((assessment) => assessment.id !== id)
    const results = this.getStoredResults().filter((result) => result.assessmentId !== id)
    this.setStoredAssessments(assessments)
    this.setStoredResults(results)
    return true
  }

  async getResults(filters = {}) {
    try {
      let response

      if (filters.studentId && !filters.classId && !filters.subjectId && !filters.examId && !filters.className) {
        response = await apiClient.get(`${RESULTS_BASE_URL}/student/${filters.studentId}`)
      } else if (filters.examId && !filters.classId && !filters.subjectId && !filters.studentId && !filters.className) {
        response = await apiClient.get(`${RESULTS_BASE_URL}/exam/${filters.examId}`)
      } else if (filters.className && !filters.subjectId && !filters.studentId && !filters.examId) {
        response = await apiClient.get(`${RESULTS_BASE_URL}/class/${encodeURIComponent(filters.className)}`)
      } else {
        response = await apiClient.get(RESULTS_BASE_URL)
      }

      const results = normalizeArray(response.data, ['results', 'data'])
      const classFilter = filters.className || (filters.classId ? await resolveClassName(filters.classId) : '')
      const subjectFilter = filters.subjectId || filters.subjectCode || filters.subjectName
        ? await resolveSubjectFilter(filters.subjectId || filters.subjectCode || filters.subjectName)
        : null

      return results.filter((result) => {
        if (filters.assessmentId && String(result.assessmentId) !== String(filters.assessmentId)) return false
        if (filters.studentId && String(result.studentId) !== String(filters.studentId)) return false
        if (filters.examId && String(result.examId) !== String(filters.examId)) return false
        if (filters.classId && !matchesClass(result, classFilter, filters.classId)) return false
        if (filters.className && String(result.className || '').trim().toLowerCase() !== String(filters.className || '').trim().toLowerCase()) return false
        if (subjectFilter && !matchesSubject(result, subjectFilter, filters.subjectId || filters.subjectCode || filters.subjectName)) return false
        if (filters.term && String(result.term) !== String(filters.term)) return false
        if (filters.academicYear && String(result.academicYear) !== String(filters.academicYear)) return false
        return true
      })
    } catch (error) {
      console.error('Error fetching results from API:', error)
      throw error?.response?.data || error
    }
  }

  async getAssessmentResults(assessmentId) {
    return this.getResults({ assessmentId })
  }

  async saveAssessmentResults({ assessment, entries = [], gradingScheme }) {
    const existingResults = this.getStoredResults().filter((result) => result.assessmentId !== assessment.id)
    const calculatedEntries = entries
      .filter((entry) => entry.rawScore !== '' && entry.rawScore !== null && entry.rawScore !== undefined)
      .map((entry) => {
        const calculated = calculateGrade({
          rawScore: entry.rawScore,
          maxScore: assessment.maxScore,
          gradingScheme
        })

        return {
          id: createId('RES'),
          assessmentId: assessment.id,
          assessmentTitle: assessment.title,
          studentId: entry.studentId,
          studentName: entry.studentName,
          studentIdentifier: entry.studentIdentifier || '',
          classId: assessment.classId,
          className: assessment.className,
          subjectId: assessment.subjectId,
          subjectName: assessment.subjectName,
          courseId: assessment.courseId || entry.courseId || '',
          courseName: assessment.courseName || entry.courseName || '',
          term: assessment.term,
          academicYear: assessment.academicYear,
          assessmentType: assessment.type,
          date: assessment.date,
          enteredAt: new Date().toISOString(),
          ...calculated
        }
      })

    this.setStoredResults([...existingResults, ...calculatedEntries])
    return calculatedEntries
  }

  buildRoster({ students = [], classItem = null, classes = [], courses = [] }) {
    const selectedClass = classItem || {}
    const filteredStudents = students.filter((student) => matchesStudentToClass(student, selectedClass))

    return filteredStudents.map((student) => {
      const linkedCourse = getCourseForContext({ classItem: selectedClass, student, courses })
      return {
        studentId: student.id,
        studentName: [student.firstName, student.otherNames, student.lastName].filter(Boolean).join(' '),
        studentIdentifier: student.studentId || '',
        classId: selectedClass.id || getClassIdentity(student).id,
        className: selectedClass.name || getClassIdentity(student).name,
        courseId: linkedCourse?.id || '',
        courseName: linkedCourse?.name || student.combination || ''
      }
    })
  }

  async getGradebookStats(filters = {}) {
    const assessments = await this.getAssessments(filters)
    const results = await this.getResults(filters)
    const summary = summarizeGrades(results)

    return {
      totalAssessments: assessments.length,
      gradedEntries: results.length,
      classAverage: summary.averagePercentage,
      passRate: summary.passRate
    }
  }

  async getSubjectSummaries({ filters = {} } = {}) {
    const results = await this.getResults(filters)
    const grouped = results.reduce((accumulator, result) => {
      const key = `${result.subjectId || result.subjectName}::${result.classId || result.className}`
      if (!accumulator[key]) {
        accumulator[key] = []
      }
      accumulator[key].push(result)
      return accumulator
    }, {})

    return Object.values(grouped).map((items) => {
      const first = items[0]
      const summary = summarizeGrades(items)
      return {
        subjectId: first.subjectId,
        subjectName: first.subjectName,
        classId: first.classId,
        className: first.className,
        assessmentCount: new Set(items.map((item) => item.assessmentId)).size,
        resultCount: items.length,
        averagePercentage: summary.averagePercentage,
        passRate: summary.passRate,
        highestScore: summary.highestScore,
        lowestScore: summary.lowestScore
      }
    }).sort((left, right) => right.averagePercentage - left.averagePercentage)
  }

  async getCourseSummaries({ filters = {}, courses = [] } = {}) {
    const results = await this.getResults(filters)
    const groupedByCourse = results.reduce((accumulator, result) => {
      let key = result.courseId || result.courseName

      if (!key && courses.length) {
        const matchedCourse = courses.find((course) => {
          const allSubjects = [...(course.principalSubjects || []), ...(course.subsidiarySubjects || [])]
          return allSubjects.some((subject) => normalizeString(subject) === normalizeString(result.subjectName))
        })
        key = matchedCourse?.id || matchedCourse?.name || ''
      }

      if (!key) return accumulator
      if (!accumulator[key]) accumulator[key] = []
      accumulator[key].push(result)
      return accumulator
    }, {})

    return Object.entries(groupedByCourse).map(([key, items]) => {
      const matchedCourse = courses.find((course) => String(course.id) === String(key) || normalizeString(course.name) === normalizeString(key))
      const summary = summarizeGrades(items)

      return {
        courseId: matchedCourse?.id || key,
        courseName: matchedCourse?.name || items[0]?.courseName || key,
        subjectsCovered: new Set(items.map((item) => item.subjectName)).size,
        resultCount: items.length,
        averagePercentage: summary.averagePercentage,
        passRate: summary.passRate,
        highestScore: summary.highestScore,
        lowestScore: summary.lowestScore
      }
    }).sort((left, right) => right.averagePercentage - left.averagePercentage)
  }

  async getStudentTranscript({ studentId, courses = [] } = {}) {
    const results = await this.getResults({ studentId })
    const summary = summarizeGrades(results)
    const groupedSubjects = results.reduce((accumulator, result) => {
      if (!accumulator[result.subjectName]) accumulator[result.subjectName] = []
      accumulator[result.subjectName].push(result)
      return accumulator
    }, {})

    const subjectSummaries = Object.entries(groupedSubjects).map(([subjectName, items]) => {
      const resultSummary = summarizeGrades(items)
      return {
        subjectName,
        assessmentCount: items.length,
        averagePercentage: resultSummary.averagePercentage,
        bestGrade: items.sort((left, right) => right.percentage - left.percentage)[0]?.grade || '-',
        points: Number((items.reduce((sum, item) => sum + Number(item.points || 0), 0) / items.length).toFixed(2))
      }
    })

    const courseSummary = await this.getCourseSummaries({ filters: { studentId }, courses })

    return {
      results,
      summary,
      subjectSummaries,
      courseSummary
    }
  }

  async getResultStatistics() {
    try {
      const response = await apiClient.get(`${RESULTS_BASE_URL}/statistics`)
      return response.data
    } catch (error) {
      console.error('Error fetching result statistics:', error)
      throw error?.response?.data || error
    }
  }
}

export const resultsService = new ResultsService()

export default resultsService