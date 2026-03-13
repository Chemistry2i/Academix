const ASSIGNMENTS_STORAGE_KEY = 'academix.assignments.v1'
const SUBMISSIONS_STORAGE_KEY = 'academix.assignmentSubmissions.v1'
const LEGACY_SUBMISSION_KEY = '__legacy__'

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

const getAssignmentsFromStorage = () => readJson(ASSIGNMENTS_STORAGE_KEY, [])
const getRawSubmissionsFromStorage = () => readJson(SUBMISSIONS_STORAGE_KEY, {})

const persistAssignments = (assignments) => writeJson(ASSIGNMENTS_STORAGE_KEY, assignments)
const persistSubmissions = (submissions) => writeJson(SUBMISSIONS_STORAGE_KEY, submissions)

const normalizeString = (value) => String(value || '').trim().toLowerCase()

const resolveStudentClass = (studentContext = {}) => {
  return {
    classId: studentContext.classId || studentContext.schoolClass?.id || '',
    className: studentContext.className || studentContext.currentClass || studentContext.schoolClass?.name || ''
  }
}

const buildStudentKey = (studentContext = {}) => {
  if (studentContext.studentId || studentContext.id) return `id:${studentContext.studentId || studentContext.id}`
  if (studentContext.studentEmail || studentContext.email) return `email:${normalizeString(studentContext.studentEmail || studentContext.email)}`
  return LEGACY_SUBMISSION_KEY
}

const normalizeStudentContext = (studentContext = {}) => {
  const { classId, className } = resolveStudentClass(studentContext)
  return {
    studentId: studentContext.studentId || studentContext.id || '',
    studentEmail: studentContext.studentEmail || studentContext.email || '',
    studentName: studentContext.studentName || [studentContext.firstName, studentContext.lastName].filter(Boolean).join(' ').trim() || 'Student',
    classId,
    className,
    studentKey: buildStudentKey(studentContext)
  }
}

const normalizeSubmissionBucket = (bucket) => {
  if (!bucket) return {}

  if (bucket.submittedAt) {
    return {
      [LEGACY_SUBMISSION_KEY]: {
        ...bucket,
        studentKey: LEGACY_SUBMISSION_KEY,
        studentName: bucket.studentName || 'Student'
      }
    }
  }

  if (typeof bucket === 'object') return bucket
  return {}
}

const getSubmissionsFromStorage = () => {
  const raw = getRawSubmissionsFromStorage()
  return Object.entries(raw).reduce((accumulator, [assignmentId, bucket]) => {
    accumulator[assignmentId] = normalizeSubmissionBucket(bucket)
    return accumulator
  }, {})
}

const getSubmissionBucket = (assignmentId) => {
  const submissions = getSubmissionsFromStorage()
  return normalizeSubmissionBucket(submissions[assignmentId])
}

const getSubmissionValues = (assignmentId) => {
  const bucket = getSubmissionBucket(assignmentId)
  return Object.entries(bucket).map(([studentKey, submission]) => ({
    studentKey,
    ...submission
  }))
}

const getStudentSubmission = (assignmentId, studentContext = {}) => {
  const student = normalizeStudentContext(studentContext)
  const bucket = getSubmissionBucket(assignmentId)
  return bucket[student.studentKey] || null
}

const filterAssignmentsByContext = (assignments = [], options = {}) => {
  return assignments.filter((assignment) => {
    if (options.classId && String(assignment.classId || '') !== String(options.classId)) return false
    if (options.className && normalizeString(assignment.className) !== normalizeString(options.className)) return false
    if (options.subjectId && String(assignment.subjectId || '') !== String(options.subjectId)) return false
    if (options.subjectName && normalizeString(assignment.subjectName) !== normalizeString(options.subjectName)) return false
    return true
  })
}

const sortAssignments = (assignments) => {
  return [...assignments].sort((left, right) => {
    const leftDate = new Date(`${left.dueDate || ''}T${left.dueTime || '23:59'}`).getTime()
    const rightDate = new Date(`${right.dueDate || ''}T${right.dueTime || '23:59'}`).getTime()
    return rightDate - leftDate
  })
}

