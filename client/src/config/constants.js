// Academix - Application Constants

export const APP_NAME = 'Academix';
export const APP_DESCRIPTION = 'School Management System for Ugandan Secondary Schools';
export const APP_VERSION = '1.0.0';

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const API_TIMEOUT = 30000; // 30 seconds

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Uganda specific configurations
export const UGANDA_CONFIG = {
  currency: 'UGX',
  currencySymbol: 'UGX',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: 'HH:mm',
  timezone: 'Africa/Kampala',
  phoneCode: '+256',
  country: 'Uganda',
};

// Academic year configuration (Uganda follows January-December)
export const ACADEMIC_TERMS = {
  TERM_1: { label: 'Term 1', months: [1, 2, 3, 4] },    // February - April
  TERM_2: { label: 'Term 2', months: [5, 6, 7, 8] },    // May - August  
  TERM_3: { label: 'Term 3', months: [9, 10, 11, 12] }, // September - December
};

// Uganda O-Level Grading System
export const O_LEVEL_GRADES = {
  D1: { min: 80, max: 100, points: 1, description: 'Distinction 1' },
  D2: { min: 70, max: 79, points: 2, description: 'Distinction 2' },
  C3: { min: 65, max: 69, points: 3, description: 'Credit 3' },
  C4: { min: 60, max: 64, points: 4, description: 'Credit 4' },
  C5: { min: 55, max: 59, points: 5, description: 'Credit 5' },
  C6: { min: 50, max: 54, points: 6, description: 'Credit 6' },
  P7: { min: 45, max: 49, points: 7, description: 'Pass 7' },
  P8: { min: 40, max: 44, points: 8, description: 'Pass 8' },
  F9: { min: 0, max: 39, points: 9, description: 'Fail' },
};

// Uganda A-Level Grading System
export const A_LEVEL_GRADES = {
  A: { min: 80, max: 100, points: 6, description: 'Excellent' },
  B: { min: 70, max: 79, points: 5, description: 'Very Good' },
  C: { min: 60, max: 69, points: 4, description: 'Good' },
  D: { min: 50, max: 59, points: 3, description: 'Credit' },
  E: { min: 45, max: 49, points: 2, description: 'Pass' },
  O: { min: 40, max: 44, points: 1, description: 'Subsidiary Pass' },
  F: { min: 0, max: 39, points: 0, description: 'Fail' },
};

// Class/Form levels for secondary schools
export const CLASS_LEVELS = {
  S1: { label: 'Senior 1', level: 1, section: 'O-Level' },
  S2: { label: 'Senior 2', level: 2, section: 'O-Level' },
  S3: { label: 'Senior 3', level: 3, section: 'O-Level' },
  S4: { label: 'Senior 4', level: 4, section: 'O-Level' },
  S5: { label: 'Senior 5', level: 5, section: 'A-Level' },
  S6: { label: 'Senior 6', level: 6, section: 'A-Level' },
};

// Standard subjects for Uganda Secondary Schools
export const SUBJECTS = {
  // Core O-Level subjects
  CORE: [
    'English Language',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Geography',
    'History',
    'Religious Education (CRE/IRE)',
  ],
  // Optional O-Level subjects
  OPTIONAL: [
    'Agriculture',
    'Commerce',
    'Computer Studies',
    'Fine Art',
    'French',
    'Home Economics',
    'Literature in English',
    'Music',
    'Physical Education',
    'Swahili',
    'Technical Drawing',
  ],
  // A-Level subject combinations
  A_LEVEL_COMBINATIONS: {
    SCIENCES: ['Physics', 'Chemistry', 'Biology', 'Mathematics'],
    ARTS: ['History', 'Geography', 'Economics', 'Divinity'],
    BUSINESS: ['Economics', 'Entrepreneurship', 'Commerce', 'Mathematics'],
  },
};

// Student status
export const STUDENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  GRADUATED: 'graduated',
  TRANSFERRED: 'transferred',
  SUSPENDED: 'suspended',
  EXPELLED: 'expelled',
};

// Staff status
export const STAFF_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ON_LEAVE: 'on_leave',
  RESIGNED: 'resigned',
  TERMINATED: 'terminated',
};

// Gender options
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

// Uganda regions for school locations
export const UGANDA_REGIONS = {
  CENTRAL: 'Central',
  EASTERN: 'Eastern',
  NORTHERN: 'Northern',
  WESTERN: 'Western',
};

// Payment methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  MOBILE_MONEY: 'mobile_money',
  BANK_TRANSFER: 'bank_transfer',
  CHEQUE: 'cheque',
};

// Mobile money providers in Uganda
export const MOBILE_MONEY_PROVIDERS = [
  { value: 'mtn_momo', label: 'MTN Mobile Money' },
  { value: 'airtel_money', label: 'Airtel Money' },
];

// Attendance status
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
  HALF_DAY: 'half_day',
};

// Fee types
export const FEE_TYPES = {
  TUITION: 'tuition',
  BOARDING: 'boarding',
  LIBRARY: 'library',
  LABORATORY: 'laboratory',
  SPORTS: 'sports',
  MEDICAL: 'medical',
  TRANSPORT: 'transport',
  UNIFORM: 'uniform',
  DEVELOPMENT: 'development',
  PTA: 'pta',
  EXAMINATION: 'examination',
};

// Book status (Library)
export const BOOK_STATUS = {
  AVAILABLE: 'available',
  ISSUED: 'issued',
  RESERVED: 'reserved',
  DAMAGED: 'damaged',
  LOST: 'lost',
};

// Inventory categories
export const INVENTORY_CATEGORIES = {
  BOOKS: 'books',
  LAB_EQUIPMENT: 'lab_equipment',
  FURNITURE: 'furniture',
  UNIFORMS: 'uniforms',
  SPORTS_EQUIPMENT: 'sports_equipment',
  ELECTRONICS: 'electronics',
  STATIONERY: 'stationery',
  CLEANING_SUPPLIES: 'cleaning_supplies',
};

// Notification types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  ANNOUNCEMENT: 'announcement',
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'academix_token',
  USER_DATA: 'academix_user',
  THEME: 'academix_theme',
  SCHOOL_ID: 'academix_school',
  LANGUAGE: 'academix_language',
};
