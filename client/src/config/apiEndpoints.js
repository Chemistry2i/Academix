// Academix - API Endpoints Configuration

const API_VERSION = '/v1';

export const AUTH_ENDPOINTS = {
  LOGIN: `${API_VERSION}/auth/login`,
  REGISTER: `${API_VERSION}/auth/register`,
  LOGOUT: `${API_VERSION}/auth/logout`,
  REFRESH_TOKEN: `${API_VERSION}/auth/refresh`,
  FORGOT_PASSWORD: `${API_VERSION}/auth/forgot-password`,
  RESET_PASSWORD: `${API_VERSION}/auth/reset-password`,
  VERIFY_EMAIL: `${API_VERSION}/auth/verify-email`,
  CHANGE_PASSWORD: `${API_VERSION}/auth/change-password`,
  ME: `${API_VERSION}/auth/me`,
};

export const USER_ENDPOINTS = {
  BASE: `${API_VERSION}/users`,
  GET_ALL: `${API_VERSION}/users`,
  GET_BY_ID: (id) => `${API_VERSION}/users/${id}`,
  CREATE: `${API_VERSION}/users`,
  UPDATE: (id) => `${API_VERSION}/users/${id}`,
  DELETE: (id) => `${API_VERSION}/users/${id}`,
  RESET_PASSWORD: (id) => `${API_VERSION}/users/${id}/reset-password`,
  UPDATE_STATUS: (id) => `${API_VERSION}/users/${id}/status`,
  GET_BY_ROLE: (role) => `${API_VERSION}/users/role/${role}`,
};

export const SCHOOL_ENDPOINTS = {
  BASE: `${API_VERSION}/schools`,
  GET_ALL: `${API_VERSION}/schools`,
  GET_BY_ID: (id) => `${API_VERSION}/schools/${id}`,
  CREATE: `${API_VERSION}/schools`,
  UPDATE: (id) => `${API_VERSION}/schools/${id}`,
  DELETE: (id) => `${API_VERSION}/schools/${id}`,
  SETTINGS: (id) => `${API_VERSION}/schools/${id}/settings`,
};

export const STUDENT_ENDPOINTS = {
  BASE: `${API_VERSION}/students`,
  GET_ALL: `${API_VERSION}/students`,
  GET_BY_ID: (id) => `${API_VERSION}/students/${id}`,
  CREATE: `${API_VERSION}/students`,
  UPDATE: (id) => `${API_VERSION}/students/${id}`,
  DELETE: (id) => `${API_VERSION}/students/${id}`,
  GET_BY_CLASS: (classId) => `${API_VERSION}/students/class/${classId}`,
  GET_BY_PARENT: (parentId) => `${API_VERSION}/students/parent/${parentId}`,
  PROMOTE: `${API_VERSION}/students/promote`,
  TRANSFER: (id) => `${API_VERSION}/students/${id}/transfer`,
  GENERATE_ID: (id) => `${API_VERSION}/students/${id}/generate-id`,
};

export const STAFF_ENDPOINTS = {
  BASE: `${API_VERSION}/staff`,
  GET_ALL: `${API_VERSION}/staff`,
  GET_BY_ID: (id) => `${API_VERSION}/staff/${id}`,
  CREATE: `${API_VERSION}/staff`,
  UPDATE: (id) => `${API_VERSION}/staff/${id}`,
  DELETE: (id) => `${API_VERSION}/staff/${id}`,
  GET_BY_ROLE: (role) => `${API_VERSION}/staff/role/${role}`,
  GET_TEACHERS: `${API_VERSION}/staff/teachers`,
};

export const CLASS_ENDPOINTS = {
  BASE: `${API_VERSION}/classes`,
  GET_ALL: `${API_VERSION}/classes`,
  GET_BY_ID: (id) => `${API_VERSION}/classes/${id}`,
  CREATE: `${API_VERSION}/classes`,
  UPDATE: (id) => `${API_VERSION}/classes/${id}`,
  DELETE: (id) => `${API_VERSION}/classes/${id}`,
  ASSIGN_TEACHER: (id) => `${API_VERSION}/classes/${id}/assign-teacher`,
  GET_STUDENTS: (id) => `${API_VERSION}/classes/${id}/students`,
  GET_TIMETABLE: (id) => `${API_VERSION}/classes/${id}/timetable`,
};

export const SUBJECT_ENDPOINTS = {
  BASE: `${API_VERSION}/subjects`,
  GET_ALL: `${API_VERSION}/subjects`,
  GET_BY_ID: (id) => `${API_VERSION}/subjects/${id}`,
  CREATE: `${API_VERSION}/subjects`,
  UPDATE: (id) => `${API_VERSION}/subjects/${id}`,
  DELETE: (id) => `${API_VERSION}/subjects/${id}`,
  ASSIGN_TEACHER: (id) => `${API_VERSION}/subjects/${id}/assign-teacher`,
};

