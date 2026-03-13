import { classService } from './classService'
import { teacherService } from './teacherService'

const _contextCache = new Map()

const normalizeArray = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []

  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key]
  }

  const firstArray = Object.values(payload).find((value) => Array.isArray(value))
  return firstArray || []
}

const normalizeString = (value) => String(value || '').trim().toLowerCase()

const uniqueValues = (values) => [...new Set(values.filter(Boolean))]

const getClassId = (item) => String(item?.id || item?.classId || '')
const getClassName = (item) => item?.name || item?.className || item?.currentClass || item?.schoolClass?.name || ''
const getSubjectId = (item) => String(item?.id || item?.subjectId || '')
const getSubjectName = (item) => item?.name || item?.subjectName || item?.subject || item?.mainSubject || ''

const matchesTeacher = (teacher, user) => {
  return normalizeString(teacher?.email) === normalizeString(user?.email)
}

const matchByIdOrName = ({ id, name, candidateId, candidateName }) => {
  if (id && candidateId && String(id) === String(candidateId)) return true
  if (name && candidateName && normalizeString(name) === normalizeString(candidateName)) return true
  return false
}

class TeacherPortalService {
  normalizeArray(payload, keys = []) {
    return normalizeArray(payload, keys)
  }

  async getTeacherContext(user, options = {}) {
    const cacheKey = user?.email || 'anonymous'
    if (!options.classes?.length && !options.subjects?.length && _contextCache.has(cacheKey)) {
      return _contextCache.get(cacheKey)
    }

    const classList = options.classes?.length
      ? options.classes
      : normalizeArray(await classService.getClasses().catch(() => []), ['classes', 'data'])

    const teacherPayload = await teacherService.getTeachers(true).catch(() => ({ teachers: [] }))
    const teachers = normalizeArray(teacherPayload, ['teachers', 'data'])

    // Primary match: exact email match
    let teacher = teachers.find((item) => matchesTeacher(item, user)) || null

    // Secondary: match by first+last name when email is unreliable
    if (!teacher && (user?.firstName || user?.lastName)) {
      const firstName = normalizeString(user?.firstName || '')
      const lastName = normalizeString(user?.lastName || '')
      teacher = teachers.find((item) => {
        const tFirst = normalizeString(item?.firstName || '')
        const tLast = normalizeString(item?.lastName || '')
        return (firstName && tFirst === firstName) && (lastName && tLast === lastName)
      }) || null
    }

    let assignedClasses = []

    if (teacher?.id) {
      const classPayload = await teacherService.getTeacherClasses(teacher.id).catch(() => [])
      assignedClasses = normalizeArray(classPayload, ['classes', 'data'])
    }

    if (!assignedClasses.length) {
      assignedClasses = classList.filter((item) => {
        const classTeacher = item.classTeacher || item.teacher || {}
        const teacherMatch = matchByIdOrName({
          id: teacher?.id,
          name: teacher?.email,
          candidateId: classTeacher.id,
          candidateName: classTeacher.email
        })

        const explicitAssignment = (teacher?.assignedClasses || []).some(
          (value) => normalizeString(value) === normalizeString(getClassName(item))
        )

        return teacherMatch || explicitAssignment
      })
    }

    const assignedClassIds = uniqueValues(assignedClasses.map((item) => getClassId(item)))
    const assignedClassNames = uniqueValues(assignedClasses.map((item) => getClassName(item)))

    const subjectNames = uniqueValues([
      ...(Array.isArray(teacher?.subjects) ? teacher.subjects : []),
      teacher?.primarySubject,
      ...assignedClasses.map((item) => item.subject || item.subjectName || item.mainSubject)
    ])

    const subjectIds = uniqueValues(
      assignedClasses
        .map((item) => String(item.subjectId || item.subject?.id || ''))
        .filter(Boolean)
    )

    const availableSubjects = (options.subjects || []).filter((subject) => {
      return subjectIds.includes(getSubjectId(subject)) ||
        subjectNames.some((name) => normalizeString(name) === normalizeString(getSubjectName(subject)))
    })

    const context = {
      teacher,
      assignedClasses,
      assignedClassIds,
      assignedClassNames,
      subjectNames,
      subjectIds,
      availableSubjects
    }

    if (!options.classes?.length && !options.subjects?.length) {
      _contextCache.set(cacheKey, context)
    }

    return context
  }

