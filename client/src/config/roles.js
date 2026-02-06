// Academix - Role & Permission Configuration for Ugandan Secondary Schools
// This file defines all roles, permissions, and module access mappings

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
  NURSE: 'nurse',
  LIBRARIAN: 'librarian',
  BURSAR: 'bursar',
  INVENTORY_OFFICER: 'inventory_officer',
  REGISTRAR: 'registrar',
  ACADEMIC_HEAD: 'academic_head',
  EXAMINATION_OFFICER: 'examination_officer',
  IT_SUPPORT: 'it_support',
  SECURITY_OFFICER: 'security_officer',
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'School Admin',
  [ROLES.TEACHER]: 'Teacher',
  [ROLES.STUDENT]: 'Student',
  [ROLES.PARENT]: 'Parent',
  [ROLES.NURSE]: 'School Nurse',
  [ROLES.LIBRARIAN]: 'Librarian',
  [ROLES.BURSAR]: 'Bursar',
  [ROLES.INVENTORY_OFFICER]: 'Inventory Officer',
  [ROLES.REGISTRAR]: 'Registrar',
  [ROLES.ACADEMIC_HEAD]: 'Academic Head / HOD',
  [ROLES.EXAMINATION_OFFICER]: 'Examination Officer',
  [ROLES.IT_SUPPORT]: 'IT Support',
  [ROLES.SECURITY_OFFICER]: 'Security Officer',
};

// Module definitions
export const MODULES = {
  // Core Modules
  DASHBOARD: 'dashboard',
  USER_MANAGEMENT: 'user_management',
  ROLE_MANAGEMENT: 'role_management',
  STUDENT_MANAGEMENT: 'student_management',
  STAFF_MANAGEMENT: 'staff_management',
  SCHOOL_MANAGEMENT: 'school_management',
  SYSTEM_SETTINGS: 'system_settings',
  SYSTEM_LOGS: 'system_logs',
  
  // Academic Modules
  CLASS_MANAGEMENT: 'class_management',
  SUBJECT_MANAGEMENT: 'subject_management',
  ATTENDANCE: 'attendance',
  EXAMS: 'exams',
  RESULTS: 'results',
  TIMETABLE: 'timetable',
  ASSIGNMENTS: 'assignments',
  CURRICULUM: 'curriculum',
  
  // Support Modules
  MEDICAL: 'medical',
  LIBRARY: 'library',
  INVENTORY: 'inventory',
  TRANSPORT: 'transport',
  HOSTEL: 'hostel',
  
  // Finance Modules
  FEES: 'fees',
  PAYMENTS: 'payments',
  PAYROLL: 'payroll',
  BUDGETING: 'budgeting',
  FINANCIAL_REPORTS: 'financial_reports',
  
  // Communication Modules
  NOTICES: 'notices',
  MESSAGING: 'messaging',
  SMS_EMAIL: 'sms_email',
  
  // Admission Modules
  ADMISSIONS: 'admissions',
  TRANSFERS: 'transfers',
  ID_GENERATION: 'id_generation',
  
  // Security Modules
  VISITOR_LOGS: 'visitor_logs',
  STUDENT_CHECKIN: 'student_checkin',
  PICKUP_VERIFICATION: 'pickup_verification',
};

// Permission types
export const PERMISSIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  APPROVE: 'approve',
  EXPORT: 'export',
  PRINT: 'print',
};