export const ATTENDANCE_ENDPOINTS = {
  BASE: `${API_VERSION}/attendance`,
  MARK: `${API_VERSION}/attendance/mark`,
  GET_BY_CLASS: (classId, date) => `${API_VERSION}/attendance/class/${classId}?date=${date}`,
  GET_BY_STUDENT: (studentId) => `${API_VERSION}/attendance/student/${studentId}`,
  GET_REPORT: `${API_VERSION}/attendance/report`,
  UPDATE: (id) => `${API_VERSION}/attendance/${id}`,
};

export const EXAM_ENDPOINTS = {
  BASE: `${API_VERSION}/exams`,
  GET_ALL: `${API_VERSION}/exams`,
  GET_BY_ID: (id) => `${API_VERSION}/exams/${id}`,
  CREATE: `${API_VERSION}/exams`,
  UPDATE: (id) => `${API_VERSION}/exams/${id}`,
  DELETE: (id) => `${API_VERSION}/exams/${id}`,
  SCHEDULE: `${API_VERSION}/exams/schedule`,
  PUBLISH_RESULTS: (id) => `${API_VERSION}/exams/${id}/publish`,
};

export const RESULT_ENDPOINTS = {
  BASE: `${API_VERSION}/results`,
  GET_ALL: `${API_VERSION}/results`,
  GET_BY_STUDENT: (studentId) => `${API_VERSION}/results/student/${studentId}`,
  GET_BY_CLASS: (classId, examId) => `${API_VERSION}/results/class/${classId}/exam/${examId}`,
  ENTER_MARKS: `${API_VERSION}/results/marks`,
  UPDATE_MARKS: (id) => `${API_VERSION}/results/${id}`,
  GENERATE_REPORT: (studentId, termId) => `${API_VERSION}/results/report/${studentId}/${termId}`,
  REPORT_CARD: (studentId, termId) => `${API_VERSION}/results/report-card/${studentId}/${termId}`,
};

export const ASSIGNMENT_ENDPOINTS = {
  BASE: `${API_VERSION}/assignments`,
  GET_ALL: `${API_VERSION}/assignments`,
  GET_BY_ID: (id) => `${API_VERSION}/assignments/${id}`,
  CREATE: `${API_VERSION}/assignments`,
  UPDATE: (id) => `${API_VERSION}/assignments/${id}`,
  DELETE: (id) => `${API_VERSION}/assignments/${id}`,
  SUBMIT: (id) => `${API_VERSION}/assignments/${id}/submit`,
  GRADE: (id) => `${API_VERSION}/assignments/${id}/grade`,
  GET_BY_CLASS: (classId) => `${API_VERSION}/assignments/class/${classId}`,
  GET_SUBMISSIONS: (id) => `${API_VERSION}/assignments/${id}/submissions`,
};

export const TIMETABLE_ENDPOINTS = {
  BASE: `${API_VERSION}/timetable`,
  GET_BY_CLASS: (classId) => `${API_VERSION}/timetable/class/${classId}`,
  GET_BY_TEACHER: (teacherId) => `${API_VERSION}/timetable/teacher/${teacherId}`,
  CREATE: `${API_VERSION}/timetable`,
  UPDATE: (id) => `${API_VERSION}/timetable/${id}`,
  DELETE: (id) => `${API_VERSION}/timetable/${id}`,
  GENERATE: `${API_VERSION}/timetable/generate`,
};

export const FEE_ENDPOINTS = {
  BASE: `${API_VERSION}/fees`,
  GET_ALL: `${API_VERSION}/fees`,
  GET_BY_ID: (id) => `${API_VERSION}/fees/${id}`,
  CREATE: `${API_VERSION}/fees`,
  UPDATE: (id) => `${API_VERSION}/fees/${id}`,
  DELETE: (id) => `${API_VERSION}/fees/${id}`,
  GET_STRUCTURE: (classId, termId) => `${API_VERSION}/fees/structure/${classId}/${termId}`,
  STUDENT_BALANCE: (studentId) => `${API_VERSION}/fees/balance/${studentId}`,
  OUTSTANDING: `${API_VERSION}/fees/outstanding`,
};

export const PAYMENT_ENDPOINTS = {
  BASE: `${API_VERSION}/payments`,
  GET_ALL: `${API_VERSION}/payments`,
  GET_BY_ID: (id) => `${API_VERSION}/payments/${id}`,
  CREATE: `${API_VERSION}/payments`,
  GET_BY_STUDENT: (studentId) => `${API_VERSION}/payments/student/${studentId}`,
  RECEIPT: (id) => `${API_VERSION}/payments/${id}/receipt`,
  REPORT: `${API_VERSION}/payments/report`,
};

