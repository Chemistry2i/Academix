// Academix - Navigation Configuration based on Roles
import {
  FaHome,
  FaUsers,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBook,
  FaCalendarAlt,
  FaClipboardList,
  FaChartBar,
  FaCog,
  FaMoneyBillWave,
  FaHospital,
  FaBookOpen,
  FaBoxes,
  FaBus,
  FaBed,
  FaBullhorn,
  FaEnvelope,
  FaUserPlus,
  FaIdCard,
  FaShieldAlt,
  FaExchangeAlt,
  FaFileAlt,
  FaGraduationCap,
  FaUserCog,
  FaHistory,
  FaDoorOpen,
} from 'react-icons/fa';

import { ROLES, MODULES } from '../config/roles';

// Navigation item structure
const createNavItem = (label, path, icon, module = null, children = null) => ({
  label,
  path,
  icon,
  module,
  children,
});

// Main navigation structure
export const navigationConfig = [
  // Dashboard - accessible to all
  createNavItem('Dashboard', '/dashboard', <FaHome />, MODULES.DASHBOARD),

  // User Management Section
  {
    label: 'User Management',
    icon: <FaUsers />,
    children: [
      createNavItem('All Users', '/users', <FaUsers />, MODULES.USER_MANAGEMENT),
      createNavItem('Roles & Permissions', '/users/roles', <FaShieldAlt />, MODULES.ROLE_MANAGEMENT),
    ],
  },

  // Student Management Section
  {
    label: 'Students',
    icon: <FaUserGraduate />,
    children: [
      createNavItem('All Students', '/students', <FaUserGraduate />, MODULES.STUDENT_MANAGEMENT),
      createNavItem('Admissions', '/students/admissions', <FaUserPlus />, MODULES.ADMISSIONS),
      createNavItem('Transfers', '/students/transfers', <FaExchangeAlt />, MODULES.TRANSFERS),
      createNavItem('ID Generation', '/students/id-cards', <FaIdCard />, MODULES.ID_GENERATION),
    ],
  },

  // Staff Management Section
  {
    label: 'Staff',
    icon: <FaChalkboardTeacher />,
    children: [
      createNavItem('All Staff', '/staff', <FaChalkboardTeacher />, MODULES.STAFF_MANAGEMENT),
      createNavItem('Teachers', '/staff/teachers', <FaChalkboardTeacher />, MODULES.STAFF_MANAGEMENT),
    ],
  },

  // Academic Section
  {
    label: 'Academics',
    icon: <FaGraduationCap />,
    children: [
      createNavItem('Classes', '/academics/classes', <FaBook />, MODULES.CLASS_MANAGEMENT),
      createNavItem('Subjects', '/academics/subjects', <FaBookOpen />, MODULES.SUBJECT_MANAGEMENT),
      createNavItem('Timetable', '/academics/timetable', <FaCalendarAlt />, MODULES.TIMETABLE),
      createNavItem('Curriculum', '/academics/curriculum', <FaFileAlt />, MODULES.CURRICULUM),
    ],
  },

  // Attendance & Results
  {
    label: 'Attendance & Exams',
    icon: <FaClipboardList />,
    children: [
      createNavItem('Attendance', '/attendance', <FaClipboardList />, MODULES.ATTENDANCE),
      createNavItem('Examinations', '/exams', <FaFileAlt />, MODULES.EXAMS),
      createNavItem('Results', '/results', <FaChartBar />, MODULES.RESULTS),
      createNavItem('Assignments', '/assignments', <FaBook />, MODULES.ASSIGNMENTS),
    ],
  },

  // Finance Section
  {
    label: 'Finance',
    icon: <FaMoneyBillWave />,
    children: [
      createNavItem('Fees Structure', '/finance/fees', <FaMoneyBillWave />, MODULES.FEES),
      createNavItem('Payments', '/finance/payments', <FaMoneyBillWave />, MODULES.PAYMENTS),
      createNavItem('Payroll', '/finance/payroll', <FaMoneyBillWave />, MODULES.PAYROLL),
      createNavItem('Budgeting', '/finance/budgeting', <FaChartBar />, MODULES.BUDGETING),
      createNavItem('Reports', '/finance/reports', <FaChartBar />, MODULES.FINANCIAL_REPORTS),
    ],
  },

  // Support Modules
  {
    label: 'Support Services',
    icon: <FaHospital />,
    children: [
      createNavItem('Medical / Clinic', '/medical', <FaHospital />, MODULES.MEDICAL),
      createNavItem('Library', '/library', <FaBookOpen />, MODULES.LIBRARY),
      createNavItem('Inventory', '/inventory', <FaBoxes />, MODULES.INVENTORY),
      createNavItem('Transport', '/transport', <FaBus />, MODULES.TRANSPORT),
      createNavItem('Hostel', '/hostel', <FaBed />, MODULES.HOSTEL),
    ],
  },

  // Communication
  {
    label: 'Communication',
    icon: <FaBullhorn />,
    children: [
      createNavItem('Notices', '/notices', <FaBullhorn />, MODULES.NOTICES),
      createNavItem('Messages', '/messages', <FaEnvelope />, MODULES.MESSAGING),
    ],
  },

  // Security
  {
    label: 'Security',
    icon: <FaShieldAlt />,
    children: [
      createNavItem('Visitor Logs', '/security/visitors', <FaDoorOpen />, MODULES.VISITOR_LOGS),
      createNavItem('Student Check-in', '/security/checkin', <FaIdCard />, MODULES.STUDENT_CHECKIN),
      createNavItem('Pickup Verification', '/security/pickup', <FaShieldAlt />, MODULES.PICKUP_VERIFICATION),
    ],
  },

  // Settings & System
  {
    label: 'Settings',
    icon: <FaCog />,
    children: [
      createNavItem('School Settings', '/settings/school', <FaCog />, MODULES.SCHOOL_MANAGEMENT),
      createNavItem('System Settings', '/settings/system', <FaUserCog />, MODULES.SYSTEM_SETTINGS),
      createNavItem('System Logs', '/settings/logs', <FaHistory />, MODULES.SYSTEM_LOGS),
    ],
  },
];

