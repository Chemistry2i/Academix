// Academix - Timetable Management Page
import { Card, Row, Col, Form, Table, Badge } from 'react-bootstrap';
import { FaCalendarAlt, FaPlus, FaPrint, FaEdit } from 'react-icons/fa';
import { PageHeader, Button } from '../../components/common';

const Timetable = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [
    { time: '8:00 - 8:40', period: 1 },
    { time: '8:40 - 9:20', period: 2 },
    { time: '9:20 - 10:00', period: 3 },
    { time: '10:00 - 10:30', period: 'Break' },
    { time: '10:30 - 11:10', period: 4 },
    { time: '11:10 - 11:50', period: 5 },
    { time: '11:50 - 12:30', period: 6 },
    { time: '12:30 - 2:00', period: 'Lunch' },
    { time: '2:00 - 2:40', period: 7 },
    { time: '2:40 - 3:20', period: 8 },
  ];

  const timetableData = {
    Monday: ['Math', 'English', 'Physics', '', 'Chemistry', 'Biology', 'History', '', 'Geography', 'PE'],
    Tuesday: ['English', 'Math', 'Chemistry', '', 'Physics', 'Geography', 'Biology', '', 'History', 'Computer'],
    Wednesday: ['Physics', 'Chemistry', 'Math', '', 'English', 'History', 'Geography', '', 'Biology', 'Music'],
    Thursday: ['Biology', 'History', 'English', '', 'Math', 'Physics', 'Chemistry', '', 'Geography', 'Art'],
    Friday: ['Chemistry', 'Biology', 'History', '', 'Geography', 'Math', 'English', '', 'Physics', 'Games'],
  };

  return (
    <div className="timetable-page">
      <PageHeader
        title="Timetable"
        subtitle="View and manage class timetables"
        icon={<FaCalendarAlt />}
        breadcrumbs={[{ label: 'Academics' }, { label: 'Timetable' }]}
        actions={
          <>
            <Button variant="outline-primary" icon={<FaPrint />}>Print</Button>
            <Button variant="primary" icon={<FaEdit />}>Edit Timetable</Button>
          </>
        }
      />

      {/* Class Selector */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <Form.Label>Select Class</Form.Label>
              <Form.Select>
                <option>Senior 1 - East</option>
                <option>Senior 1 - West</option>
                <option>Senior 2 - East</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Label>View Type</Form.Label>
              <Form.Select>
                <option>Weekly</option>
                <option>Daily</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Timetable Grid */}
      <Card>
        <Card.Header>Timetable - Senior 1 East</Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table bordered className="mb-0 text-center">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '120px' }}>Time</th>
                  {days.map((day) => (
                    <th key={day}>{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periods.map((p, idx) => (
                  <tr key={idx} className={typeof p.period === 'string' ? 'table-secondary' : ''}>
                    <td className="small">
                      <strong>{p.time}</strong>
                      <br />
                      <span className="text-muted">{typeof p.period === 'number' ? `Period ${p.period}` : p.period}</span>
                    </td>
                    {days.map((day) => (
                      <td key={day}>
                        {typeof p.period === 'string' ? (
                          <Badge bg="secondary">{p.period}</Badge>
                        ) : (
                          timetableData[day][idx] && (
                            <Badge bg="primary" className="w-100 py-2">{timetableData[day][idx]}</Badge>
                          )
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Timetable;