  filterSubjectsByScope(subjects = [], scope = {}) {
    return subjects.filter((subject) => {
      return scope.subjectIds?.includes(getSubjectId(subject)) ||
        scope.subjectNames?.some((name) => normalizeString(name) === normalizeString(getSubjectName(subject)))
    })
  }

  filterStudentsByScope(students = [], scope = {}) {
    return students.filter((student) => {
      const classId = String(student?.schoolClass?.id || student?.classId || '')
      const className = getClassName(student)
      return scope.assignedClassIds?.includes(classId) ||
        scope.assignedClassNames?.some((name) => normalizeString(name) === normalizeString(className))
    })
  }

  filterAssignmentsByScope(assignments = [], scope = {}) {
    return assignments.filter((assignment) => {
      const classMatch = !scope.assignedClassIds?.length && !scope.assignedClassNames?.length
        ? true
        : scope.assignedClassIds?.includes(String(assignment.classId || '')) ||
          scope.assignedClassNames?.some((name) => normalizeString(name) === normalizeString(assignment.className))

      const hasSubjectScope = Boolean(scope.subjectIds?.length || scope.subjectNames?.length)
      const subjectMatch = !hasSubjectScope
        ? true
        : scope.subjectIds?.includes(String(assignment.subjectId || '')) ||
          scope.subjectNames?.some((name) => normalizeString(name) === normalizeString(assignment.subjectName))

      return classMatch && subjectMatch
    })
  }

  filterAssessmentsByScope(assessments = [], scope = {}) {
    return assessments.filter((assessment) => {
      const classMatch = !scope.assignedClassIds?.length && !scope.assignedClassNames?.length
        ? true
        : scope.assignedClassIds?.includes(String(assessment.classId || '')) ||
          scope.assignedClassNames?.some((name) => normalizeString(name) === normalizeString(assessment.className))

      const hasSubjectScope = Boolean(scope.subjectIds?.length || scope.subjectNames?.length)
      const subjectMatch = !hasSubjectScope
        ? true
        : scope.subjectIds?.includes(String(assessment.subjectId || '')) ||
          scope.subjectNames?.some((name) => normalizeString(name) === normalizeString(assessment.subjectName))

      return classMatch && subjectMatch
    })
  }

  filterResultsByScope(results = [], scope = {}) {
    return results.filter((result) => {
      const classMatch = !scope.assignedClassIds?.length && !scope.assignedClassNames?.length
        ? true
        : scope.assignedClassIds?.includes(String(result.classId || '')) ||
          scope.assignedClassNames?.some((name) => normalizeString(name) === normalizeString(result.className))

      const hasSubjectScope = Boolean(scope.subjectIds?.length || scope.subjectNames?.length)
      const subjectMatch = !hasSubjectScope
        ? true
        : scope.subjectIds?.includes(String(result.subjectId || '')) ||
          scope.subjectNames?.some((name) => normalizeString(name) === normalizeString(result.subjectName))

      return classMatch && subjectMatch
    })
  }

  buildMarkQueue({ assessments = [], students = [], results = [], scope = {} }) {
    const scopedAssessments = this.filterAssessmentsByScope(assessments, scope)

    return scopedAssessments
      .map((assessment) => {
        const classRoster = this.filterStudentsByScope(students, {
          ...scope,
          assignedClassIds: [String(assessment.classId || '')],
          assignedClassNames: [assessment.className]
        })

        const gradedCount = results.filter((result) => result.assessmentId === assessment.id).length
        const totalStudents = classRoster.length
        const pendingCount = Math.max(totalStudents - gradedCount, 0)
        const completionRate = totalStudents ? Math.round((gradedCount / totalStudents) * 100) : 0

        return {
          ...assessment,
          totalStudents,
          gradedCount,
          pendingCount,
          completionRate,
          status: pendingCount > 0 ? 'Needs marking' : 'Complete'
        }
      })
      .sort((left, right) => {
        const leftPending = left.pendingCount > 0 ? 1 : 0
        const rightPending = right.pendingCount > 0 ? 1 : 0
        if (leftPending !== rightPending) return rightPending - leftPending
        return new Date(right.date || 0).getTime() - new Date(left.date || 0).getTime()
      })
  }
}

export const teacherPortalService = new TeacherPortalService()

export default teacherPortalService