const createAssignmentId = () => {
  return `ASM-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

const getAssignmentState = (assignment) => {
  if (assignment.status === 'DRAFT') return 'draft'
  if (assignment.status === 'CLOSED') return 'closed'

  const dueAt = new Date(`${assignment.dueDate || ''}T${assignment.dueTime || '23:59'}`)
  if (!Number.isNaN(dueAt.getTime()) && dueAt.getTime() < Date.now()) {
    return 'overdue'
  }

  return 'active'
}

const enrichAssignment = (assignment, options = {}) => {
  const submissions = getSubmissionValues(assignment.id)
  const studentSubmission = options.studentContext
    ? getStudentSubmission(assignment.id, options.studentContext)
    : null
  const reviewedCount = submissions.filter((item) => item.reviewedAt || item.status === 'reviewed').length

  const submissionStatus = studentSubmission
    ? (studentSubmission.reviewedAt || studentSubmission.status === 'reviewed' ? 'reviewed' : 'submitted')
    : (getAssignmentState(assignment) === 'overdue' ? 'overdue' : 'pending')

  return {
    ...assignment,
    state: getAssignmentState(assignment),
    submissionStatus,
    submittedAt: studentSubmission?.submittedAt || null,
    submissionNotes: studentSubmission?.notes || '',
    feedback: studentSubmission?.feedback || '',
    score: studentSubmission?.score ?? null,
    reviewedAt: studentSubmission?.reviewedAt || null,
    submissionsCount: submissions.length,
    reviewedSubmissionsCount: reviewedCount,
    pendingReviewCount: Math.max(submissions.length - reviewedCount, 0)
  }
}

export const assignmentService = {
  async getAssignments(options = {}) {
    const data = filterAssignmentsByContext(getAssignmentsFromStorage(), options)
    return sortAssignments(data).map((assignment) => enrichAssignment(assignment, options))
  },

  async getPublishedAssignments(options = {}) {
    return sortAssignments(
      filterAssignmentsByContext(
        getAssignmentsFromStorage().filter((assignment) => assignment.status !== 'DRAFT'),
        options
      )
    ).map((assignment) => enrichAssignment(assignment, options))
  },

  async getAssignmentById(id, options = {}) {
    const assignment = getAssignmentsFromStorage().find((item) => item.id === id)
    return assignment ? enrichAssignment(assignment, options) : null
  },

  async saveAssignment(payload) {
    const assignments = getAssignmentsFromStorage()
    const now = new Date().toISOString()
    const normalized = {
      id: payload.id || createAssignmentId(),
      title: payload.title?.trim() || '',
      subjectId: payload.subjectId || '',
      subjectName: payload.subjectName?.trim() || '',
      classId: payload.classId || '',
      className: payload.className?.trim() || '',
      type: payload.type || 'HOMEWORK',
      description: payload.description?.trim() || '',
      instructions: payload.instructions?.trim() || '',
      dueDate: payload.dueDate || '',
      dueTime: payload.dueTime || '23:59',
      totalPoints: Number(payload.totalPoints || 0),
      allowLateSubmissions: Boolean(payload.allowLateSubmissions),
      status: payload.status || 'DRAFT',
      createdBy: payload.createdBy || 'Staff',
      createdByEmail: payload.createdByEmail || '',
      updatedAt: now,
      createdAt: payload.createdAt || now
    }

    const index = assignments.findIndex((item) => item.id === normalized.id)
    if (index >= 0) {
      assignments[index] = {
        ...assignments[index],
        ...normalized,
        createdAt: assignments[index].createdAt || normalized.createdAt
      }
    } else {
      assignments.unshift(normalized)
    }

    persistAssignments(assignments)
    return enrichAssignment(normalized)
  },

  async publishAssignment(id) {
    const assignments = getAssignmentsFromStorage()
    const updatedAssignments = assignments.map((assignment) => {
      if (assignment.id !== id) return assignment
      return {
        ...assignment,
        status: 'PUBLISHED',
        updatedAt: new Date().toISOString()
      }
    })
    persistAssignments(updatedAssignments)
    return this.getAssignmentById(id)
  },

  async closeAssignment(id) {
    const assignments = getAssignmentsFromStorage()
    const updatedAssignments = assignments.map((assignment) => {
      if (assignment.id !== id) return assignment
      return {
        ...assignment,
        status: 'CLOSED',
        updatedAt: new Date().toISOString()
      }
    })
    persistAssignments(updatedAssignments)
    return this.getAssignmentById(id)
  },

  async deleteAssignment(id) {
    const assignments = getAssignmentsFromStorage().filter((assignment) => assignment.id !== id)
    persistAssignments(assignments)

    const submissions = getSubmissionsFromStorage()
    delete submissions[id]
    persistSubmissions(submissions)

    return true
  },

  async submitAssignment(id, studentOrOptions = {}, notes = '') {
    const studentContext = typeof studentOrOptions === 'object' && !Array.isArray(studentOrOptions)
      ? studentOrOptions.studentContext || studentOrOptions
      : {}
    const submissionNotes = typeof studentOrOptions === 'string'
      ? studentOrOptions
      : (studentOrOptions.notes || notes || '')

    const student = normalizeStudentContext(studentContext)
    const submissions = getSubmissionsFromStorage()
    const bucket = normalizeSubmissionBucket(submissions[id])
    bucket[student.studentKey] = {
      ...(bucket[student.studentKey] || {}),
      submittedAt: new Date().toISOString(),
      notes: submissionNotes,
      studentId: student.studentId,
      studentEmail: student.studentEmail,
      studentName: student.studentName,
      classId: student.classId,
      className: student.className,
      status: 'submitted',
      score: null,
      feedback: '',
      reviewedAt: null,
      reviewedBy: ''
    }

    submissions[id] = bucket
    persistSubmissions(submissions)
    return this.getAssignmentById(id, { studentContext: student })
  },

  async undoSubmission(id, studentContext = null) {
    const submissions = getSubmissionsFromStorage()
    if (!studentContext) {
      delete submissions[id]
      persistSubmissions(submissions)
      return this.getAssignmentById(id)
    }

    const student = normalizeStudentContext(studentContext)
    const bucket = normalizeSubmissionBucket(submissions[id])
    delete bucket[student.studentKey]

    if (Object.keys(bucket).length) {
      submissions[id] = bucket
    } else {
      delete submissions[id]
    }

    persistSubmissions(submissions)
    return this.getAssignmentById(id, { studentContext: student })
  },

  async getAssignmentSubmissions(assignmentId) {
    return getSubmissionValues(assignmentId)
      .map((item) => ({
        ...item,
        status: item.reviewedAt || item.status === 'reviewed' ? 'reviewed' : 'submitted'
      }))
      .sort((left, right) => new Date(right.submittedAt || 0).getTime() - new Date(left.submittedAt || 0).getTime())
  },

  async reviewSubmission(assignmentId, studentKey, payload = {}) {
    const submissions = getSubmissionsFromStorage()
    const bucket = normalizeSubmissionBucket(submissions[assignmentId])
    const existing = bucket[studentKey]
    if (!existing) return null

    bucket[studentKey] = {
      ...existing,
      score: payload.score === '' || payload.score === null || payload.score === undefined ? null : Number(payload.score),
      feedback: payload.feedback || '',
      reviewedAt: new Date().toISOString(),
      reviewedBy: payload.reviewedBy || 'Teacher',
      status: 'reviewed'
    }

    submissions[assignmentId] = bucket
    persistSubmissions(submissions)
    return bucket[studentKey]
  },

  async getAssignmentReviewSummary(assignmentId, options = {}) {
    const submissions = await this.getAssignmentSubmissions(assignmentId)
    const reviewed = submissions.filter((item) => item.status === 'reviewed').length
    const expected = Number(options.expectedCount || 0)

    return {
      submittedCount: submissions.length,
      reviewedCount: reviewed,
      pendingReviewCount: Math.max(submissions.length - reviewed, 0),
      expectedCount: expected,
      missingSubmissionCount: Math.max(expected - submissions.length, 0)
    }
  },

  async getAssignmentStats(options = {}) {
    const assignments = await this.getAssignments(options)

    const totalAssignments = assignments.length
    const activeAssignments = assignments.filter((assignment) => assignment.state === 'active').length
    const draftAssignments = assignments.filter((assignment) => assignment.state === 'draft').length
    const overdueAssignments = assignments.filter((assignment) => assignment.state === 'overdue').length
    const publishedAssignments = assignments.filter((assignment) => assignment.status === 'PUBLISHED').length

    const totalPoints = assignments.reduce((sum, assignment) => sum + Number(assignment.totalPoints || 0), 0)
    const averagePoints = totalAssignments ? Math.round(totalPoints / totalAssignments) : 0

    return {
      totalAssignments,
      activeAssignments,
      draftAssignments,
      overdueAssignments,
      publishedAssignments,
      averagePoints
    }
  }
}

export default assignmentService