// Role to Module mapping with permissions
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: {
    modules: Object.values(MODULES),
    permissions: Object.values(PERMISSIONS),
    description: 'Full system access - System owner / Head office',
  },
  
  [ROLES.ADMIN]: {
    modules: [
      MODULES.DASHBOARD,
      MODULES.USER_MANAGEMENT,
      MODULES.STUDENT_MANAGEMENT,
      MODULES.STAFF_MANAGEMENT,
      MODULES.CLASS_MANAGEMENT,
      MODULES.SUBJECT_MANAGEMENT,
      MODULES.ATTENDANCE,
      MODULES.EXAMS,
      MODULES.RESULTS,
      MODULES.TIMETABLE,
      MODULES.ASSIGNMENTS,
      MODULES.ADMISSIONS,
      MODULES.FEES,
      MODULES.PAYMENTS,
      MODULES.NOTICES,
      MODULES.MESSAGING,
      MODULES.MEDICAL,
      MODULES.LIBRARY,
      MODULES.INVENTORY,
      MODULES.TRANSPORT,
      MODULES.HOSTEL,
    ],
    permissions: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE, PERMISSIONS.EXPORT, PERMISSIONS.PRINT],
    description: 'School Admin / Principal - Manages school operations',
  },
  
  [ROLES.TEACHER]: {
    modules: [
      MODULES.DASHBOARD,
      MODULES.ATTENDANCE,
      MODULES.EXAMS,
      MODULES.RESULTS,
      MODULES.ASSIGNMENTS,
      MODULES.TIMETABLE,
      MODULES.NOTICES,
      MODULES.MESSAGING,
      MODULES.CLASS_MANAGEMENT,
    ],
    permissions: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
    description: 'Manages classes, attendance, marks, and assignments',
  },
  
  [ROLES.STUDENT]: {
    modules: [
      MODULES.DASHBOARD,
      MODULES.ATTENDANCE,
      MODULES.RESULTS,
      MODULES.TIMETABLE,
      MODULES.ASSIGNMENTS,
      MODULES.NOTICES,
      MODULES.LIBRARY,
      MODULES.FEES,
    ],
    permissions: [PERMISSIONS.VIEW],
    description: 'View-only access to personal academics',
  },
  
  [ROLES.PARENT]: {
    modules: [
      MODULES.DASHBOARD,
      MODULES.ATTENDANCE,
      MODULES.RESULTS,
      MODULES.FEES,
      MODULES.PAYMENTS,
      MODULES.NOTICES,
      MODULES.MESSAGING,
    ],
    permissions: [PERMISSIONS.VIEW],
    description: 'View child academics and communicate with school',
  },
  
  [ROLES.NURSE]: {
    modules: [
      MODULES.DASHBOARD,
      MODULES.MEDICAL,
      MODULES.STUDENT_MANAGEMENT,
    ],
    permissions: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.PRINT],
    description: 'Manages student medical records and clinic visits',
  },
  
  [ROLES.LIBRARIAN]: {
    modules: [
      MODULES.DASHBOARD,
      MODULES.LIBRARY,
    ],
    permissions: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.PRINT],
    description: 'Manages library books and transactions',
  },
  
  [ROLES.BURSAR]: {
    modules: [
      MODULES.DASHBOARD,
      MODULES.FEES,
      MODULES.PAYMENTS,
      MODULES.PAYROLL,
      MODULES.BUDGETING,
      MODULES.FINANCIAL_REPORTS,
    ],
    permissions: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.APPROVE, PERMISSIONS.EXPORT, PERMISSIONS.PRINT],
    description: 'Manages school finances, fees, and payments',
  },
  
  [ROLES.INVENTORY_OFFICER]: {
    modules: [
      MODULES.DASHBOARD,
      MODULES.INVENTORY,
    ],
    permissions: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.EXPORT],
    description: 'Manages school assets and inventory',
  },
  
  [ROLES.REGISTRAR]: {
    modules: [
      MODULES.DASHBOARD,
      MODULES.ADMISSIONS,
      MODULES.TRANSFERS,
      MODULES.ID_GENERATION,
      MODULES.STUDENT_MANAGEMENT,
    ],
    permissions: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.APPROVE, PERMISSIONS.PRINT],
    description: 'Handles admissions, transfers, and student records',
  },
  
  [ROLES.ACADEMIC_HEAD]: {
    modules: [
      MODULES.DASHBOARD,
      MODULES.CLASS_MANAGEMENT,
      MODULES.SUBJECT_MANAGEMENT,
      MODULES.CURRICULUM,
      MODULES.EXAMS,
      MODULES.RESULTS,
      MODULES.ATTENDANCE,
      MODULES.STAFF_MANAGEMENT,
    ],
    permissions: [PERMISSIONS.VIEW, PERMISSIONS.EDIT, PERMISSIONS.APPROVE, PERMISSIONS.EXPORT],
    description: 'Oversees academic operations and teachers',
  },
  
  [ROLES.EXAMINATION_OFFICER]: {
    modules: [
      MODULES.DASHBOARD,
      MODULES.EXAMS,
      MODULES.RESULTS,
      MODULES.TIMETABLE,
    ],
    permissions: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.APPROVE, PERMISSIONS.PRINT],
    description: 'Manages examinations and grading',
  },
  
  [ROLES.IT_SUPPORT]: {
    modules: [
      MODULES.DASHBOARD,
      MODULES.USER_MANAGEMENT,
      MODULES.SYSTEM_LOGS,
    ],
    permissions: [PERMISSIONS.VIEW, PERMISSIONS.EDIT],
    description: 'Provides technical support and password resets',
  },
  
  [ROLES.SECURITY_OFFICER]: {
    modules: [
      MODULES.DASHBOARD,
      MODULES.VISITOR_LOGS,
      MODULES.STUDENT_CHECKIN,
      MODULES.PICKUP_VERIFICATION,
    ],
    permissions: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
    description: 'Manages school security and visitor logs',
  },
};

// Helper functions
export const hasModuleAccess = (role, module) => {
  const roleConfig = ROLE_PERMISSIONS[role];
  if (!roleConfig) return false;
  return roleConfig.modules.includes(module);
};

export const hasPermission = (role, permission) => {
  const roleConfig = ROLE_PERMISSIONS[role];
  if (!roleConfig) return false;
  return roleConfig.permissions.includes(permission);
};

export const canAccess = (role, module, permission) => {
  return hasModuleAccess(role, module) && hasPermission(role, permission);
};

export const getRoleModules = (role) => {
  const roleConfig = ROLE_PERMISSIONS[role];
  return roleConfig ? roleConfig.modules : [];
};

export const getRoleLabel = (role) => {
  return ROLE_LABELS[role] || role;
};
