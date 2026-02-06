// Academix - Attendance Management Page
import { useState } from 'react';
import { Card, Row, Col, Form, Table, Badge } from 'react-bootstrap';
import { FaClipboardCheck, FaSave, FaCalendarAlt } from 'react-icons/fa';
import { PageHeader, Button, StatCard } from '../../components/common';
import { ATTENDANCE_STATUS } from '../../config/constants';

const Attendance = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const students = [
    { id: '1', name: 'John Mukasa', rollNo: '001', status: 'present' },
    { id: '2', name: 'Sarah Nakato', rollNo: '002', status: 'present' },
    { id: '3', name: 'David Okello', rollNo: '003', status: 'absent' },
    { id: '4', name: 'Grace Achieng', rollNo: '004', status: 'late' },
    { id: '5', name: 'Peter Opio', rollNo: '005', status: 'present' },
  ];

  const stats = {
    present: 42,
    absent: 3,
    late: 2,
    percentage: '89%',
  };

  return (
    <div className="attendance-page">
      <PageHeader
        title="Attendance"
        subtitle="Mark and manage student attendance"
        icon={<FaClipboardCheck />}
        breadcrumbs={[{ label: 'Attendance' }]}
      />

      {/* Stats */}
      <Row className="g-3 mb-4">
        <Col sm={6} lg={3}>
          <StatCard title="Present Today" value={stats.present} variant="success" icon={<FaClipboardCheck size={24} />} />
        </Col>
        <Col sm={6} lg={3}>
          <StatCard title="Absent Today" value={stats.absent} variant="danger" icon={<FaClipboardCheck size={24} />} />
        </Col>
        <Col sm={6} lg={3}>
          <StatCard title="Late Today" value={stats.late} variant="warning" icon={<FaClipboardCheck size={24} />} />
        </Col>
        <Col sm={6} lg={3}>
          <StatCard title="Attendance Rate" value={stats.percentage} variant="info" icon={<FaCalendarAlt size={24} />} />
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={3}>
              <Form.Label>Select Class</Form.Label>
              <Form.Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                <option value="">Select Class</option>
                <option value="s1-east">Senior 1 - East</option>
                <option value="s1-west">Senior 1 - West</option>
                <option value="s2-east">Senior 2 - East</option>
                <option value="s2-west">Senior 2 - West</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label>Select Date</Form.Label>
              <Form.Control type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </Col>
            <Col md={3}>
              <Button variant="primary" icon={<FaClipboardCheck />}>Load Attendance</Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Attendance Table */}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>Mark Attendance - Senior 1 East</span>
          <Button variant="success" icon={<FaSave />}>Save Attendance</Button>
        </Card.Header>
        <Card.Body>
          <Table hover responsive>
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.rollNo}</td>
                  <td>{student.name}</td>
                  <td>
                    <Form.Select defaultValue={student.status} size="sm" style={{ width: '120px' }}>
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                      <option value="excused">Excused</option>
                    </Form.Select>
                  </td>
                  <td>
                    <Form.Control type="text" size="sm" placeholder="Add remarks..." />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Attendance;