export const MEDICAL_ENDPOINTS = {
  BASE: `${API_VERSION}/medical`,
  GET_ALL: `${API_VERSION}/medical`,
  GET_BY_STUDENT: (studentId) => `${API_VERSION}/medical/student/${studentId}`,
  CREATE_RECORD: `${API_VERSION}/medical/records`,
  UPDATE_RECORD: (id) => `${API_VERSION}/medical/records/${id}`,
  LOG_VISIT: `${API_VERSION}/medical/visits`,
  IMMUNIZATIONS: (studentId) => `${API_VERSION}/medical/immunizations/${studentId}`,
  EMERGENCY_NOTES: (studentId) => `${API_VERSION}/medical/emergency/${studentId}`,
};

export const LIBRARY_ENDPOINTS = {
  BASE: `${API_VERSION}/library`,
  BOOKS: `${API_VERSION}/library/books`,
  GET_BOOK: (id) => `${API_VERSION}/library/books/${id}`,
  ADD_BOOK: `${API_VERSION}/library/books`,
  UPDATE_BOOK: (id) => `${API_VERSION}/library/books/${id}`,
  ISSUE: `${API_VERSION}/library/issue`,
  RETURN: (id) => `${API_VERSION}/library/return/${id}`,
  OVERDUE: `${API_VERSION}/library/overdue`,
  STUDENT_HISTORY: (studentId) => `${API_VERSION}/library/history/${studentId}`,
};

export const INVENTORY_ENDPOINTS = {
  BASE: `${API_VERSION}/inventory`,
  GET_ALL: `${API_VERSION}/inventory`,
  GET_BY_ID: (id) => `${API_VERSION}/inventory/${id}`,
  CREATE: `${API_VERSION}/inventory`,
  UPDATE: (id) => `${API_VERSION}/inventory/${id}`,
  DELETE: (id) => `${API_VERSION}/inventory/${id}`,
  ISSUE: `${API_VERSION}/inventory/issue`,
  LOW_STOCK: `${API_VERSION}/inventory/low-stock`,
  CATEGORIES: `${API_VERSION}/inventory/categories`,
};

export const NOTICE_ENDPOINTS = {
  BASE: `${API_VERSION}/notices`,
  GET_ALL: `${API_VERSION}/notices`,
  GET_BY_ID: (id) => `${API_VERSION}/notices/${id}`,
  CREATE: `${API_VERSION}/notices`,
  UPDATE: (id) => `${API_VERSION}/notices/${id}`,
  DELETE: (id) => `${API_VERSION}/notices/${id}`,
  PUBLISH: (id) => `${API_VERSION}/notices/${id}/publish`,
  BY_AUDIENCE: (audience) => `${API_VERSION}/notices/audience/${audience}`,
};

export const MESSAGE_ENDPOINTS = {
  BASE: `${API_VERSION}/messages`,
  GET_ALL: `${API_VERSION}/messages`,
  GET_CONVERSATION: (userId) => `${API_VERSION}/messages/conversation/${userId}`,
  SEND: `${API_VERSION}/messages`,
  DELETE: (id) => `${API_VERSION}/messages/${id}`,
  MARK_READ: (id) => `${API_VERSION}/messages/${id}/read`,
  UNREAD_COUNT: `${API_VERSION}/messages/unread-count`,
};

export const SECURITY_ENDPOINTS = {
  VISITOR_LOG: `${API_VERSION}/security/visitors`,
  LOG_VISITOR: `${API_VERSION}/security/visitors`,
  CHECKOUT_VISITOR: (id) => `${API_VERSION}/security/visitors/${id}/checkout`,
  STUDENT_CHECKIN: `${API_VERSION}/security/checkin`,
  STUDENT_CHECKOUT: `${API_VERSION}/security/checkout`,
  PICKUP_VERIFY: `${API_VERSION}/security/pickup/verify`,
  PICKUP_LOG: `${API_VERSION}/security/pickup/log`,
};

export const REPORT_ENDPOINTS = {
  ACADEMIC: `${API_VERSION}/reports/academic`,
  FINANCIAL: `${API_VERSION}/reports/financial`,
  ATTENDANCE: `${API_VERSION}/reports/attendance`,
  LIBRARY: `${API_VERSION}/reports/library`,
  INVENTORY: `${API_VERSION}/reports/inventory`,
  SYSTEM_LOGS: `${API_VERSION}/reports/system-logs`,
};
