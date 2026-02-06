// Academix - Student Details Page
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Row, Col, Tab, Tabs, Badge, Table } from 'react-bootstrap';
import {
  FaUserGraduate,
  FaEdit,
  FaPrint,
  FaIdCard,
  FaArrowLeft,
} from 'react-icons/fa';
import { PageHeader, Button, LoadingSpinner } from '../../components/common';

const StudentDetails = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call
    setTimeout(() => {
      setStudent({
        id,
        studentId: 'STU-2026-001',
        firstName: 'John',
        lastName: 'Mukasa',
        dateOfBirth: '2010-05-15',
        gender: 'Male',
        class: 'Senior 1',
        section: 'East',
        status: 'active',
        admissionDate: '2026-01-15',
        bloodGroup: 'O+',
        religion: 'Christian',
        nationality: 'Ugandan',
        address: 'Kampala, Uganda',
        contact: '+256 701 234 567',
        email: 'john.mukasa@student.academix.ug',
        parent: {
          name: 'James Mukasa',
          relation: 'Father',
          phone: '+256 700 123 456',
          email: 'james.mukasa@email.com',
          occupation: 'Engineer',
        },
        fees: {
          total: 2500000,
          paid: 1500000,
          balance: 1000000,
        },
        attendance: {
          present: 85,
          absent: 10,
          late: 5,
          percentage: 85,
        },
      });
      setIsLoading(false);
    }, 500);
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading student details..." />;
  }

  if (!student) {
    return <div>Student not found</div>;
  }

  return (
    <div className="student-details-page">
      <PageHeader
        title={`${student.firstName} ${student.lastName}`}
        subtitle={`Student ID: ${student.studentId}`}
        icon={<FaUserGraduate />}
        breadcrumbs={[
          { label: 'Students', path: '/students' },
          { label: `${student.firstName} ${student.lastName}` },
        ]}
        actions={
          <>
            <Button variant="outline-secondary" icon={<FaPrint />}>
              Print Profile
            </Button>
            <Button variant="outline-primary" icon={<FaIdCard />}>
              Generate ID Card
            </Button>
            <Button variant="primary" icon={<FaEdit />}>
              Edit Student
            </Button>
          </>
        }
      />

      <Row className="g-4">
        {/* Profile Card */}
        <Col lg={4}>
          <Card>
            <Card.Body className="text-center">
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}
              >
                {student.firstName[0]}{student.lastName[0]}
              </div>
              <h4>{student.firstName} {student.lastName}</h4>
              <p className="text-muted mb-3">{student.studentId}</p>
              <Badge bg={student.status === 'active' ? 'success' : 'secondary'} className="mb-3">
                {student.status}
              </Badge>
              
              <hr />
              
              <div className="text-start">
                <p><strong>Class:</strong> {student.class} - {student.section}</p>
                <p><strong>Gender:</strong> {student.gender}</p>
                <p><strong>Date of Birth:</strong> {student.dateOfBirth}</p>
                <p><strong>Blood Group:</strong> {student.bloodGroup}</p>
                <p><strong>Religion:</strong> {student.religion}</p>
                <p><strong>Nationality:</strong> {student.nationality}</p>
              </div>
            </Card.Body>
          </Card>

          {/* Fee Summary */}
          <Card className="mt-3">
            <Card.Header>Fee Summary</Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Total Fees:</span>
                <span className="fw-bold">UGX {student.fees.total.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 text-success">
                <span>Paid:</span>
                <span>UGX {student.fees.paid.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between text-danger">
                <span>Balance:</span>
                <span>UGX {student.fees.balance.toLocaleString()}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Details Tabs */}
        <Col lg={8}>
          <Card>
            <Card.Body>
              <Tabs defaultActiveKey="personal" className="mb-3">
                <Tab eventKey="personal" title="Personal Info">
                  <Row className="g-3">
                    <Col md={6}>
                      <p><strong>Address:</strong></p>
                      <p className="text-muted">{student.address}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Contact:</strong></p>
                      <p className="text-muted">{student.contact}</p>
                      <p className="text-muted">{student.email}</p>
                    </Col>
                  </Row>
                  
                  <hr />
                  
                  <h6>Parent/Guardian Information</h6>
                  <Row className="g-3 mt-1">
                    <Col md={6}>
                      <p><strong>Name:</strong> {student.parent.name}</p>
                      <p><strong>Relation:</strong> {student.parent.relation}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Phone:</strong> {student.parent.phone}</p>
                      <p><strong>Email:</strong> {student.parent.email}</p>
                    </Col>
                  </Row>
                </Tab>

                <Tab eventKey="attendance" title="Attendance">
                  <Row className="g-3 text-center">
                    <Col md={3}>
                      <Card className="bg-success bg-opacity-10">
                        <Card.Body>
                          <h3 className="text-success">{student.attendance.present}</h3>
                          <small>Present</small>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="bg-danger bg-opacity-10">
                        <Card.Body>
                          <h3 className="text-danger">{student.attendance.absent}</h3>
                          <small>Absent</small>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="bg-warning bg-opacity-10">
                        <Card.Body>
                          <h3 className="text-warning">{student.attendance.late}</h3>
                          <small>Late</small>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="bg-primary bg-opacity-10">
                        <Card.Body>
                          <h3 className="text-primary">{student.attendance.percentage}%</h3>
                          <small>Overall</small>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Tab>

                <Tab eventKey="results" title="Results">
                  <p className="text-muted">Academic results will be displayed here.</p>
                </Tab>

                <Tab eventKey="fees" title="Fee History">
                  <p className="text-muted">Fee payment history will be displayed here.</p>
                </Tab>

                <Tab eventKey="documents" title="Documents">
                  <p className="text-muted">Student documents will be displayed here.</p>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StudentDetails;
