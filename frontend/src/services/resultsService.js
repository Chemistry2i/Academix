import { calculateGrade, getDefaultGradingScheme, summarizeGrades } from '../utils/grading'

const ASSESSMENTS_STORAGE_KEY = 'academix.assessments.v1'
const RESULTS_STORAGE_KEY = 'academix.results.v1'
const GRADING_SCHEMES_STORAGE_KEY = 'academix.gradingSchemes.v1'

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
    const results = this.getStoredResults()
    return results.filter((result) => {
      if (filters.assessmentId && result.assessmentId !== filters.assessmentId) return false
      if (filters.classId && String(result.classId) !== String(filters.classId)) return false
      if (filters.subjectId && String(result.subjectId) !== String(filters.subjectId)) return false
      if (filters.studentId && String(result.studentId) !== String(filters.studentId)) return false
      if (filters.term && result.term !== filters.term) return false
      if (filters.academicYear && result.academicYear !== filters.academicYear) return false
      return true
    })
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
}

export const resultsService = new ResultsService()

export default resultsService