// Student-specific navigation (simpler, flat structure)
const studentNavigation = [
  createNavItem('Dashboard', '/dashboard', <FaHome />, MODULES.DASHBOARD),
  createNavItem('Exams & Results', '/results', <FaChartBar />, MODULES.RESULTS),
  createNavItem('Assignments', '/assignments', <FaBook />, MODULES.ASSIGNMENTS),
  createNavItem('Timetable', '/academics/timetable', <FaCalendarAlt />, MODULES.TIMETABLE),
  createNavItem('Library', '/library', <FaBookOpen />, MODULES.LIBRARY),
  createNavItem('Notices', '/notices', <FaBullhorn />, MODULES.NOTICES),
];

// Get navigation items based on user role
export const getNavigationForRole = (role, checkModuleAccess) => {
  // Students get a simplified flat navigation
  if (role === ROLES.STUDENT) {
    return studentNavigation.filter((item) => {
      if (!item.module) return true;
      return checkModuleAccess(item.module);
    });
  }

  const filterItems = (items) => {
    return items
      .map((item) => {
        // If item has children, filter them
        if (item.children) {
          const filteredChildren = item.children.filter((child) => {
            if (!child.module) return true;
            return checkModuleAccess(child.module);
          });

          // Only include parent if it has accessible children
          if (filteredChildren.length > 0) {
            return { ...item, children: filteredChildren };
          }
          return null;
        }

        // Single item - check module access
        if (!item.module) return item;
        return checkModuleAccess(item.module) ? item : null;
      })
      .filter(Boolean);
  };

  return filterItems(navigationConfig);
};

// Quick access dashboard widgets per role
export const dashboardWidgetsConfig = {
  [ROLES.SUPER_ADMIN]: ['schools', 'users', 'systemHealth', 'logs'],
  [ROLES.ADMIN]: ['students', 'teachers', 'attendance', 'fees', 'notices'],
  [ROLES.TEACHER]: ['myClasses', 'attendance', 'assignments', 'notices'],
  [ROLES.STUDENT]: ['profile', 'attendance', 'results', 'assignments', 'timetable'],
  [ROLES.PARENT]: ['childProfile', 'attendance', 'results', 'fees', 'notices'],
  [ROLES.NURSE]: ['todayVisits', 'pendingFollowups', 'emergencyContacts'],
  [ROLES.LIBRARIAN]: ['issuedBooks', 'overdueBooks', 'todayReturns'],
  [ROLES.BURSAR]: ['todayPayments', 'outstanding', 'feeSummary', 'recentTransactions'],
  [ROLES.INVENTORY_OFFICER]: ['lowStock', 'recentIssues', 'inventorySummary'],
  [ROLES.REGISTRAR]: ['pendingAdmissions', 'recentAdmissions', 'idCards'],
  [ROLES.ACADEMIC_HEAD]: ['teacherPerformance', 'examResults', 'curriculumProgress'],
  [ROLES.EXAMINATION_OFFICER]: ['upcomingExams', 'pendingResults', 'examSchedule'],
  [ROLES.IT_SUPPORT]: ['systemStatus', 'pendingTickets', 'userActivities'],
  [ROLES.SECURITY_OFFICER]: ['todayVisitors', 'todayCheckins', 'pendingPickups'],
};

export default navigationConfig;
