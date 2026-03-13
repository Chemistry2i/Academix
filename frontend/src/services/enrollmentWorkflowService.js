import { apiClient } from './apiClient'

const REQUESTS_STORAGE_KEY = 'academix.enrollment.changeRequests.v1'

const asArray = (payload) => {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.requests)) return payload.requests
  if (Array.isArray(payload.documents)) return payload.documents
  const firstArray = Object.values(payload).find((value) => Array.isArray(value))
  return firstArray || []
}

const readRequests = () => {
  try {
    return JSON.parse(localStorage.getItem(REQUESTS_STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

const writeRequests = (requests) => {
  localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests))
}

const normalizeDocumentList = (documents = []) => {
  return documents.map((doc) => ({
    id: doc?.id || doc?.documentId || doc?.type || `doc-${Math.random().toString(36).slice(2, 8)}`,
    name: doc?.name || doc?.documentName || doc?.type || 'Document',
    status: String(doc?.status || 'MISSING').toUpperCase(),
    uploadedAt: doc?.uploadedAt || doc?.uploadDate || null,
    note: doc?.note || doc?.remarks || ''
  }))
}

const buildDefaultDocuments = (student, enrollment) => {
  const now = new Date().toISOString()
  const hasPhoto = Boolean(student?.profileImageUrl || student?.profilePicture)

  return [
    {
      id: 'admission-letter',
      name: 'Admission Letter',
      status: enrollment ? 'VERIFIED' : 'MISSING',
      uploadedAt: enrollment ? (enrollment?.enrollmentDate || enrollment?.admissionDate || now) : null,
      note: enrollment ? 'Available in system' : 'Not found'
    },
    {
      id: 'student-photo',
      name: 'Student Photo',
      status: hasPhoto ? 'SUBMITTED' : 'MISSING',
      uploadedAt: hasPhoto ? now : null,
      note: hasPhoto ? 'Profile photo detected' : 'Profile photo not uploaded'
    },
    {
      id: 'guardian-consent',
      name: 'Guardian Consent',
      status: 'MISSING',
      uploadedAt: null,
      note: 'Required for enrollment completion'
    },
    {
      id: 'fee-clearance',
      name: 'Fee Clearance',
      status: 'PENDING',
      uploadedAt: null,
      note: 'Awaiting finance confirmation'
    }
  ]
}

export const enrollmentWorkflowService = {
  async getEnrollmentDocuments(studentId, { student = null, enrollment = null } = {}) {
    try {
      const response = await apiClient.get(`/students/${studentId}/enrollment/documents`)
      return normalizeDocumentList(asArray(response?.data || response))
    } catch {
      const rawDocs = enrollment?.documents || enrollment?.documentList || []
      const normalized = normalizeDocumentList(rawDocs)
      if (normalized.length) return normalized
      return buildDefaultDocuments(student, enrollment)
    }
  },

  async getChangeRequests(studentId) {
    try {
      const response = await apiClient.get(`/students/${studentId}/enrollment/change-requests`)
      return asArray(response?.data || response)
    } catch {
      return readRequests().filter((item) => String(item.studentId) === String(studentId))
    }
  },

  async submitChangeRequest(studentId, payload) {
    const requestBody = {
      requestType: payload.requestType,
      targetValue: payload.targetValue,
      reason: payload.reason,
      requestedEffectiveDate: payload.requestedEffectiveDate,
    }

    try {
      const response = await apiClient.post(`/students/${studentId}/enrollment/change-requests`, requestBody)
      return response?.data || response
    } catch {
      const existing = readRequests()
      const nextRequest = {
        id: `REQ-${Date.now()}`,
        studentId,
        requestType: requestBody.requestType,
        targetValue: requestBody.targetValue,
        reason: requestBody.reason,
        requestedEffectiveDate: requestBody.requestedEffectiveDate || null,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      }
      const updated = [nextRequest, ...existing]
      writeRequests(updated)
      return nextRequest
    }
  }
}

export default enrollmentWorkflowService
