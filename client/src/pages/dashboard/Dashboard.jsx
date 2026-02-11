// Academix - Dashboard Page
import { Row, Col, Card } from 'react-bootstrap';
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUsers,
  FaMoneyBillWave,
  FaClipboardCheck,
  FaBookOpen,
  FaBell,
  FaCalendarAlt,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, StatCard } from '../../components/common';
import CanAccess from '../../components/auth/CanAccess';
import { MODULES, ROLES, getRoleLabel } from '../../config/roles';
import StudentDashboard from './StudentDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // If user is a student, show the student-specific dashboard
  if (user?.role === ROLES.STUDENT) {
    return <StudentDashboard />;
  }

  // Dashboard stats - would come from API in real app
  const stats = {
    totalStudents: 1250,
    totalTeachers: 48,
    totalStaff: 75,
    attendanceRate: '94.5%',
    feesCollected: 'UGX 45.2M',
    pendingFees: 'UGX 12.8M',
    booksIssued: 324,
    upcomingEvents: 5,
  };

  return (
    <div className="dashboard-page">
      <PageHeader
        title={`Welcome, ${user?.firstName || 'User'}!`}
        subtitle={`${getRoleLabel(user?.role)} Dashboard`}
      />

      {/* Quick Stats */}
      <Row className="g-3 mb-4">
        <CanAccess module={MODULES.STUDENT_MANAGEMENT}>
          <Col sm={6} lg={3}>
            <StatCard
              title="Total Students"
              value={stats.totalStudents.toLocaleString()}
              icon={<FaUserGraduate size={24} />}
              variant="primary"
              trend="up"
              trendValue="12%"
            />
          </Col>
        </CanAccess>

        <CanAccess module={MODULES.STAFF_MANAGEMENT}>
          <Col sm={6} lg={3}>
            <StatCard
              title="Total Teachers"
              value={stats.totalTeachers}
              icon={<FaChalkboardTeacher size={24} />}
              variant="success"
            />
          </Col>
        </CanAccess>

        <CanAccess module={MODULES.ATTENDANCE}>
          <Col sm={6} lg={3}>
            <StatCard
              title="Attendance Rate"
              value={stats.attendanceRate}
              icon={<FaClipboardCheck size={24} />}
              variant="info"
              subtitle="This month"
            />
          </Col>
        </CanAccess>

        <CanAccess module={MODULES.FEES}>
          <Col sm={6} lg={3}>
            <StatCard
              title="Fees Collected"
              value={stats.feesCollected}
              icon={<FaMoneyBillWave size={24} />}
              variant="warning"
              subtitle="This term"
            />
          </Col>
        </CanAccess>
      </Row>

      {/* Main Content Grid */}
      <Row className="g-3">
        {/* Recent Activities */}
        <Col lg={8}>
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span className="fw-semibold">Recent Activities</span>
              <a href="#" className="text-primary small">View All</a>
            </Card.Header>
            <Card.Body>
              <div className="activity-list">
                {[
                  {
                    icon: <FaUserGraduate className="text-primary" />,
                    title: 'New student registered',
                    description: 'John Mukasa - Senior 1 East',
                    time: '5 minutes ago',
                  },
                  {
                    icon: <FaMoneyBillWave className="text-success" />,
                    title: 'Fee payment received',
                    description: 'UGX 1,500,000 from Sarah Nakato',
                    time: '15 minutes ago',
                  },
                  {
                    icon: <FaClipboardCheck className="text-info" />,
                    title: 'Attendance marked',
                    description: 'Senior 3 West - 45 students present',
                    time: '1 hour ago',
                  },
                  {
                    icon: <FaBookOpen className="text-warning" />,
                    title: 'Exam results published',
                    description: 'Mid-term exams - Senior 2',
                    time: '2 hours ago',
                  },
                  {
                    icon: <FaBell className="text-danger" />,
                    title: 'Notice published',
                    description: 'Sports Day announcement',
                    time: '3 hours ago',
                  },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="d-flex align-items-start py-3 border-bottom"
                  >
                    <div
                      className="activity-icon rounded-circle p-2 me-3"
                      style={{ backgroundColor: '#f8f9fa' }}
                    >
                      {activity.icon}
                    </div>
                    <div className="flex-grow-1">
                      <p className="mb-0 fw-medium">{activity.title}</p>
                      <small className="text-muted">{activity.description}</small>
                    </div>
                    <small className="text-muted">{activity.time}</small>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Upcoming Events & Quick Actions */}
        <Col lg={4}>
          <Card className="mb-3">
            <Card.Header className="fw-semibold">
              <FaCalendarAlt className="me-2" />
              Upcoming Events
            </Card.Header>
            <Card.Body className="p-0">
              <div className="list-group list-group-flush">
                {[
                  {
                    title: 'Staff Meeting',
                    date: 'Feb 7, 2026',
                    time: '10:00 AM',
                    type: 'meeting',
                  },
                  {
                    title: 'Mid-term Exams Begin',
                    date: 'Feb 15, 2026',
                    time: 'All Day',
                    type: 'exam',
                  },
                  {
                    title: 'Parents Day',
                    date: 'Feb 20, 2026',
                    time: '9:00 AM',
                    type: 'event',
                  },
                ].map((event, index) => (
                  <div key={index} className="list-group-item">
                    <div className="d-flex justify-content-between">
                      <span className="fw-medium">{event.title}</span>
                      <span
                        className={`badge bg-${
                          event.type === 'exam'
                            ? 'danger'
                            : event.type === 'meeting'
                            ? 'primary'
                            : 'success'
                        }-subtle text-${
                          event.type === 'exam'
                            ? 'danger'
                            : event.type === 'meeting'
                            ? 'primary'
                            : 'success'
                        }`}
                      >
                        {event.type}
                      </span>
                    </div>
                    <small className="text-muted">
                      {event.date} • {event.time}
                    </small>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header className="fw-semibold">Quick Actions</Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <CanAccess module={MODULES.STUDENT_MANAGEMENT}>
                  <a href="/students/new" className="btn btn-outline-primary btn-sm">
                    <FaUserGraduate className="me-2" />
                    Add New Student
                  </a>
                </CanAccess>
                <CanAccess module={MODULES.ATTENDANCE}>
                  <a href="/attendance" className="btn btn-outline-success btn-sm">
                    <FaClipboardCheck className="me-2" />
                    Mark Attendance
                  </a>
                </CanAccess>
                <CanAccess module={MODULES.FEES}>
                  <a href="/finance/payments/new" className="btn btn-outline-warning btn-sm">
                    <FaMoneyBillWave className="me-2" />
                    Record Payment
                  </a>
                </CanAccess>
                <CanAccess module={MODULES.NOTICES}>
                  <a href="/notices/new" className="btn btn-outline-info btn-sm">
                    <FaBell className="me-2" />
                    Post Notice
                  </a>
                </CanAccess>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
