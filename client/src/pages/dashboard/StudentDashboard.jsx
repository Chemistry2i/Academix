// Academix - Student Dashboard Component
import { useState } from 'react';
import { Row, Col, Card, Nav, Tab, Badge } from 'react-bootstrap';
import {
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaTrophy,
  FaClipboardCheck,
  FaBook,
  FaChartLine,
  FaCalendarAlt,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import WelcomeBanner from '../../components/common/WelcomeBanner';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Demo user data for preview when not authenticated
  const demoUser = {
    firstName: 'Sarah',
    lastName: 'Nambi',
  };
  const displayUser = user || demoUser;

  // Mock student data - would come from API
  const studentData = {
    class: 'S4A',
    rollNo: 'S4A001',
    attendance: {
      percentage: 94,
      trend: '+2%',
    },
    grade: {
      current: 'A-',
      status: 'Excellent',
    },
    assignments: {
      completed: 8,
      total: 10,
      pending: 2,
    },
    rank: {
      position: 5,
      percentile: 'Top 15%',
    },
  };

  // Recent attendance records
  const recentAttendance = [
    { date: 'Sat, Feb 7', status: 'present' },
    { date: 'Fri, Feb 6', status: 'present' },
    { date: 'Thu, Feb 5', status: 'late' },
    { date: 'Wed, Feb 4', status: 'present' },
    { date: 'Tue, Feb 3', status: 'present' },
  ];

  // Upcoming assignments
  const upcomingAssignments = [
    {
      title: "Newton's Laws - Case Studies",
      subject: 'Physics',
      dueDate: '2/20/2026',
      priority: 'high',
    },
    {
      title: 'Organic Chemistry Reactions',
      subject: 'Chemistry',
      dueDate: '2/18/2026',
      priority: 'medium',
    },
    {
      title: 'Essay on Climate Change',
      subject: 'Geography',
      dueDate: '2/22/2026',
      priority: 'low',
    },
  ];

  // Recent results
  const recentResults = [
    { subject: 'Physics', score: 85, grade: 'A', maxScore: 100 },
    { subject: 'Chemistry', score: 78, grade: 'B+', maxScore: 100 },
    { subject: 'Mathematics', score: 92, grade: 'A+', maxScore: 100 },
    { subject: 'Biology', score: 80, grade: 'A-', maxScore: 100 },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <FaCheckCircle className="text-success" />;
      case 'late':
        return <FaClock className="text-warning" />;
      case 'absent':
        return <FaTimesCircle className="text-danger" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#fff3cd';
      case 'medium':
        return '#d1e7dd';
      case 'low':
        return '#e2e3e5';
      default:
        return '#f8f9fa';
    }
  };

  return (
    <div className="student-dashboard">
      {/* Welcome Banner */}
      <WelcomeBanner
        name={`${displayUser.firstName} ${displayUser.lastName || ''}`.trim()}
        subtitle={`Class ${studentData.class} • Roll No: ${studentData.rollNo}`}
        greeting="Welcome"
      />

      {/* Stat Cards */}
      <Row className="g-3 mb-4">
        <Col sm={6} lg={3}>
          <Card className="stat-card stat-card-green h-100">
            <Card.Body>
              <div className="stat-card-header">
                <div className="stat-icon bg-success">
                  <FaClipboardCheck size={20} />
                </div>
                <span className="stat-trend text-success">{studentData.attendance.trend}</span>
              </div>
              <div className="stat-label">Attendance</div>
              <div className="stat-value">{studentData.attendance.percentage}%</div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} lg={3}>
          <Card className="stat-card stat-card-orange h-100">
            <Card.Body>
              <div className="stat-card-header">
                <div className="stat-icon bg-warning">
                  <FaTrophy size={20} />
                </div>
                <span className="stat-badge text-warning">{studentData.grade.status}</span>
              </div>
              <div className="stat-label">Overall Grade</div>
              <div className="stat-value">{studentData.grade.current}</div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} lg={3}>
          <Card className="stat-card stat-card-blue h-100">
            <Card.Body>
              <div className="stat-card-header">
                <div className="stat-icon bg-primary">
                  <FaBook size={20} />
                </div>
                <span className="stat-badge text-primary">{studentData.assignments.pending} pending</span>
              </div>
              <div className="stat-label">Assignments</div>
              <div className="stat-value">
                {studentData.assignments.completed}/{studentData.assignments.total}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} lg={3}>
          <Card className="stat-card stat-card-purple h-100">
            <Card.Body>
              <div className="stat-card-header">
                <div className="stat-icon bg-orange">
                  <FaChartLine size={20} />
                </div>
                <span className="stat-badge text-orange">{studentData.rank.percentile}</span>
              </div>
              <div className="stat-label">Class Rank</div>
              <div className="stat-value">{studentData.rank.position}th</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabs Section */}
      <Card className="dashboard-tabs-card">
        <Card.Body className="p-0">
          <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
            <Nav variant="tabs" className="dashboard-tabs border-bottom">
              <Nav.Item>
                <Nav.Link eventKey="overview" className="px-4">
                  <FaBook className="me-2" />
                  Overview
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="attendance" className="px-4">
                  <FaCalendarAlt className="me-2" />
                  Attendance
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="results" className="px-4">
                  <FaTrophy className="me-2" />
                  Results
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="assignments" className="px-4">
                  <FaClipboardCheck className="me-2" />
                  Assignments
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content className="p-4">
              {/* Overview Tab */}
              <Tab.Pane eventKey="overview">
                <Row>
                  <Col lg={6} className="mb-4 mb-lg-0">
                    <h5 className="section-title">Recent Attendance</h5>
                    <div className="attendance-list">
                      {recentAttendance.map((record, index) => (
                        <div key={index} className="attendance-item">
                          <span className="attendance-date">{record.date}</span>
                          <span className={`attendance-status status-${record.status}`}>
                            {getStatusIcon(record.status)}
                            <span className="ms-2">{getStatusLabel(record.status)}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </Col>

                  <Col lg={6}>
                    <h5 className="section-title">Upcoming Assignments</h5>
                    <div className="assignments-list">
                      {upcomingAssignments.map((assignment, index) => (
                        <div
                          key={index}
                          className="assignment-item"
                          style={{ backgroundColor: getPriorityColor(assignment.priority) }}
                        >
                          <div className="assignment-info">
                            <h6 className="assignment-title">{assignment.title}</h6>
                            <span className="assignment-subject">{assignment.subject}</span>
                          </div>
                          <span className="assignment-due text-danger">
                            Due: {assignment.dueDate}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Col>
                </Row>
              </Tab.Pane>

              {/* Attendance Tab */}
              <Tab.Pane eventKey="attendance">
                <div className="attendance-details">
                  <Row className="mb-4">
                    <Col md={4}>
                      <Card className="text-center p-3 border-0 bg-success bg-opacity-10">
                        <h3 className="text-success mb-1">{studentData.attendance.percentage}%</h3>
                        <small className="text-muted">Overall Attendance</small>
                      </Card>
                    </Col>
                    <Col md={4}>
                      <Card className="text-center p-3 border-0 bg-warning bg-opacity-10">
                        <h3 className="text-warning mb-1">3</h3>
                        <small className="text-muted">Late Arrivals</small>
                      </Card>
                    </Col>
                    <Col md={4}>
                      <Card className="text-center p-3 border-0 bg-danger bg-opacity-10">
                        <h3 className="text-danger mb-1">2</h3>
                        <small className="text-muted">Days Absent</small>
                      </Card>
                    </Col>
                  </Row>
                  <h6 className="mb-3">Attendance History</h6>
                  <div className="attendance-list">
                    {recentAttendance.map((record, index) => (
                      <div key={index} className="attendance-item">
                        <span className="attendance-date">{record.date}</span>
                        <span className={`attendance-status status-${record.status}`}>
                          {getStatusIcon(record.status)}
                          <span className="ms-2">{getStatusLabel(record.status)}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Tab.Pane>

              {/* Results Tab */}
              <Tab.Pane eventKey="results">
                <h6 className="mb-3">Recent Exam Results</h6>
                <div className="results-list">
                  {recentResults.map((result, index) => (
                    <div key={index} className="result-item">
                      <div className="result-info">
                        <span className="result-subject">{result.subject}</span>
                        <div className="result-progress">
                          <div
                            className="result-bar"
                            style={{ width: `${(result.score / result.maxScore) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="result-score">
                        <span className="score">{result.score}/{result.maxScore}</span>
                        <Badge
                          bg={result.score >= 80 ? 'success' : result.score >= 60 ? 'warning' : 'danger'}
                          className="ms-2"
                        >
                          {result.grade}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Tab.Pane>

              {/* Assignments Tab */}
              <Tab.Pane eventKey="assignments">
                <Row className="mb-4">
                  <Col md={4}>
                    <Card className="text-center p-3 border-0 bg-success bg-opacity-10">
                      <h3 className="text-success mb-1">{studentData.assignments.completed}</h3>
                      <small className="text-muted">Completed</small>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="text-center p-3 border-0 bg-warning bg-opacity-10">
                      <h3 className="text-warning mb-1">{studentData.assignments.pending}</h3>
                      <small className="text-muted">Pending</small>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="text-center p-3 border-0 bg-primary bg-opacity-10">
                      <h3 className="text-primary mb-1">{studentData.assignments.total}</h3>
                      <small className="text-muted">Total</small>
                    </Card>
                  </Col>
                </Row>
                <h6 className="mb-3">Upcoming Assignments</h6>
                <div className="assignments-list">
                  {upcomingAssignments.map((assignment, index) => (
                    <div
                      key={index}
                      className="assignment-item"
                      style={{ backgroundColor: getPriorityColor(assignment.priority) }}
                    >
                      <div className="assignment-info">
                        <h6 className="assignment-title">{assignment.title}</h6>
                        <span className="assignment-subject">{assignment.subject}</span>
                      </div>
                      <span className="assignment-due text-danger">Due: {assignment.dueDate}</span>
                    </div>
                  ))}
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Card.Body>
      </Card>
    </div>
  );
};

export default StudentDashboard;
