// Academix - Results Management Page
import { useState } from 'react';
import { Card, Row, Col, Form, Tab, Tabs, Badge } from 'react-bootstrap';
import { FaChartBar, FaFileExport, FaPrint, FaUpload } from 'react-icons/fa';
import { PageHeader, DataTable, Button } from '../../components/common';

const Results = () => {
  const [results] = useState([
    { id: '1', studentId: 'STU-001', name: 'John Mukasa', class: 'S1-East', exam: 'BOT 2026', totalMarks: 580, grade: 'D1', position: 1 },
    { id: '2', studentId: 'STU-002', name: 'Sarah Nakato', class: 'S1-East', exam: 'BOT 2026', totalMarks: 565, grade: 'D1', position: 2 },
    { id: '3', studentId: 'STU-003', name: 'David Okello', class: 'S1-East', exam: 'BOT 2026', totalMarks: 520, grade: 'D2', position: 3 },
    { id: '4', studentId: 'STU-004', name: 'Grace Achieng', class: 'S1-East', exam: 'BOT 2026', totalMarks: 495, grade: 'C3', position: 4 },
  ]);

  const columns = [
    { header: 'Pos', accessor: 'position' },
    { header: 'Student ID', accessor: 'studentId' },
    { header: 'Name', accessor: 'name' },
    { header: 'Class', accessor: 'class' },
    { header: 'Total Marks', accessor: 'totalMarks' },
    { header: 'Grade', accessor: 'grade', render: (v) => <Badge bg="success">{v}</Badge> },
  ];

  return (
    <div className="results-page">
      <PageHeader
        title="Results"
        subtitle="View and manage examination results"
        icon={<FaChartBar />}
        breadcrumbs={[{ label: 'Results' }]}
        actions={
          <>
            <Button variant="outline-primary" icon={<FaUpload />}>Upload Marks</Button>
            <Button variant="outline-success" icon={<FaFileExport />}>Export</Button>
            <Button variant="primary" icon={<FaPrint />}>Print Reports</Button>
          </>
        }
      />

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={3}>
              <Form.Label>Class</Form.Label>
              <Form.Select><option>Senior 1 - East</option></Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label>Exam</Form.Label>
              <Form.Select><option>BOT 2026</option></Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label>Subject</Form.Label>
              <Form.Select><option>All Subjects</option></Form.Select>
            </Col>
            <Col md={3}>
              <Button variant="primary">View Results</Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>Results - Senior 1 East - BOT 2026</Card.Header>
        <Card.Body>
          <DataTable columns={columns} data={results} searchable pagination pageSize={10} />
        </Card.Body>
      </Card>
    </div>
  );
};

export default Results;
